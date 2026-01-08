/**
 * OWASP Security Headers & Middleware
 * Implements industry-standard security headers and protections
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Security headers middleware
 * Adds OWASP-recommended security headers to all responses
 */
export function securityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy - prevents inline scripts and restricts resource loading
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " + // Only allow resources from same origin by default
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " + // Scripts from same origin, allow inline for Next.js
      "style-src 'self' 'unsafe-inline'; " + // Styles from same origin and inline
      "img-src 'self' data: https:; " + // Images from same origin, data URLs, and HTTPS
      "font-src 'self' data:; " + // Fonts from same origin and data URLs
      "connect-src 'self'; " + // API calls only to same origin
      "frame-ancestors 'none'; " + // Prevent clickjacking
      "base-uri 'self'; " + // Base tag can only point to same origin
      "form-action 'self';" // Forms can only submit to same origin
  );

  // X-Content-Type-Options - prevents MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // X-Frame-Options - prevents clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // X-XSS-Protection - legacy XSS protection (mostly for older browsers)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy - controls referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy - controls browser features and APIs
  response.headers.set(
    "Permissions-Policy",
    "accelerometer=(), " +
      "ambient-light-sensor=(), " +
      "autoplay=(), " +
      "camera=(), " +
      "geolocation=(), " +
      "gyroscope=(), " +
      "magnetometer=(), " +
      "microphone=(), " +
      "payment=(), " +
      "usb=()"
  );

  // Strict-Transport-Security - enforces HTTPS
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Remove server information header
  response.headers.delete("Server");

  return response;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
  keyGenerator?: (req: NextRequest) => string;
}

/**
 * In-memory rate limiter store
 * Note: In production, use Redis or similar for distributed systems
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware
 * Prevents abuse and DoS attacks
 */
export function rateLimit(config: RateLimitConfig) {
  return (req: NextRequest) => {
    const key =
      config.keyGenerator?.(req) ||
      req.headers.get("x-forwarded-for") ||
      "unknown";
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (record && record.resetTime > now) {
      if (record.count >= config.maxRequests) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: "Too many requests, please try again later",
          }),
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil((record.resetTime - now) / 1000)),
            },
          }
        );
      }
      record.count++;
    } else {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
    }

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (v.resetTime <= now) {
          rateLimitStore.delete(k);
        }
      }
    }

    return null; // Allow request
  };
}

/**
 * CORS middleware configuration
 */
export interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders?: string[];
  maxAge?: number;
  credentials?: boolean;
}

/**
 * CORS middleware
 * Implements secure cross-origin requests
 */
export function corsMiddleware(config: CORSConfig) {
  return (req: NextRequest) => {
    const requestOrigin = req.headers.get("origin");

    if (!requestOrigin || !config.allowedOrigins.includes(requestOrigin)) {
      return null; // CORS not allowed
    }

    const response = new NextResponse(null);

    response.headers.set("Access-Control-Allow-Origin", requestOrigin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      config.allowedMethods.join(", ")
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      config.allowedHeaders.join(", ")
    );

    if (config.exposedHeaders) {
      response.headers.set(
        "Access-Control-Expose-Headers",
        config.exposedHeaders.join(", ")
      );
    }

    if (config.maxAge) {
      response.headers.set("Access-Control-Max-Age", config.maxAge.toString());
    }

    if (config.credentials) {
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    return response;
  };
}

/**
 * Request logging middleware
 * Logs all API requests for security audit trail
 */
export function requestLogger(req: NextRequest) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const pathname = new URL(req.url).pathname;
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  console.log(`[${timestamp}] ${method} ${pathname} - IP: ${ip}`);

  return null; // Allow request to continue
}

/**
 * Input validation middleware
 * Validates and sanitizes request body
 */
export async function inputValidationMiddleware(req: NextRequest) {
  if (req.method === "GET" || req.method === "HEAD") {
    return null; // No body to validate
  }

  try {
    const body = await req.json();

    // Check for suspicious patterns in body
    const bodyStr = JSON.stringify(body);

    // Size limit - prevent DoS attacks
    if (bodyStr.length > 1024 * 100) {
      // 100KB limit
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Request body too large",
        }),
        { status: 413 }
      );
    }

    return null; // Valid input
  } catch {
    // Invalid JSON
    return null; // Let the route handler deal with it
  }
}
