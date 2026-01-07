import { signupSchema } from "@/lib/schemas/authSchema";
import { hashPassword, generateTokenPair } from "@/lib/auth";
import { sendError, sendValidationError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import crypto from "crypto";

/**
 * POST /api/auth/signup
 * Register a new user with email and password
 * Issues token pair immediately after signup
 *
 * Body: {
 *   name: string (required),
 *   email: string (required, valid email),
 *   password: string (required, min 8 chars, must include uppercase, lowercase, number, special char),
 *   age: number (optional)
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input against signup schema
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return sendError(
        "User with this email already exists",
        ERROR_CODES.EMAIL_ALREADY_EXISTS,
        409
      );
    }

    // Hash password
    let hashedPassword: string;
    try {
      hashedPassword = await hashPassword(validatedData.password);
    } catch {
      return sendError(
        "Failed to process password",
        ERROR_CODES.INTERNAL_ERROR,
        500
      );
    }

    // Generate unique username with collision handling
    const baseUsername = validatedData.email.split("@")[0];
    let username = baseUsername;
    let usernameExists = await prisma.user.findUnique({
      where: { username },
    });

    // If username exists, append random suffix until unique
    let attempts = 0;
    while (usernameExists && attempts < 10) {
      const suffix = crypto.randomBytes(3).toString("hex");
      username = `${baseUsername}${suffix}`;
      usernameExists = await prisma.user.findUnique({
        where: { username },
      });
      attempts++;
    }

    if (usernameExists) {
      return sendError(
        "Unable to generate unique username. Please try again.",
        ERROR_CODES.INTERNAL_ERROR,
        500
      );
    }

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        username,
        passwordHash: hashedPassword,
        role: "USER", // Default role
        lastLoginAt: new Date(), // Set login time for new user
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate token pair for immediate login after signup
    const { accessToken, refreshToken, expiresIn } = generateTokenPair(
      newUser.id,
      newUser.email,
      newUser.role
    );

    // Hash refresh token for secure storage
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
        userId: newUser.id,
        token: accessToken, // Store access token reference
        refreshTokenHash, // Store hash of refresh token
        tokenVersion: 1, // Start at version 1
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Access token expiry
        ipAddress,
        userAgent,
        isRevoked: false,
      },
    });

    console.log(
      `[AUTH] User ${newUser.email} registered and logged in. Session: ${session.id}`
    );

    // Set secure HTTP-only cookies
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
        message: "User registered successfully",
        data: {
          user: newUser,
          expiresIn,
          tokenVersion: 1,
          sessionId: session.id,
        },
      }),
      {
        status: 201,
        headers,
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return sendValidationError(error);
    }

    if (error instanceof Error) {
      console.error("Signup error:", error);
    }

    return sendError(
      "Failed to register user",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
