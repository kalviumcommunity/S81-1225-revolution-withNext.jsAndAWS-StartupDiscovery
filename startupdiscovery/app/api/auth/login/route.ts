import { loginSchema } from "@/lib/schemas/authSchema";
import { comparePassword, generateTokenPair } from "@/lib/auth";
import { sendError, sendValidationError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import crypto from "crypto";

/**
 * POST /api/auth/login
 * Authenticate user and issue JWT token pair
 *
 * Token Flow:
 * 1. User submits email and password
 * 2. Server verifies credentials
 * 3. Server generates access token (15m) and refresh token (7d)
 * 4. Server stores refresh token hash in Session with version
 * 5. Server returns tokens in secure HTTP-only cookies
 * 6. Client uses access token for API requests
 * 7. When access token expires, client uses refresh token to get new one
 *
 * Body: {
 *   email: string (required, valid email),
 *   password: string (required)
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input against login schema
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return sendError(
        "Invalid email or password",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    // Verify password
    let isPasswordValid: boolean;
    try {
      isPasswordValid = await comparePassword(
        validatedData.password,
        user.passwordHash
      );
    } catch {
      return sendError(
        "Failed to verify password",
        ERROR_CODES.INTERNAL_ERROR,
        500
      );
    }

    if (!isPasswordValid) {
      return sendError(
        "Invalid email or password",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    // Generate token pair: access token (short) + refresh token (long)
    const { accessToken, refreshToken, expiresIn } = generateTokenPair(
      user.id,
      user.email,
      user.role
    );

    // Hash refresh token for secure storage (never store token in plain text)
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Get client IP and User-Agent for session tracking
    const xForwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = xForwardedFor
      ? xForwardedFor.split(",")[0].trim()
      : req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    // Create session record with token hash and version
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken, // Store access token reference
        refreshTokenHash, // Store hash of refresh token
        tokenVersion: 1, // Track token rotation version
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Access token expiry (15 min)
        ipAddress,
        userAgent,
        isRevoked: false,
      },
    });

    console.log(
      `[AUTH] User ${user.email} logged in. Session: ${session.id}, TokenVersion: 1`
    );

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Set secure HTTP-only cookies for both tokens
    const headers = new Headers();
    headers.set(
      "Set-Cookie",
      [
        // Access Token Cookie (15 minutes)
        `accessToken=${accessToken}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure" : ""}; SameSite=Lax; Max-Age=${15 * 60}; Path=/`,
        // Refresh Token Cookie (7 days)
        `refreshToken=${refreshToken}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure" : ""}; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`,
      ].join("\n")
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
          },
          expiresIn,
          tokenVersion: 1,
          sessionId: session.id,
        },
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(error);
    }

    // Log error without exposing sensitive information
    if (error instanceof Error) {
      console.error("Login error:", error.message);
    }

    return sendError(
      "Failed to authenticate user",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
