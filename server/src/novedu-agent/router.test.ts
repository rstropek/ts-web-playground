import express from "express";
import cors from "cors";
import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ChatCompletionChunk } from "openai/resources/chat/completions";
import type { NoveduChatClient, NoveduStream } from "./bridge.js";
import { createNoveduAgentRouter, NOVEDU_AGENT_PATH } from "./router.js";

const validInput = {
  threadId: "thread-1",
  runId: "run-1",
  state: {},
  messages: [{ id: "user-1", role: "user", content: "Hello" }],
  tools: [],
  context: [],
  forwardedProps: {},
};

const servers: Server[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
});

describe("Novedu AG-UI route", () => {
  it("rejects a missing code and invalid AG-UI input before streaming", async () => {
    const { url } = await startApp(clientReturning([]));
    const missing = await post(url, validInput);
    expect(missing.status).toBe(401);
    expect(missing.headers.get("content-type")).toContain("application/json");

    const invalid = await post(url, { messages: [] }, "activity-code");
    expect(invalid.status).toBe(400);
    expect(invalid.headers.get("content-type")).toContain("application/json");
  });

  it("passes only the trimmed header code to the request-scoped client", async () => {
    const createClient = vi.fn(() => clientReturning([chunk({ content: "Safe response" })]));
    const { url } = await startApp(createClient);

    const response = await post(url, validInput, "  private-activity-code  ");
    const body = await response.text();

    expect(createClient).toHaveBeenCalledWith("private-activity-code");
    expect(body).toContain("Safe response");
    expect(body).not.toContain("private-activity-code");
    expect(parseEvents(body).map((event) => event.type)).toEqual([
      "RUN_STARTED",
      "TEXT_MESSAGE_START",
      "TEXT_MESSAGE_CONTENT",
      "TEXT_MESSAGE_END",
      "RUN_FINISHED",
    ]);
  });

  it.each([
    [401, "invalid_code"],
    [403, "inactive_code"],
    [413, "request_too_large"],
    [502, "upstream_failure"],
  ])("streams sanitized upstream %i errors", async (status, expectedCode) => {
    const { url } = await startApp(() => throwingClient(status));
    const response = await post(url, validInput, "code");
    const body = await response.text();
    const events = parseEvents(body);

    expect(response.status).toBe(200);
    expect(events[0]?.type).toBe("RUN_STARTED");
    expect(events.at(-1)).toMatchObject({ type: "RUN_ERROR", code: expectedCode });
    expect(body).not.toContain("raw secret details");
  });

  it("aborts the upstream request when the browser disconnects", async () => {
    let upstreamAborted = false;
    const disconnectClient: NoveduChatClient = {
      chat: {
        completions: {
          create: async (_body, options) => ({
            async *[Symbol.asyncIterator]() {
              yield chunk({ content: "partial" });
              await new Promise<void>((resolve) => options.signal.addEventListener("abort", () => resolve(), { once: true }));
              upstreamAborted = true;
              const error = new Error("aborted");
              error.name = "AbortError";
              throw error;
            },
          }),
        },
      },
    };
    const { url } = await startApp(disconnectClient);
    const controller = new AbortController();
    const response = await post(url, validInput, "code", {}, controller.signal);
    await response.body!.getReader().read();
    controller.abort();

    await vi.waitFor(() => expect(upstreamAborted).toBe(true));
  });

  it("returns POST and OPTIONS without CORS headers despite later global CORS", async () => {
    const { url } = await startApp(clientReturning([]));
    const options = await fetch(url, { method: "OPTIONS", headers: { Origin: "https://other.example" } });
    expect(options.status).toBe(204);
    expect(options.headers.get("access-control-allow-origin")).toBeNull();

    const response = await post(url, validInput, "code", { Origin: "https://other.example" });
    await response.text();
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });
});

async function startApp(createClient: ((code: string) => NoveduChatClient) | NoveduChatClient) {
  const app = express();
  app.use(NOVEDU_AGENT_PATH, createNoveduAgentRouter({
    createClient: typeof createClient === "function" ? createClient : () => createClient,
  }));
  app.use(cors());
  const server = createServer(app);
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not start test server");
  return { server, url: `http://127.0.0.1:${address.port}${NOVEDU_AGENT_PATH}` };
}

function post(
  url: string,
  body: unknown,
  code?: string,
  extraHeaders: Record<string, string> = {},
  signal?: AbortSignal,
) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(code ? { "X-Novedu-Code": code } : {}),
      ...extraHeaders,
    },
    body: JSON.stringify(body),
    signal,
  });
}

function clientReturning(chunks: ChatCompletionChunk[]): NoveduChatClient {
  return {
    chat: {
      completions: {
        create: async () => ({ async *[Symbol.asyncIterator]() { yield* chunks; } }),
      },
    },
  };
}

function throwingClient(status: number): NoveduChatClient {
  return {
    chat: {
      completions: {
        create: async () => { throw Object.assign(new Error("raw secret details"), { status }); },
      },
    },
  };
}

function chunk(delta: ChatCompletionChunk["choices"][number]["delta"]): ChatCompletionChunk {
  return {
    id: "chunk",
    created: 0,
    model: "coding",
    object: "chat.completion.chunk",
    choices: [{ index: 0, finish_reason: null, delta }],
  };
}

function parseEvents(body: string): Record<string, unknown>[] {
  return body.split("\n").filter((line) => line.startsWith("data: ")).map((line) => JSON.parse(line.slice(6)));
}
