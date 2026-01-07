"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarLink {
  href: string;
  label: string;
  icon?: string;
}

interface SidebarProps {
  links?: SidebarLink[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

/**
 * Sidebar Component
 * Secondary navigation panel for application routes
 *
 * @param links - Array of navigation links to display
 * @param collapsible - Whether sidebar can be toggled open/closed on mobile
 * @param defaultOpen - Initial open state for collapsible sidebar
 *
 * Accessibility:
 * - Uses semantic <aside> element
 * - Keyboard navigation support
 * - ARIA labels for collapse/expand button
 * - Link active states properly indicated
 * - Mobile-responsive: hidden on small screens, toggleable with button
 */
export default function Sidebar({
  links = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/users", label: "Users", icon: "👥" },
    { href: "/profile", label: "Profile", icon: "👤" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ],
  collapsible = true,
  defaultOpen = true,
}: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname.startsWith("/dashboard");
    if (href === "/users") return pathname.startsWith("/users");
    return pathname === href;
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "w-64" : "w-0"
        } bg-slate-900 text-white transition-all duration-300 overflow-hidden flex flex-col h-screen fixed left-0 top-16 z-40 md:relative md:top-0 md:w-64 md:block`}
        role="complementary"
        aria-label="Secondary navigation"
      >
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                isActive(link.href)
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.icon && <span className="text-xl">{link.icon}</span>}
              <span className="flex-1">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer info */}
        <div className="border-t border-slate-700 p-4 text-xs text-slate-400">
          <p>© 2026 Startup Discovery</p>
        </div>
      </aside>

      {/* Mobile toggle button */}
      {collapsible && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      )}

      {/* Mobile overlay */}
      {isOpen && collapsible && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 top-16"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
