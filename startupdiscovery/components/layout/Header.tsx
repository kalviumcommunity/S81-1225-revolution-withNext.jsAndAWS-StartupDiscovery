"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  title?: string;
  showNav?: boolean;
}

/**
 * Header Component
 * Global navigation header displayed at the top of all pages
 *
 * @param title - Optional custom title (defaults to "Startup Discovery")
 * @param showNav - Whether to show navigation links (defaults to true)
 *
 * Accessibility:
 * - Uses semantic <header> element
 * - Navigation links have active state indication
 * - Proper heading hierarchy with h1
 * - Skip to main content link available for screen readers
 */
export default function Header({
  title = "🚀 Startup Discovery",
  showNav = true,
}: HeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/users", label: "Browse Users" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/login", label: "Sign In" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
      role="banner"
    >
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo / Title */}
          <Link
            href="/"
            className="text-2xl font-bold hover:text-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1"
            aria-label="Startup Discovery - Home"
          >
            {title}
          </Link>

          {/* Navigation */}
          {showNav && (
            <nav
              className="hidden md:flex gap-1"
              role="navigation"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
                    isActive(link.href)
                      ? "bg-blue-800 text-white font-semibold"
                      : "text-blue-100 hover:bg-blue-500 hover:text-white"
                  }`}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
