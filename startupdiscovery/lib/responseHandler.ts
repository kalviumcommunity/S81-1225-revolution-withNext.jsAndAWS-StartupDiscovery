import { NextResponse } from 'next/server';

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
