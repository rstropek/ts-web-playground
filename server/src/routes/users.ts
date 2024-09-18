import express from "express";
import { Database } from "@azure/cosmos";
import { getAllUsers, getUserById, updateUser } from "../data/users.js";
import { Octokit } from "@octokit/rest";
import { createRepository } from "../helpers/github.js";
import { isAuthenticated } from "../helpers/authHelper.js";
import logger from "../helpers/logging.js";

export function createUserRoutes(cosmosDb: Database, ghPat: string): express.Router {
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

  router.post("/:userId", async (req, res) => {
    const userId = req.params.userId;
    const { 
      operation,
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

    user.repository = repository;
    if (operation === "generate") {
      const repoName = await createRepository(ghPat, process.env.GH_ORG!);
      if (repoName) {
        user.repository = repoName;
      }
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.accountName = accountName;
    user.class = userClass;
    await updateUser(cosmosDb, user);

    if (operation === "generate") {
      res.redirect(`/users/${userId}`);
    } else {
      res.redirect("/users");
    }
  });

  return router;
}

export function createMeRoute(cosmosDb: Database): express.RequestHandler {
  return async(req: express.Request, res: express.Response) => {
    logger.info(req.session.firstName);
    if (!isAuthenticated(req.session)) {
      res.status(403 /* Forbidden */)
        .send({
          userId: req.session.userId,
          firstName: req.session.firstName,
          lastName: req.session.lastName,
          accountName: req.session.accountName,
          isAdmin: req.session.isAdmin,
        });
      return;
    }

    const user = await getUserById(cosmosDb, req.session.userId!);
    if (!user) {
      res.sendStatus(404 /* Not Found */);
      return;
    }

    res.send({
      firstName: req.session.firstName,
      repository: user.repository,
    });
  }
}
