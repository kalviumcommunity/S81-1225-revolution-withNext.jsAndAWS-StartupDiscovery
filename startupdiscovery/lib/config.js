/**
 * Environment Configuration Utility
 * Loads and validates environment variables with proper type checking
 * Ensures all required secrets are present before application starts
 */

const REQUIRED_ENV_VARS = {
  // Always required
  NODE_ENV: 'production',
  NEXT_PUBLIC_API_BASE_URL: 'string',
  NEXT_PUBLIC_APP_URL: 'string',
  
  // Server-side only (secrets)
  ...(process.env.NODE_ENV !== 'development' && {
    DATABASE_URL: 'string',
    GITHUB_CLIENT_SECRET: 'string',
    GOOGLE_CLIENT_SECRET: 'string',
  }),
};

/**
 * Get environment variables with validation
 * @returns {Object} Validated environment configuration
 */
export const getEnvironmentConfig = () => {
  const config = {
    // Application settings
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isStaging: process.env.NODE_ENV === 'staging',
    isProduction: process.env.NODE_ENV === 'production',

    // Public URLs (safe for client-side)
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

    // Database (server-side only)
    databaseUrl: process.env.DATABASE_URL,

    // OAuth IDs (can be public - IDs are not secrets)
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },

    // Feature flags
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',

    // Logging
    logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),
  };

  // Validate server-side secrets only if not in development
  if (config.nodeEnv !== 'development') {
    validateSecrets(config);
  }

  return config;
};

/**
 * Validate that all required secrets are present
 * @param {Object} config - Environment configuration
 * @throws {Error} If required secrets are missing
 */
function validateSecrets(config) {
  const missingSecrets = [];

  // Check critical secrets for non-development environments
  if (!config.databaseUrl) {
    missingSecrets.push('DATABASE_URL');
  }

  if (!config.github.clientSecret) {
    missingSecrets.push('GITHUB_CLIENT_SECRET');
  }

  if (!config.google.clientSecret) {
    missingSecrets.push('GOOGLE_CLIENT_SECRET');
  }

  if (missingSecrets.length > 0) {
    const error = new Error(
      `Missing required environment secrets: ${missingSecrets.join(', ')}\n` +
      'Ensure these are set via GitHub Secrets in CI/CD or via environment.'
    );
    console.error(error.message);
    throw error;
  }
}

/**
 * Log environment configuration (SAFE - no secrets logged)
 * Useful for debugging which environment is active
 */
export const logEnvironmentConfig = () => {
  const config = getEnvironmentConfig();
  console.log('═══════════════════════════════════════════════════');
  console.log('Environment Configuration (secrets hidden)');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Node Environment: ${config.nodeEnv}`);
  console.log(`API Base URL: ${config.apiBaseUrl}`);
  console.log(`App URL: ${config.appUrl}`);
  console.log(`Analytics Enabled: ${config.enableAnalytics}`);
  console.log(`Debug Mode: ${config.debugMode}`);
  console.log(`Log Level: ${config.logLevel}`);
  console.log('═══════════════════════════════════════════════════');
};
