import express from "express";
import { ensureAuthenticated, isAuthenticated } from "../helpers/authHelper.js";

const router = express.Router();

router.get("/", (req, res) => {
  if (isAuthenticated(req.session)) {
    return res.redirect("/main");
  }

  res.render("home");
});

router.get("/main", ensureAuthenticated, (req, res) => {
  res.render("main", { firstName: req.session.firstName, isAdmin: req.session.isAdmin });
});

export default router;
