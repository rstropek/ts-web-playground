import express from "express";
import cors from "cors";
import pinoHTTP from "pino-http";
import dotenv from "dotenv";
import * as msal from "@azure/msal-node";
import identity from "@azure/identity";
import kv from "@azure/keyvault-secrets";
import hbs from "hbs";
import path from "path";
import { fileURLToPath } from 'url';

import { ensureAuthenticated, getConfidentialClientApplication } from "./helpers/authHelper.js";
import { getSessionMiddleware } from "./helpers/sessionHelper.js";
import logger from "./helpers/logging.js";
import { getUserDetails } from "./helpers/graphHelper.js";

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

const pca = await getConfidentialClientApplication(kvClient);
if (!pca) {
  logger.error("Failed to get MSAL ConfidentialClientApplication");
  process.exit(1);
}

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

app.use(cors());
app.use(pinoHTTP.default);

if (process.env.LOG_REQUESTS) {
  app.use(pinoHTTP.default({ logger }));
}

const sessionMiddleware = await getSessionMiddleware(credential, kvClient);
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

  const redirectUrl = req.session.returnTo || "/";
  delete req.session.returnTo; // Clear the returnTo value in the session
  res.redirect(redirectUrl);
});

// Dashboard Route (Protected)
app.get("/dashboard", ensureAuthenticated, (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.send(`<h1>Welcome, ${req.session.user.username}</h1><a href="/logout">Logout</a>`);
});

// Dashboard Route (Protected)
app.get("/dummy", ensureAuthenticated, (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.send(`<h1>Dummy</h1>`);
});

// Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
});

// Home Route
app.get("/", (req, res) => {
  res.render("index");
  //res.send('<h1>Home</h1><a href="/login">Login with Azure AD</a>');
});
const PORT = process.env["PORT"] || 8080;
app.listen(PORT, () => {
  logger.info({ PORT }, "Listening");
});
