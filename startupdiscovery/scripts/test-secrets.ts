/**
 * Test Script for Secrets Management
 * Verify AWS Secrets Manager and Azure Key Vault integration
 */

import {
  getSecret,
  getSecretValue,
  verifySecretAccess,
  getSecretMetadata,
  validateSecretsConfig,
  getSecretsConfig,
  getSecretsProvider,
} from "@/lib/secrets";

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
  error?: string;
}

const results: TestResult[] = [];

/**
 * Test 1: Verify Configuration
 */
async function testConfiguration(): Promise<void> {
  const testName = "Configuration Validation";

  try {
    const config = getSecretsConfig();
    const errors = validateSecretsConfig();

    const success = errors.length === 0;

    results.push({
      name: testName,
      success,
      message: success
        ? "Configuration is valid"
        : `Configuration errors: ${errors.join(", ")}`,
      details: {
        provider: config.provider,
        configured: config.configured,
        configDetails: config.details,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    results.push({
      name: testName,
      success: false,
      message: "Failed to validate configuration",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Test 2: Provider Detection
 */
async function testProviderDetection(): Promise<void> {
  const testName = "Provider Detection";

  try {
    const provider = getSecretsProvider();
    const isValid = ["aws", "azure"].includes(provider);

    results.push({
      name: testName,
      success: isValid,
      message: isValid ? `Provider detected: ${provider}` : "Invalid provider",
      details: { provider },
    });
  } catch (error) {
    results.push({
      name: testName,
      success: false,
      message: "Failed to detect provider",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Test 3: Secret Access Verification
 */
async function testSecretAccess(): Promise<void> {
  const testName = "Secret Access Verification";

  try {
    const secretId = process.env.AWS_SECRET_ID || process.env.AZURE_SECRET_NAME;

    if (!secretId) {
      results.push({
        name: testName,
        success: false,
        message: "No secret ID configured (AWS_SECRET_ID or AZURE_SECRET_NAME)",
      });
      return;
    }

    const metadata = await verifySecretAccess(secretId);

    results.push({
      name: testName,
      success: metadata.accessible,
      message: metadata.accessible
        ? `Successfully accessed secret: ${metadata.name}`
        : `Cannot access secret: ${metadata.error || "Unknown error"}`,
      details: {
        name: metadata.name,
        accessible: metadata.accessible,
        lastUpdated: metadata.lastUpdated,
        error: metadata.error,
      },
    });
  } catch (error) {
    results.push({
      name: testName,
      success: false,
      message: "Failed to verify secret access",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Test 4: Secret Retrieval
 */
async function testSecretRetrieval(): Promise<void> {
  const testName = "Secret Retrieval";

  try {
    const secretId = process.env.AWS_SECRET_ID || process.env.AZURE_SECRET_NAME;

    if (!secretId) {
      results.push({
        name: testName,
        success: false,
        message: "No secret ID configured",
      });
      return;
    }

    const secret = await getSecret(secretId);
    const isValid =
      typeof secret === "string" ||
      (typeof secret === "object" && secret !== null);

    results.push({
      name: testName,
      success: isValid,
      message: isValid
        ? "Successfully retrieved secret"
        : "Retrieved secret is invalid",
      details: {
        type: typeof secret,
        keys: typeof secret === "object" ? Object.keys(secret) : undefined,
        keysCount:
          typeof secret === "object" ? Object.keys(secret).length : undefined,
      },
    });
  } catch (error) {
    results.push({
      name: testName,
      success: false,
      message: "Failed to retrieve secret",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Test 5: Secret Value Extraction
 */
async function testSecretValueExtraction(): Promise<void> {
  const testName = "Secret Value Extraction";

  try {
    const secretId = process.env.AWS_SECRET_ID || process.env.AZURE_SECRET_NAME;

    if (!secretId) {
      results.push({
        name: testName,
        success: false,
        message: "No secret ID configured",
      });
      return;
    }

    // Try to extract a common secret key
    const testKeys = [
      "DATABASE_URL",
      "JWT_SECRET",
      "API_KEY",
      "ENCRYPTION_KEY",
    ];
    let success = false;
    let extractedKey = "";
    let value = "";

    for (const key of testKeys) {
      try {
        const val = await getSecretValue(secretId, key);
        if (val) {
          success = true;
          extractedKey = key;
          value = val.substring(0, 20) + "..."; // Redact sensitive data
          break;
        }
      } catch {
        // Try next key
      }
    }

    results.push({
      name: testName,
      success,
      message: success
        ? `Successfully extracted value for key: ${extractedKey}`
        : "Could not extract any secret values",
      details: {
        extractedKey: success ? extractedKey : undefined,
        valueSample: success ? value : undefined,
        testedKeys: testKeys,
      },
    });
  } catch (error) {
    results.push({
      name: testName,
      success: false,
      message: "Failed to extract secret value",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Test 6: Secret Metadata
 */
async function testSecretMetadata(): Promise<void> {
  const testName = "Secret Metadata Retrieval";

  try {
    const secretId = process.env.AWS_SECRET_ID || process.env.AZURE_SECRET_NAME;

    if (!secretId) {
      results.push({
        name: testName,
        success: false,
        message: "No secret ID configured",
      });
      return;
    }

    const metadata = await getSecretMetadata(secretId);

    results.push({
      name: testName,
      success: metadata.accessible,
      message: metadata.accessible
        ? "Successfully retrieved secret metadata"
        : `Cannot retrieve metadata: ${metadata.error || "Unknown error"}`,
      details: {
        name: metadata.name,
        accessible: metadata.accessible,
        lastUpdated: metadata.lastUpdated,
        enabled: metadata.enabled,
        error: metadata.error,
      },
    });
  } catch (error) {
    results.push({
      name: testName,
      success: false,
      message: "Failed to retrieve secret metadata",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Run all tests
 */
async function runAllTests(): Promise<void> {
  console.log("\n========================================");
  console.log("   Secrets Management Test Suite");
  console.log("========================================\n");

  await testConfiguration();
  await testProviderDetection();
  await testSecretAccess();
  await testSecretRetrieval();
  await testSecretValueExtraction();
  await testSecretMetadata();

  // Print results
  console.log("\n--- Test Results ---\n");

  let passedCount = 0;
  let failedCount = 0;

  results.forEach((result) => {
    const status = result.success ? "✓ PASS" : "✗ FAIL";
    console.log(`${status}: ${result.name}`);
    console.log(`  Message: ${result.message}`);

    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }

    if (result.details) {
      console.log(`  Details:`);
      Object.entries(result.details).forEach(([key, value]) => {
        if (value !== undefined) {
          console.log(`    ${key}: ${JSON.stringify(value)}`);
        }
      });
    }

    console.log();

    if (result.success) {
      passedCount++;
    } else {
      failedCount++;
    }
  });

  // Summary
  const totalCount = results.length;
  const passRate = Math.round((passedCount / totalCount) * 100);

  console.log("--- Summary ---\n");
  console.log(`Total Tests: ${totalCount}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Pass Rate: ${passRate}%`);

  console.log("\n========================================");

  // Exit with appropriate code
  process.exit(failedCount > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch((error) => {
  console.error("Test suite error:", error);
  process.exit(1);
});
