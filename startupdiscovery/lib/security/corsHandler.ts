/**
 * CORS API Wrapper
 * Wraps API route handlers to apply CORS headers automatically
 */

import { NextResponse } from "next/server";
import { applyCORSHeaders, applySecureHeaders } from "./secureHeaders";

/**
 * Wraps API route handlers with CORS and security headers
 * @param handler The actual API route handler (GET, POST, etc.)
 * @returns Wrapped handler with CORS/security headers applied
 */
export function withCORS(
  handler: (req: Request) => Promise<Response> | Response
) {
  return async (req: Request) => {
    // Handle preflight OPTIONS requests
    if (req.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 204 });
      const origin = req.headers.get("origin") || undefined;
      applySecureHeaders(response);
      applyCORSHeaders(response, origin);
      return response;
    }

    // Call the actual handler
    const response = await handler(req);

    // Ensure response is a NextResponse for header manipulation
    const nextResponse =
      response instanceof NextResponse
        ? response
        : new NextResponse(response.body, {
            status: response.status,
            headers: new Headers(response.headers),
          });

    // Apply CORS and security headers
    const origin = req.headers.get("origin") || undefined;
    applySecureHeaders(nextResponse);
    applyCORSHeaders(nextResponse, origin);

    return nextResponse;
  };
}

/**
 * Create a CORS-wrapped API response
 * Useful for inline API route handlers
 * @param body Response body/data
 * @param status HTTP status code
 * @param req The incoming request (for origin extraction)
 * @returns NextResponse with CORS headers applied
 */
export function corsResponse(
  body: unknown,
  status: number = 200,
  req?: Request
): NextResponse {
  const response = NextResponse.json(body, { status });
  const origin = req?.headers.get("origin") || undefined;
  applySecureHeaders(response);
  applyCORSHeaders(response, origin);
  return response;
}

/**
 * Create a CORS-wrapped error response
 * @param error Error message
 * @param status HTTP status code
 * @param req The incoming request
 * @returns NextResponse with error and CORS headers
 */
export function corsErrorResponse(
  error: string,
  status: number = 400,
  req?: Request
): NextResponse {
  return corsResponse({ error }, status, req);
}
