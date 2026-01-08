import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone", // Required for Docker deployment

  // Security Headers Configuration
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          // HSTS (HTTP Strict-Transport-Security)
          // Forces browsers to always use HTTPS for this domain
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // Content Security Policy (CSP)
          // Controls which resources (scripts, styles, images, etc.) can be loaded
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://apis.google.com; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
              "img-src 'self' data: https:; " +
              "font-src 'self' https://fonts.gstatic.com data:; " +
              "connect-src 'self' https:; " +
              "frame-ancestors 'none'; " +
              "base-uri 'self'; " +
              "form-action 'self';",
          },

          // Prevent browsers from MIME-type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // Prevent clickjacking attacks
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // Enable XSS protection in older browsers
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },

          // Control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // Permissions Policy (formerly Feature Policy)
          // Restrict access to browser features and APIs
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
          },

          // Prevent sensitive data in browser cache
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
    ];
  },

  // Redirect HTTP to HTTPS (for production deployment)
  redirects: async () => {
    return [
      {
        source: "/:path*",
        destination: "https://:host/:path*",
        permanent: true,
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
      },
    ];
  },
};

export default nextConfig;
