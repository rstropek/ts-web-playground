import type * as monaco from "monaco-editor";
import type { Files } from "../files";
import { renderMarkdown, summarizeToolCall } from "./rendering";
import { createAgentTools } from "./tools";
import { AgentController } from "./transport";

export function mountAgentView(files: Files, monacoApi: typeof monaco, exerciseSpecMarkdown: string) {
  const section = document.getElementById("agent")! as HTMLElement;
  const codeForm = document.getElementById("agent-code-form")! as HTMLFormElement;
  const codeInput = document.getElementById("agent-code")! as HTMLInputElement;
  const conversation = document.getElementById("agent-conversation")! as HTMLDivElement;
  const chat = document.getElementById("agent-chat")! as HTMLDivElement;
  const messageForm = document.getElementById("agent-message-form")! as HTMLFormElement;
  const messageInput = document.getElementById("agent-message")! as HTMLTextAreaElement;
  const sendButton = document.getElementById("agent-send")! as HTMLButtonElement;
  const stopButton = document.getElementById("agent-stop")! as HTMLButtonElement;
  const startOverButton = document.getElementById("agent-start-over")! as HTMLButtonElement;
  const textMessages = new Map<string, HTMLDivElement>();
  const toolEntries = new Map<string, HTMLDetailsElement>();
  let controller: AgentController | undefined;

  const scrollToBottom = () => {
    conversation.scrollTop = conversation.scrollHeight;
  };

  // Only pull focus back into the chat if the student is still working there.
  // Otherwise a finished run would steal focus from the code editor.
  const focusMessageInput = () => {
    const active = document.activeElement;
    if (!active || active === document.body || section.contains(active)) {
      messageInput.focus();
    }
  };

  const addStatus = (text: string, className = "") => {
    const status = document.createElement("div");
    status.className = `agent-status ${className}`.trim();
    status.textContent = text;
    chat.appendChild(status);
    scrollToBottom();
  };

  codeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const code = codeInput.value.trim();
    if (!code || controller) return;

    controller = new AgentController({
      code,
      tools: createAgentTools(files, monacoApi, exerciseSpecMarkdown),
      callbacks: {
        onUserMessage(content) {
          const message = document.createElement("div");
          message.className = "agent-message agent-message-user";
          message.textContent = content;
          chat.appendChild(message);
          scrollToBottom();
        },
        onRunningChanged(running) {
          messageInput.disabled = running;
          sendButton.disabled = running;
          startOverButton.disabled = running;
          stopButton.hidden = !running;
          if (!running) focusMessageInput();
        },
        onTextStart(messageId) {
          const message = document.createElement("div");
          message.className = "agent-message agent-message-assistant agent-message-streaming";
          message.setAttribute("aria-live", "polite");
          chat.appendChild(message);
          textMessages.set(messageId, message);
          scrollToBottom();
        },
        onTextDelta(messageId, delta) {
          const message = textMessages.get(messageId);
          if (message) message.textContent = `${message.textContent ?? ""}${delta}`;
          scrollToBottom();
        },
        onTextComplete(messageId, content) {
          const message = textMessages.get(messageId);
          if (!message) return;
          message.classList.remove("agent-message-streaming");
          void renderMarkdown(message, content, monacoApi).then(scrollToBottom);
        },
        onToolStart(toolCallId, name) {
          const details = document.createElement("details");
          details.className = "agent-tool-call";
          const summary = document.createElement("summary");
          summary.textContent = summarizeToolCall(name, {});
          details.appendChild(summary);
          chat.appendChild(details);
          toolEntries.set(toolCallId, details);
          scrollToBottom();
        },
        onToolComplete(toolCallId, name, args, result) {
          const details = toolEntries.get(toolCallId);
          if (!details) return;
          details.querySelector("summary")!.textContent = summarizeToolCall(name, args);
          const argumentsTitle = document.createElement("strong");
          argumentsTitle.textContent = "Arguments";
          const argumentsText = document.createElement("pre");
          argumentsText.textContent = JSON.stringify(args, null, 2);
          const resultTitle = document.createElement("strong");
          resultTitle.textContent = "Result";
          const resultText = document.createElement("pre");
          resultText.textContent = result;
          details.append(argumentsTitle, argumentsText, resultTitle, resultText);
          scrollToBottom();
        },
        onStopped(partialMessageIds) {
          for (const id of partialMessageIds) {
            const message = textMessages.get(id);
            if (!message) continue;
            message.classList.remove("agent-message-streaming");
            const stopped = document.createElement("div");
            stopped.className = "agent-stopped-label";
            stopped.textContent = "Stopped";
            message.appendChild(stopped);
          }
          if (!partialMessageIds.length) addStatus("Stopped", "agent-status-muted");
          scrollToBottom();
        },
        onError(message) {
          addStatus(message, "agent-status-error");
        },
      },
    });

    codeInput.value = "";
    codeForm.hidden = true;
    conversation.hidden = false;
    messageForm.hidden = false;
    messageInput.focus();
  });

  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const content = messageInput.value;
    if (!controller || !content.trim()) return;
    messageInput.value = "";
    void controller.send(content);
  });

  messageInput.addEventListener("keydown", (event) => {
    // Enter also commits an IME composition (e.g. Japanese input). Sending
    // there would submit a half-composed message.
    if (event.isComposing) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      messageForm.requestSubmit();
    }
  });
  stopButton.addEventListener("click", () => controller?.stop());
  startOverButton.addEventListener("click", () => {
    if (!controller?.resetConversation()) return;
    chat.replaceChildren();
    textMessages.clear();
    toolEntries.clear();
    messageInput.value = "";
    messageInput.focus();
  });
}
