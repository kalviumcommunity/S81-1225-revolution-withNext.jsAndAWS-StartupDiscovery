import { useAuthContext } from "@/context/AuthContext";

/**
 * useAuth hook - simplified interface for authentication
 *
 * Encapsulates auth context logic and provides helpful derived state
 *
 * Returns:
 * - isAuthenticated: boolean flag indicating if user is logged in
 * - user: current username or null
 * - email: current user email or null
 * - isLoading: whether login is in progress
 * - error: any login errors
 * - login: function to authenticate user
 * - logout: function to clear user session
 * - clearError: function to dismiss errors
 *
 * Example:
 * const { isAuthenticated, user, login, logout } = useAuth();
 */
export function useAuth() {
  const { user, email, isLoading, error, login, logout, clearError } =
    useAuthContext();

  return {
    // Derived state
    isAuthenticated: user !== null,
    // State
    user,
    email,
    isLoading,
    error,
    // Actions
    login,
    logout,
    clearError,
  };
}
