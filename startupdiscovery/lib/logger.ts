/**
 * Structured logging utility for application-wide logging
 * Provides consistent JSON format for all logs for easier monitoring and debugging
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
  timestamp: string;
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
 * Log info level message
 */
export function logInfo(message: string, meta?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level: "info",
    message,
    meta,
    timestamp: getTimestamp(),
  };
  console.log(formatLogEntry(entry));
}

/**
 * Log warning level message
 */
export function logWarn(message: string, meta?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level: "warn",
    message,
    meta,
    timestamp: getTimestamp(),
  };
  console.warn(formatLogEntry(entry));
}

/**
 * Log error level message
 */
export function logError(
  message: string,
  meta?: Record<string, unknown>
): void {
  const entry: LogEntry = {
    level: "error",
    message,
    meta,
    timestamp: getTimestamp(),
  };
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
    const entry: LogEntry = {
      level: "debug",
      message,
      meta,
      timestamp: getTimestamp(),
    };
    console.log(formatLogEntry(entry));
  }
}

/**
 * Logger class for more advanced use cases
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, meta?: Record<string, unknown>): void {
    logInfo(`[${this.context}] ${message}`, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    logWarn(`[${this.context}] ${message}`, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    logError(`[${this.context}] ${message}`, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    logDebug(`[${this.context}] ${message}`, meta);
  }
}

const loggerExport = {
  logInfo,
  logWarn,
  logError,
  logDebug,
  Logger,
};

export default loggerExport;
