/**
 * Cloud Database Connection Test Endpoint
 * GET /api/cloud-db/test
 * Tests database connection and returns system information
 */

import type { NextResponse } from "next/server";
import { executeQuery, testConnectionWithRetry } from "@/lib/cloudDatabase";
import { applySecureHeaders } from "@/lib/security/secureHeaders";

interface TestResult {
  success: boolean;
  message: string;
  timestamp: string;
  databaseInfo?: {
    version: string;
    currentDatabase: string;
    currentUser: string;
    connected: boolean;
  };
  error?: string;
}

export async function GET() {
  const result: TestResult = {
    success: false,
    message: "",
    timestamp: new Date().toISOString(),
  };

  try {
    // Test connection with retries
    await testConnectionWithRetry(3, 500);
    result.message = "✓ Database connection successful";

    // Get database information
    const queryResult = await executeQuery(
      "SELECT VERSION() as version, CURRENT_DATABASE() as current_database, CURRENT_USER as current_user"
    );

    if (queryResult.rows.length > 0) {
      const dbInfo = queryResult.rows[0] as {
        version: string;
        current_database: string;
        current_user: string;
      };
      result.databaseInfo = {
        version: dbInfo.version.split(",")[0].trim(),
        currentDatabase: dbInfo.current_database,
        currentUser: dbInfo.current_user,
        connected: true,
      };
      result.success = true;
    }
  } catch (error) {
    result.success = false;
    result.error =
      error instanceof Error ? error.message : "Unknown error occurred";
    result.message = `✗ Connection test failed: ${result.error}`;

    // Provide helpful troubleshooting information
    if (result.error.includes("ECONNREFUSED")) {
      result.message +=
        " - Check if database endpoint is correct and database is running";
    } else if (result.error.includes("authentication")) {
      result.message +=
        " - Check username, password, and that user has proper permissions";
    } else if (result.error.includes("does not exist")) {
      result.message += " - Database or user does not exist. Create them first";
    }
  }

  const statusCode = result.success ? 200 : 500;
  const response = new Response(JSON.stringify(result, null, 2), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });

  applySecureHeaders(response as unknown as NextResponse);
  return response;
}
