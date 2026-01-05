import { loginSchema } from "@/lib/schemas/authSchema";
import { comparePassword, generateToken } from "@/lib/auth";
import {
  sendSuccess,
  sendError,
  sendValidationError,
} from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";

/**
 * POST /api/auth/login
 * Authenticate user and issue JWT token
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
    } catch (error) {
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

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    return sendSuccess(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        token,
        expiresIn: "7d",
      },
      "Login successful",
      200
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
