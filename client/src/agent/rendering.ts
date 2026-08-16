import purify from "dompurify";
import type * as monaco from "monaco-editor";
import { renderMarkdownToHtml } from "../markdown";

const LANGUAGE_ALIASES: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  html: "html",
  css: "css",
  json: "json",
  sh: "shell",
  bash: "shell",
  txt: "plaintext",
  text: "plaintext",
};

export async function renderMarkdown(
  container: HTMLElement,
  markdown: string,
  monacoApi: typeof monaco,
): Promise<void> {
  container.innerHTML = renderMarkdownToHtml(markdown);
  const codeBlocks = [...container.querySelectorAll("pre > code")];

  await Promise.all(codeBlocks.map(async (codeElement) => {
    const originalText = codeElement.textContent ?? "";
    const languageClass = [...codeElement.classList].find((name) => name.startsWith("language-"));
    const requestedLanguage = languageClass?.slice("language-".length) || "plaintext";
    const language = LANGUAGE_ALIASES[requestedLanguage.toLowerCase()] ?? requestedLanguage.toLowerCase();

    // colorize() marks the tokens up with Monaco's .mtk* classes, so the snippet
    // follows the editor theme from here on without being rendered again.
    try {
      const highlighted = await monacoApi.editor.colorize(originalText, language, {});
      codeElement.innerHTML = purify.sanitize(highlighted);
    } catch {
      codeElement.textContent = originalText;
    }

    const pre = codeElement.parentElement!;
    pre.classList.add("agent-code-block");

    // The button lives next to the <pre>, not inside it. Inside, it would
    // scroll away with long lines and end up in the text selection.
    const wrapper = document.createElement("div");
    wrapper.className = "agent-code-block-wrapper";
    pre.replaceWith(wrapper);
    wrapper.appendChild(pre);

    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "agent-code-copy";
    copy.textContent = "Copy";
    copy.addEventListener("click", async () => {
      copy.textContent = (await copyToClipboard(originalText)) ? "Copied" : "Copy failed";
      window.setTimeout(() => { copy.textContent = "Copy"; }, 1200);
    });
    wrapper.appendChild(copy);
  }));
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // navigator.clipboard is only available in secure contexts (https or
    // localhost). Plain http (e.g. LAN testing) needs the legacy fallback.
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    try {
      textarea.select();
      return document.execCommand("copy");
    } finally {
      textarea.remove();
    }
  } catch {
    return false;
  }
}

export function summarizeToolCall(name: string, args: unknown): string {
  if (name === "list_files") return "List files";
  if (name === "get_typescript_errors") return "Check TypeScript errors";
  if (name === "get_exercise_spec") return "Read exercise spec";
  if (name === "read_file" && isRecord(args)) {
    const path = typeof args.path === "string" ? args.path : "file";
    const start = typeof args.start_line === "number" ? args.start_line : "?";
    const end = typeof args.end_line === "number" ? args.end_line : "?";
    return `Read ${path} · lines ${start}–${end}`;
  }
  return `Use ${name}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
