import express from "express";
import { ensureAuthenticated, isAuthenticated } from "../helpers/authHelper.js";
import { Database } from "@azure/cosmos";
import { getAllExercises } from "../data/exercises.js";
import { ExerciseWithId } from "../data/model.js";

function create(cosmosDb: Database): express.Router {
  const router = express.Router();

  router.get("/", (req, res) => {
    if (isAuthenticated(req.session)) {
      return res.redirect("/main");
    }

    res.render("home", {layout: 'homeLayout.hbs'});
  });

  router.get("/main", ensureAuthenticated, async (req, res) => {
    const exercises = await getAllExercises(cosmosDb);

    const categories = new Set(exercises.map(exercise => exercise.category ?? "Uncategorized"));
    const groupedExercises: { category: string, exercises: ExerciseWithId[] }[] = [];
    for(const c of categories) {
      groupedExercises.push({ category: c, exercises: exercises.filter(e => e.category === c) });
    }

    res.render("main", { firstName: req.session.firstName, isAdmin: req.session.isAdmin, groupedExercises });
  });

  return router;
}

export default create;
