import express from "express";
import { Database } from "@azure/cosmos";
import { getAllUsers, getUserById, updateUser } from "../data/users.js";

function create(cosmosDb: Database): express.Router {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const searchQuery = req.query.search?.toString();
    const users = await getAllUsers(cosmosDb, searchQuery);

    res.render("users", { users, searchQuery });
  });

  router.get("/:userId", async (req, res) => {
    const userId = req.params.userId;
    const user = await getUserById(cosmosDb, userId);
    if (!user) {
      res.status(404).send();
      return;
    }

    res.render("user-details", { user });
  });

  router.post("/edit", async (req, res) => {
    const { 
      userId, 
      firstName, 
      lastName, 
      accountName, 
      class: userClass,
      repository
    } = req.body;

    const user = await getUserById(cosmosDb, userId);
    if (!user) {
      res.status(404).send();
      return;
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.accountName = accountName;
    user.class = userClass;
    user.repository = repository;
    await updateUser(cosmosDb, user);

    res.redirect("/users");
  });

  return router;
}

export default create;
