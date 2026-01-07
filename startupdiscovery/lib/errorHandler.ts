/**
 * Centralized error handling utility for consistent error management across the application
 * Handles structured logging, environment-specific error responses, and sensitive data protection
 */

import { NextResponse } from "next/server";
import { logError } from "./logger";

export interface ErrorContext {
  method?: string;
  path?: string;
  statusCode?: number;
  userId?: number;
  [key: string]: unknown;
}

export interface ErrorResponse {
  success: false;
  message: string;
  stack?: string;
  requestId?: string;
}

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract safe error message from error object
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred";
}

/**
 * Extract stack trace from error object
 */
function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

/**
 * Check if error contains sensitive information
 */
function isSensitiveError(errorMessage: string): boolean {
  const sensitivePatterns = [
    /password/i,
    /token/i,
    /secret/i,
    /api.?key/i,
    /database.?url/i,
    /connection.?string/i,
  ];

  return sensitivePatterns.some((pattern) => pattern.test(errorMessage));
}

/**
 * Redact sensitive information from error message
 */
function redactSensitiveInfo(errorMessage: string): string {
  return errorMessage
    .replace(/password[^,]*/gi, "password: [REDACTED]")
    .replace(/token[^,]*/gi, "token: [REDACTED]")
    .replace(/secret[^,]*/gi, "secret: [REDACTED]")
    .replace(/api.?key[^,]*/gi, "api_key: [REDACTED]")
    .replace(/database.?url[^,]*/gi, "database_url: [REDACTED]")
    .replace(/connection.?string[^,]*/gi, "connection_string: [REDACTED]");
}

/**
 * Centralized error handler
 *
 * @param error - The error object
 * @param context - Additional context about the error (method, path, userId, etc.)
 * @returns NextResponse with appropriate error message based on environment
 */
export function handleError(
  error: unknown,
  context: ErrorContext = {}
): NextResponse<ErrorResponse> {
  const requestId = generateRequestId();
  const isDevelopment = process.env.NODE_ENV === "development";
  const statusCode = context.statusCode || 500;

  const errorMessage = getErrorMessage(error);
  const errorStack = getErrorStack(error);

  // Prepare error metadata for logging
  const errorMeta: Record<string, unknown> = {
    message: errorMessage,
    stack: isDevelopment ? errorStack : "REDACTED",
    requestId,
    context,
  };

  // Log the error in structured format
  const logMessage = `Error in ${context.method || "UNKNOWN"} ${context.path || "UNKNOWN"}`;
  logError(logMessage, errorMeta);

  // Prepare response based on environment
  let responseMessage: string;

  if (isDevelopment) {
    // In development, show detailed error information
    responseMessage = isSensitiveError(errorMessage)
      ? redactSensitiveInfo(errorMessage)
      : errorMessage;
  } else {
    // In production, show safe, generic message
    responseMessage = "Something went wrong. Please try again later.";
  }

  const errorResponse: ErrorResponse = {
    success: false,
    message: responseMessage,
    ...(isDevelopment && { stack: errorStack }),
    requestId,
  };

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Async wrapper for API route handlers to catch and handle errors
 *
 * @param handler - The async route handler function
 * @returns Wrapped handler with error catching
 */
export function withErrorHandler(
  handler: (
    req: Request,
    context?: { params?: Promise<Record<string, string>> }
  ) => Promise<NextResponse>
) {
  return async (
    req: Request,
    context?: { params?: Promise<Record<string, string>> }
  ) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleError(error, {
        method: req.method,
        path: new URL(req.url).pathname,
      });
    }
  };
}

const errorHandlerExport = {
  handleError,
  withErrorHandler,
};

export default errorHandlerExport;
