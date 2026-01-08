/**
 * Input Sanitization & Output Encoding Module
 * Provides OWASP-compliant sanitization for XSS and injection prevention
 */

import sanitizeHtml from "sanitize-html";
import { escape, trim } from "validator";

/**
 * Sanitization levels for different contexts
 */
export enum SanitizationLevel {
  // Removes all HTML tags - strictest, for plain text only
  STRICT = "strict",
  // Allows safe HTML tags only - for rich text content
  MODERATE = "moderate",
  // Minimal sanitization - for use with DOMPurify on client
  MINIMAL = "minimal",
}

/**
 * Sanitize HTML input - removes potentially dangerous tags and attributes
 * @param input - Raw user input containing potentially malicious HTML
 * @param level - Sanitization level
 * @returns Sanitized safe HTML string
 */
export const sanitizeHtmlInput = (
  input: string | null | undefined,
  level: SanitizationLevel = SanitizationLevel.MODERATE
): string => {
  if (!input || typeof input !== "string") {
    return "";
  }

  const trimmedInput = trim(input);

  switch (level) {
    case SanitizationLevel.STRICT:
      // Remove all HTML tags - plain text only
      return sanitizeHtml(trimmedInput, {
        allowedTags: [],
        allowedAttributes: {},
        disallowedTagsMode: "discard",
      });

    case SanitizationLevel.MODERATE:
      // Allow safe formatting tags for rich text
      return sanitizeHtml(trimmedInput, {
        allowedTags: [
          "p",
          "br",
          "strong",
          "em",
          "u",
          "a",
          "ul",
          "ol",
          "li",
          "blockquote",
          "code",
          "pre",
          "h1",
          "h2",
          "h3",
        ],
        allowedAttributes: {
          a: ["href", "title", "rel"],
          code: ["class"],
          pre: ["class"],
        },
        allowedSchemes: ["http", "https", "mailto"],
        disallowedTagsMode: "discard",
        transformTags: {
          // Ensure links open in new tab and have security attributes
          a: sanitizeHtml.simpleTransform("a", {
            target: "_blank",
            rel: "noopener noreferrer",
          }),
        },
      });

    case SanitizationLevel.MINIMAL:
      // Minimal sanitization - basic tag/attribute removal
      return sanitizeHtml(trimmedInput, {
        allowedTags: false, // Allow all tags by default in minimal mode
        allowedAttributes: false,
        disallowedTagsMode: "escape",
      });

    default:
      return sanitizeHtml(trimmedInput, {
        allowedTags: [],
        allowedAttributes: {},
      });
  }
};

/**
 * Sanitize plain text input - removes HTML entirely and escapes special characters
 * @param input - Raw user input
 * @returns Escaped safe text string
 */
export const sanitizeTextInput = (input: string | null | undefined): string => {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Trim whitespace
  const trimmedInput = trim(input);

  // Escape HTML special characters
  return escape(trimmedInput);
};

/**
 * Sanitize URL input - validates and sanitizes URLs
 * @param input - Raw URL input
 * @returns Safe URL string or empty string if invalid
 */
export const sanitizeUrl = (input: string | null | undefined): string => {
  if (!input || typeof input !== "string") {
    return "";
  }

  const trimmedInput = trim(input);

  try {
    // Only allow http and https protocols
    const url = new URL(trimmedInput);

    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }

    // Return sanitized URL
    return url.toString();
  } catch {
    // Invalid URL format
    return "";
  }
};

/**
 * Sanitize email input - removes potentially malicious characters
 * @param input - Raw email input
 * @returns Sanitized email string
 */
