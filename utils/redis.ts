import env from "./env";
import { createClient } from "redis";

const redisClient = createClient({
  url: env("REDIS_URL")!,
});

export type RedisClientType = typeof redisClient;

export default redisClient;
