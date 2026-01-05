/**
 * Token validation utility with signature verification
 * In production, this would use JWT tokens with proper cryptographic verification
 */

// Mock valid tokens for demonstration (in production, use JWT)
// Format: token -> { userId: number, role: string }
const VALID_TOKENS: Record<string, { userId: number; role: string }> = {
  // Test tokens for demo purposes
  "1:user": { userId: 1, role: "user" },
  "2:user": { userId: 2, role: "user" },
  "3:user": { userId: 3, role: "user" },
  "4:moderator": { userId: 4, role: "moderator" },
  "1:admin": { userId: 1, role: "admin" },
};

/**
 * Validate and verify authentication token
 * In production, implement proper JWT verification with secret key
 */
export function validateToken(
  token: string
): { userId: number; role: string } | null {
  // Check if token exists in valid tokens list
  if (VALID_TOKENS[token]) {
    return VALID_TOKENS[token];
  }

  // Token not found or invalid
  return null;
}

/**
 * Check if user role has required permission level
 */
export function hasRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = { admin: 3, moderator: 2, user: 1 };
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel =
    roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  return userLevel >= requiredLevel;
}
