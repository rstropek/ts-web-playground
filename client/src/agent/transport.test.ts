import type { AgentSubscriber, Message, RunAgentParameters, RunAgentResult } from "@ag-ui/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AgentToolSet } from "./tools";
import {
  AgentController,
  MAX_AGENT_RUNS_PER_TURN,
  verifyApiKey,
  type AgentTransport,
} from "./transport";

describe("AgentController", () => {
  it("consumes text/tool events, executes tools, and continues with tool-result messages", async () => {
    const agent = new FakeAgent();
    const textDeltas: string[] = [];
    const completedTools: string[] = [];
    const execute = vi.fn(async () => "file contents");
    agent.runs.push(async (subscriber) => {
      await call(subscriber?.onToolCallStartEvent, { event: {
        type: "TOOL_CALL_START", toolCallId: "call-1", toolCallName: "read_file", parentMessageId: "assistant-1",
      } });
      await call(subscriber?.onToolCallArgsEvent, { event: {
        type: "TOOL_CALL_ARGS", toolCallId: "call-1", delta: "{\"path\":\"index.ts\"," },
      });
      await call(subscriber?.onToolCallArgsEvent, { event: {
        type: "TOOL_CALL_ARGS", toolCallId: "call-1", delta: "\"start_line\":1,\"end_line\":2}" },
      });
      await call(subscriber?.onToolCallEndEvent, {
        event: { type: "TOOL_CALL_END", toolCallId: "call-1" },
        toolCallName: "read_file",
        toolCallArgs: { path: "index.ts", start_line: 1, end_line: 2 },
      });
      agent.messages.push({
        id: "assistant-1",
        role: "assistant",
        toolCalls: [{
          id: "call-1", type: "function", function: { name: "read_file", arguments: "{\"path\":\"index.ts\",\"start_line\":1,\"end_line\":2}" },
        }],
      });
    });
    agent.runs.push(async (subscriber) => {
      await call(subscriber?.onTextMessageStartEvent, { event: {
        type: "TEXT_MESSAGE_START", messageId: "assistant-2", role: "assistant",
      } });
      await call(subscriber?.onTextMessageContentEvent, { event: {
        type: "TEXT_MESSAGE_CONTENT", messageId: "assistant-2", delta: "Use const." },
      });
      await call(subscriber?.onTextMessageEndEvent, {
        event: { type: "TEXT_MESSAGE_END", messageId: "assistant-2" },
        textMessageBuffer: "Use const.",
      });
      agent.messages.push({ id: "assistant-2", role: "assistant", content: "Use const." });
    });

    const controller = createController(agent, { execute }, {
      onTextDelta: (_id, delta) => textDeltas.push(delta),
      onToolComplete: (_id, name) => completedTools.push(name),
    });
    await controller.send("Help me");

    expect(agent.runCount).toBe(2);
    expect(execute).toHaveBeenCalledWith("read_file", { path: "index.ts", start_line: 1, end_line: 2 });
    expect(agent.messages.find((message) => message.role === "tool")).toMatchObject({
      toolCallId: "call-1",
      content: "file contents",
    });
    expect(textDeltas).toEqual(["Use const."]);
    expect(completedTools).toEqual(["read_file"]);
  });

  it("stops the active request, retains the partial display, and removes incomplete model messages", async () => {
    const agent = new FakeAgent();
    const stopped = vi.fn();
    agent.runs.push(async (subscriber) => {
      await call(subscriber?.onTextMessageStartEvent, { event: {
        type: "TEXT_MESSAGE_START", messageId: "partial", role: "assistant",
      } });
      await call(subscriber?.onTextMessageContentEvent, { event: {
        type: "TEXT_MESSAGE_CONTENT", messageId: "partial", delta: "Part" },
      });
      agent.messages.push({ id: "partial", role: "assistant", content: "Part" });
      await new Promise<void>((_resolve, reject) => { agent.rejectActiveRun = reject; });
    });
    const controller = createController(agent, {}, { onStopped: stopped });

    const sending = controller.send("Question");
    await vi.waitFor(() => expect(agent.rejectActiveRun).toBeTypeOf("function"));
    expect(controller.resetConversation()).toBe(false);
    controller.stop();
    await sending;

    expect(agent.abortCalled).toBe(true);
    expect(stopped).toHaveBeenCalledWith(["partial"]);
    expect(agent.messages).toHaveLength(1);
    expect(agent.messages[0]).toMatchObject({ role: "user", content: "Question" });
  });

  it("stops after eight tool-response runs and reports a loop", async () => {
    const agent = new FakeAgent();
    const onError = vi.fn();
    for (let index = 0; index < MAX_AGENT_RUNS_PER_TURN; index++) {
      agent.runs.push(async (subscriber) => {
        const id = `call-${index}`;
        await call(subscriber?.onToolCallStartEvent, { event: {
          type: "TOOL_CALL_START", toolCallId: id, toolCallName: "list_files", parentMessageId: `assistant-${index}`,
        } });
        await call(subscriber?.onToolCallArgsEvent, { event: {
          type: "TOOL_CALL_ARGS", toolCallId: id, delta: "{}",
        } });
        await call(subscriber?.onToolCallEndEvent, {
          event: { type: "TOOL_CALL_END", toolCallId: id }, toolCallName: "list_files", toolCallArgs: {},
        });
        agent.messages.push({
          id: `assistant-${index}`,
          role: "assistant",
          toolCalls: [{ id, type: "function", function: { name: "list_files", arguments: "{}" } }],
        });
      });
    }

    await createController(agent, {}, { onError }).send("Loop");

    expect(agent.runCount).toBe(MAX_AGENT_RUNS_PER_TURN);
    expect(onError).toHaveBeenCalledWith(expect.stringContaining("too many times"));
  });

  it("starts over by clearing the in-memory conversation", async () => {
    const agent = new FakeAgent();
    agent.messages = [
      { id: "user", role: "user", content: "Old question" },
      { id: "assistant", role: "assistant", content: "Old answer" },
    ];
    const controller = createController(agent);

    expect(controller.resetConversation()).toBe(true);
    expect(agent.messages).toEqual([]);
  });
});

