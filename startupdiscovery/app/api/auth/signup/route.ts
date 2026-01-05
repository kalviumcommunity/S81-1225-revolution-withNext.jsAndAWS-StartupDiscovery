import { signupSchema } from "@/lib/schemas/authSchema";
import { hashPassword, generateToken } from "@/lib/auth";
import {
  sendSuccess,
  sendError,
  sendValidationError,
} from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import crypto from "crypto";

/**
 * POST /api/auth/signup
 * Register a new user with email and password
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
    } catch (error) {
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

    // Generate JWT token for immediate login after signup
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    return sendSuccess(
      {
        user: newUser,
        token,
        expiresIn: "7d",
      },
      "User registered successfully",
      201
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
