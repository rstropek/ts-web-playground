import {
  HttpAgent,
  type AgentSubscriber,
  type Message,
  type RunAgentParameters,
  type RunAgentResult,
} from "@ag-ui/client";
import type { AgentToolSet } from "./tools";

export const MAX_AGENT_RUNS_PER_TURN = 8;

export interface AgentTransport {
  messages: Message[];
  runAgent(parameters?: RunAgentParameters, subscriber?: AgentSubscriber): Promise<RunAgentResult>;
  abortRun(): void;
}

export interface AgentViewCallbacks {
  onUserMessage?(content: string): void;
  onRunningChanged?(running: boolean): void;
  onTextStart?(messageId: string): void;
  onTextDelta?(messageId: string, delta: string): void;
  onTextComplete?(messageId: string, content: string): void;
  onToolStart?(toolCallId: string, name: string): void;
  onToolComplete?(toolCallId: string, name: string, args: unknown, result: string): void;
  onStopped?(partialMessageIds: string[]): void;
  onError?(message: string): void;
}

export interface AgentControllerOptions {
  code: string;
  tools: AgentToolSet;
  callbacks?: AgentViewCallbacks;
  createAgent?: (code: string) => AgentTransport;
  idFactory?: () => string;
}

interface CapturedToolCall {
  id: string;
  name: string;
  argumentsText: string;
  args: unknown;
}

export class AgentController {
  private readonly agent: AgentTransport;
  private readonly tools: AgentToolSet;
  private readonly callbacks: AgentViewCallbacks;
  private readonly idFactory: () => string;
  private activeTurn = false;
  private stopRequested = false;

  constructor(options: AgentControllerOptions) {
    this.tools = options.tools;
    this.callbacks = options.callbacks ?? {};
    this.idFactory = options.idFactory ?? createId;
    this.agent = (options.createAgent ?? createHttpAgent)(options.code);
  }

  get isRunning() {
    return this.activeTurn;
  }

  async send(content: string): Promise<void> {
    const trimmed = content.trim();
    if (!trimmed || this.activeTurn) return;

    this.activeTurn = true;
    this.stopRequested = false;
    this.agent.messages = [
      ...this.agent.messages,
      { id: this.idFactory(), role: "user", content: trimmed },
    ];
    this.callbacks.onUserMessage?.(trimmed);
    this.callbacks.onRunningChanged?.(true);

    try {
      for (let runNumber = 1; runNumber <= MAX_AGENT_RUNS_PER_TURN; runNumber++) {
        // Stop can be pressed between runs (e.g. while tools are executing).
        // The agent creates a fresh abort controller per run, so the abort of
        // the previous run would not stop the next one.
        if (this.stopRequested) {
          this.callbacks.onStopped?.([]);
          return;
        }

        const stableMessages = cloneMessages(this.agent.messages);
        const capturedTools = new Map<string, CapturedToolCall>();
        const partialMessageIds = new Set<string>();
        let runError: string | undefined;

        const subscriber: AgentSubscriber = {
          onTextMessageStartEvent: ({ event }) => {
            partialMessageIds.add(event.messageId);
            this.callbacks.onTextStart?.(event.messageId);
          },
          onTextMessageContentEvent: ({ event }) => {
            this.callbacks.onTextDelta?.(event.messageId, event.delta);
          },
          onTextMessageEndEvent: ({ event, textMessageBuffer }) => {
            partialMessageIds.delete(event.messageId);
            this.callbacks.onTextComplete?.(event.messageId, textMessageBuffer);
          },
          onToolCallStartEvent: ({ event }) => {
            capturedTools.set(event.toolCallId, {
              id: event.toolCallId,
              name: event.toolCallName,
              argumentsText: "",
              args: {},
            });
            this.callbacks.onToolStart?.(event.toolCallId, event.toolCallName);
          },
          onToolCallArgsEvent: ({ event }) => {
            const toolCall = capturedTools.get(event.toolCallId);
            if (toolCall) toolCall.argumentsText += event.delta;
          },
          onToolCallEndEvent: ({ event, toolCallArgs, toolCallName }) => {
            const toolCall = capturedTools.get(event.toolCallId);
            if (toolCall) {
              toolCall.name = toolCallName;
              toolCall.args = toolCallArgs;
            }
          },
          onRunErrorEvent: ({ event }) => {
            runError = event.message;
          },
        };

        try {
          await this.agent.runAgent({ tools: this.tools.definitions }, subscriber);
        } catch (error) {
          this.agent.messages = stableMessages;
          if (this.stopRequested || isAbortError(error)) {
            this.callbacks.onStopped?.([...partialMessageIds]);
            return;
          }
          this.callbacks.onError?.(readError(error));
          return;
        }

        if (this.stopRequested) {
          this.agent.messages = stableMessages;
          this.callbacks.onStopped?.([...partialMessageIds]);
          return;
        }
        if (runError) {
          this.agent.messages = stableMessages;
          this.callbacks.onError?.(runError);
          return;
        }

        const toolCalls = [...capturedTools.values()];
        if (!toolCalls.length) return;

        const results = await Promise.all(toolCalls.map(async (toolCall) => {
          const args = parseToolArguments(toolCall.argumentsText, toolCall.args);
          let result: string;
          try {
            result = await this.tools.execute(toolCall.name, args);
          } catch (error) {
            result = JSON.stringify({ error: readError(error) });
          }
          this.callbacks.onToolComplete?.(toolCall.id, toolCall.name, args, result);
          return {
            id: this.idFactory(),
            role: "tool" as const,
            toolCallId: toolCall.id,
            content: result,
          };
        }));
        this.agent.messages = [...this.agent.messages, ...results];

        if (runNumber === MAX_AGENT_RUNS_PER_TURN) {
          this.callbacks.onError?.("The agent used tools too many times without producing a final answer.");
          return;
        }
      }
    } finally {
      this.activeTurn = false;
      this.callbacks.onRunningChanged?.(false);
    }
  }

  stop() {
    if (!this.activeTurn) return;
    this.stopRequested = true;
    this.agent.abortRun();
  }

  resetConversation(): boolean {
    if (this.activeTurn) return false;
    this.agent.messages = [];
    return true;
  }
}

function createHttpAgent(code: string): AgentTransport {
  return new HttpAgent({
    url: "/api/novedu-agent",
    headers: { "X-Novedu-Code": code },
  });
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `agent-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneMessages(messages: Message[]): Message[] {
  return typeof structuredClone === "function"
    ? structuredClone(messages)
    : JSON.parse(JSON.stringify(messages)) as Message[];
}

function parseToolArguments(text: string, fallback: unknown): unknown {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || /aborted|abort/i.test(error.message));
}

function readError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
