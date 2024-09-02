import { Redis } from "ioredis";
import { AccessToken, TokenCredential } from "@azure/identity";
import pino from "pino";

export async function getRedisClient(
  credential: TokenCredential,
  hostname: string,
  logger: pino.Logger
): Promise<Redis> {
  const redisToken = await credential.getToken(
    "https://redis.azure.com/.default"
  );
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

export function extractUsernameFromToken(accessToken: AccessToken): string {
  const base64Metadata = accessToken.token.split(".")[1]!;
  const { oid } = JSON.parse(
    Buffer.from(base64Metadata, "base64").toString("utf8")
  );
  return oid;
}
