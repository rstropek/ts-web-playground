import type * as monaco from "monaco-editor";
import type { Files } from "../files";
import { renderMarkdown, summarizeToolCall } from "./rendering";
import { clearStoredApiKey, getStoredApiKey, setStoredApiKey } from "./key-storage";
import { createAgentTools } from "./tools";
import { AgentController, verifyApiKey, type KeyCheckResult } from "./transport";

export function mountAgentView(files: Files, monacoApi: typeof monaco, exerciseSpecMarkdown: string) {
  const section = document.getElementById("agent")! as HTMLElement;
  const keyForm = document.getElementById("agent-key-form")! as HTMLFormElement;
  const keyInput = document.getElementById("agent-api-key")! as HTMLInputElement;
  const keySubmit = document.getElementById("agent-key-submit")! as HTMLButtonElement;
  const keyMessage = document.getElementById("agent-key-message")! as HTMLParagraphElement;
  const keyChecking = document.getElementById("agent-key-checking")! as HTMLDivElement;
  const conversation = document.getElementById("agent-conversation")! as HTMLDivElement;
  const chat = document.getElementById("agent-chat")! as HTMLDivElement;
  const messageForm = document.getElementById("agent-message-form")! as HTMLFormElement;
  const messageInput = document.getElementById("agent-message")! as HTMLTextAreaElement;
  const sendButton = document.getElementById("agent-send")! as HTMLButtonElement;
  const stopButton = document.getElementById("agent-stop")! as HTMLButtonElement;
  const startOverButton = document.getElementById("agent-start-over")! as HTMLButtonElement;
  const newKeyButton = document.getElementById("agent-new-key")! as HTMLButtonElement;
  const textMessages = new Map<string, HTMLDivElement>();
  const toolEntries = new Map<string, HTMLDetailsElement>();
  let controller: AgentController | undefined;
  let checkingKey = false;

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

  // The agent pane is hidden unless it is the active view, and the key check
  // resolves whenever it resolves - often while the student is typing code.
  // Focusing unconditionally would yank the caret out of the editor.
  const focusIfVisible = (element: HTMLElement) => {
    if (section.offsetParent !== null) element.focus();
  };

  // Bridges the gap between sending a turn and the first token of the answer,
  // so a slow model does not look like a crash.
  const waiting = document.createElement("div");
  waiting.className = "agent-status agent-status-muted agent-waiting";
  waiting.setAttribute("aria-live", "polite");
  waiting.textContent = "Waiting for the coding agent…";

  const showWaiting = () => {
    chat.appendChild(waiting);
    scrollToBottom();
  };
  const hideWaiting = () => waiting.remove();

  const setKeyMessage = (text?: string, isError = false) => {
    keyMessage.textContent = text ?? "";
    keyMessage.hidden = !text;
    keyMessage.classList.toggle("agent-key-message-error", isError);
  };

  const addStatus = (text: string, className = "") => {
    const status = document.createElement("div");
    status.className = `agent-status ${className}`.trim();
    status.textContent = text;
    chat.appendChild(status);
    scrollToBottom();
  };

  const startSession = (apiKey: string) => {
    controller = new AgentController({
      apiKey,
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
          if (running) showWaiting();
          else hideWaiting();
          messageInput.disabled = running;
          sendButton.disabled = running;
          startOverButton.disabled = running;
          newKeyButton.disabled = running;
          stopButton.hidden = !running;
          if (!running) focusMessageInput();
        },
        onTextStart(messageId) {
          hideWaiting();
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
          hideWaiting();
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
          // The tool result goes back to the model, so the wait starts over.
          if (controller?.isRunning) showWaiting();
          scrollToBottom();
        },
        onStopped(partialMessageIds) {
          hideWaiting();
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
        onError(message, code) {
          hideWaiting();
          addStatus(message, "agent-status-error");
          // A key that died mid-session would otherwise be restored on the next
          // page load and fail again. Only a flat rejection counts: a closed or
          // expired activity leaves the key itself perfectly good.
          if (code === "invalid_api_key") clearStoredApiKey();
        },
      },
    });

    keyInput.value = "";
    keyForm.hidden = true;
    keyChecking.hidden = true;
    conversation.hidden = false;
    messageForm.hidden = false;
    focusIfVisible(messageInput);
  };

  // The way back out of the chat: used by "New key" and by a saved key that no
  // longer passes the check.
  const showKeyForm = (message?: string, isError = false) => {
    controller = undefined;
    chat.replaceChildren();
    textMessages.clear();
    toolEntries.clear();
    messageInput.value = "";
    conversation.hidden = true;
    messageForm.hidden = true;
    keyChecking.hidden = true;
    keyForm.hidden = false;
    setKeyMessage(message, isError);
    focusIfVisible(keyInput);
  };

  keyForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const apiKey = keyInput.value.trim();
    if (!apiKey || controller || checkingKey) return;

    checkingKey = true;
    keyInput.disabled = true;
    keySubmit.disabled = true;
    setKeyMessage("Checking your key…");
    let result: KeyCheckResult;
    try {
      result = await verifyApiKey(apiKey);
    } finally {
      checkingKey = false;
      keyInput.disabled = false;
      keySubmit.disabled = false;
    }

    // Only a key that has just been proven to work is worth remembering.
    if (result.status !== "valid") {
      setKeyMessage(result.message, result.status === "invalid");
      focusIfVisible(keyInput);
      return;
    }
    setStoredApiKey(apiKey);
    setKeyMessage();
    startSession(apiKey);
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
  newKeyButton.addEventListener("click", () => {
    if (controller?.isRunning) return;
    clearStoredApiKey();
    showKeyForm();
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

  void restoreStoredKey();

  // Moving to the next exercise is a full page load, so without this the
  // student would paste the same key over and over. A remembered key is only
  // trusted as far as the check confirms it.
  async function restoreStoredKey() {
    const apiKey = getStoredApiKey();
    if (!apiKey) return;

    keyForm.hidden = true;
    keyChecking.hidden = false;
    const result = await verifyApiKey(apiKey);
    if (result.status === "valid") {
      startSession(apiKey);
      return;
    }
    // "closed" and "unknown" say nothing bad about the key itself, so it stays
    // put and will be picked up again on the next load.
    if (result.status === "invalid") clearStoredApiKey();
    showKeyForm(
      result.status === "unknown"
        ? `${result.message} Paste it again, or reload the page later.`
        : result.message,
      result.status === "invalid",
    );
  }
}
