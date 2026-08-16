import purify from "dompurify";
import { marked } from "marked";

/**
 * Renders markdown to sanitized HTML. External images are routed through the
 * server-side image proxy so that assets of private exercise repositories load
 * and the student's browser does not talk to external hosts directly.
 */
export function renderMarkdownToHtml(markdown: string): string {
  const html = purify.sanitize(marked.parse(markdown) as string);

  return html.replace(
    /<img\s+[^>]*src="(https:\/\/[^"]*)"[^>]*>/g,
    (match, originalUrl) => {
      return match.replace(
        originalUrl,
        `/github/exercise/image-proxy?imageUrl=${encodeURIComponent(originalUrl)}`
      );
    }
  );
}
