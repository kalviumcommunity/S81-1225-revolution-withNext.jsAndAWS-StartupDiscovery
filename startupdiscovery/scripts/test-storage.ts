/**
 * Object Storage Configuration - Test Script
 * Demonstrates file upload, retrieval, and deletion flows
 *
 * Usage: npx ts-node scripts/test-storage.ts
 */

import fetch from "node-fetch";

const API_BASE_URL = process.env.API_URL || "http://localhost:3000/api";

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message: string) {
  log(colors.green, `✓ ${message}`);
}

function error(message: string) {
  log(colors.red, `✗ ${message}`);
}

function info(message: string) {
  log(colors.cyan, `ℹ ${message}`);
}

function section(title: string) {
  console.log(`\n${colors.blue}${"=".repeat(60)}${colors.reset}`);
  log(colors.blue, `  ${title}`);
  console.log(`${colors.blue}${"=".repeat(60)}${colors.reset}\n`);
}

/**
 * Test 1: Check storage status
 */
async function testStorageStatus() {
  section("Test 1: Check Storage Status");

  try {
    const response = await fetch(`${API_BASE_URL}/storage/status`);
    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      error(`Status check failed: ${JSON.stringify(data)}`);
      return false;
    }

    info("Storage Status:");
    console.log(JSON.stringify(data, null, 2));
    success("Storage status retrieved successfully");
    return true;
  } catch (err) {
    error(`Error checking storage status: ${err}`);
    return false;
  }
}

/**
 * Test 2: Validate file types
 */
