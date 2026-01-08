/**
 * Secrets Metadata Endpoint
 * GET /api/secrets/metadata - Get secret metadata and rotation info
 */

import { NextRequest, NextResponse } from "next/server";
import { getSecretMetadata } from "@/lib/secrets";

// Authorization helper
async function isAuthorized(req: NextRequest): Promise<boolean> {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return false;
  }

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

    // Get secret name from query parameter
    const secretName =
      req.nextUrl.searchParams.get("secret") ||
      process.env.AWS_SECRET_ID ||
      process.env.AZURE_SECRET_NAME;

    if (!secretName) {
      return NextResponse.json(
        { error: "Secret name is required" },
        { status: 400 }
      );
    }

    // Get metadata
    const metadata = await getSecretMetadata(secretName);

    if (!metadata.accessible) {
      return NextResponse.json(
        {
          error: "Secret is not accessible",
          name: metadata.name,
          message: metadata.error,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      name: metadata.name,
      accessible: true,
      lastUpdated: metadata.lastUpdated,
      enabled: metadata.enabled ?? true,
      rotationInfo: {
        lastUpdated: metadata.lastUpdated,
        nextRotationDue:
          metadata.lastUpdated &&
          new Date(
            metadata.lastUpdated.getTime() + 90 * 24 * 60 * 60 * 1000
          ).toISOString(),
        rotationFrequency: "90 days",
      },
    });
  } catch (error) {
    console.error("Secrets metadata error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get metadata",
      },
      { status: 500 }
    );
  }
}
