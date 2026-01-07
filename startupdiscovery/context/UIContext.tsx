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
 * UI state interface
 */
export interface UIState {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  showNotifications: boolean;
  modalOpen: boolean;
}

/**
 * UI context type
 */
interface UIContextType extends UIState {
  toggleTheme: () => void;
  toggleSidebar: () => void;
  toggleNotifications: () => void;
  toggleModal: (open: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  resetUI: () => void;
}

/**
 * UIContext - manages global UI state
 */
const UIContext = createContext<UIContextType | undefined>(undefined);

/**
 * Default UI state
 */
const defaultUIState: UIState = {
  theme: "light",
  sidebarOpen: true,
  showNotifications: true,
  modalOpen: false,
};

/**
 * UIProvider - wraps app to provide UI state context
 *
 * Props:
 * - children: React components to wrap with UI context
 *
 * Features:
 * - Theme management (light/dark)
 * - Sidebar visibility toggle
 * - Notifications toggle
 * - Modal state management
 * - Memoized context value for performance
 */
export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<"light" | "dark">(
    defaultUIState.theme
  );
  const [sidebarOpen, setSidebarOpen] = useState(defaultUIState.sidebarOpen);
  const [showNotifications, setShowNotifications] = useState(
    defaultUIState.showNotifications
  );
  const [modalOpen, setModalOpen] = useState(defaultUIState.modalOpen);

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      console.log(`🎨 Theme toggled to: ${newTheme}`);
      // In production, you might save this to localStorage
      return newTheme;
    });
  }, []);

  /**
   * Set theme explicitly
   */
  const setTheme = useCallback((newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    console.log(`🎨 Theme set to: ${newTheme}`);
  }, []);

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      console.log(`📂 Sidebar ${!prev ? "opened" : "closed"}`);
      return !prev;
    });
  }, []);

  /**
   * Toggle notifications visibility
   */
  const toggleNotifications = useCallback(() => {
    setShowNotifications((prev) => {
      console.log(`🔔 Notifications ${!prev ? "enabled" : "disabled"}`);
      return !prev;
    });
  }, []);

  /**
   * Control modal state
   */
  const toggleModal = useCallback((open: boolean) => {
    setModalOpen(open);
    console.log(`🪟 Modal ${open ? "opened" : "closed"}`);
  }, []);

  /**
   * Reset UI to default state
   */
  const resetUI = useCallback(() => {
    setThemeState(defaultUIState.theme);
    setSidebarOpen(defaultUIState.sidebarOpen);
    setShowNotifications(defaultUIState.showNotifications);
    setModalOpen(defaultUIState.modalOpen);
    console.log("🔄 UI state reset to defaults");
  }, []);

  /**
   * Memoize context value to prevent unnecessary re-renders
   */
  const value = useMemo(
    () => ({
      theme,
      sidebarOpen,
      showNotifications,
      modalOpen,
      toggleTheme,
      toggleSidebar,
      toggleNotifications,
      toggleModal,
      setTheme,
      resetUI,
    }),
    [
      theme,
      sidebarOpen,
      showNotifications,
      modalOpen,
      toggleTheme,
      toggleSidebar,
      toggleNotifications,
      toggleModal,
      setTheme,
      resetUI,
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

/**
 * useUIContext hook - access UI context directly
 * Use useUI() instead for better encapsulation
 */
export function useUIContext() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUIContext must be used within a UIProvider");
  }
  return context;
}
