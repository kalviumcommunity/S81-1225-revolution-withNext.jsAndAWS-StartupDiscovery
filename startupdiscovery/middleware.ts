import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Get JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set.");
}

/**
 * Role-based access control configuration
 * Maps routes/patterns to required roles
 * Use wildcard (*) to allow all authenticated users
 */
interface RoutePermission {
  pattern: string | RegExp;
  requiredRoles: string[]; // Empty array means public, specific roles for restricted
}

const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Public routes (no authentication required)
  { pattern: /^\/api\/auth\//, requiredRoles: [] },
  { pattern: /^\/api\/health/, requiredRoles: [] },

  // User routes (all authenticated users)
  { pattern: /^\/api\/users$/, requiredRoles: ["USER", "ADMIN", "MODERATOR"] },
  {
    pattern: /^\/api\/users\/.*/,
    requiredRoles: ["USER", "ADMIN", "MODERATOR"],
  },

  // Task routes (all authenticated users)
  { pattern: /^\/api\/tasks/, requiredRoles: ["USER", "ADMIN", "MODERATOR"] },

  // Project routes (all authenticated users)
  {
    pattern: /^\/api\/projects/,
    requiredRoles: ["USER", "ADMIN", "MODERATOR"],
  },

  // Admin routes (admin only)
  { pattern: /^\/api\/admin/, requiredRoles: ["ADMIN"] },

  // Dashboard routes (all authenticated users)
  { pattern: /^\/dashboard/, requiredRoles: ["USER", "ADMIN", "MODERATOR"] },
];

/**
 * Extract JWT from Authorization header
 */
function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Verify JWT and extract user data
 */
function verifyJWT(
  token: string
): { userId: number; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!, {
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
 * Check if a route matches a pattern
 */
function isRouteMatching(pathname: string, pattern: string | RegExp): boolean {
  if (typeof pattern === "string") {
    return pathname === pattern;
  }
  return pattern.test(pathname);
}

/**
 * Find the permission for a given route
 */
function getRoutePermission(pathname: string): RoutePermission | null {
  for (const permission of ROUTE_PERMISSIONS) {
    if (isRouteMatching(pathname, permission.pattern)) {
      return permission;
    }
  }
  return null;
}

/**
 * Check if user has required role
 */
function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  if (requiredRoles.length === 0) {
    return true; // Public route
  }
  return requiredRoles.includes(userRole);
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

  // Get route permission
  const permission = getRoutePermission(pathname);

  // If no permission found, allow request (public route)
  if (!permission) {
    return NextResponse.next();
  }

  // If route requires authentication
  if (permission.requiredRoles.length > 0) {
    const authHeader = request.headers.get("authorization");
    const token = extractToken(authHeader);

    // No token provided
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
          error: {
            code: "MISSING_TOKEN",
            details: "Authorization header with Bearer token is required",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Verify token
    const userData = verifyJWT(token);

    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
          error: {
            code: "INVALID_TOKEN",
            details: "Token is invalid, expired, or tampered with",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Check role permission
    if (!hasRequiredRole(userData.role, permission.requiredRoles)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied",
          error: {
            code: "INSUFFICIENT_PERMISSIONS",
            details: `Your role '${userData.role}' is not permitted to access this resource. Required roles: ${permission.requiredRoles.join(", ")}`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
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