export const sanitizeEmail = (input: string | null | undefined): string => {
  if (!input || typeof input !== "string") {
    return "";
  }

  const trimmedInput = trim(input);

  // Remove any HTML tags and scripts
  const sanitized = sanitizeHtml(trimmedInput, {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Email regex pattern (basic)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Return sanitized email if valid format, otherwise empty
  return emailRegex.test(sanitized) ? sanitized.toLowerCase() : "";
};

/**
 * Sanitize numeric input - ensures input is valid number
 * @param input - Raw input
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Number or null if invalid
 */
export const sanitizeNumber = (
  input: unknown,
  min?: number,
  max?: number
): number | null => {
  const num = Number(input);

  if (isNaN(num)) {
    return null;
  }

  if (min !== undefined && num < min) {
    return null;
  }

  if (max !== undefined && num > max) {
    return null;
  }

  return num;
};

/**
 * Sanitize object input - recursively sanitizes all string values
 * @param obj - Raw object with potentially unsafe values
 * @param level - Sanitization level for strings
 * @returns Object with sanitized string values
 */
export const sanitizeObject = <T extends Record<string, unknown>>(
  obj: T,
  level: SanitizationLevel = SanitizationLevel.MODERATE
): T => {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  const sanitized = (Array.isArray(obj) ? [...obj] : { ...obj }) as Record<
    string,
    unknown
  >;

  for (const key in sanitized) {
    if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
      const value = sanitized[key];

      if (typeof value === "string") {
        sanitized[key] = sanitizeHtmlInput(value, level);
      } else if (typeof value === "object" && value !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizeObject(
          value as Record<string, unknown>,
          level
        );
      }
    }
  }

  return sanitized as T;
};

/**
 * Encode output for safe HTML display - escapes HTML special characters
 * @param input - User-controlled content to display
 * @returns HTML-safe encoded string
 */
export const encodeOutput = (input: unknown): string => {
  if (input === null || input === undefined) {
    return "";
  }

  return escape(String(input));
};

/**
 * Validate against known XSS patterns
 * @param input - Input to check
 * @returns true if suspicious patterns detected, false otherwise
 */
export const hasXSSPatterns = (input: string | null | undefined): boolean => {
  if (!input || typeof input !== "string") {
    return false;
  }

  // Common XSS patterns
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
    /eval\(/gi,
    /expression\s*\(/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
};

/**
 * Validate against known SQL injection patterns
 * @param input - Input to check
 * @returns true if suspicious patterns detected, false otherwise
 */
export const hasSQLiPatterns = (input: string | null | undefined): boolean => {
  if (!input || typeof input !== "string") {
    return false;
  }

  // Common SQLi patterns
  const sqliPatterns = [
    /('|"|;|--|\/\*|\*\/).*?(union|select|insert|update|delete|drop|create)/gi,
    /(\bor\b|\band\b)[\s\w=']*=[\s\w='"]*/gi,
    /1\s*=\s*1/gi,
    /1\s*=\s*2/gi,
    /'[\s]*or[\s]*'1'[\s]*=[\s]*'1/gi,
  ];

  return sqliPatterns.some((pattern) => pattern.test(input));
};

/**
 * Comprehensive input validation
 * @param input - Input to validate
 * @param options - Validation options
 * @returns Object with validation result and message
 */
export const validateInput = (
  input: unknown,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    checkXSS?: boolean;
    checkSQLi?: boolean;
  } = {}
): { valid: boolean; message: string } => {
  const {
    required = true,
    minLength,
    maxLength,
    pattern,
    checkXSS = true,
    checkSQLi = true,
  } = options;

  // Check if required
  if (required && (!input || (typeof input === "string" && !trim(input)))) {
    return { valid: false, message: "Input is required" };
  }

  // Convert to string for validation
  const inputStr = String(input).trim();

  // Check length
  if (minLength && inputStr.length < minLength) {
    return {
      valid: false,
      message: `Input must be at least ${minLength} characters`,
    };
  }

  if (maxLength && inputStr.length > maxLength) {
    return {
      valid: false,
      message: `Input must not exceed ${maxLength} characters`,
    };
  }

  // Check pattern
  if (pattern && !pattern.test(inputStr)) {
    return {
      valid: false,
      message: "Input does not match required format",
    };
  }

  // Check for XSS patterns
  if (checkXSS && hasXSSPatterns(inputStr)) {
    return {
      valid: false,
      message: "Input contains potentially malicious content (XSS detected)",
    };
  }

  // Check for SQLi patterns
  if (checkSQLi && hasSQLiPatterns(inputStr)) {
    return {
      valid: false,
      message: "Input contains potentially malicious content (SQLi detected)",
    };
  }

  return { valid: true, message: "Valid input" };
};
