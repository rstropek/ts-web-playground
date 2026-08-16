import {
  EventType,
  type BaseEvent,
  type Message,
  type RunErrorEvent,
  type RunAgentInput,
  type Tool,
} from "@ag-ui/core";
import type {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions";

export const NOVEDU_SYSTEM_MESSAGE =
  "You are a coding agent in a browser-based TypeScript playground. You can inspect the current exercise files, exercise specification, and live TypeScript errors, but you cannot edit files. Help the student understand the code and suggest changes they can apply themselves. If the exercise specification references external resources such as images, instruct the student to open the Spec view and review the referenced material themselves.";

export interface NoveduStream
  extends AsyncIterable<ChatCompletionChunk> {}

export interface NoveduChatClient {
  chat: {
    completions: {
      create(
        body: {
          model: string;
          messages: ChatCompletionMessageParam[];
          tools?: ChatCompletionTool[];
          stream: true;
        },
        options: { signal: AbortSignal },
      ): Promise<NoveduStream>;
    };
  };
}

export interface StreamBridgeOptions {
  input: RunAgentInput;
  stream: NoveduStream;
  emit: (event: BaseEvent) => void;
}

export function toChatMessages(messages: Message[]): ChatCompletionMessageParam[] {
  return messages.flatMap((message): ChatCompletionMessageParam[] => {
    switch (message.role) {
      case "developer":
      case "system":
      case "user":
        if (typeof message.content !== "string") {
          throw new Error("Only text messages are supported.");
        }
        return [{ role: message.role, content: message.content }];
      case "assistant":
        return [{
          role: "assistant",
          content: message.content ?? null,
          ...(message.toolCalls?.length
            ? {
                tool_calls: message.toolCalls.map((toolCall) => ({
                  id: toolCall.id,
                  type: "function" as const,
                  function: {
                    name: toolCall.function.name,
                    arguments: toolCall.function.arguments,
                  },
                })),
              }
            : {}),
        }];
      case "tool":
        return [{
          role: "tool",
          content: message.content,
          tool_call_id: message.toolCallId,
        }];
      case "activity":
      case "reasoning":
        return [];
    }
  });
}

export function toChatTools(tools: Tool[]): ChatCompletionTool[] {
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

interface PendingToolCall {
  id: string;
  name: string;
  pendingArguments: string;
  started: boolean;
}

export async function bridgeChatCompletionStream({
  input,
  stream,
  emit,
}: StreamBridgeOptions): Promise<void> {
  const assistantMessageId = `${input.runId}-assistant`;
  const toolCalls = new Map<number, PendingToolCall>();
  let textStarted = false;
  let textEnded = false;

  const endText = () => {
    if (textStarted && !textEnded) {
      emit({
        type: EventType.TEXT_MESSAGE_END,
        messageId: assistantMessageId,
      });
      textEnded = true;
    }
  };

  for await (const chunk of stream) {
    // Chunks without choices (usage-only) and choices without a delta
    // (finish-reason-only) are legal and must not break the run.
    for (const choice of chunk.choices ?? []) {
      const delta = choice.delta ?? {};
      if (delta.content) {
        if (!textStarted) {
          emit({
            type: EventType.TEXT_MESSAGE_START,
            messageId: assistantMessageId,
            role: "assistant",
          });
          textStarted = true;
        }
        emit({
          type: EventType.TEXT_MESSAGE_CONTENT,
          messageId: assistantMessageId,
          delta: delta.content,
        });
      }

      for (const toolDelta of delta.tool_calls ?? []) {
        const pending = toolCalls.get(toolDelta.index) ?? {
          id: "",
          name: "",
          pendingArguments: "",
          started: false,
        };

        // Only assemble id and name until the call has been announced. Some
        // providers repeat them in every delta, which would otherwise produce
        // ids like "call_Acall_A" that no longer match the started call.
        if (!pending.started) {
          if (toolDelta.id) {
            pending.id += toolDelta.id;
          }
          if (toolDelta.function?.name) {
            pending.name += toolDelta.function.name;
          }
        }
        if (toolDelta.function?.arguments) {
          pending.pendingArguments += toolDelta.function.arguments;
        }

        // Wait for the first argument fragment before announcing the call. This
        // lets us assemble providers that split the function name across chunks.
        if (!pending.started && pending.name && pending.pendingArguments) {
          pending.id ||= `${input.runId}-tool-${toolDelta.index}`;
          emit({
            type: EventType.TOOL_CALL_START,
            toolCallId: pending.id,
            toolCallName: pending.name,
            parentMessageId: assistantMessageId,
          });
          pending.started = true;
        }

        if (pending.started && pending.pendingArguments) {
          emit({
            type: EventType.TOOL_CALL_ARGS,
            toolCallId: pending.id,
            delta: pending.pendingArguments,
          });
          pending.pendingArguments = "";
        }

        toolCalls.set(toolDelta.index, pending);
      }
    }
  }

  endText();
  for (const [index, pending] of [...toolCalls.entries()].sort(([a], [b]) => a - b)) {
    if (!pending.started) {
      pending.id ||= `${input.runId}-tool-${index}`;
      pending.name ||= "unknown_tool";
      emit({
        type: EventType.TOOL_CALL_START,
        toolCallId: pending.id,
        toolCallName: pending.name,
        parentMessageId: assistantMessageId,
      });
      if (pending.pendingArguments) {
        emit({
          type: EventType.TOOL_CALL_ARGS,
          toolCallId: pending.id,
          delta: pending.pendingArguments,
        });
      }
    }
    emit({ type: EventType.TOOL_CALL_END, toolCallId: pending.id });
  }
}

export function createChatCompletionRequest(input: RunAgentInput) {
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: NOVEDU_SYSTEM_MESSAGE },
    ...toChatMessages(input.messages),
  ];
  const tools = toChatTools(input.tools);
  return {
    model: "coding",
    messages,
    ...(tools.length ? { tools } : {}),
    stream: true as const,
  };
}

export function sanitizeUpstreamError(error: unknown): RunErrorEvent {
  if (isAbortError(error)) {
    return {
      type: EventType.RUN_ERROR,
      code: "aborted",
      message: "The request was stopped.",
    };
  }

  const status = getErrorStatus(error);
  switch (status) {
    case 401:
      return {
        type: EventType.RUN_ERROR,
        code: "invalid_code",
        message: "The activity code is invalid.",
      };
    case 403:
      return {
        type: EventType.RUN_ERROR,
        code: "inactive_code",
        message: "This activity is inactive.",
      };
    case 410:
      return {
        type: EventType.RUN_ERROR,
        code: "expired_code",
        message: "This activity has expired.",
      };
    case 413:
      return {
        type: EventType.RUN_ERROR,
        code: "request_too_large",
        message: "The agent request is too large.",
      };
    default:
      return {
        type: EventType.RUN_ERROR,
        code: "upstream_failure",
        message: "The coding agent is temporarily unavailable.",
      };
  }
}

export function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return undefined;
  }
  return typeof error.status === "number" ? error.status : undefined;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || /aborted|abort/i.test(error.message));
}
