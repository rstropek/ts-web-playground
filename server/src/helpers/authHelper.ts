import kv from "@azure/keyvault-secrets";
import * as msal from "@azure/msal-node";
import logger from "./logging.js";
import express from "express";
import { SessionData } from "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    firstName?: string;
    lastName?: string;
    accountName?: string;
    returnTo?: string;
    isAdmin?: boolean;
  }
}

export async function getConfidentialClientApplication(kvClient: kv.SecretClient): Promise<msal.ConfidentialClientApplication | undefined> {
  const entraClientId = await kvClient.getSecret("ENTRA-CLIENT-ID");
  const entraClientSecret = await kvClient.getSecret("ENTRA-CLIENT-SECRET");
  const entraTenantId = await kvClient.getSecret("ENTRA-TENANT-ID");
  if (!entraClientId || !entraClientSecret || !entraTenantId || !entraClientId.value || !entraClientSecret.value || !entraTenantId.value) {
    logger.error("Secrets ENTRA-CLIENT-ID, ENTRA-CLIENT-SECRET, or ENTRA-TENANT-ID not found in Key Vault");
    return;
  }
  const msalConfig: msal.Configuration = {
    auth: {
      clientId: entraClientId.value,
      authority: `https://login.microsoftonline.com/${entraTenantId.value}`,
      clientSecret: entraClientSecret.value,
    },
    system: {
      loggerOptions: {
        loggerCallback(loglevel: msal.LogLevel, message: string, _containsPii: boolean) {
          switch (loglevel) {
            case msal.LogLevel.Error:
              logger.error(message);
              break;
            case msal.LogLevel.Warning:
              logger.warn(message);
              break;
            case msal.LogLevel.Info:
              logger.info(message);
              break;
            case msal.LogLevel.Verbose:
              logger.debug(message);
              break;
          }
        },
        piiLoggingEnabled: false,
        logLevel: msal.LogLevel.Warning,
      },
    },
  };

  const pca = new msal.ConfidentialClientApplication(msalConfig);
  return pca;
}

export async function ensureAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
  if (isAuthenticated(req.session)) {
    return next(); // User is authenticated, proceed to the next middleware
  } else {
    // Store the original URL the user requested
    req.session.returnTo = req.originalUrl;
    res.redirect('/login'); // Redirect to login
  }
}

export async function ensureAuthenticatedWithoutRedirect(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
  if (isAuthenticated(req.session)) {
    return next(); // User is authenticated, proceed to the next middleware
  } else {
    res.status(401).send("Unauthorized");
  }
}

export function ensureAdmin(req: express.Request, res: express.Response, next: express.NextFunction): void {
  if (req.session.isAdmin) {
    return next(); // User is an admin, proceed to the next middleware
  } else {
    res.status(403).send("Forbidden");
  }
}

export function isAuthenticated(session: SessionData): boolean {
  return session.userId !== undefined;
}
