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
 * Access Token Payload - for short-lived API requests
 */
interface AccessTokenPayload extends JWTPayload {
  type: "access";
}

/**
 * Refresh Token Payload - for obtaining new access tokens
 */
interface RefreshTokenPayload {
  userId: number;
  email: string;
  type: "refresh";
  tokenVersion: number; // For token rotation tracking
  iat?: number;
  exp?: number;
}

/**
 * JWT Secret Keys - In production, use environment variables
 * Should be long, random strings stored securely
 */
const getAccessTokenSecret = (): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_ACCESS_SECRET environment variable is not set. Please set it in your .env.local file."
    );
  }
  return secret;
};

const getRefreshTokenSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_REFRESH_SECRET environment variable is not set. Please set it in your .env.local file."
    );
  }
  return secret;
};

const getJWTSecret = (): string => {
  // Fallback to access secret for backward compatibility
  return getAccessTokenSecret();
};

// Token expiry times
const ACCESS_TOKEN_EXPIRY = "15m"; // Short-lived: 15 minutes
const REFRESH_TOKEN_EXPIRY = "7d"; // Long-lived: 7 days
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d"; // Fallback for backward compatibility

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
      getJWTSecret(),
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
    const decoded = jwt.verify(token, getJWTSecret(), {
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

/**
 * Generate Access Token (short-lived, 15 minutes)
 * Used for API authentication - should be stored in memory or secure cookie
 */
export function generateAccessToken(
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
        type: "access",
        iat: Math.floor(Date.now() / 1000),
      } as AccessTokenPayload,
      getAccessTokenSecret(),
      {
        expiresIn: ACCESS_TOKEN_EXPIRY,
        algorithm: "HS256",
      } as jwt.SignOptions
    );
    return token;
  } catch (error) {
    throw new Error(
      `Access token generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate Refresh Token (long-lived, 7 days)
 * Used to obtain new access tokens - stored in secure HTTP-only cookie
 */
export function generateRefreshToken(
  userId: number,
  email: string,
  tokenVersion: number = 1
): string {
  try {
    const token = jwt.sign(
      {
        userId,
        email,
        type: "refresh",
        tokenVersion,
        iat: Math.floor(Date.now() / 1000),
      } as RefreshTokenPayload,
      getRefreshTokenSecret(),
      {
        expiresIn: REFRESH_TOKEN_EXPIRY,
        algorithm: "HS256",
      } as jwt.SignOptions
    );
    return token;
  } catch (error) {
    throw new Error(
      `Refresh token generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Verify Access Token
 * Returns decoded token data or null if invalid/expired
 */
export function verifyAccessToken(token: string): {
  userId: number;
  email: string;
  role: string;
  type: string;
} | null {
  try {
    const decoded = jwt.verify(token, getAccessTokenSecret(), {
      algorithms: ["HS256"],
    }) as AccessTokenPayload;

    // Ensure this is an access token
    if (decoded.type !== "access") {
      return null;
    }

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
        type: decoded.type,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Verify Refresh Token
 * Returns decoded token data or null if invalid/expired
 */
export function verifyRefreshToken(token: string): {
  userId: number;
  email: string;
  tokenVersion: number;
  type: string;
} | null {
  try {
    const decoded = jwt.verify(token, getRefreshTokenSecret(), {
      algorithms: ["HS256"],
    }) as RefreshTokenPayload;

    // Ensure this is a refresh token
    if (decoded.type !== "refresh") {
      return null;
    }

    if (
      typeof decoded === "object" &&
      "userId" in decoded &&
      "email" in decoded &&
      "tokenVersion" in decoded
    ) {
      return {
        userId: decoded.userId,
        email: decoded.email,
        tokenVersion: decoded.tokenVersion,
        type: decoded.type,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Generate both Access and Refresh tokens
 * Called after successful login/signup
 */
export function generateTokenPair(
  userId: number,
  email: string,
  role: string = "USER",
  tokenVersion: number = 1
): {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
} {
  const accessToken = generateAccessToken(userId, email, role);
  const refreshToken = generateRefreshToken(userId, email, tokenVersion);

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY,
  };
}
