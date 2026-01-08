/**
 * Cloud Database Health Check Endpoint
 * GET /api/cloud-db/health
 * Returns database connection status and server information
 */

import { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/cloudDatabase";
import { applySecureHeaders } from "@/lib/security/secureHeaders";

export async function GET(_req: NextRequest) {
  try {
    const health = await checkDatabaseHealth();

    const response = new Response(JSON.stringify(health), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    applySecureHeaders(response as unknown as NextResponse);
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    const response = new Response(
      JSON.stringify({
        status: "error",
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );

    applySecureHeaders(response as unknown as NextResponse);
    return response;
  }
}
