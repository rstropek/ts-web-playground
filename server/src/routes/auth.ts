import express from "express";
import * as msal from "@azure/msal-node";
import { getUserDetails, isUserInGroup } from "../helpers/graphHelper.js";
import logger from "../helpers/logging.js";
import { Database } from "@azure/cosmos";
import { getUserWithTan, storeLogin } from "../data/users.js";
import * as kv from "@azure/keyvault-secrets";

type RecaptchaResponse = {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  score: number;
  action: string;
};

async function create(pca: msal.ConfidentialClientApplication, cosmosDb: Database, kv: kv.SecretClient): Promise<express.Router | undefined> {
  const router = express.Router();

  const entraAdminGroupId = await kv.getSecret("ENTRA-ADMIN-GROUP-ID");
  if (!entraAdminGroupId || !entraAdminGroupId.value) {
    logger.error("Secret ENTRA-ADMIN-GROUP-ID not found in Key Vault");
    return;
  }

  const recaptchaSecret = await kv.getSecret("RECAPTCHA-SECRET");
  if (!recaptchaSecret || !recaptchaSecret.value) {
    logger.error("Failed to get recaptcha secret");
    process.exit(1);
  }

  router.get("/login", async (req, res) => {
    const authCodeUrlParameters = {
      scopes: ["user.read"],
      redirectUri: `${process.env.CALLBACK_HOST ?? "http://localhost:8080"}/auth/callback`,
    };

    // Redirects to login page
    const response = await pca.getAuthCodeUrl(authCodeUrlParameters);
    res.redirect(response);
  });

  // Auth callback route
  router.get("/auth/callback", async (req, res) => {
    const tokenRequest: msal.AuthorizationCodeRequest = {
      code: req.query.code as string,
      scopes: ["user.read"],
      redirectUri: `${process.env.CALLBACK_HOST ?? "http://localhost:8080"}/auth/callback`,
    };

    const response = await pca.acquireTokenByCode(tokenRequest);

    const user = await getUserDetails(pca, response.account?.homeAccountId!);

    req.session.userId = response.account?.homeAccountId;
    req.session.accountName = response.account?.username;
    req.session.firstName = user.givenName;
    req.session.lastName = user.surname;
    req.session.isAdmin = await isUserInGroup(pca, response.account?.homeAccountId!, entraAdminGroupId.value!);
    req.session.save((err) => {
      if (err) {
        logger.error(err);
      }
    });

    await storeLogin(cosmosDb, {
      userId: req.session.userId!,
      accountName: req.session.accountName!,
      firstName: req.session.firstName!,
      lastName: req.session.lastName!
    });

    const redirectUrl = req.session.returnTo || "/main";
    delete req.session.returnTo; // Clear the returnTo value in the session
    res.redirect(redirectUrl);
  });

  router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      res.redirect("/");
    });
  });

  router.post("/loginWithTan", async (req, res) => {
    const recaptcha_response = req.body["g-recaptcha-response"];

    const recaptchaResult = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${recaptchaSecret.value}&response=${recaptcha_response}`,
    });

    if (!recaptchaResult.ok) {
      logger.error("Recaptcha request failed");
      res.status(500).send("Recaptcha request failed");
      return;
    }

    const result: RecaptchaResponse = await recaptchaResult.json();
    const challenge_ts = new Date(result.challenge_ts);
    const now = new Date();

    if (!result.success || result.action !== "loginWithTan" || result.score < 0.5 || now.getTime() - challenge_ts.getTime() > 1000 * 60 * 5) {
      logger.error("Recaptcha failed");
      res.status(400).send("Recaptcha failed");
      return;
    }

    const { user, tan } = req.body;

    const loggedInUser = await getUserWithTan(cosmosDb, user, tan);
    if (!loggedInUser) {
      res.redirect("/");
      return;
    }

    req.session.userId = loggedInUser.userId;
    req.session.accountName = loggedInUser.accountName;
    req.session.firstName = loggedInUser.firstName;
    req.session.lastName = loggedInUser.lastName;
    req.session.isAdmin = false; // login with TAN does not support admin rights
    req.session.save((err) => {
      if (err) {
        logger.error(err);
      }
    });

    await storeLogin(cosmosDb, {
      userId: req.session.userId!,
      accountName: req.session.accountName!,
      firstName: req.session.firstName!,
      lastName: req.session.lastName!
    });

    res.redirect("/main");
  });

  router.post("/workAnonymously", async (req, res) => {
    const recaptcha_response = req.body["g-recaptcha-response"];

    const recaptchaResult = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${recaptchaSecret.value}&response=${recaptcha_response}`,
    });

    if (!recaptchaResult.ok) {
      logger.error("Recaptcha request failed");
      res.status(500).send("Recaptcha request failed");
      return;
    }

    const result: RecaptchaResponse = await recaptchaResult.json();
    const challenge_ts = new Date(result.challenge_ts);
    const now = new Date();

    if (!result.success || result.action !== "workAnonymously" || result.score < 0.5 || now.getTime() - challenge_ts.getTime() > 1000 * 60 * 5) {
      logger.error("Recaptcha failed");
      res.status(400).send("Recaptcha failed");
      return;
    }

    req.session.userId = "~~anonymous~~";
    req.session.accountName = "anonymous";
    req.session.firstName = "Anonymous";
    req.session.lastName = "";
    req.session.isAdmin = false; // working anonymously does not support admin rights
    req.session.save((err) => {
      if (err) {
        logger.error(err);
      }
    });

    res.redirect("/main");
  });

  return router;
}

export default create;
