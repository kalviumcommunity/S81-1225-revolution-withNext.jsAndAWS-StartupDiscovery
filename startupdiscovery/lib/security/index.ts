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
