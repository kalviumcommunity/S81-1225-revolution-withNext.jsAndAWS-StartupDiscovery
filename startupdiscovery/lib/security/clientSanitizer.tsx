"use client";

/**
 * Client-side Sanitization using DOMPurify
 * For sanitizing user-generated content in React components
 */

import DOMPurify from "dompurify";

/**
 * Configure DOMPurify with security settings
 */
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
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
  ALLOWED_ATTR: ["href", "title", "rel", "class"],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  FORCE_BODY: false,
  SANITIZE_DOM: true,
  IN_PLACE: false,
};

/**
 * Sanitize HTML content using DOMPurify on client side
 * @param dirty - Potentially unsafe HTML content
 * @returns Safe HTML string
 */
export const sanitizeHtml = (dirty: string | null | undefined): string => {
  if (!dirty || typeof dirty !== "string") {
    return "";
  }

  return DOMPurify.sanitize(dirty, DOMPURIFY_CONFIG);
};

/**
 * Sanitize plain text - removes all HTML
 * @param text - User text input
 * @returns Safe plain text
 */
export const sanitizeText = (text: string | null | undefined): string => {
  if (!text || typeof text !== "string") {
    return "";
  }

  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/**
 * Safe text display - escapes HTML entities
 * @param text - Text to display
 * @returns HTML-safe text
 */
export const safeText = (text: unknown): string => {
  if (text === null || text === undefined) {
    return "";
  }

  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
};

/**
 * Create a safe HTML object for use with dangerouslySetInnerHTML
 * Only use after sanitizing with sanitizeHtml()
 * @param html - Sanitized HTML content
 * @returns Object for dangerouslySetInnerHTML
 */
export const createSafeHtml = (html: string): { __html: string } => ({
  __html: sanitizeHtml(html),
});

/**
 * Check if content appears to have XSS patterns
 * @param content - Content to check
 * @returns true if suspicious patterns found
 */
export const hasXSSPatterns = (content: string | null | undefined): boolean => {
  if (!content || typeof content !== "string") {
    return false;
  }

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
    /eval\(/gi,
    /data:text\/html/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(content));
};

/**
 * React component safe text rendering
 * Use this to safely render user content in components
 * @param text - User content
 * @returns Safe text to display
 */
export function SafeText({ children }: { children: React.ReactNode }) {
  return <>{safeText(children as string)}</>;
}

/**
 * React component for safe HTML rendering
 * Sanitizes content before display
 * @param html - User HTML content
 * @returns React component with safe HTML
 */
export function SafeHtml({ html }: { html: string }) {
  const sanitized = sanitizeHtml(html);
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: sanitized,
      }}
    />
  );
}
