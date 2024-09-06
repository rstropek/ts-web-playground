import express from "express";
import { Database } from "@azure/cosmos";
import { createExercise, deleteExercise, getAllExercises, getExerciseById, updateExercise } from "../data/exercises.js";
import { ExerciseMasterData, ExerciseWithId } from "../data/model.js";

function create(cosmosDb: Database): express.Router {
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
        descriptionMd: ""
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
      yamlUrl
    } = req.body;

    if (id) {
      const exercise = await getExerciseById(cosmosDb, id);
      if (!exercise) {
        res.status(404).send();
        return;
      }

      exercise.title = title;
      exercise.descriptionMd = descriptionMd;
      exercise.icon = icon;
      exercise.yamlUrl = yamlUrl;
      await updateExercise(cosmosDb, exercise);
    } else {
      const newExercise: ExerciseMasterData = {
        title,
        descriptionMd,
        icon,
        yamlUrl
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

  return router;
}

export default create;
