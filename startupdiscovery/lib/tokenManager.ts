import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

/**
 * Token Manager - Handles secure storage and retrieval of JWT tokens
 *
 * Security Strategy:
 * - Access Token: Stored in HTTP-only cookie (cannot be accessed via JavaScript)
 * - Refresh Token: Stored in secure HTTP-only cookie with SameSite=Strict
 * - Prevents XSS attacks by using HTTP-only cookies
 * - Prevents CSRF attacks through SameSite policy
 */

/**
 * Cookie configuration for access tokens
 * Short-lived, cannot be accessed by JavaScript
 */
export const ACCESS_TOKEN_COOKIE_CONFIG: Partial<ResponseCookie> = {
  httpOnly: true, // Prevent JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "lax", // CSRF protection - allow top-level navigation
  maxAge: 15 * 60, // 15 minutes in seconds
  path: "/", // Available to entire application
};

/**
 * Cookie configuration for refresh tokens
 * Longer-lived, cannot be accessed by JavaScript
 */
export const REFRESH_TOKEN_COOKIE_CONFIG: Partial<ResponseCookie> = {
  httpOnly: true, // Prevent JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict", // Strict CSRF protection - no cross-site requests
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  path: "/", // Available to entire application
};

/**
 * Get HTTP-Only cookie header for setting access token
 * @param token - The access token to set
 * @returns Set-Cookie header value
 */
export function getAccessTokenCookieHeader(token: string): string {
  const config = ACCESS_TOKEN_COOKIE_CONFIG;
  const cookieParts: string[] = [`accessToken=${token}`];

  if (config.httpOnly) cookieParts.push("HttpOnly");
  if (config.secure) cookieParts.push("Secure");
  cookieParts.push(`SameSite=${config.sameSite}`);
  cookieParts.push(`Max-Age=${config.maxAge}`);
  if (config.path) cookieParts.push(`Path=${config.path}`);

  return cookieParts.join("; ");
}

/**
 * Get HTTP-Only cookie header for setting refresh token
 * @param token - The refresh token to set
 * @returns Set-Cookie header value
 */
export function getRefreshTokenCookieHeader(token: string): string {
  const config = REFRESH_TOKEN_COOKIE_CONFIG;
  const cookieParts: string[] = [`refreshToken=${token}`];

  if (config.httpOnly) cookieParts.push("HttpOnly");
  if (config.secure) cookieParts.push("Secure");
  cookieParts.push(`SameSite=${config.sameSite}`);
  cookieParts.push(`Max-Age=${config.maxAge}`);
  if (config.path) cookieParts.push(`Path=${config.path}`);

  return cookieParts.join("; ");
}

/**
 * Create array of Set-Cookie headers for response
 * Used in login/signup endpoints
 */
export function createAuthCookieHeaders(
  accessToken: string,
  refreshToken: string
): string[] {
  return [
    getAccessTokenCookieHeader(accessToken),
    getRefreshTokenCookieHeader(refreshToken),
  ];
}

/**
 * Clear authentication cookies (logout)
 * Sets Max-Age=0 to delete cookies
 */
export function getClearAuthCookies(): string[] {
  const now = new Date();
  now.setDate(now.getDate() - 1); // Set to past date to clear

  const clearAccessToken = [
    "accessToken=",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
    "Path=/",
  ].join("; ");

  const clearRefreshToken = [
    "refreshToken=",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Max-Age=0",
    "Path=/",
  ].join("; ");

  return [clearAccessToken, clearRefreshToken];
}

/**
 * Extract tokens from cookie string
 * @param cookieString - Raw cookie header from request
 * @returns Object with tokens or null
 */
export function extractTokensFromCookies(cookieString: string | null): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  if (!cookieString) {
    return { accessToken: null, refreshToken: null };
  }

  const cookies = cookieString.split(";").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>
  );

  return {
    accessToken: cookies.accessToken || null,
    refreshToken: cookies.refreshToken || null,
  };
}

/**
 * Check if token is expired (30 second buffer)
 * @param expiresAt - Token expiration timestamp
 * @returns true if token is expired or about to expire
 */
export function isTokenExpired(expiresAt: number): boolean {
  const BUFFER_SECONDS = 30; // Refresh 30 seconds before actual expiry
  const now = Math.floor(Date.now() / 1000);
  return now >= expiresAt - BUFFER_SECONDS;
}

/**
 * Token rotation information
 */
export interface TokenRotationInfo {
  previousTokenVersion: number;
  newTokenVersion: number;
  rotatedAt: Date;
  reason: "refresh" | "security_update";
}

/**
 * Log token rotation event (for audit trail)
 * In production, send to logging service
 */
export function logTokenRotation(info: TokenRotationInfo): void {
  console.log(
    `[TOKEN_ROTATION] User token rotated - Version: ${info.previousTokenVersion} → ${info.newTokenVersion} | Reason: ${info.reason} | Time: ${info.rotatedAt.toISOString()}`
  );

  // In production, send to centralized logging service
  // Example: await sendToLoggingService(info);
}

/**
 * Security considerations documented:
 *
 * XSS Protection:
 * - HTTP-Only cookies cannot be accessed by JavaScript
 * - Even if JavaScript is compromised, tokens remain secure
 * - Prevent: document.cookie, localStorage, sessionStorage access
 *
 * CSRF Protection:
 * - SameSite=Strict on refresh token (no cross-site requests)
 * - SameSite=Lax on access token (allow top-level navigation)
 * - Cookies not sent in cross-origin requests
 * - Browser automatically handles CSRF token inclusion
 *
 * Token Rotation:
 * - Refresh token includes version number
 * - Each refresh increments version
 * - Old versions invalidated server-side
 * - Reduce replay attack window
 *
 * Additional Security:
 * - Secure flag ensures HTTPS-only transmission in production
 * - HttpOnly flag prevents JavaScript access
 * - Path=/api ensures cookies not leaked to other routes
 * - Max-Age limits token lifetime
 *
 * Trade-offs:
 * - Cannot access tokens from JavaScript (by design)
 * - Slight latency increase for cookie parsing
 * - Cross-domain requests require proper configuration
 * - Cannot use tokens for WebSocket authentication directly
 */
