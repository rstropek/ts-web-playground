import { EventType, RunAgentInputSchema, type BaseEvent } from "@ag-ui/core";
import { EventEncoder } from "@ag-ui/encoder";
import express from "express";
import OpenAI from "openai";
import {
  bridgeChatCompletionStream,
  createChatCompletionRequest,
  getErrorStatus,
  sanitizeUpstreamError,
  type NoveduChatClient,
} from "./bridge.js";

export const NOVEDU_AGENT_PATH = "/api/novedu-agent";
// Novedu PROD. The novedu.at prototype is shut down; DEV runs at dev.novedu.at.
export const NOVEDU_BASE_URL = "https://app.novedu.at/api/coding/v1";

/** What the key check was able to conclude about a key. */
export type KeyCheckStatus = "valid" | "invalid" | "closed" | "unknown";

// Only "invalid" ever costs the student their stored key, so every status that
// is not a flat rejection has to fall into one of the harmless buckets.
const KEY_CHECK_MESSAGES: Record<Exclude<KeyCheckStatus, "valid">, string> = {
  invalid: "Your Novedu API key was not accepted. Please enter it again.",
  closed: "This activity is not open right now. Try again when your teacher opens it.",
  unknown: "Could not check your API key right now.",
};

export interface NoveduAgentRouterOptions {
  createClient?: (apiKey: string) => NoveduChatClient;
  /** Resolves when the key is usable, throws otherwise. */
  verifyApiKey?: (apiKey: string, signal: AbortSignal) => Promise<void>;
}

export function createNoveduAgentRouter(
  options: NoveduAgentRouterOptions = {},
): express.Router {
  const router = express.Router();
  const createClient = options.createClient ?? createDefaultClient;
  const verifyApiKey = options.verifyApiKey ?? verifyApiKeyUpstream;

  router.options("/", (_req, res) => {
    res.status(204).end();
  });

  // Lets the playground find out whether a remembered API key still works
  // without spending a conversation turn. Novedu's /models endpoint sends no
  // CORS headers, so the browser cannot ask it directly - this proxies it.
  router.get("/key-check", async (req, res) => {
    const apiKey = req.get("X-Novedu-Api-Key")?.trim();
    if (!apiKey) {
      res.status(401).json({ error: "A Novedu API key is required." });
      return;
    }

    const abortController = new AbortController();
    res.once("close", () => abortController.abort());

    let status: KeyCheckStatus;
    try {
      await verifyApiKey(apiKey, abortController.signal);
      status = "valid";
    } catch (error) {
      status = classifyKeyCheckError(getErrorStatus(error));
    }

    if (res.writableEnded) return;
    res.json(status === "valid" ? { status } : { status, message: KEY_CHECK_MESSAGES[status] });
  });

  router.post("/", express.json({ limit: "2mb" }), async (req, res) => {
    // The student's personal Novedu API key (`nvk-…`). Novedu retired
    // code-as-key: the activity code alone no longer authenticates anything.
    const apiKey = req.get("X-Novedu-Api-Key")?.trim();
    if (!apiKey) {
      res.status(401).json({ error: "A Novedu API key is required." });
      return;
    }

    const parsed = RunAgentInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid AG-UI request." });
      return;
    }

    const abortController = new AbortController();
    let responseComplete = false;
    res.once("close", () => {
      if (!responseComplete) {
        abortController.abort();
      }
    });

    const encoder = new EventEncoder();
    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const emit = (event: BaseEvent) => {
      if (!res.destroyed && !res.writableEnded) {
        res.write(encoder.encode(event));
      }
    };

    emit({
      type: EventType.RUN_STARTED,
      threadId: parsed.data.threadId,
      runId: parsed.data.runId,
    });

    try {
      const client = createClient(apiKey);
      const stream = await client.chat.completions.create(
        createChatCompletionRequest(parsed.data),
        { signal: abortController.signal },
      );
      await bridgeChatCompletionStream({ input: parsed.data, stream, emit });
      emit({
        type: EventType.RUN_FINISHED,
        threadId: parsed.data.threadId,
        runId: parsed.data.runId,
      });
    } catch (error) {
      emit(sanitizeUpstreamError(error));
    } finally {
      responseComplete = true;
      if (!res.writableEnded) {
        res.end();
      }
    }
  });

  router.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    const status = getErrorStatus(error);
    if (status === 413) {
      res.status(413).json({ error: "The AG-UI request body is too large." });
      return;
    }
    if (status === 400) {
      res.status(400).json({ error: "Invalid JSON request body." });
      return;
    }
    next(error);
  });

  return router;
}

function createDefaultClient(apiKey: string): NoveduChatClient {
  return createOpenAIClient(apiKey) as NoveduChatClient;
}

// The cheapest authenticated call on the Novedu proxy: it never reaches the
// model and meters nothing, so it is safe to run on every page load.
async function verifyApiKeyUpstream(apiKey: string, signal: AbortSignal): Promise<void> {
  await createOpenAIClient(apiKey).models.list({ signal });
}

function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: NOVEDU_BASE_URL,
    maxRetries: 0,
  });
}

// A closed availability window (403) means the key itself is fine and will work
// again later, so it must not be treated like a rejection.
function classifyKeyCheckError(status: number | undefined): Exclude<KeyCheckStatus, "valid"> {
  switch (status) {
    case 401:
      return "invalid";
    case 403:
      return "closed";
    default:
      return "unknown";
  }
}
