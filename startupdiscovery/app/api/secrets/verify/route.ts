/**
 * Secrets Verification Endpoint
 * GET /api/secrets/verify - Check if secrets are accessible
 */

import { NextRequest, NextResponse } from "next/server";
import {
  verifySecretAccess,
  validateSecretsConfig,
  getSecretsConfig,
} from "@/lib/secrets";

// Only allow in development or with authentication
async function isAuthorized(req: NextRequest): Promise<boolean> {
  // In production, implement proper JWT or token verification
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return false;
  }

  // Verify JWT token or API key
  // This is a placeholder - implement proper authentication
  const token = authHeader.replace("Bearer ", "");
  return token === process.env.SECRETS_VERIFY_TOKEN;
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<Record<string, unknown>>> {
  try {
    // Check authorization
    const authorized = await isAuthorized(req);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get configuration
    const config = getSecretsConfig();

    // Validate configuration
    const errors = validateSecretsConfig();
    if (errors.length > 0) {
      return NextResponse.json(
        {
          configured: false,
          provider: config.provider,
          errors,
        },
        { status: 400 }
      );
    }

    // Verify secret access
    const secretId = process.env.AWS_SECRET_ID || process.env.AZURE_SECRET_NAME;
    if (!secretId) {
      return NextResponse.json(
        {
          error: "No secret ID configured",
          provider: config.provider,
        },
        { status: 400 }
      );
    }

    const verification = await verifySecretAccess(secretId);

    return NextResponse.json({
      configured: true,
      provider: config.provider,
      accessible: verification.accessible,
      secretName: verification.name,
      lastUpdated: verification.lastUpdated,
      message: verification.accessible
        ? "Secrets are properly configured and accessible"
        : verification.error || "Secrets are not accessible",
    });
  } catch (error) {
    console.error("Secrets verification error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Verification failed",
      },
      { status: 500 }
    );
  }
}