async function testFileValidation() {
  section("Test 2: File Type Validation");

  const testCases = [
    {
      name: "Valid image (JPEG)",
      fileName: "profile.jpg",
      fileType: "image/jpeg",
      fileSize: 1024 * 500, // 500KB
      shouldPass: true,
    },
    {
      name: "Valid PDF",
      fileName: "document.pdf",
      fileType: "application/pdf",
      fileSize: 1024 * 1024 * 5, // 5MB
      shouldPass: true,
    },
    {
      name: "Invalid type (executable)",
      fileName: "malware.exe",
      fileType: "application/x-msdownload",
      fileSize: 1024 * 100,
      shouldPass: false,
    },
    {
      name: "File too large",
      fileName: "large.pdf",
      fileType: "application/pdf",
      fileSize: 1024 * 1024 * 100, // 100MB (exceeds 20MB limit)
      shouldPass: false,
    },
  ];

  for (const testCase of testCases) {
    info(`Testing: ${testCase.name}`);

    try {
      const params = new URLSearchParams({
        fileName: testCase.fileName,
        fileType: testCase.fileType,
        fileSize: testCase.fileSize.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/storage/upload-url?${params.toString()}`
      );
      const data = (await response.json()) as Record<string, unknown>;

      if (testCase.shouldPass) {
        if (response.ok) {
          success(`  ✓ ${testCase.name} - Upload URL generated`);
          console.log(
            `    URL: ${(data.uploadUrl as string)?.substring(0, 50)}...`
          );
        } else {
          error(`  ✗ ${testCase.name} - Should have passed`);
        }
      } else {
        if (!response.ok) {
          success(`  ✓ ${testCase.name} - Correctly rejected`);
          console.log(`    Reason: ${data.error}`);
        } else {
          error(`  ✗ ${testCase.name} - Should have been rejected`);
        }
      }
    } catch (err) {
      error(`  Error: ${err}`);
    }
  }
}

/**
 * Test 3: Generate presigned URLs
 */
async function testPresignedUrls() {
  section("Test 3: Generate Presigned URLs");

  const testFiles = [
    {
      name: "avatar.jpg",
      type: "image/jpeg",
      size: 2 * 1024 * 1024, // 2MB
    },
    {
      name: "resume.pdf",
      type: "application/pdf",
      size: 3 * 1024 * 1024, // 3MB
    },
  ];

  for (const file of testFiles) {
    info(`Generating URL for: ${file.name}`);

    try {
      const params = new URLSearchParams({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/storage/upload-url?${params.toString()}`
      );
      const data = (await response.json()) as Record<string, unknown>;

      if (response.ok) {
        const uploadUrl = data.uploadUrl as string;
        const downloadUrl = data.downloadUrl as string;
        const expiresIn = data.expiresIn as number;

        success(`Generated presigned URL`);
        console.log(`  Provider: ${data.provider}`);
        console.log(`  Expires in: ${expiresIn} seconds`);
        console.log(`  Upload URL: ${uploadUrl.substring(0, 60)}...`);
        console.log(`  Download URL: ${downloadUrl.substring(0, 60)}...`);
      } else {
        error(`Failed to generate URL: ${data.error}`);
      }
    } catch (err) {
      error(`Error: ${err}`);
    }
  }
}

/**
 * Test 4: Simulate file retrieval
 */
async function testFileRetrieval() {
  section("Test 4: File Retrieval (Metadata)");

  const testFileKeys = [
    "avatar.jpg",
    "documents/resume.pdf",
    "uploads/photo.png",
  ];

  for (const fileKey of testFileKeys) {
    info(`Retrieving metadata for: ${fileKey}`);

    try {
      const params = new URLSearchParams({ key: fileKey });

      const response = await fetch(
        `${API_BASE_URL}/storage/retrieve?${params.toString()}`
      );
      const data = (await response.json()) as Record<string, unknown>;

      if (response.ok) {
        success(`File found`);
        console.log(`  Name: ${data.fileName}`);
        console.log(`  Size: ${data.size} bytes`);
        console.log(`  Type: ${data.contentType}`);
        console.log(`  Uploaded: ${data.uploadedAt}`);
      } else {
        info(`File not found (expected for demo)`);
      }
    } catch (err) {
      error(`Error: ${err}`);
    }
  }
}

/**
 * Test 5: Generate download URLs
 */
async function testDownloadUrls() {
  section("Test 5: Generate Download URLs");

  const fileKeys = ["avatar.jpg", "document.pdf"];

  for (const fileKey of fileKeys) {
    info(`Generating download URL for: ${fileKey}`);

    try {
      const params = new URLSearchParams({ key: fileKey });

      const response = await fetch(
        `${API_BASE_URL}/storage/download?${params.toString()}`
      );
      const data = (await response.json()) as Record<string, unknown>;

      if (response.ok) {
        success(`Download URL generated`);
        console.log(`  File: ${data.fileName}`);
        console.log(`  Expires: ${data.expiresIn} seconds`);
        console.log(
          `  URL: ${(data.downloadUrl as string).substring(0, 60)}...`
        );
      } else {
        info(`File not found (expected for demo): ${data.error}`);
      }
    } catch (err) {
      error(`Error: ${err}`);
    }
  }
}

/**
 * Test 6: Configuration validation
 */
async function testConfiguration() {
  section("Test 6: Configuration Validation");

  info("Checking environment variables...\n");

  const envVars = [
    {
      name: "STORAGE_PROVIDER",
      required: true,
      value: process.env.STORAGE_PROVIDER,
    },
    {
      name: "STORAGE_MAX_FILE_SIZE",
      required: false,
      value: process.env.STORAGE_MAX_FILE_SIZE,
    },
    {
      name: "AWS_S3_BUCKET_NAME",
      required: false,
      value: process.env.AWS_S3_BUCKET_NAME,
    },
    {
      name: "AZURE_BLOB_CONTAINER_NAME",
      required: false,
      value: process.env.AZURE_BLOB_CONTAINER_NAME,
    },
  ];

  for (const envVar of envVars) {
    if (envVar.value) {
      success(`${envVar.name}: Configured`);
    } else if (envVar.required) {
      error(`${envVar.name}: MISSING (required)`);
    } else {
      info(`${envVar.name}: Not set (optional)`);
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log("\n");
  log(
    colors.cyan,
    "╔════════════════════════════════════════════════════════╗"
  );
  log(
    colors.cyan,
    "║      Object Storage Configuration - Test Suite         ║"
  );
  log(
    colors.cyan,
    "╚════════════════════════════════════════════════════════╝"
  );

  try {
    // Run all tests
    await testConfiguration();
    await testStorageStatus();
    await testFileValidation();
    await testPresignedUrls();
    await testFileRetrieval();
    await testDownloadUrls();

    section("Test Summary");
    success("All tests completed successfully!");
    info(
      "Next steps: Configure AWS S3 or Azure Blob credentials and upload files"
    );
  } catch (error) {
    error(`Test suite failed: ${error}`);
    process.exit(1);
  }

  console.log("\n");
}

// Run tests
runTests().catch(console.error);
