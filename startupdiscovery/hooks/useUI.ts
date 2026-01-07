import { useUIContext } from "@/context/UIContext";

/**
 * useUI hook - simplified interface for UI state management
 *
 * Encapsulates UI context logic and provides clean API for components
 *
 * Returns:
 * - theme: current theme ('light' or 'dark')
 * - sidebarOpen: whether sidebar is visible
 * - showNotifications: whether notifications are enabled
 * - modalOpen: whether modal is displayed
 * - toggleTheme: function to switch theme
 * - toggleSidebar: function to toggle sidebar visibility
 * - toggleNotifications: function to toggle notifications
 * - toggleModal: function to control modal state
 * - setTheme: function to set specific theme
 * - resetUI: function to reset all UI state to defaults
 *
 * Example:
 * const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUI();
 */
export function useUI() {
  const {
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
  } = useUIContext();

  return {
    // State
    theme,
    sidebarOpen,
    showNotifications,
    modalOpen,
    // Actions
    toggleTheme,
    toggleSidebar,
    toggleNotifications,
    toggleModal,
    setTheme,
    resetUI,
  };
}
