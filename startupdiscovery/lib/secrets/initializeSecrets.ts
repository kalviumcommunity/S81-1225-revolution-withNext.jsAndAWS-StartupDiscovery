/**
 * Secrets Initialization Module
 * Load secrets at application startup and manage caching
 */

import {
  loadSecretsAsEnv,
  verifySecretAccess,
  validateSecretsConfig,
  getSecretsProvider,
} from "./index";

export interface InitializeSecretsOptions {
  /**
   * Automatically load secrets as environment variables
   */
  loadEnv?: boolean;

  /**
   * Verify secret access on startup
   */
  verify?: boolean;

  /**
   * Cache TTL in seconds (for refresh strategy)
   */
  cacheTtl?: number;

  /**
   * Secret ID/name to load
   */
  secretId?: string;

  /**
   * Throw error if initialization fails
   */
  throwOnError?: boolean;
}

/**
 * In-memory cache for secrets
 */
const secretsCache: Map<string, { value: unknown; timestamp: number }> =
  new Map();
new Map();

/**
 * Initialize secrets on application startup
 */
export async function initializeSecrets(
  options: InitializeSecretsOptions = {}
): Promise<{
  success: boolean;
  provider: string;
  message: string;
  errors?: string[];
}> {
  const {
    loadEnv = true,
    verify = true,
    secretId = "",
    throwOnError = true,
  } = options;

  const errors: string[] = [];

  try {
    // Validate configuration
    const configErrors = validateSecretsConfig();
    if (configErrors.length > 0) {
      const message = `Secrets configuration errors: ${configErrors.join(", ")}`;
      if (throwOnError) throw new Error(message);
      errors.push(...configErrors);
      return {
        success: false,
        provider: getSecretsProvider(),
        message,
        errors,
      };
    }

    // Verify access if requested
    if (verify && secretId) {
      const metadata = await verifySecretAccess(secretId);
      if (!metadata.accessible) {
        const message = `Cannot access secret: ${secretId}. ${metadata.error || "Unknown error"}`;
        if (throwOnError) throw new Error(message);
        errors.push(message);
        return {
          success: false,
          provider: getSecretsProvider(),
          message,
          errors,
        };
      }
    }

    // Load secrets as environment variables if requested
    if (loadEnv && secretId) {
      await loadSecretsAsEnv(secretId);
    }

    return {
      success: true,
      provider: getSecretsProvider(),
      message: "Secrets initialized successfully",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to initialize secrets";

    if (throwOnError) {
      throw new Error(message);
    }

    return {
      success: false,
      provider: getSecretsProvider(),
      message,
      errors: [message],
    };
  }
}

/**
 * Get cached secret value
 */
export function getCachedSecret(key: string): unknown | null {
  const cached = secretsCache.get(key);

  if (!cached) {
    return null;
  }

  // Return cached value (TTL checked separately if needed)
  return cached.value;
}

/**
 * Set cached secret value
 */
export function setCachedSecret(key: string, value: unknown): void {
  secretsCache.set(key, {
    value,
    timestamp: Date.now(),
  });
}

/**
 * Clear secrets cache
 */
export function clearSecretsCache(): void {
  secretsCache.clear();
}

/**
 * Check if cached secret is stale
 */
export function isSecretStale(key: string, ttl: number): boolean {
  const cached = secretsCache.get(key);

  if (!cached) {
    return true;
  }

  const age = (Date.now() - cached.timestamp) / 1000;
  return age > ttl;
}

/**
 * Refresh secrets from provider
 */
export async function refreshSecrets(secretId: string): Promise<boolean> {
  try {
    await loadSecretsAsEnv(secretId);
    clearSecretsCache();
    return true;
  } catch (error) {
    console.error(
      "Error refreshing secrets:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return false;
  }
}

/**
 * Get initialization status
 */
export function getInitializationStatus(): {
  initialized: boolean;
  cacheSize: number;
  provider: string;
} {
  return {
    initialized: secretsCache.size > 0,
    cacheSize: secretsCache.size,
    provider: getSecretsProvider(),
  };
}

/**
 * Recommended usage in Next.js:
 *
 * 1. In app/layout.tsx (Server Component):
 *    import { initializeSecrets } from '@/lib/secrets/initializeSecrets';
 *
 *    export default async function RootLayout({
 *      children,
 *    }: {
 *      children: React.ReactNode;
 *    }) {
 *      // Initialize secrets on startup
 *      if (typeof window === 'undefined') {
 *        await initializeSecrets({
 *          loadEnv: true,
 *          verify: true,
 *          secretId: process.env.AWS_SECRET_ID || process.env.AZURE_SECRET_NAME,
 *          throwOnError: process.env.NODE_ENV === 'production',
 *        });
 *      }
 *
 *      return (
 *        <html>
 *          <body>{children}</body>
 *        </html>
 *      );
 *    }
 *
 * 2. Or use in a middleware or API handler for more control
 *
 * 3. Environment variables from secrets are now available:
 *    - process.env.DATABASE_URL
 *    - process.env.API_KEYS
 *    - process.env.JWT_SECRET
 *    - etc.
 */
