import express from "express";
import { Database } from "@azure/cosmos";
import { createExercise, deleteExercise, getAllExercises, getExerciseById, updateExercise } from "../data/exercises.js";
import { ExerciseMasterData, ExerciseWithId } from "../data/model.js";
import { saveFile } from "../helpers/github.js";
import kv from "@azure/keyvault-secrets";
import logger from "../helpers/logging.js";
import { getUserById } from "../data/users.js";

async function create(cosmosDb: Database, kv: kv.SecretClient): Promise<express.Router> {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const searchQuery = req.query.search?.toString();
    const exercises = await getAllExercises(cosmosDb, searchQuery);

    res.render("exercises", { exercises, searchQuery });
  });

  router.get("/:exerciseId", async (req, res) => {
    const exerciseId = req.params.exerciseId;

    if (exerciseId === "new") {
      const exercise: ExerciseMasterData = {
        title: "",
        category: "",
      };

      res.render("exercise-details", { exercise });
    } else {
      const exercise = await getExerciseById(cosmosDb, exerciseId);
      if (!exercise) {
        res.status(404).send();
        return;
      }

      res.render("exercise-details", { exercise });
    }
  });

  router.post("/edit", async (req, res) => {
    const { 
      id, 
      title, 
      descriptionMd, 
      icon,
      yamlUrl,
      category
    } = req.body;

    if (id) {
      const exercise = await getExerciseById(cosmosDb, id);
      if (!exercise) {
        res.status(404).send();
        return;
      }

      exercise.title = title;
      exercise.yamlUrl = yamlUrl;
      exercise.category = category;
      await updateExercise(cosmosDb, exercise);
    } else {
      const newExercise: ExerciseMasterData = {
        title,
        yamlUrl,
        category
      };
      await createExercise(cosmosDb, newExercise);
    }

    res.redirect("/exercises");
  });

  // delete route
  router.get("/:exerciseId/delete", async (req, res) => {
    const exerciseId = req.params.exerciseId;

    const exercise = await getExerciseById(cosmosDb, exerciseId);
    if (!exercise) {
      res.status(404).send();
      return;
    }

    // delete exercise
    await deleteExercise(cosmosDb, exerciseId);

    res.redirect("/exercises");
  });

  const ghPat = await kv.getSecret("GH-PAT");
  if (!ghPat || !ghPat.value) {
    logger.error("Failed to get GitHub PAT");
    process.exit(1);
  }
  router.post("/save", async (req, res) => {
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

  return router;
}

export function titleToFolder(title: string): string {
  return title.replace(/ /g, "_").replace(/\W/g, "").toLowerCase();
}

export default create;
