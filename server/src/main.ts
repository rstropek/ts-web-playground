import express from "express";
import cors from "cors";
import pino from "pino";
import pinoHTTP from "pino-http";
import dotenv from "dotenv";
import * as msal from "@azure/msal-node";
import graph from "@microsoft/microsoft-graph-client";
import identity from "@azure/identity";
import kv from "@azure/keyvault-secrets";
import { getConfidentialClientApplication } from "./helpers/authHelper.js";
import { getSessionMiddleware } from "./helpers/sessionHelper.js";

const logger = pino.default();

const isDevelopment = process.env.NODE_ENV === "development";
if (isDevelopment) {
  logger.info("Starting with {configuration} configuration", isDevelopment ? "development" : "production");
}

dotenv.config({
  path: ".env",
  debug: isDevelopment,
});

if (!process.env.KEY_VAULT_URL) {
  logger.error("Environment variable KEY_VAULT_URL is not set");
  process.exit(1);
}

const credential = new identity.DefaultAzureCredential();
const kvClient = new kv.SecretClient(process.env.KEY_VAULT_URL, credential);

const pca = await getConfidentialClientApplication(kvClient, logger);
if (!pca) {
  logger.error("Failed to get MSAL ConfidentialClientApplication");
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(pinoHTTP.default({ logger }));

const sessionMiddleware = await getSessionMiddleware(credential, kvClient, logger);
if (!sessionMiddleware) {
  logger.error("Failed to get session middleware");
  process.exit(1);
}
app.use(sessionMiddleware);

// Login Route
app.get("/login", async (req, res) => {
  const authCodeUrlParameters = {
    scopes: ["user.read"],
    redirectUri: "http://localhost:8080/auth/callback",
  };

  // Redirects to login page
  const response = await pca.getAuthCodeUrl(authCodeUrlParameters);
  res.redirect(response);
});

type User = {
  user: string;
  token: string;
};

declare module "express-session" {
  interface SessionData {
    user: msal.AccountInfo;
    token: string;
  }
}

// Auth callback route
app.get("/auth/callback", async (req, res) => {
  const tokenRequest: msal.AuthorizationCodeRequest = {
    code: req.query.code as string,
    scopes: ["user.read"],
    redirectUri: "http://localhost:8080/auth/callback",
  };

  const response = await pca.acquireTokenByCode(tokenRequest);

  const user = await getUserDetails(pca, response.account?.homeAccountId!);

  req.session.user = response.account!;
  req.session.token = response.accessToken;
  req.session.save((err) => {
    if (err) {
      logger.error(err);
    }
  });

  res.redirect("/dashboard");
});

// Dashboard Route (Protected)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.send(`<h1>Welcome, ${req.session.user.username}</h1><a href="/logout">Logout</a>`);
});

// Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
});

// Home Route
app.get("/", (req, res) => {
  res.send('<h1>Home</h1><a href="/login">Login with Azure AD</a>');
});
const PORT = process.env["PORT"] || 8080;
app.listen(PORT, () => {
  logger.info({ PORT }, "Listening");
});

function getAuthenticatedClient(msalClient: msal.ConfidentialClientApplication, userId: string) {
  if (!msalClient || !userId) {
    throw new Error(`Invalid MSAL state. Client: ${msalClient ? "present" : "missing"}, User ID: ${userId ? "present" : "missing"}`);
  }

  // Initialize Graph client
  const client = graph.Client.init({
    // Implement an auth provider that gets a token
    // from the app's MSAL instance
    authProvider: async (done) => {
      try {
        // Get the user's account
        const account = await msalClient.getTokenCache().getAccountByHomeId(userId);

        if (account) {
          // Attempt to get the token silently
          // This method uses the token cache and
          // refreshes expired tokens as needed
          const scopes = ["user.read"];
          const response = await msalClient.acquireTokenSilent({
            scopes: scopes,
            redirectUri: process.env.OAUTH_REDIRECT_URI,
            account: account,
          });

          // First param to callback is the error,
          // Set to null in success case
          done(null, response.accessToken);
        }
      } catch (err) {
        console.log(JSON.stringify(err, Object.getOwnPropertyNames(err)));
        done(err, null);
      }
    },
  });

  return client;
}

async function getUserDetails(msalClient: msal.ConfidentialClientApplication, userId: string) {
  const client = getAuthenticatedClient(msalClient, userId);

  const user = await client.api("/me").select("givenName,surname,displayName,mail,userPrincipalName,otherMails").get();
  return user;
}
