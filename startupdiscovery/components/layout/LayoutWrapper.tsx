"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutWrapperProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
  headerTitle?: string;
}

/**
 * LayoutWrapper Component
 * Main layout container that combines Header and Sidebar for consistent page structure
 *
 * @param children - Page content to render in main area
 * @param showHeader - Whether to display header (default: true)
 * @param showSidebar - Whether to display sidebar (default: true)
 * @param headerTitle - Optional custom title for header
 *
 * Layout Structure:
 * ┌─────────────────────────┐
 * │       Header            │
 * ├──────────┬──────────────┤
 * │          │              │
 * │ Sidebar  │   Main       │
 * │          │  Content     │
 * │          │  (children)  │
 * │          │              │
 * └──────────┴──────────────┘
 *
 * Accessibility:
 * - Uses semantic <main> element for page content
 * - Proper landmark structure
 * - Screen reader navigation
 */
export default function LayoutWrapper({
  children,
  showHeader = true,
  showSidebar = true,
  headerTitle,
}: LayoutWrapperProps) {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      {showHeader && <Header title={headerTitle} />}

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && <Sidebar />}

        {/* Main content */}
        <main
          id="main-content"
          className="flex-1 overflow-auto md:ml-0"
          role="main"
        >
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
