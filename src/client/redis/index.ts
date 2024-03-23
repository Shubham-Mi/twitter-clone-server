import Redis from "ioredis";

export const redisClient = new Redis(
  `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_ENDPOINT}:${process.env.REDIS_PORT}`
);
