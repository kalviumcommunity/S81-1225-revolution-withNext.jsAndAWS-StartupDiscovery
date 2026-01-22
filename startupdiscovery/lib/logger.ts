/**
 * Structured logging utility for application-wide logging
 * Provides consistent JSON format for all logs for easier monitoring and debugging
 * Enhanced with correlation IDs for request tracing and CloudWatch compatibility
 */

import { headers } from "next/headers";
import { nanoid } from "nanoid";

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  context?: string;
  method?: string;
  endpoint?: string;
  statusCode?: number;
  duration?: number;
  userId?: string;
  meta?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  environment: string;
  service: string;
}

/**
 * Format log entry as JSON string
 */
function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/**
 * Get current ISO timestamp
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Generate a unique request ID for correlation
 */
export function generateRequestId(): string {
  return `req_${nanoid(16)}`;
}

/**
 * Get request ID from headers or generate new one
 */
export function getRequestId(): string {
  try {
    const headersList = headers();
    return headersList.get("x-request-id") || generateRequestId();
  } catch {
    // headers() can only be called in Server Components or Route Handlers
    return generateRequestId();
  }
}

/**
 * Base log entry builder
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  options?: {
    meta?: Record<string, unknown>;
    requestId?: string;
    context?: string;
    error?: Error;
    method?: string;
    endpoint?: string;
    statusCode?: number;
    duration?: number;
    userId?: string;
  }
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: getTimestamp(),
    environment: process.env.NODE_ENV || "development",
    service: "startupdiscovery-api",
  };

  if (options?.requestId) entry.requestId = options.requestId;
  if (options?.context) entry.context = options.context;
  if (options?.method) entry.method = options.method;
  if (options?.endpoint) entry.endpoint = options.endpoint;
  if (options?.statusCode) entry.statusCode = options.statusCode;
  if (options?.duration) entry.duration = options.duration;
  if (options?.userId) entry.userId = options.userId;
  if (options?.meta) entry.meta = options.meta;

  if (options?.error) {
    entry.error = {
      message: options.error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : options.error.stack,
      code: (options.error as any).code,
    };
  }

  return entry;
}

/**
 * Log info level message
 */
export function logInfo(message: string, meta?: Record<string, unknown>): void {
  const entry = createLogEntry("info", message, { meta });
  console.log(formatLogEntry(entry));
}

/**
 * Log warning level message
 */
export function logWarn(message: string, meta?: Record<string, unknown>): void {
  const entry = createLogEntry("warn", message, { meta });
  console.warn(formatLogEntry(entry));
}

/**
 * Log error level message
 */
export function logError(
  message: string,
  error?: Error,
  meta?: Record<string, unknown>
): void {
  const entry = createLogEntry("error", message, { error, meta });
  console.error(formatLogEntry(entry));
}

/**
 * Log debug level message (only in development)
 */
export function logDebug(
  message: string,
  meta?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV !== "production") {
    const entry = createLogEntry("debug", message, { meta });
    console.log(formatLogEntry(entry));
  }
}

/**
 * Logger class for more advanced use cases
 * Supports request correlation and context tracking
 */
export class Logger {
  private context: string;
  private requestId?: string;
  private userId?: string;

  constructor(context: string, requestId?: string, userId?: string) {
    this.context = context;
    this.requestId = requestId;
    this.userId = userId;
  }

  /**
   * Set request ID for correlation
   */
  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  info(message: string, meta?: Record<string, unknown>): void {
    const entry = createLogEntry("info", message, {
      meta,
      context: this.context,
      requestId: this.requestId,
      userId: this.userId,
    });
    console.log(formatLogEntry(entry));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    const entry = createLogEntry("warn", message, {
      meta,
      context: this.context,
      requestId: this.requestId,
      userId: this.userId,
    });
    console.warn(formatLogEntry(entry));
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    const entry = createLogEntry("error", message, {
      error,
      meta,
      context: this.context,
      requestId: this.requestId,
      userId: this.userId,
    });
    console.error(formatLogEntry(entry));
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== "production") {
      const entry = createLogEntry("debug", message, {
        meta,
        context: this.context,
        requestId: this.requestId,
        userId: this.userId,
      });
      console.log(formatLogEntry(entry));
    }
  }

  /**
   * Log API request with full context
   */
  logRequest(
    method: string,
    endpoint: string,
    meta?: Record<string, unknown>
  ): void {
    const entry = createLogEntry("info", "API request received", {
      method,
      endpoint,
      meta,
      context: this.context,
      requestId: this.requestId,
      userId: this.userId,
    });
    console.log(formatLogEntry(entry));
  }

  /**
   * Log API response with timing
   */
  logResponse(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    meta?: Record<string, unknown>
  ): void {
    const level: LogLevel = statusCode >= 400 ? "error" : "info";
    const entry = createLogEntry(level, "API request completed", {
      method,
      endpoint,
      statusCode,
      duration,
      meta,
      context: this.context,
      requestId: this.requestId,
      userId: this.userId,
    });
    console.log(formatLogEntry(entry));
  }
}

const loggerExport = {
  logInfo,
  logWarn,
  logError,
  logDebug,
  Logger,
  generateRequestId,
  getRequestId,
};

export default loggerExport;
