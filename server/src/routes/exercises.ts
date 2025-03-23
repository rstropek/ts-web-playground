import express from "express";
import { Database } from "@azure/cosmos";
import { createExercise, deleteExercise, getAllExercises, getExerciseById, updateExercise } from "../data/exercises.js";
import { ExerciseMasterData, ExerciseWithId } from "../data/model.js";
import { saveFile } from "../helpers/github.js";
import * as kv from "@azure/keyvault-secrets";
import logger from "../helpers/logging.js";
import { getUserById } from "../data/users.js";

async function create(cosmosDb: Database, kv: kv.SecretClient): Promise<express.Router> {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const searchQuery = req.query.search?.toString();
    const exercises = await getAllExercises(cosmosDb, searchQuery);

    res.render("exercises", { layout: 'adminLayout.hbs', exercises, searchQuery });
  });

  router.get("/:exerciseId", async (req, res) => {
    const exerciseId = req.params.exerciseId;

    let exercise: ExerciseMasterData | undefined;
    if (exerciseId === "new") {
      exercise = {
        title: "",
        category: "",
      };

    } else {
      exercise = await getExerciseById(cosmosDb, exerciseId);
      if (!exercise) {
        res.status(404).send();
        return;
      }
    }

    res.render("exercise-details", { layout: 'adminLayout.hbs', exercise });
  });

  router.post("/", async (req, res) => {
    const {
      id,
      title,
      sortOrder,
      yamlUrl,
      category,
      displayFrom,
      displayUntil
    } = req.body;

    if (!id) {
      const newExercise: ExerciseMasterData = {
        title,
        yamlUrl,
        category,
        sortOrder,
        displayFrom,
        displayUntil
      };
      await createExercise(cosmosDb, newExercise);
    } else {
      const exercise = await getExerciseById(cosmosDb, id);
      if (!exercise) {
        res.status(404).send();
        return;
      }

      exercise.title = title;
      exercise.sortOrder = sortOrder;
      exercise.yamlUrl = yamlUrl;
      exercise.category = category;
      exercise.displayFrom = displayFrom;
      exercise.displayUntil = displayUntil;
      await updateExercise(cosmosDb, exercise);
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

  return router;
}

export default create;
