/**
 * Request Logger Middleware
 * Adds request correlation IDs and logs all API requests/responses
 */

import { NextRequest, NextResponse } from "next/server";
import { Logger, generateRequestId } from "./logger";

const logger = new Logger("RequestLogger");

export interface RequestLoggerOptions {
  excludePaths?: string[];
  logBody?: boolean;
}

/**
 * Middleware to log API requests with correlation IDs
 */
export function withRequestLogger(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: RequestLoggerOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    
    // Generate or get request ID
    const requestId = req.headers.get("x-request-id") || generateRequestId();
    
    // Create logger with request context
    const reqLogger = new Logger("API", requestId);
    
    // Extract request details
    const method = req.method;
    const endpoint = req.nextUrl.pathname;
    const userAgent = req.headers.get("user-agent") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // Check if path should be excluded from logging
    if (options.excludePaths?.some(path => endpoint.includes(path))) {
      return handler(req);
    }

    // Log incoming request
    reqLogger.logRequest(method, endpoint, {
      userAgent,
      ip,
      query: Object.fromEntries(req.nextUrl.searchParams),
    });

    try {
      // Execute the handler
      const response = await handler(req);
      
      // Calculate duration
      const duration = Date.now() - startTime;
      
      // Log response
      reqLogger.logResponse(method, endpoint, response.status, duration, {
        userAgent,
        ip,
      });

      // Add request ID to response headers
      const headers = new Headers(response.headers);
      headers.set("x-request-id", requestId);
      
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log error
      reqLogger.error(
        "Request failed with error",
        error instanceof Error ? error : new Error(String(error)),
        {
          method,
          endpoint,
          duration,
          userAgent,
          ip,
        }
      );

      throw error;
    }
  };
}

/**
 * Simple API request logger for route handlers
 */
export async function logApiRequest(
  req: Request,
  context?: string
): Promise<{ requestId: string; logger: Logger; startTime: number }> {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const logger = new Logger(context || "API", requestId);

  const method = req.method;
  const url = new URL(req.url);
  const endpoint = url.pathname;

  logger.logRequest(method, endpoint, {
    query: Object.fromEntries(url.searchParams),
  });

  return { requestId, logger, startTime };
}

/**
 * Log API response
 */
export function logApiResponse(
  logger: Logger,
  req: Request,
  statusCode: number,
  startTime: number,
  meta?: Record<string, unknown>
): void {
  const duration = Date.now() - startTime;
  const url = new URL(req.url);

  logger.logResponse(req.method, url.pathname, statusCode, duration, meta);
}
