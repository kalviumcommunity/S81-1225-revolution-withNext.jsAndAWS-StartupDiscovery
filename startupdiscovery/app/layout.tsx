import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { LayoutWrapper } from "@/components";
import { AuthProvider, UIProvider } from "@/context";
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
        <AuthProvider>
          <UIProvider>
            <LayoutWrapper
              showHeader
              showSidebar
              headerTitle="Startup Discovery"
            >
              {children}
            </LayoutWrapper>
          </UIProvider>
        </AuthProvider>

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
