import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Startup Discovery - Public & Protected Routing Demo",
  description:
    "Next.js App Router with public routes, protected routes, dynamic routes, SEO, breadcrumbs, and error handling",
  keywords: [
    "Next.js",
    "App Router",
    "Dynamic Routes",
    "Protected Routes",
    "SEO",
    "Middleware",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://startupdiscovery.com",
    title: "Startup Discovery",
    description: "Explore innovative startups and connect with founders",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Navigation Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              StartUp Discovery
            </Link>

            <ul className="hidden md:flex items-center gap-8">
              <li>
                <Link
                  href="/"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/startups"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Startups
                </Link>
              </li>
              <li>
                <Link
                  href="/users"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Browse Users
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                >
                  Dashboard
                </Link>
              </li>
            </ul>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                Sign In
              </Link>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        {children}

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 mt-16">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-white font-bold mb-4">Startup Discovery</h3>
                <p className="text-sm">
                  Connecting founders, investors, and innovators.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Public Routes</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/" className="hover:text-white transition">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/startups"
                      className="hover:text-white transition"
                    >
                      Browse Startups
                    </Link>
                  </li>
                  <li>
                    <Link href="/users" className="hover:text-white transition">
                      Browse Users
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Protected Routes</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="/dashboard"
                      className="hover:text-white transition"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/profile"
                      className="hover:text-white transition"
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/settings"
                      className="hover:text-white transition"
                    >
                      Settings
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="#privacy"
                      className="hover:text-white transition"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="#terms" className="hover:text-white transition">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center text-sm">
              <p>
                © 2024 Startup Discovery. All rights reserved. | Built with
                Next.js App Router
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