describe("verifyApiKey", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends the key to the playground server and passes the verdict through", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ status: "valid" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(verifyApiKey("nvk-key")).resolves.toEqual({ status: "valid" });
    expect(fetchMock).toHaveBeenCalledWith("/api/novedu-agent/key-check", {
      headers: { "X-Novedu-Api-Key": "nvk-key" },
    });

    vi.stubGlobal("fetch", async () => jsonResponse({ status: "closed", message: "Not open." }));
    await expect(verifyApiKey("nvk-key")).resolves.toEqual({ status: "closed", message: "Not open." });

    vi.stubGlobal("fetch", async () => jsonResponse({ status: "invalid", message: "Rejected." }));
    await expect(verifyApiKey("nvk-key")).resolves.toEqual({ status: "invalid", message: "Rejected." });
  });

  // Only "invalid" makes the caller delete a stored key, so anything the client
  // cannot positively read as a rejection has to land on "unknown" instead.
  it.each([
    ["a failed request", async () => { throw new Error("offline"); }],
    ["a non-200 response", async () => new Response("nope", { status: 500 })],
    ["an unparseable body", async () => new Response("not json", { status: 200 })],
    ["an unrecognised status", async () => jsonResponse({ status: "banana" })],
    ["a missing status", async () => jsonResponse({ message: "Rejected." })],
  ])("falls back to unknown for %s", async (_label, fetchImpl) => {
    vi.stubGlobal("fetch", fetchImpl);
    await expect(verifyApiKey("nvk-key")).resolves.toEqual({
      status: "unknown",
      message: expect.any(String),
    });
  });

  it("always carries a message the view can show", async () => {
    vi.stubGlobal("fetch", async () => jsonResponse({ status: "unknown" }));
    await expect(verifyApiKey("nvk-key")).resolves.toMatchObject({
      status: "unknown",
      message: expect.any(String),
    });
  });
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

class FakeAgent implements AgentTransport {
  messages: Message[] = [];
  runs: ((subscriber?: AgentSubscriber) => Promise<void>)[] = [];
  runCount = 0;
  abortCalled = false;
  rejectActiveRun?: (error: Error) => void;

  async runAgent(_parameters?: RunAgentParameters, subscriber?: AgentSubscriber): Promise<RunAgentResult> {
    const run = this.runs[this.runCount++];
    if (!run) throw new Error("Unexpected run");
    await run(subscriber);
    return { result: undefined, newMessages: [] };
  }

  abortRun() {
    this.abortCalled = true;
    const error = new Error("aborted");
    error.name = "AbortError";
    this.rejectActiveRun?.(error);
  }
}

function createController(
  agent: FakeAgent,
  toolOverrides: Partial<AgentToolSet> = {},
  callbacks: ConstructorParameters<typeof AgentController>[0]["callbacks"] = {},
) {
  let id = 0;
  const tools: AgentToolSet = {
    definitions: [{ name: "list_files", description: "List", parameters: { type: "object" } }],
    execute: async () => "[]",
    ...toolOverrides,
  };
  return new AgentController({
    apiKey: "nvk-key",
    tools,
    callbacks,
    createAgent: () => agent,
    idFactory: () => `generated-${++id}`,
  });
}

async function call(callback: ((params: never) => unknown) | undefined, params: unknown) {
  await callback?.(params as never);
}
