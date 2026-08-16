import { EventType, type BaseEvent, type RunAgentInput } from "@ag-ui/core";
import { describe, expect, it } from "vitest";
import type { ChatCompletionChunk } from "openai/resources/chat/completions";
import {
  NOVEDU_SYSTEM_MESSAGE,
  bridgeChatCompletionStream,
  createChatCompletionRequest,
  sanitizeUpstreamError,
  toChatMessages,
  toChatTools,
} from "./bridge.js";

const input: RunAgentInput = {
  threadId: "thread-1",
  runId: "run-1",
  state: {},
  messages: [
    { id: "u1", role: "user", content: "Help" },
    {
      id: "a1",
      role: "assistant",
      content: "I'll inspect it.",
      toolCalls: [{
        id: "call-old",
        type: "function",
        function: { name: "read_file", arguments: "{\"path\":\"index.ts\"}" },
      }],
    },
    { id: "t1", role: "tool", toolCallId: "call-old", content: "const x = 1" },
  ],
  tools: [{
    name: "read_file",
    description: "Read a file",
    parameters: { type: "object" },
  }],
  context: [],
  forwardedProps: {},
};

describe("Novedu bridge conversion", () => {
  it("prepends the playground system message and converts messages and tools", () => {
    const request = createChatCompletionRequest(input);

    expect(request.model).toBe("coding");
    expect(request.stream).toBe(true);
    expect(request.messages[0]).toEqual({ role: "system", content: NOVEDU_SYSTEM_MESSAGE });
    expect(NOVEDU_SYSTEM_MESSAGE).toContain("open the Spec view");
    expect(request.messages.slice(1)).toEqual(toChatMessages(input.messages));
    expect(request.tools).toEqual(toChatTools(input.tools));
    expect(request.messages[2]).toMatchObject({
      role: "assistant",
      tool_calls: [{ id: "call-old", function: { name: "read_file" } }],
    });
    expect(request.messages[3]).toEqual({
      role: "tool",
      tool_call_id: "call-old",
      content: "const x = 1",
    });
  });

  it("converts fragmented text and multiple fragmented tool calls in index order", async () => {
    const events: BaseEvent[] = [];
    const chunks: ChatCompletionChunk[] = [
      chunk({ content: "Hel" }),
      chunk({ content: "lo" }),
      chunk({ tool_calls: [{ index: 1, id: "call-2", type: "function", function: { name: "get_" } }] }),
      chunk({ tool_calls: [{ index: 0, id: "call-1", type: "function", function: { name: "read_" } }] }),
      chunk({ tool_calls: [{ index: 1, function: { name: "typescript_errors", arguments: "{}" } }] }),
      chunk({ tool_calls: [{ index: 0, function: { name: "file", arguments: "{\"path\":" } }] }),
      chunk({ tool_calls: [{ index: 0, function: { arguments: "\"index.ts\",\"start_line\":1,\"end_line\":2}" } }] }),
    ];

    await bridgeChatCompletionStream({ input, stream: iterable(chunks), emit: (event) => events.push(event) });

    expect(events.map((event) => event.type)).toEqual([
      EventType.TEXT_MESSAGE_START,
      EventType.TEXT_MESSAGE_CONTENT,
      EventType.TEXT_MESSAGE_CONTENT,
      EventType.TOOL_CALL_START,
      EventType.TOOL_CALL_ARGS,
      EventType.TOOL_CALL_START,
      EventType.TOOL_CALL_ARGS,
      EventType.TOOL_CALL_ARGS,
      EventType.TEXT_MESSAGE_END,
      EventType.TOOL_CALL_END,
      EventType.TOOL_CALL_END,
    ]);
    expect(events[3]).toMatchObject({ toolCallId: "call-2", toolCallName: "get_typescript_errors" });
    expect(events[5]).toMatchObject({ toolCallId: "call-1", toolCallName: "read_file" });
    expect(events.at(-2)).toMatchObject({ toolCallId: "call-1" });
    expect(events.at(-1)).toMatchObject({ toolCallId: "call-2" });
  });

  it.each([
    [401, "invalid_code"],
    [403, "inactive_code"],
    [410, "expired_code"],
    [413, "request_too_large"],
    [500, "upstream_failure"],
  ])("maps status %i to a sanitized %s error", (status, code) => {
    const event = sanitizeUpstreamError({ status, message: "secret upstream body" });
    expect(event.code).toBe(code);
    expect(event.message).not.toContain("secret upstream body");
  });
});

function chunk(delta: ChatCompletionChunk["choices"][number]["delta"]): ChatCompletionChunk {
  return {
    id: "chunk",
    created: 0,
    model: "coding",
    object: "chat.completion.chunk",
    choices: [{ index: 0, finish_reason: null, delta }],
  };
}

async function* iterable(chunks: ChatCompletionChunk[]) {
  yield* chunks;
}
