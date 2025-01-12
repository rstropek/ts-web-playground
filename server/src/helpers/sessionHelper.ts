import express from "express";
import * as kv from "@azure/keyvault-secrets";
import session from "express-session";
import { RedisStore } from "connect-redis";
import logger from './logging.js';
import { Redis } from "ioredis";

export async function getSessionMiddleware(kvClient: kv.SecretClient): Promise<express.RequestHandler | undefined> {
  const redisHostname = await kvClient.getSecret("REDIS-HOSTNAME");
  if (!redisHostname || !redisHostname.value) {
    logger.error("Secret REDIS-HOSTNAME not found in Key Vault");
    process.exit(1);
  }
  const redisKey = await kvClient.getSecret("REDIS-KEY");
  if (!redisKey || !redisKey.value) {
    logger.error("Secret REDIS-KEY not found in Key Vault");
    process.exit(1);
  }
  const redis = await getRedisClient(redisKey.value, redisHostname.value!);

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
      secure: (process.env.SECURE_COOKIE ?? "false") === "true",
      maxAge: 48 * 60 * 60 * 1000, // 48 hours
      httpOnly: true,
    },
    rolling: true,
  });
}

async function getRedisClient(redisKey: string, hostname: string): Promise<Redis> {
  //const redisToken = await credential.getToken("https://redis.azure.com/.default");
  //const redisPrincipal = extractUsernameFromToken(redisToken!);
  const redis = new Redis({
    username: "default",
    password: redisKey,
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
