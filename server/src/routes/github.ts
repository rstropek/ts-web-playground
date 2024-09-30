import express from "express";
import { Database } from "@azure/cosmos";
import { saveFile } from "../helpers/github.js";
import kv from "@azure/keyvault-secrets";
import logger from "../helpers/logging.js";
import { getUserById } from "../data/users.js";

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

  return router;
}

export function titleToFolder(title: string): string {
  return title.replace(/ /g, "_").replace(/\W/g, "").toLowerCase();
}

export default create;
