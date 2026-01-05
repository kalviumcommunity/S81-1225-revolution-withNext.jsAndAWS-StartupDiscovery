import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

/**
 * JWT Payload interface for type safety
 */
interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * JWT Secret Key - In production, use environment variable
 * Should be a long, random string stored securely
 */
const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is not set. Please set it in your .env.local file."
  );
}
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d"; // Token expires in 7 days

/**
 * Hash password using bcrypt
 * Cost factor of 10 provides good security/performance balance
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    throw new Error(
      `Password hashing failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Compare plain password with hashed password
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(
      `Password comparison failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate JWT token for authenticated user
 * Token contains user ID, email, and role
 */
export function generateToken(
  userId: number,
  email: string,
  role: string = "USER"
): string {
  try {
    const token = jwt.sign(
      {
        userId,
        email,
        role,
        iat: Math.floor(Date.now() / 1000), // Issued at
      },
      JWT_SECRET as string,
      {
        expiresIn: JWT_EXPIRY,
        algorithm: "HS256",
      } as jwt.SignOptions
    );
    return token;
  } catch (error) {
    throw new Error(
      `Token generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Verify and decode JWT token
 * Returns decoded token data or null if invalid
 */
export function verifyToken(
  token: string
): { userId: number; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string, {
      algorithms: ["HS256"],
    }) as JWTPayload;

    if (
      typeof decoded === "object" &&
      "userId" in decoded &&
      "email" in decoded &&
      "role" in decoded
    ) {
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    }

    return null;
  } catch {
    // Token is invalid, expired, or tampered with
    return null;
  }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7);
}

/**
 * Validate Authorization header and extract user data
 * Returns user data if valid, null if invalid
 */
export function validateAuthHeader(
  authHeader: string | null
): { userId: number; email: string; role: string } | null {
  const token = extractBearerToken(authHeader);

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Middleware to check JWT in request
 * Can be used in API routes to protect endpoints
 */
export function checkJWTAuth(req: NextRequest): {
  authorized: boolean;
  userId?: number;
  email?: string;
  role?: string;
} {
  const authHeader = req.headers.get("authorization");
  const userData = validateAuthHeader(authHeader);

  if (!userData) {
    return { authorized: false };
  }

  return {
    authorized: true,
    userId: userData.userId,
    email: userData.email,
    role: userData.role,
  };
}
