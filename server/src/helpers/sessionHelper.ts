import express from "express";
import kv from "@azure/keyvault-secrets";
import pino from "pino";
import session from "express-session";
import RedisStore from "connect-redis";
import { getRedisClient } from "./redisHelper.js";
import { TokenCredential } from "@azure/identity";

export async function getSessionMiddleware(credential: TokenCredential, kvClient: kv.SecretClient, logger: pino.Logger): Promise<express.RequestHandler | undefined> {
  const redisHostname = await kvClient.getSecret("REDIS-HOSTNAME");
  if (!redisHostname) {
    logger.error("Secret REDIS-HOSTNAME not found in Key Vault");
    process.exit(1);
  }
  const redis = await getRedisClient(credential, redisHostname.value!, logger);

  const redisSecret = await kvClient.getSecret("REDIS-SECRET");
  if (!redisSecret || !redisSecret.value) {
    logger.error("Secret REDIS-SECRET not found in Key Vault");
    return;
  }
  return session({
    store: new RedisStore({
      client: redis,
      prefix: "tsweb:",
    }),
    secret: redisSecret.value,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV !== "development",
      maxAge: 48 * 60 * 60 * 1000, // 48 hours
      httpOnly: true,
    },
    rolling: true,
  });
}
