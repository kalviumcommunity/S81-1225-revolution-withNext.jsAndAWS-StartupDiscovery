/**
 * Secure Headers Utility
 * Centralizes HTTPS enforcement and security header management
 * Implements OWASP-recommended security headers and HTTPS/HSTS enforcement
 */

import { NextResponse } from "next/server";

/**
 * Security Headers Configuration
 * Defines all security headers that should be applied to responses
 */
export const SECURE_HEADERS = {
  // HSTS - Forces HTTPS usage
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",

  // CSP - Controls resource loading
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://apis.google.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "connect-src 'self' https:; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';",

  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Prevent clickjacking
  "X-Frame-Options": "DENY",

  // XSS protection for older browsers
  "X-XSS-Protection": "1; mode=block",

  // Referrer Policy
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions Policy - Restrict browser features
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",

  // Cache control for sensitive pages
  "Cache-Control": "public, max-age=3600, must-revalidate",
};

/**
 * CORS Configuration
 * Defines trusted origins and allowed methods
 */
export const CORS_CONFIG = {
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.com",
  ],
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token",
  ],
};

/**
 * Apply security headers to response
 * @param response NextResponse to enhance with security headers
 * @returns Enhanced response with all security headers applied
 */
export function applySecureHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURE_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Configure CORS headers for API responses
 * @param response NextResponse to enhance
 * @param origin Request origin to validate against trusted origins
 * @returns Enhanced response with CORS headers if origin is trusted
 */
export function applyCORSHeaders(
  response: NextResponse,
  origin?: string
): NextResponse {
  // Check if origin is trusted
  const isTrustedOrigin = origin
    ? CORS_CONFIG.trustedOrigins.includes(origin)
    : true;

  if (isTrustedOrigin && origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      CORS_CONFIG.allowedMethods.join(", ")
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      CORS_CONFIG.allowedHeaders.join(", ")
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Max-Age", "86400");
  }

  return response;
}

/**
 * Add both security and CORS headers to response
 * @param response NextResponse to enhance
 * @param origin Request origin
 * @returns Enhanced response with all headers
 */
export function applyAllSecurityHeaders(
  response: NextResponse,
  origin?: string
): NextResponse {
  return applyCORSHeaders(applySecureHeaders(response), origin);
}

/**
 * Verify that request uses HTTPS (for production)
 * @param protocol Request protocol (from x-forwarded-proto or similar)
 * @returns true if HTTPS or in development, false otherwise
 */
export function isHttpsRequest(protocol?: string): boolean {
  // In development, allow both HTTP and HTTPS
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  // In production, enforce HTTPS
  return protocol === "https";
}

/**
 * Validate origin against CORS trusted origins
 * @param origin Request origin header value
 * @returns true if origin is trusted
 */
export function isTrustedOrigin(origin: string): boolean {
  return CORS_CONFIG.trustedOrigins.some(
    (trustedOrigin) =>
      origin === trustedOrigin || origin.endsWith(trustedOrigin)
  );
}
