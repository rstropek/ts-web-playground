import express from "express";
import kv from "@azure/keyvault-secrets";
import session from "express-session";
import RedisStore from "connect-redis";
import logger from './logging.js';
import { Redis } from "ioredis";
import { AccessToken, TokenCredential } from "@azure/identity";

export async function getSessionMiddleware(credential: TokenCredential, kvClient: kv.SecretClient): Promise<express.RequestHandler | undefined> {
  const redisHostname = await kvClient.getSecret("REDIS-HOSTNAME");
  if (!redisHostname) {
    logger.error("Secret REDIS-HOSTNAME not found in Key Vault");
    process.exit(1);
  }
  const redis = await getRedisClient(credential, redisHostname.value!);

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

async function getRedisClient(credential: TokenCredential, hostname: string): Promise<Redis> {
  const redisToken = await credential.getToken("https://redis.azure.com/.default");
  const redisPrincipal = extractUsernameFromToken(redisToken!);
  const redis = new Redis({
    username: redisPrincipal,
    password: redisToken!.token,
    tls: {
      host: hostname,
      port: 6380,
    },
    keepAlive: 0,
  });

  redis.on("error", (error: Error) => {
    logger.error(error, "Redis client error");
  });

  // Write a value to the cache to ensure the connection is successful
  await redis.set("foo", "bar");

  return redis;
}

function extractUsernameFromToken(accessToken: AccessToken): string {
  const base64Metadata = accessToken.token.split(".")[1]!;
  const { oid } = JSON.parse(Buffer.from(base64Metadata, "base64").toString("utf8"));
  return oid;
}
