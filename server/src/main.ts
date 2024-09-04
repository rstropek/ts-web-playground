import express from "express";
import cors from "cors";
import pinoHTTP from "pino-http";
import dotenv from "dotenv";
import * as msal from "@azure/msal-node";
import identity from "@azure/identity";
import kv from "@azure/keyvault-secrets";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import { ensureAuthenticated, getConfidentialClientApplication } from "./helpers/authHelper.js";
import { getSessionMiddleware } from "./helpers/sessionHelper.js";
import logger from "./helpers/logging.js";
import { getUserDetails } from "./helpers/graphHelper.js";
import home from "./routes/home.js";

const isDevelopment = process.env.NODE_ENV === "development";
logger.info({ configuration: isDevelopment ? "development" : "production" }, "Start configuration");

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
app.engine("hbs", engine({
  extname: "hbs",
  defaultLayout: "layout",
  layoutsDir: path.join(__dirname, "views", "layouts"),
  partialsDir: path.join(__dirname, "views", "partials"),
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());

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

  req.session.userId = response.account?.homeAccountId;
  req.session.accountName = response.account?.username;
  req.session.firstName = user.givenName;
  req.session.lastName = user.surname;
  req.session.save((err) => {
    if (err) {
      logger.error(err);
    }
  });

  const redirectUrl = req.session.returnTo || "/main";
  delete req.session.returnTo; // Clear the returnTo value in the session
  res.redirect(redirectUrl);
});

// Dashboard Route (Protected)
app.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.send(`<h1>Welcome, ${req.session.accountName}</h1><a href="/logout">Logout</a>`);
});

// Dashboard Route (Protected)
app.get("/dummy", ensureAuthenticated, (req, res) => {
  res.send(`<h1>Dummy</h1>`);
});

// Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
});

app.use("/", home);

app.use("/playground", ensureAuthenticated, express.static(path.join(__dirname, 'public', 'p5playground')));

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(500).send();
});

const PORT = process.env["PORT"] || 8080;
app.listen(PORT, () => {
  logger.info({ PORT }, "Listening");
});
