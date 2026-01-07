/**
 * Cache helper utilities for implementing cache-aside pattern
 * Provides functions for get, set, delete, and invalidation with TTL support
 */

import { getRedisClient } from "./redis";
import { Logger } from "./logger";

const logger = new Logger("CacheUtils");

export interface CacheOptions {
  ttl?: number; // Time-to-live in seconds (default: 300s)
  tags?: string[]; // For cache invalidation by tag
}

/**
 * Generate cache key with namespace
 */
export function generateCacheKey(
  namespace: string,
  ...parts: (string | number)[]
): string {
  return [namespace, ...parts].join(":");
}

/**
 * Get value from cache
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    const cached = await redis.get(key);

    if (cached) {
      logger.debug("Cache hit", { key });
      return JSON.parse(cached) as T;
    }

    logger.debug("Cache miss", { key });
    return null;
  } catch (error) {
    logger.warn("Error reading from cache", {
      key,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Set value in cache with TTL
 */
export async function setCached<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const ttl = options.ttl || 300; // Default 5 minutes

    // Store the value
    await redis.set(key, JSON.stringify(value), "EX", ttl);

    // Store tags for invalidation
    if (options.tags && options.tags.length > 0) {
      for (const tag of options.tags) {
        const tagKey = `tag:${tag}`;
        await redis.sadd(tagKey, key);
        await redis.expire(tagKey, ttl);
      }
    }

    logger.debug("Cache set", { key, ttl, tags: options.tags?.length || 0 });
    return true;
  } catch (error) {
    logger.warn("Error writing to cache", {
      key,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Delete value from cache
 */
export async function deleteCached(key: string | string[]): Promise<number> {
  try {
    const redis = getRedisClient();
    const keys = Array.isArray(key) ? key : [key];

    const deleted = await redis.del(...keys);
    logger.debug("Cache deleted", { keys: keys.length, deleted });
    return deleted;
  } catch (error) {
    logger.warn("Error deleting from cache", {
      key,
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}

/**
 * Invalidate all cache keys with specific tag
 */
export async function invalidateCacheByTag(tag: string): Promise<number> {
  try {
    const redis = getRedisClient();
    const tagKey = `tag:${tag}`;

    // Get all keys with this tag
    const keys = await redis.smembers(tagKey);

    if (keys.length === 0) {
      logger.debug("No cache keys found for tag", { tag });
      return 0;
    }

    // Delete all tagged keys
    const deleted = await redis.del(...keys);
    await redis.del(tagKey);

    logger.info("Cache invalidated by tag", { tag, deleted });
    return deleted;
  } catch (error) {
    logger.warn("Error invalidating cache by tag", {
      tag,
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCacheByPattern(
  pattern: string
): Promise<number> {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);

    if (keys.length === 0) {
      logger.debug("No cache keys found for pattern", { pattern });
      return 0;
    }

    const deleted = await redis.del(...keys);
    logger.info("Cache invalidated by pattern", { pattern, deleted });
    return deleted;
  } catch (error) {
    logger.warn("Error invalidating cache by pattern", {
      pattern,
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}

/**
 * Cache-aside pattern helper
 * Try to get from cache, if not found, execute fetcher and cache result
 */
export async function cacheAside<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache first
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Cache miss - fetch from source
  const startTime = Date.now();
  const data = await fetcher();
  const fetchTime = Date.now() - startTime;

  // Cache the result
  await setCached(key, data, options);

  logger.info("Cache-aside: fetched from source", {
    key,
    fetchTime,
    cached: false,
  });

  return data;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  keys: number;
  memory: string;
  connected: boolean;
} | null> {
  try {
    const redis = getRedisClient();
    const keys = await redis.dbsize();
    const info = await redis.info("memory");

    // Extract used memory from info output
    const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
    const memory = memoryMatch ? memoryMatch[1] : "unknown";

    return {
      keys,
      memory,
      connected: redis.status === "ready",
    };
  } catch (error) {
    logger.warn("Error getting cache stats", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Clear all cache (use with caution)
 */
export async function clearAllCache(): Promise<boolean> {
  try {
    const redis = getRedisClient();
    await redis.flushdb();
    logger.warn("All cache cleared");
    return true;
  } catch (error) {
    logger.error("Error clearing cache", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

const cacheUtils = {
  generateCacheKey,
  getCached,
  setCached,
  deleteCached,
  invalidateCacheByTag,
  invalidateCacheByPattern,
  cacheAside,
  getCacheStats,
  clearAllCache,
};

export default cacheUtils;
