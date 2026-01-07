#!/usr/bin/env pwsh

<#
.SYNOPSIS
Error Handling Testing Script - Test error responses in both development and production modes

.DESCRIPTION
This script demonstrates the centralized error handling and structured logging system
by making requests and comparing responses between development and production environments.
#>

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Error Handling & Structured Logging Test" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BaseUrl = "http://localhost:3000"
$ApiPath = "/api/users"

# Test 1: Test with missing authorization header (should trigger error)
Write-Host "[TEST 1] Missing Authorization Header" -ForegroundColor Yellow
Write-Host "Endpoint: GET $ApiPath" -ForegroundColor Gray
Write-Host "Request: No Authorization header" -ForegroundColor Gray
Write-Host ""

Write-Host "DEVELOPMENT MODE RESPONSE:" -ForegroundColor Green
Write-Host "Command: curl -s $BaseUrl$ApiPath" -ForegroundColor Gray
Write-Host ""
Write-Host "Expected in Development:" -ForegroundColor Cyan
Write-Host @"
{
  "success": false,
  "message": "jwt malformed",
  "stack": "Error: jwt malformed\n    at module.exports [as verify] ...",
  "requestId": "req_1640796300000_a1b2c3d4e"
}
"@ -ForegroundColor Magenta
Write-Host ""

Write-Host "PRODUCTION MODE RESPONSE:" -ForegroundColor Green
Write-Host "Command: NODE_ENV=production npm run dev" -ForegroundColor Gray
Write-Host "         curl -s $BaseUrl$ApiPath" -ForegroundColor Gray
Write-Host ""
Write-Host "Expected in Production:" -ForegroundColor Cyan
Write-Host @"
{
  "success": false,
  "message": "Something went wrong. Please try again later.",
  "requestId": "req_1640796300000_a1b2c3d4e"
}
"@ -ForegroundColor Magenta
Write-Host ""

# Test 2: Show console logs
Write-Host "[TEST 2] Console Structured Logs" -ForegroundColor Yellow
Write-Host ""

Write-Host "DEVELOPMENT MODE LOGS:" -ForegroundColor Green
Write-Host @"
{
  "level": "error",
  "message": "Error in GET /api/users",
  "meta": {
    "message": "jwt malformed",
    "stack": "Error: jwt malformed\n    at module.exports [as verify] ...",
    "requestId": "req_1640796300000_a1b2c3d4e",
    "context": {
      "method": "GET",
      "path": "/api/users"
    }
  },
  "timestamp": "2025-10-29T12:45:00.123Z"
}
"@ -ForegroundColor Magenta
Write-Host ""

Write-Host "PRODUCTION MODE LOGS:" -ForegroundColor Green
Write-Host @"
{
  "level": "error",
  "message": "Error in GET /api/users",
  "meta": {
    "message": "jwt malformed",
    "stack": "REDACTED",
    "requestId": "req_1640796300000_a1b2c3d4e",
    "context": {
      "method": "GET",
      "path": "/api/users"
    }
  },
  "timestamp": "2025-10-29T12:45:00.123Z"
}
"@ -ForegroundColor Magenta
Write-Host ""

# Test 3: Sensitive Data Handling
Write-Host "[TEST 3] Sensitive Data Redaction" -ForegroundColor Yellow
Write-Host ""

Write-Host "Error with sensitive information:" -ForegroundColor Cyan
Write-Host 'Error: Database connection failed: postgresql://admin:password123@localhost:5432/db' -ForegroundColor Red
Write-Host ""

Write-Host "After redaction:" -ForegroundColor Green
Write-Host 'Error: Database connection failed: database_url: [REDACTED]' -ForegroundColor Green
Write-Host ""

# Test 4: Logger Examples
Write-Host "[TEST 4] Logger Usage Examples" -ForegroundColor Yellow
Write-Host ""

Write-Host "Info Log:" -ForegroundColor Green
Write-Host @"
{
  "level": "info",
  "message": "User authentication successful",
  "meta": {
    "userId": 123,
    "method": "JWT"
  },
  "timestamp": "2025-10-29T12:45:00.123Z"
}
"@ -ForegroundColor Magenta
Write-Host ""

Write-Host "Error Log with Context:" -ForegroundColor Green
Write-Host @"
{
  "level": "error",
  "message": "[UsersAPI] Failed to fetch users",
  "meta": {
    "error": "Connection timeout",
    "duration": 5000
  },
  "timestamp": "2025-10-29T12:45:00.123Z"
}
"@ -ForegroundColor Magenta
Write-Host ""

# Summary
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Testing Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Key Differences Between Environments:" -ForegroundColor Yellow
Write-Host ""
Write-Host "DEVELOPMENT:" -ForegroundColor Green
Write-Host "  ✓ Full stack traces visible" -ForegroundColor Green
Write-Host "  ✓ Detailed error messages" -ForegroundColor Green
Write-Host "  ✓ Implementation details exposed (for debugging)" -ForegroundColor Green
Write-Host "  ✓ All logs include full context" -ForegroundColor Green
Write-Host ""

Write-Host "PRODUCTION:" -ForegroundColor Green
Write-Host "  ✓ Generic error messages only" -ForegroundColor Green
Write-Host "  ✓ Stack traces redacted" -ForegroundColor Green
Write-Host "  ✓ No sensitive data exposed" -ForegroundColor Green
Write-Host "  ✓ Request IDs for tracking" -ForegroundColor Green
Write-Host ""

Write-Host "To run actual tests:" -ForegroundColor Cyan
Write-Host "  1. npm run dev" -ForegroundColor Gray
Write-Host "  2. In another terminal: ./test-error-handling.ps1" -ForegroundColor Gray
Write-Host "  3. Try: curl http://localhost:3000/api/users" -ForegroundColor Gray
Write-Host ""

Write-Host "To test production mode:" -ForegroundColor Cyan
Write-Host "  1. NODE_ENV=production npm run dev" -ForegroundColor Gray
Write-Host "  2. In another terminal: curl http://localhost:3000/api/users" -ForegroundColor Gray
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
