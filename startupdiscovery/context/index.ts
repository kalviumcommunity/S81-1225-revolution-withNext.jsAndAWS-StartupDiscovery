/**
 * Context Barrel Export
 *
 * Provides convenient imports for all contexts:
 * import { AuthProvider, UIProvider } from "@/context";
 */

export { AuthProvider, useAuthContext } from "./AuthContext";
export type { AuthState } from "./AuthContext";

export { UIProvider, useUIContext } from "./UIContext";
export type { UIState } from "./UIContext";
