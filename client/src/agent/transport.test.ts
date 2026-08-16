import type { AgentSubscriber, Message, RunAgentParameters, RunAgentResult } from "@ag-ui/client";
import { describe, expect, it, vi } from "vitest";
import type { AgentToolSet } from "./tools";
import {
  AgentController,
  MAX_AGENT_RUNS_PER_TURN,
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
    code: "code",
    tools,
    callbacks,
    createAgent: () => agent,
    idFactory: () => `generated-${++id}`,
  });
}

async function call(callback: ((params: never) => unknown) | undefined, params: unknown) {
  await callback?.(params as never);
}
