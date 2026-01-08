/**
 * Cloud Database Connection Module
 * Handles connections to AWS RDS or Azure PostgreSQL
 * Provides connection pooling, health checks, and error handling
 */

import { Pool, PoolClient } from "pg";

/**
 * Connection pool instance (singleton)
 * Reused across API requests
 */
let pool: Pool | null = null;

/**
 * Initialize connection pool
 * Called once on first database access
 */
function initializePool(): Pool {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not defined. Configure cloud database connection in .env.local"
    );
  }

  pool = new Pool({
    connectionString,
    // Connection pool configuration
    max: 20, // Maximum number of connections in pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 5000, // Timeout for acquiring a connection
    statement_timeout: 30000, // Query timeout: 30 seconds
    application_name: "nextjs-app",
  });

  // Log pool events
  pool.on("connect", () => {
    console.log("[DB] New connection created");
  });

  pool.on("remove", () => {
    console.log("[DB] Connection removed from pool");
  });

  pool.on("error", (err) => {
    console.error("[DB] Unexpected error on idle connection", err);
  });

  return pool;
}

/**
 * Get a connection from the pool
 * @returns Database connection
 */
export async function getConnection(): Promise<PoolClient> {
  const connectionPool = initializePool();
  return connectionPool.connect();
}

/**
 * Execute a query using pool
 * @param query SQL query string
 * @param values Query parameters
 * @returns Query result
 */
export async function executeQuery(
  query: string,
  values?: (string | number | boolean | null)[]
) {
  const connectionPool = initializePool();
  return connectionPool.query(query, values);
}

/**
 * Check database health
 * @returns Health status and server info
 */
export async function checkDatabaseHealth(): Promise<{
  status: "connected" | "disconnected";
  database: string;
  serverTime: string;
  poolSize: number;
}> {
  try {
    const connectionPool = initializePool();
    const result = await connectionPool.query(
      "SELECT VERSION(), NOW() as server_time"
    );

    const row = result.rows[0] as {
      version: string;
      server_time: Date;
    };

    return {
      status: "connected",
      database: row.version.split(",")[0], // Extract PostgreSQL version
      serverTime: row.server_time.toISOString(),
      poolSize: connectionPool.totalCount,
    };
  } catch (error) {
    console.error("[DB] Health check failed:", error);
    return {
      status: "disconnected",
      database: "Unknown",
      serverTime: new Date().toISOString(),
      poolSize: 0,
    };
  }
}

/**
 * Get connection pool statistics
 * @returns Pool metrics
 */
export function getPoolMetrics(): {
  idle: number;
  total: number;
  waiting: number;
} {
  if (!pool) {
    return { idle: 0, total: 0, waiting: 0 };
  }

  return {
    idle: pool.idleCount,
    total: pool.totalCount,
    waiting: pool.waitingCount,
  };
}

/**
 * Test database connection with retry logic
 * @param maxRetries Maximum number of retry attempts
 * @param retryDelayMs Delay between retries (milliseconds)
 * @returns Connection success status
 */
export async function testConnectionWithRetry(
  maxRetries: number = 3,
  retryDelayMs: number = 1000
): Promise<boolean> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await executeQuery("SELECT 1");
      console.log(`[DB] Connection test successful (attempt ${attempt})`);
      return true;
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `[DB] Connection attempt ${attempt} failed:`,
        lastError.message
      );

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = retryDelayMs * Math.pow(2, attempt - 1);
        console.log(`[DB] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed to connect to database after ${maxRetries} attempts: ${lastError?.message}`
  );
}

/**
 * Close all connections in the pool
 * Call this during application shutdown
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("[DB] Connection pool closed");
  }
}

/**
 * Execute transaction
 * @param callback Function to execute within transaction
 * @returns Transaction result
 */
export async function executeTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getConnection();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Connection string validator
 * Helps identify configuration issues
 */
export function validateConnectionString(url: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!url) {
    errors.push("CONNECTION_STRING is empty");
  }

  if (!url.startsWith("postgresql://")) {
    errors.push("Connection string must start with 'postgresql://'");
  }

  if (!url.includes("@")) {
    errors.push(
      "Connection string must contain credentials (user:password@host)"
    );
  }

  if (!url.includes(":5432") && !url.includes(":5433")) {
    errors.push("Port should be 5432 (standard) or 5433 (alternative)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
