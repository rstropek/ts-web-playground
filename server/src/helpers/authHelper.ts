import kv from "@azure/keyvault-secrets";
import pino from "pino";
import * as msal from "@azure/msal-node";

export async function getConfidentialClientApplication(kvClient: kv.SecretClient, logger: pino.Logger): Promise<msal.ConfidentialClientApplication | undefined> {
  const entraClientId = await kvClient.getSecret("ENTRY-CLIENT-ID");
  const entraClientSecret = await kvClient.getSecret("ENTRA-CLIENT-SECRET");
  const entraTenantId = await kvClient.getSecret("ENTRA-TENANT-ID");
  if (!entraClientId || !entraClientSecret || !entraTenantId || !entraClientId.value || !entraClientSecret.value || !entraTenantId.value) {
    logger.error("Secrets ENTRY-CLIENT-ID, ENTRA-CLIENT-SECRET, or ENTRA-TENANT-ID not found in Key Vault");
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
