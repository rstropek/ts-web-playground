import express from "express";
import cors from "cors";
import pinoHTTP from "pino-http";
import dotenv from "dotenv";
import identity from "@azure/identity";
import kv from "@azure/keyvault-secrets";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import { createProxyMiddleware } from 'http-proxy-middleware';

import { ensureAdmin, ensureAuthenticated, getConfidentialClientApplication, isAuthenticated } from "./helpers/authHelper.js";
import { getSessionMiddleware } from "./helpers/sessionHelper.js";
import logger from "./helpers/logging.js";
import home from "./routes/home.js";
import auth from "./routes/auth.js";
import { createCosmosClient, getDatabase } from "./helpers/cosmosHelper.js";
import users from "./routes/users.js";
import exercises from "./routes/exercises.js";

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

const cosmosClient = await createCosmosClient(kvClient);
if (!cosmosClient) {
  logger.error("Failed to get CosmosClient");
  process.exit(1);
}

const cosmosDb = await getDatabase(cosmosClient, "tsweb");

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.engine("hbs", engine({
  extname: "hbs",
  defaultLayout: "layout",
  layoutsDir: path.join(__dirname, "views", "layouts"),
  partialsDir: path.join(__dirname, "views", "partials"),
  helpers: {
    dateFormat(dateStr: string) {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      return new Date(dateStr).toLocaleString('de-AT', options).replace(',', '');
    },
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());

if (process.env.LOG_REQUESTS) {
  app.use(pinoHTTP.default({ logger }));
}

const sessionMiddleware = await getSessionMiddleware(kvClient);
if (!sessionMiddleware) {
  logger.error("Failed to get session middleware");
  process.exit(1);
}
app.use(sessionMiddleware);

app.use(bodyParser.urlencoded({ extended: true }));

const authMiddleware = await auth(pca, cosmosDb, kvClient);
if (!authMiddleware) {
  logger.error("Failed to get auth middleware");
  process.exit(1);
}

const ghPat = await kvClient.getSecret("GH-PAT");
if (!ghPat || !ghPat.value) {
  logger.error("Failed to get GitHub PAT");
  process.exit(1);
}

app.use("/", home);
app.use("/", express.static(path.join(__dirname, 'public')));
app.use("/", authMiddleware);
app.use("/users", ensureAuthenticated, ensureAdmin, users(cosmosDb, ghPat.value));
app.use("/exercises", ensureAuthenticated, ensureAdmin, exercises(cosmosDb));
if (isDevelopment) {
  const proxyMiddleware = createProxyMiddleware<express.Request, express.Response>({
    target: 'http://localhost:5173/playground',
    changeOrigin: true,
    ws: true,
  });
  app.use('/playground', proxyMiddleware);
} else {
  app.use("/playground", express.static(path.join(__dirname, 'public', 'p5playground')));
}

app.get("/me", (req, res) => {
  if (!isAuthenticated(req.session)) {
    res.sendStatus(403 /* Forbidden */);
    return;
  }

  res.send({
    firstName: req.session.firstName,
  });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(500).send();
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection');
});

const PORT = process.env["PORT"] || 8080;
app.listen(PORT, () => {
  logger.info({ PORT }, "Listening");
});
