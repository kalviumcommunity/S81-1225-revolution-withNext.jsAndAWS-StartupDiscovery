"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";

/**
 * Auth state interface
 */
export interface AuthState {
  user: string | null;
  email: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth context type
 */
interface AuthContextType extends AuthState {
  login: (username: string, email: string) => void;
  logout: () => void;
  clearError: () => void;
}

/**
 * AuthContext - manages global authentication state
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider - wraps app to provide authentication context
 *
 * Props:
 * - children: React components to wrap with auth context
 *
 * Features:
 * - User login with username and email
 * - User logout
 * - Error state management
 * - Memoized context value for performance
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Login - authenticate user
   * Simulates async authentication flow
   */
  const login = useCallback((username: string, userEmail: string) => {
    if (!username || !userEmail) {
      setError("Username and email are required");
      console.warn("Login failed: Missing credentials");
      return;
    }

    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setUser(username);
      setEmail(userEmail);
      setError(null);
      setIsLoading(false);
      console.log(`✅ User logged in: ${username} (${userEmail})`);
    }, 500);
  }, []);

  /**
   * Logout - clear user session
   */
  const logout = useCallback(() => {
    setUser(null);
    setEmail(null);
    setError(null);
    console.log("✅ User logged out");
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Memoize context value to prevent unnecessary re-renders
   */
  const value = useMemo(
    () => ({
      user,
      email,
      isLoading,
      error,
      login,
      logout,
      clearError,
    }),
    [user, email, isLoading, error, login, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuthContext hook - access auth context directly
 * Use useAuth() instead for better encapsulation
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
