/**
 * Cloud Database Metrics Endpoint
 * GET /api/cloud-db/metrics
 * Returns connection pool statistics and performance metrics
 */

import type { NextResponse } from "next/server";
import { getPoolMetrics, checkDatabaseHealth } from "@/lib/cloudDatabase";
import { applySecureHeaders } from "@/lib/security/secureHeaders";

interface MetricsResponse {
  timestamp: string;
  pool: {
    idle: number;
    total: number;
    waiting: number;
    utilization: number;
  };
  database: {
    status: "connected" | "disconnected";
    version: string;
    serverTime: string;
  };
  recommendations: string[];
}

export async function GET() {
  try {
    const metrics = getPoolMetrics();
    const health = await checkDatabaseHealth();

    const utilization =
      metrics.total > 0
        ? ((metrics.total - metrics.idle) / metrics.total) * 100
        : 0;

    const recommendations: string[] = [];

    if (utilization > 80) {
      recommendations.push(
        "⚠ Connection pool utilization is high (>80%). Consider scaling up."
      );
    }

    if (metrics.waiting > 0) {
      recommendations.push(
        `⚠ ${metrics.waiting} connection(s) waiting in queue. May indicate contention.`
      );
    }

    if (health.status === "disconnected") {
      recommendations.push(
        "✗ Database connection failed. Check connectivity and credentials."
      );
    } else {
      recommendations.push("✓ Database connection healthy");
    }

    const result: MetricsResponse = {
      timestamp: new Date().toISOString(),
      pool: {
        idle: metrics.idle,
        total: metrics.total,
        waiting: metrics.waiting,
        utilization: parseFloat(utilization.toFixed(2)),
      },
      database: {
        status: health.status,
        version: health.database,
        serverTime: health.serverTime,
      },
      recommendations,
    };

    const response = new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    applySecureHeaders(response as unknown as NextResponse);
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    const result = {
      timestamp: new Date().toISOString(),
      error: errorMessage,
      recommendations: [
        "✗ Failed to retrieve metrics. Check database connection.",
      ],
    };

    const response = new Response(JSON.stringify(result, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

    applySecureHeaders(response as unknown as NextResponse);
    return response;
  }
}
