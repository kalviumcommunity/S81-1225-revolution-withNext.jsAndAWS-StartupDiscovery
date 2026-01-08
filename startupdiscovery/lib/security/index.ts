/**
 * Security Module Index
 * Exports all security utilities for use throughout the application
 */

// Server-side sanitization
export {
  sanitizeHtmlInput,
  sanitizeTextInput,
  sanitizeUrl,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeObject,
  encodeOutput,
  hasXSSPatterns,
  hasSQLiPatterns,
  validateInput,
  SanitizationLevel,
} from "./sanitizer";

// Security headers and middleware
export {
  securityHeaders,
  rateLimit,
  corsMiddleware,
  requestLogger,
  inputValidationMiddleware,
  type RateLimitConfig,
  type CORSConfig,
} from "./headers";

// Secure Headers and HTTPS Enforcement
export {
  SECURE_HEADERS,
  CORS_CONFIG,
  applySecureHeaders,
  applyCORSHeaders,
  applyAllSecurityHeaders,
  isHttpsRequest,
  isTrustedOrigin,
} from "./secureHeaders";

// CORS Handler Wrapper
export { withCORS, corsResponse, corsErrorResponse } from "./corsHandler";

// Client-side sanitization (only available in client components)
export {
  sanitizeHtml,
  sanitizeText,
  safeText,
  createSafeHtml,
  hasXSSPatterns as clientHasXSSPatterns,
  SafeText,
  SafeHtml,
} from "./clientSanitizer";
