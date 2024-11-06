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

    const response = await fetch(exerciseUrl.toString(), { redirect: 'follow' });
    const text = await response.text();
    res.status(response.status)
      .header("Content-Type", response.headers.get("Content-Type") || "text/plain")
      .send(text);
  });

  router.get("/exercise/image-proxy", async (req, res) => {
    const imageUrl = req.query.imageUrl;

    if (!imageUrl) {
      res.status(400).send("Missing imageUrl query parameter");
      return;
    }

    const response = await fetch(imageUrl.toString(), { redirect: 'follow' });
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.status(response.status)
      .header("Content-Type", response.headers.get("Content-Type") || "application/octet-stream")
      .send(buffer);
  });

  return router;
}

export function titleToFolder(title: string): string {
  return title.replace(/ /g, "_").replace(/\W/g, "").toLowerCase();
}

export default create;
