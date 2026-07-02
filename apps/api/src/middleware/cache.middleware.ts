import { Request, Response, NextFunction } from "express";
import { redis } from "../utils/redis";

/**
 * Middleware to cache GET requests in Redis for a specific duration.
 * @param ttlSeconds Time-to-live for the cache in seconds (default: 300s = 5m).
 */
export const cacheRoute = (ttlSeconds: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const authInfo = req.headers.authorization || req.cookies?.cway_refresh || "anonymous";
    const key = `cache:${req.originalUrl || req.url}:${authInfo}`;

    try {
      const cachedResponse = await redis.get(key);

      if (cachedResponse) {
        return res.setHeader("X-Cache", "HIT").json(JSON.parse(cachedResponse));
      }

      // Override res.json to capture the response and cache it
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.setex(key, ttlSeconds, JSON.stringify(body)).catch((err) => {
            console.error("Redis Cache Error:", err);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error("Redis Cache Middleware Error:", err);
      next(); // Fail gracefully
    }
  };
};
