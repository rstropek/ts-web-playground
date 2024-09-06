import express from "express";
import { ensureAuthenticated } from "../helpers/authHelper.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("home");
});

router.get("/main", ensureAuthenticated, (req, res) => {
  res.render("main", { firstName: req.session.firstName, isAdmin: req.session.isAdmin });
});

export default router;
