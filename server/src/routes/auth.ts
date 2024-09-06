import express from "express";
import * as msal from "@azure/msal-node";
import { getUserDetails, isUserInGroup } from "../helpers/graphHelper.js";
import logger from "../helpers/logging.js";
import { Database } from "@azure/cosmos";
import { storeLogin } from "../data/users.js";
import kv from "@azure/keyvault-secrets";

async function create(pca: msal.ConfidentialClientApplication, cosmosDb: Database, kv: kv.SecretClient): Promise<express.Router | undefined> {
  const router = express.Router();

  const entraAdminGroupId = await kv.getSecret("ENTRA-ADMIN-GROUP-ID");
  if (!entraAdminGroupId || !entraAdminGroupId.value) {
    logger.error("Secret ENTRA-ADMIN-GROUP-ID not found in Key Vault");
    return;
  }

  router.get("/login", async (req, res) => {
    const authCodeUrlParameters = {
      scopes: ["user.read"],
      redirectUri: "http://localhost:8080/auth/callback",
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
      redirectUri: "http://localhost:8080/auth/callback",
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

  return router;
}

export default create;
