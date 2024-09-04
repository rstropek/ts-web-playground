import express from "express";
import logger from '../helpers/logging.js';

const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

export default router;
