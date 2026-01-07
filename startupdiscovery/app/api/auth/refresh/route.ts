import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth";
import { extractTokensFromCookies, logTokenRotation } from "@/lib/tokenManager";
import prisma from "@/lib/prisma";
import crypto from "crypto";

/**
 * POST /api/auth/refresh
 * Issue a new access token using the refresh token
 *
 * Flow:
 * 1. Client sends request with refreshToken in secure cookie
 * 2. Server validates refresh token
 * 3. Server checks token hasn't been revoked (logout)
 * 4. Server verifies token version matches stored version (rotation check)
 * 5. Server issues new access token
 * 6. Server rotates refresh token (new version)
 * 7. Client receives tokens in secure cookies
 *
 * This implements automatic token rotation for security
 */
export async function POST(req: Request) {
  try {
    // Extract refresh token from cookies
    const cookieHeader = req.headers.get("cookie");
    const { refreshToken } = extractTokensFromCookies(cookieHeader);

    if (!refreshToken) {
      return sendError(
        "Refresh token not provided",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    // Verify refresh token signature and expiry
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return sendError(
        "Invalid or expired refresh token",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    // Find session in database
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: true },
    });

    if (!session) {
      return sendError("Session not found", ERROR_CODES.UNAUTHORIZED, 401);
    }

    // Check if session has been revoked (user logged out)
    if (session.isRevoked) {
      return sendError(
        "Session has been revoked",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    // Verify token version matches (token rotation security check)
    if (session.tokenVersion !== decoded.tokenVersion) {
      // Token version mismatch indicates:
      // - Token reuse after logout
      // - Potential token replay attack
      // - Invalidate all sessions for this user
      console.error(
        `[SECURITY] Token version mismatch for user ${decoded.userId}. Possible token reuse detected.`
      );

      // Mark all sessions as revoked
      await prisma.session.updateMany({
        where: {
          userId: decoded.userId,
        },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      });

      return sendError(
        "Session security validation failed. Please log in again.",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    // Generate new access token with same credentials
    const newAccessToken = generateAccessToken(
      session.user.id,
      session.user.email,
      session.user.role
    );

    // Rotate refresh token (increment version for security)
    const newTokenVersion = session.tokenVersion + 1;
    const newRefreshToken = generateRefreshToken(
      session.user.id,
      session.user.email,
      newTokenVersion
    );

    // Hash new refresh token for storage
    const newTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    // Update session with new token version and hash
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newTokenHash,
        tokenVersion: newTokenVersion,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Log token rotation for audit trail
    logTokenRotation({
      previousTokenVersion: session.tokenVersion,
      newTokenVersion,
      rotatedAt: new Date(),
      reason: "refresh",
    });

    // Set cookies with Set-Cookie header
    const headers = new Headers();
    headers.set(
      "Set-Cookie",
      [
        `accessToken=${newAccessToken}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure" : ""}; SameSite=Lax; Max-Age=${15 * 60}; Path=/`,
        `refreshToken=${newRefreshToken}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure" : ""}; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`,
      ].join("\n")
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Token refreshed successfully",
        data: {
          expiresIn: "15m",
          tokenVersion: newTokenVersion,
          refreshedAt: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Token refresh error:", error.message);
    }

    return sendError(
      "Failed to refresh token",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}

/**
 * GET /api/auth/refresh
 * Check current token validity and expiry time
 */
export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const { accessToken, refreshToken } =
      extractTokensFromCookies(cookieHeader);

    if (!accessToken || !refreshToken) {
      return sendError("Tokens not provided", ERROR_CODES.UNAUTHORIZED, 401);
    }

    // Check refresh token validity
    const refreshDecoded = verifyRefreshToken(refreshToken);

    if (!refreshDecoded) {
      return sendError(
        "Refresh token is invalid or expired",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    return sendSuccess(
      {
        valid: true,
        expiresIn: "15m",
        tokenVersion: refreshDecoded.tokenVersion,
      },
      "Tokens are valid",
      200
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Token validation error:", error.message);
    }

    return sendError(
      "Failed to validate token",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
