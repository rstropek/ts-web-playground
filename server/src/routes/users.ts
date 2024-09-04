import express from "express";
import { Database } from "@azure/cosmos";
import { getAllUsers } from "../data/users.js";

function create(cosmosDb: Database): express.Router {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const users = await getAllUsers(cosmosDb);

    res.render("users", { users });
  });

  return router;
}

export default create;
