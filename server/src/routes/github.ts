import express from "express";
import { Database } from "@azure/cosmos";
import { saveFile } from "../helpers/github.js";
import * as kv from "@azure/keyvault-secrets";
import logger from "../helpers/logging.js";
import { getUserById } from "../data/users.js";
import { getExerciseByTitle } from "../data/exercises.js";

async function create(cosmosDb: Database, kv: kv.SecretClient): Promise<express.Router> {
  const router = express.Router();

  const ghPat = await kv.getSecret("GH-PAT");
  if (!ghPat || !ghPat.value) {
    logger.error("Failed to get GitHub PAT");
    process.exit(1);
  }
  router.post("/exercise/save", async (req, res) => {
    const { 
      title, 
      fileName,
      content,
    } = req.body;

    const user = await getUserById(cosmosDb, req.session.userId!);
    if (!user) {
      res.status(404 /* Not found */).send();
      return;
    }

    if (!user.repository) {
      res.status(400 /* Bad Request */ ).send("No repository found for user");
      return;
    }

    const exercise = await getExerciseByTitle(cosmosDb, title);
    if (!exercise) {
      res.status(404 /* Not found */).send(`Exercise ${title} not found`);
      return;
    }
    const currentDateTime = new Date();
    if (exercise.displayFrom && new Date(exercise.displayFrom) > currentDateTime) {
      res.status(403 /* Forbidden */).send("Exercise is not yet available");
      return;
    }
    if (exercise.displayUntil && new Date(exercise.displayUntil) < currentDateTime) {
      res.status(403 /* Forbidden */).send("Exercise is no longer available");
      return;
    }

    const folder = titleToFolder(title);
    await saveFile(ghPat.value!, process.env.GH_ORG!, user.repository, `${folder}/${fileName}`, content);
    res.sendStatus(200);
  });

  router.get("/exercise/proxy", async (req, res) => {
    const exerciseUrl = req.query.exerciseUrl;

    if (!exerciseUrl) {
      res.status(400).send("Missing exerciseUrl query parameter");
      return;
    }

    const result = await fetchProxiedUrl(exerciseUrl.toString());
    if (!result.ok) {
      res.status(400).send(proxyErrorMessage(result.reason, "exerciseUrl"));
      return;
    }

    const text = await result.response.text();
    res.status(result.response.status)
      .header("Content-Type", result.response.headers.get("Content-Type") || "text/plain")
      .send(text);
  });

  router.get("/exercise/image-proxy", async (req, res) => {
    const imageUrl = req.query.imageUrl;

    if (!imageUrl) {
      res.status(400).send("Missing imageUrl query parameter");
      return;
    }

    const result = await fetchProxiedUrl(imageUrl.toString());
    if (!result.ok) {
      res.status(400).send(proxyErrorMessage(result.reason, "imageUrl"));
      return;
    }

    const arrayBuffer = await result.response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.status(result.response.status)
      .header("Content-Type", result.response.headers.get("Content-Type") || "application/octet-stream")
      .send(buffer);
  });

  return router;
}

export function titleToFolder(title: string): string {
  return title.replace(/ /g, "_").replace(/\W/g, "").toLowerCase();
}

const MAX_PROXY_REDIRECTS = 5;

/**
 * The proxies above fetch a URL that the caller supplies, so the scheme is
 * checked first: https anywhere, plain http only for loopback so an exercise
 * can be served from a local web server while authoring it. Which host an
 * exercise comes from is deliberately not restricted - teachers host their
 * exercise files wherever they like.
 */
export function validateProxyUrl(candidate: string, base?: URL): URL | undefined {
  let url: URL;
  try {
    url = new URL(candidate, base);
  } catch {
    return;
  }

  if (url.protocol === "https:") {
    return url;
  }
  if (url.protocol === "http:" && isLoopbackHost(url.hostname)) {
    return url;
  }

  return;
}

function isLoopbackHost(hostname: string): boolean {
  // URL keeps the brackets around an IPv6 host, as in http://[::1]:8000.
  return hostname === "localhost"
    || hostname === "[::1]"
    || /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
}

export type ProxyFetchResult =
  | { ok: true, response: Response }
  | { ok: false, reason: "rejected-url" | "too-many-redirects" };

/**
 * Fetches a proxied URL, following redirects by hand so that every hop goes
 * through validateProxyUrl again. With fetch's own `redirect: "follow"` a
 * single redirect could move the request to a scheme we just rejected.
 */
export async function fetchProxiedUrl(candidate: string): Promise<ProxyFetchResult> {
  let url = validateProxyUrl(candidate);
  if (!url) {
    return { ok: false, reason: "rejected-url" };
  }

  for (let hop = 0; hop <= MAX_PROXY_REDIRECTS; hop++) {
    const response = await fetch(url, { redirect: "manual" });

    const location = isRedirect(response.status) ? response.headers.get("Location") : null;
    if (!location) {
      return { ok: true, response };
    }

    const next = validateProxyUrl(location, url);
    if (!next) {
      return { ok: false, reason: "rejected-url" };
    }
    url = next;
  }

  return { ok: false, reason: "too-many-redirects" };
}

function isRedirect(status: number): boolean {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

function proxyErrorMessage(reason: "rejected-url" | "too-many-redirects", parameter: string): string {
  return reason === "too-many-redirects"
    ? `${parameter} redirects more than ${MAX_PROXY_REDIRECTS} times`
    : `${parameter} must be an https URL (http is only allowed for localhost)`;
}

export default create;
