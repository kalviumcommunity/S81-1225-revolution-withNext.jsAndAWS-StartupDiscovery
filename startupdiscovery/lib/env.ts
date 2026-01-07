/**
 * Environment Variable Access Utilities
 * Provides safe, typed access to environment variables with validation
 *
 * Pattern:
 * - Server-only variables: Never access in client components
 * - Public variables: Prefixed with NEXT_PUBLIC_ (sent to browser)
 * - Validation: All variables are validated on startup
 */

// ============================================
// SERVER-ONLY ENVIRONMENT VARIABLES
// ============================================
// These should ONLY be used in server components, API routes, and server utilities

export const serverEnv = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || "",

  // Email Service
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "",

  // AWS S3
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",

  // Redis
  REDIS_URL: process.env.REDIS_URL || "",
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // Logging
  ENABLE_DETAILED_LOGS: process.env.ENABLE_DETAILED_LOGS === "true",
} as const;

// ============================================
// CLIENT-ACCESSIBLE ENVIRONMENT VARIABLES
// ============================================
// These are safe to use in browser (prefixed with NEXT_PUBLIC_)
// Automatically available via process.env in all components

export const clientEnv = {
  // JWT Configuration
  JWT_EXPIRY: process.env.NEXT_PUBLIC_JWT_EXPIRY || "7d",

  // Email Service
  SENDER_EMAIL:
    process.env.NEXT_PUBLIC_SENDER_EMAIL || "noreply@startupdiscovery.com",

  // AWS S3
  AWS_S3_BUCKET:
    process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "startup-discovery-uploads",
  AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",

  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  API_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000", 10),

  // Application Settings
  ENV: process.env.NEXT_PUBLIC_ENV || "development",
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Startup Discovery",

  // Feature Flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  ENABLE_FEEDBACK: process.env.NEXT_PUBLIC_ENABLE_FEEDBACK === "true",

  // Logging
  LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || "info",
} as const;

// ============================================
// VALIDATION FUNCTION
// ============================================
// Validates that all required environment variables are set

export function validateEnvironment() {
  const errors: string[] = [];

  // Required server variables
  const requiredServerVars = [
    "DATABASE_URL",
    "JWT_SECRET",
    "SENDGRID_API_KEY",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "REDIS_URL",
  ];

  requiredServerVars.forEach((varName) => {
    if (!process.env[varName]) {
      errors.push(
        `Missing required server environment variable: ${varName}. Check your .env.local file.`
      );
    }
  });

  if (errors.length > 0) {
    console.error("❌ Environment validation failed:");
    errors.forEach((error) => console.error(`  - ${error}`));
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Critical environment variables missing. Cannot start in production."
      );
    }
  } else {
    console.log("✅ Environment variables validated successfully");
  }

  return errors.length === 0;
}

// ============================================
// TYPE SAFETY
// ============================================
// Export types for TypeScript support

export type ServerEnv = typeof serverEnv;
export type ClientEnv = typeof clientEnv;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return clientEnv.ENV === "production";
}

/**
 * Check if running in development environment
 */
export function isDevelopment(): boolean {
  return clientEnv.ENV === "development";
}

/**
 * Get API URL with proper trailing slash handling
 */
export function getApiUrl(path: string = ""): string {
  const baseUrl = clientEnv.API_URL.replace(/\/$/, ""); // Remove trailing slash
  return path ? `${baseUrl}/${path.replace(/^\//, "")}` : baseUrl; // Add path without double slashes
}
