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
export const NOVEDU_BASE_URL = "https://novedu.at/api/coding/v1";

export interface NoveduAgentRouterOptions {
  createClient?: (code: string) => NoveduChatClient;
}

export function createNoveduAgentRouter(
  options: NoveduAgentRouterOptions = {},
): express.Router {
  const router = express.Router();
  const createClient = options.createClient ?? createDefaultClient;

  router.options("/", (_req, res) => {
    res.status(204).end();
  });

  router.post("/", express.json({ limit: "2mb" }), async (req, res) => {
    const code = req.get("X-Novedu-Code")?.trim();
    if (!code) {
      res.status(401).json({ error: "An activity code is required." });
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
      const client = createClient(code);
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

function createDefaultClient(code: string): NoveduChatClient {
  return new OpenAI({
    apiKey: code,
    baseURL: NOVEDU_BASE_URL,
    maxRetries: 0,
  }) as NoveduChatClient;
}
