import express from "express";
import { ensureAuthenticated, isAuthenticated } from "../helpers/authHelper.js";
import { Database } from "@azure/cosmos";
import { getAllExercises } from "../data/exercises.js";
import { ExerciseWithId } from "../data/model.js";
import * as kv from "@azure/keyvault-secrets";
import logger from "../helpers/logging.js";

async function create(cosmosDb: Database, kv: kv.SecretClient): Promise<express.Router> {
  const recaptchaKey = await kv.getSecret("RECAPTCHA-KEY");
  if (!recaptchaKey || !recaptchaKey.value) {
    logger.error("Failed to get recaptcha key");
    process.exit(1);
  }

  const router = express.Router();

  router.get("/", (req, res) => {
    if (isAuthenticated(req.session)) {
      return res.redirect("/main");
    }

    res.render("home", { layout: 'homeLayout.hbs', captchaKey: recaptchaKey.value });
  });

  router.get("/main", ensureAuthenticated, async (req, res) => {
    const exercises = await getAllExercises(cosmosDb, undefined, true);

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
