import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Send a standardized success response
 * @param data - The data to return
 * @param message - Success message
 * @param status - HTTP status code (default: 200)
 */
export const sendSuccess = (data: any, message = 'Success', status = 200) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Send a standardized error response
 * @param message - Error message
 * @param code - Error code identifier
 * @param status - HTTP status code (default: 500)
 * @param details - Additional error details
 */
export const sendError = (
  message = 'Something went wrong',
  code = 'INTERNAL_ERROR',
  status = 500,
  details?: any
) => {
  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        code,
        details,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Send a validation error response from Zod errors
 * Note: Sanitized to prevent exposing internal schema structure
 */
export const sendValidationError = (error: ZodError) => {
  return NextResponse.json(
    {
      success: false,
      message: 'Validation Error',
      errors: error.issues.map((e: any) => ({
        field: e.path.length > 0 ? e.path[e.path.length - 1] : 'unknown',
        message: e.message,
      })),
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  );
};
