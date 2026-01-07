import {
  extractTokensFromCookies,
  getClearAuthCookies,
} from "@/lib/tokenManager";
import { verifyRefreshToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";

/**
 * POST /api/auth/logout
 * Invalidate user session and clear tokens
 *
 * Flow:
 * 1. Client sends request with refreshToken in cookie
 * 2. Server finds and revokes the session
 * 3. All refresh tokens for user remain valid but marked revoked
 * 4. Server clears cookies on client
 * 5. Client is redirected to login
 *
 * Security:
 * - Even if attacker has old refresh token, it's marked revoked
 * - Token rotation check will catch reuse attempts
 * - All tokens must be cleared from cookies
 */
export async function POST(req: Request) {
  try {
    // Extract refresh token from cookies
    const cookieHeader = req.headers.get("cookie");
    const { refreshToken } = extractTokensFromCookies(cookieHeader);

    if (!refreshToken) {
      // Token not provided, still clear cookies (safe logout)
      const headers = new Headers();
      getClearAuthCookies().forEach((cookie) =>
        headers.append("Set-Cookie", cookie)
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: "Logout successful",
        }),
        {
          status: 200,
          headers,
        }
      );
    }

    // Verify refresh token to get user info
    const decoded = verifyRefreshToken(refreshToken);

    if (decoded) {
      // Hash token for lookup
      const tokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      // Find and revoke the session
      const session = await prisma.session.findUnique({
        where: { refreshTokenHash: tokenHash },
      });

      if (session) {
        // Revoke the specific session
        await prisma.session.update({
          where: { id: session.id },
          data: {
            isRevoked: true,
            revokedAt: new Date(),
          },
        });

        console.log(
          `[AUTH] User ${decoded.userId} logged out. Session ${session.id} revoked.`
        );
      }
    }

    // Clear cookies
    const headers = new Headers();
    getClearAuthCookies().forEach((cookie) =>
      headers.append("Set-Cookie", cookie)
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Logout successful",
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Logout error:", error.message);
    }

    // Even on error, attempt to clear cookies for security
    const headers = new Headers();
    getClearAuthCookies().forEach((cookie) =>
      headers.append("Set-Cookie", cookie)
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Logout completed with errors cleared",
      }),
      {
        status: 200,
        headers,
      }
    );
  }
}

/**
 * DELETE /api/auth/logout
 * Alternative way to logout (some clients prefer DELETE)
 */
export async function DELETE(req: Request) {
  return POST(req);
}

/**
 * GET /api/auth/logout
 * Logout via GET (less secure, but sometimes needed)
 * In production, prefer POST with CSRF token validation
 */
export async function GET() {
  // For security, always redirect instead of processing GET
  // Implement proper logout via POST in client
  return new Response(
    JSON.stringify({
      error: "Use POST /api/auth/logout instead",
    }),
    {
      status: 405,
      headers: {
        Allow: "POST, DELETE",
      },
    }
  );
}
