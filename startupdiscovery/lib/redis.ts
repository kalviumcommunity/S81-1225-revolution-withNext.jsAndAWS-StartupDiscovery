/**
 *
 * Redis connection utility for caching layer
 * Provides a singleton instance for application-wide caching
 */

import Redis from "ioredis";
import { Logger } from "./logger";

const logger = new Logger("RedisCache");

let redis: Redis | null = null;

/**
 * Get or create Redis connection
 */
export function getRedisClient(): Redis {
  if (redis) {
    return redis;
  }

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  try {
    redis = new Redis(redisUrl, {
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    redis.on("connect", () => {
      logger.info("Redis connected successfully");
    });

    redis.on("error", (err: Error & { code?: string }) => {
      logger.error(
        "Redis connection error",
        err,
        {
          error: err.message,
          code: err.code,
        }
      );
    });

    redis.on("ready", () => {
      logger.info("Redis is ready");
    });

    // Don't throw if Redis is not available - app should work without caching
    redis.connect().catch((err: Error) => {
      logger.warn("Failed to connect to Redis", { error: err.message });
    });

    return redis;
  } catch (error) {
    logger.error(
      "Failed to initialize Redis client",
      error instanceof Error ? error : undefined,
      {
        error: error instanceof Error ? error.message : String(error),
      }
    );
    // Create a dummy client that won't cache
    redis = new Redis(); // This will fail gracefully if Redis not available
    return redis;
  }
}

/**
 * Close Redis connection (for cleanup)
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    try {
      await redis.quit();
      redis = null;
      logger.info("Redis connection closed");
    } catch (error) {
      logger.error(
        "Error closing Redis connection",
        error instanceof Error ? error : undefined,
        {
          error: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }
}

// Export the client getter
export default getRedisClient;
