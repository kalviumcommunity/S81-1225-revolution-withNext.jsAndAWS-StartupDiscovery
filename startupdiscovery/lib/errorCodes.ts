/**
 * Standardized error codes for API responses
 * Format: E[Category][Number]
 */
export const ERROR_CODES = {
  // Validation Errors (E001-E099)
  VALIDATION_ERROR: "E001",
  INVALID_INPUT: "E002",
  MISSING_REQUIRED_FIELD: "E003",
  INVALID_EMAIL_FORMAT: "E004",
  INVALID_DATE_FORMAT: "E005",
  INVALID_PAGINATION: "E006",
  INVALID_REQUEST_BODY: "E007",

  // Authentication & Authorization Errors (E100-E199)
  UNAUTHORIZED: "E100",
  FORBIDDEN: "E101",
  INVALID_TOKEN: "E102",
  TOKEN_EXPIRED: "E103",
  INSUFFICIENT_PERMISSIONS: "E104",

  // Resource Errors (E200-E299)
  NOT_FOUND: "E200",
  RESOURCE_NOT_FOUND: "E201",
  USER_NOT_FOUND: "E202",
  TASK_NOT_FOUND: "E203",
  PROJECT_NOT_FOUND: "E204",

  // Conflict Errors (E300-E399)
  CONFLICT: "E300",
  DUPLICATE_RESOURCE: "E301",
  EMAIL_ALREADY_EXISTS: "E302",

  // Database Errors (E400-E499)
  DATABASE_ERROR: "E400",
  DATABASE_FAILURE: "E401",
  QUERY_FAILED: "E402",

  // Server Errors (E500-E599)
  INTERNAL_ERROR: "E500",
  INTERNAL_SERVER_ERROR: "E500", // Alias for INTERNAL_ERROR
  SERVER_ERROR: "E501",
  SERVICE_UNAVAILABLE: "E502",
};

/**
 * Get human-readable error message for error code
 */
export const getErrorMessage = (code: string): string => {
  const messages: Record<string, string> = {
    [ERROR_CODES.VALIDATION_ERROR]: "Validation failed",
    [ERROR_CODES.INVALID_INPUT]: "Invalid input provided",
    [ERROR_CODES.UNAUTHORIZED]: "Authentication required",
    [ERROR_CODES.FORBIDDEN]: "Access forbidden",
    [ERROR_CODES.NOT_FOUND]: "Resource not found",
    [ERROR_CODES.CONFLICT]: "Resource conflict",
    [ERROR_CODES.DATABASE_ERROR]: "Database operation failed",
    [ERROR_CODES.INTERNAL_ERROR]: "Internal server error",
  };

  return messages[code] || "An error occurred";
};
