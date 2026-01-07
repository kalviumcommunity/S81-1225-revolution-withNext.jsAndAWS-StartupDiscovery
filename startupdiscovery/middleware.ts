import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Get JWT secret from environment variable
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set.");
  }
  return secret;
};

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
 * Extract JWT from cookies or headers
 */
function extractToken(request: NextRequest): string | null {
  // Try to get from Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Try to get from cookies
  const token = request.cookies.get("token")?.value;
  return token || null;
}

/**
 * Verify JWT and extract user data
 */
function verifyJWT(
  token: string
): { userId: number; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, getJWTSecret(), {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded === "object" &&
      "userId" in decoded &&
      "email" in decoded &&
      "role" in decoded
    ) {
      return {
        userId: decoded.userId as number,
        email: decoded.email as string,
        role: decoded.role as string,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and public routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Check if route is protected
  if (isProtectedRoute(pathname)) {
    const token = extractToken(request);

    // No token provided
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verify token
    const userData = verifyJWT(token);

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
