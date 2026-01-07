import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { extractTokensFromCookies } from "@/lib/tokenManager";

/**
 * Route Protection Configuration
 * Defines which routes require authentication
 */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/users",
  "/profile",
  "/settings",
  "/api/protected",
];

/**
 * Check if route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Extract and verify access token from cookies or headers
 */
function extractAndVerifyAccessToken(request: NextRequest): {
  valid: boolean;
  userId?: number;
  email?: string;
  role?: string;
} {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const userData = verifyAccessToken(token);
    if (userData) {
      return {
        valid: true,
        userId: userData.userId,
        email: userData.email,
        role: userData.role,
      };
    }
  }

  // Try to get from secure cookie
  const cookieHeader = request.headers.get("cookie");
  const { accessToken } = extractTokensFromCookies(cookieHeader);

  if (accessToken) {
    const userData = verifyAccessToken(accessToken);
    if (userData) {
      return {
        valid: true,
        userId: userData.userId,
        email: userData.email,
        role: userData.role,
      };
    }
  }

  return { valid: false };
}

/**
 * Verify JWT and extract user data
 * Supports both access tokens and fallback to refresh tokens
 */
function verifyJWT(
  request: NextRequest
): { userId: number; email: string; role: string } | null {
  // Try access token first
  const authData = extractAndVerifyAccessToken(request);
  if (authData.valid && authData.userId && authData.email && authData.role) {
    return {
      userId: authData.userId,
      email: authData.email,
      role: authData.role,
    };
  }

  // Fallback to old token format for backward compatibility
  const cookieHeader = request.headers.get("cookie");
  const cookies = cookieHeader
    ? Object.fromEntries(
        cookieHeader.split(";").map((cookie) => {
          const [key, value] = cookie.trim().split("=");
          return [key, value];
        })
      )
    : {};

  // Check for old single "token" cookie (backward compatibility)
  if (cookies.token) {
    try {
      // This won't work without the old secrets, so skip
    } catch {
      // Token invalid, continue
    }
  }

  return null;
}

/**
 * Main middleware function
 * Handles route protection and JWT verification
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and public routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Check if route is protected
  if (isProtectedRoute(pathname)) {
    const userData = verifyJWT(request);

    // No valid token found
    if (!userData) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Add user data to request headers for use in routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", userData.userId.toString());
    requestHeaders.set("x-user-email", userData.email);
    requestHeaders.set("x-user-role", userData.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Public route, allow access
  return NextResponse.next();
}

/**
 * Configure which routes should be protected by middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
