import { CosmosClient, Database } from "@azure/cosmos";
import kv from "@azure/keyvault-secrets";
import logger from "./logging.js";

export async function createCosmosClient(kvClient: kv.SecretClient): Promise<CosmosClient | undefined> {
  const uri = await kvClient.getSecret("COSMOS-URI");
  if (!uri || !uri.value) {
    logger.error("Secret COSMOS-URI not found in Key Vault");
    return;
  }

  const key = await kvClient.getSecret("COSMOS-KEY");
  if (!key || !key.value) {
    logger.error("Secret COSMOS-KEY not found in Key Vault");
    return;
  }

  return new CosmosClient({ endpoint: uri.value, key: key.value });
}

export async function getDatabase(client: CosmosClient, databaseId: string): Promise<Database> {
  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  return database;
}

export enum Collections {
  Users = "Users",
  Exercises = "Exercises",
}

export async function getContainer(database: Database, containerId: string) {
  const { container } = await database.containers.createIfNotExists({ id: containerId });
  return container;
}
