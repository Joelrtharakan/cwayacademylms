import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true, // Don't crash immediately on boot if Redis is unavailable
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("connect", () => {
  console.log("Successfully connected to Redis");
});

// Auto-connect in background
redis.connect().catch(() => {});
