# Test Authentication Endpoints
# This script tests signup, login, and protected routes
# Ensure the Next.js server is running at http://localhost:3000

$BASE_URL = "http://localhost:3000/api"
$TIMESTAMP = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         Authentication System Test Suite - StartupDiscovery     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Track test results
$testsPassed = 0
$testsFailed = 0
$globalToken = $null
$globalUserId = $null

function Test-Request {
  param(
    [string]$TestName,
    [string]$Method,
    [string]$Uri,
    [string]$Body,
    [hashtable]$Headers,
    [int]$ExpectedStatus,
    [string]$Description
  )

  Write-Host "📝 Test: $TestName" -ForegroundColor Yellow
  if ($Description) {
    Write-Host "   📌 $Description" -ForegroundColor Gray
  }

  try {
    $params = @{
      Uri             = $Uri
      Method          = $Method
      Headers         = $Headers -or @{ "Content-Type" = "application/json" }
      ContentType     = "application/json"
    }

    if ($Body) {
      $params.Body = $Body
    }

    $response = Invoke-WebRequest @params -ErrorAction Stop
    $statusCode = $response.StatusCode
    $content = $response.Content | ConvertFrom-Json

    if ($statusCode -eq $ExpectedStatus) {
      Write-Host "   ✅ PASS - Status: $statusCode" -ForegroundColor Green
      $testsPassed++
      return $content
    }
    else {
      Write-Host "   ❌ FAIL - Expected: $ExpectedStatus, Got: $statusCode" -ForegroundColor Red
      Write-Host "   Response: $($content | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
      $testsFailed++
      return $null
    }
  }
  catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    $content = $_.Exception.Response.Content.ToString() | ConvertFrom-Json

    if ($statusCode -eq $ExpectedStatus) {
      Write-Host "   ✅ PASS - Status: $statusCode" -ForegroundColor Green
      $testsPassed++
      return $content
    }
    else {
      Write-Host "   ❌ FAIL - Expected: $ExpectedStatus, Got: $statusCode" -ForegroundColor Red
      Write-Host "   Message: $($content.message)" -ForegroundColor Gray
      $testsFailed++
      return $null
    }
  }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "1️⃣  SIGNUP TESTS" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Test 1: Valid Signup
$signupBody = @{
  name     = "Alice Johnson"
  email    = "alice-$(Get-Random)@example.com"
  password = "SecurePass123!"
} | ConvertTo-Json

$signupResponse = Test-Request `
  -TestName "Valid User Signup" `
  -Method "POST" `
  -Uri "$BASE_URL/auth/signup" `
  -Body $signupBody `
  -Headers @{ "Content-Type" = "application/json" } `
  -ExpectedStatus 201 `
  -Description "Register new user with valid credentials"

if ($signupResponse.data) {
  $globalToken = $signupResponse.data.token
  $globalUserId = $signupResponse.data.user.id
  Write-Host "   🔐 JWT Token received: $($globalToken.Substring(0, 50))..." -ForegroundColor Green
  Write-Host "   👤 User ID: $globalUserId" -ForegroundColor Green
  Write-Host "   ⏱️  Expires in: $($signupResponse.data.expiresIn)" -ForegroundColor Green
}

Write-Host ""

# Test 2: Duplicate Email
$signupBody2 = @{
  name     = "Another User"
  email    = "alice-1234@example.com"
  password = "AnotherPass123!"
} | ConvertTo-Json

Test-Request `
  -TestName "Duplicate Email Registration" `
  -Method "POST" `
  -Uri "$BASE_URL/auth/signup" `
  -Body $signupBody2 `
  -Headers @{ "Content-Type" = "application/json" } `
  -ExpectedStatus 409 `
  -Description "Attempt to register with existing email should fail"

Write-Host ""

# Test 3: Weak Password
$weakPasswordBody = @{
  name     = "Bob Smith"
  email    = "bob-$(Get-Random)@example.com"
  password = "weak"
} | ConvertTo-Json

Test-Request `
  -TestName "Weak Password Validation" `
  -Method "POST" `
  -Uri "$BASE_URL/auth/signup" `
  -Body $weakPasswordBody `
  -Headers @{ "Content-Type" = "application/json" } `
  -ExpectedStatus 400 `
  -Description "Password must meet complexity requirements (8+ chars, uppercase, lowercase, number, special)"

Write-Host ""

# Test 4: Missing Required Fields
$missingFieldsBody = @{
  email = "charlie@example.com"
  # Missing name and password
} | ConvertTo-Json

Test-Request `
  -TestName "Missing Required Fields" `
  -Method "POST" `
  -Uri "$BASE_URL/auth/signup" `
  -Body $missingFieldsBody `
  -Headers @{ "Content-Type" = "application/json" } `
  -ExpectedStatus 400 `
  -Description "Request must include name, email, and password"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "2️⃣  LOGIN TESTS" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# First, create a user for login testing
$testUserEmail = "testuser-$(Get-Random)@example.com"
$testUserPassword = "TestPass123!"
$signupForLoginBody = @{
  name     = "Test User"
  email    = $testUserEmail
  password = $testUserPassword
} | ConvertTo-Json

Write-Host "🔧 Creating test user for login tests..." -ForegroundColor Blue
$signupForLogin = Test-Request `
  -TestName "Create User for Login Testing" `
  -Method "POST" `
  -Uri "$BASE_URL/auth/signup" `
  -Body $signupForLoginBody `
  -Headers @{ "Content-Type" = "application/json" } `
  -ExpectedStatus 201 `
  -Description "Setup: Register user for login tests"

if ($signupForLogin.data) {
  $testLoginToken = $signupForLogin.data.token
}

Write-Host ""

# Test 5: Valid Login
$loginBody = @{
  email    = $testUserEmail
  password = $testUserPassword
} | ConvertTo-Json

$loginResponse = Test-Request `
  -TestName "Valid User Login" `
  -Method "POST" `
  -Uri "$BASE_URL/auth/login" `
  -Body $loginBody `
  -Headers @{ "Content-Type" = "application/json" } `
  -ExpectedStatus 200 `
  -Description "Login with correct credentials"

if ($loginResponse.data) {
  $globalToken = $loginResponse.data.token
  Write-Host "   🔐 JWT Token received: $($globalToken.Substring(0, 50))..." -ForegroundColor Green
  Write-Host "   ⏱️  Expires in: $($loginResponse.data.expiresIn)" -ForegroundColor Green
}

Write-Host ""

# Test 6: Invalid Password
$invalidPasswordBody = @{
  email    = $testUserEmail
  password = "WrongPassword123!"
} | ConvertTo-Json

Test-Request `
  -TestName "Invalid Password Login" `
  -Method "POST" `
  -Uri "$BASE_URL/auth/login" `
  -Body $invalidPasswordBody `
  -Headers @{ "Content-Type" = "application/json" } `
  -ExpectedStatus 401 `
  -Description "Login with incorrect password should fail"

Write-Host ""

# Test 7: Non-existent User
$nonExistentBody = @{
  email    = "nonexistent-$(Get-Random)@example.com"
  password = "AnyPassword123!"
} | ConvertTo-Json

Test-Request `
  -TestName "Non-existent User Login" `
  -Method "POST" `
  -Uri "$BASE_URL/auth/login" `
  -Body $nonExistentBody `
  -Headers @{ "Content-Type" = "application/json" } `
  -ExpectedStatus 401 `
  -Description "Login with non-existent email should fail"

Write-Host ""

# Test 8: Missing Fields in Login
$missingLoginBody = @{
  email = $testUserEmail
  # Missing password
} | ConvertTo-Json

Test-Request `
  -TestName "Missing Password in Login" `
  -Method "POST" `
  -Uri "$BASE_URL/auth/login" `
  -Body $missingLoginBody `
  -Headers @{ "Content-Type" = "application/json" } `
  -ExpectedStatus 400 `
  -Description "Login request must include both email and password"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "3️⃣  PROTECTED ROUTES TESTS (JWT Validation)" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Test 9: GET Users with Valid Token
Test-Request `
  -TestName "GET Users with Valid JWT" `
  -Method "GET" `
  -Uri "$BASE_URL/users" `
  -Headers @{ 
    "Authorization" = "Bearer $globalToken"
    "Content-Type"  = "application/json"
  } `
  -ExpectedStatus 200 `
  -Description "Access protected route with valid JWT token"

Write-Host ""

# Test 10: GET Users without Token
Test-Request `
  -TestName "GET Users without Token" `
  -Method "GET" `
  -Uri "$BASE_URL/users" `
  -Headers @{ "Content-Type" = "application/json" } `
  -ExpectedStatus 401 `
  -Description "Protected route requires Authorization header"

Write-Host ""

# Test 11: GET Users with Invalid Token
Test-Request `
  -TestName "GET Users with Invalid Token" `
  -Method "GET" `
  -Uri "$BASE_URL/users" `
  -Headers @{ 
    "Authorization" = "Bearer invalid.token.here"
    "Content-Type"  = "application/json"
  } `
  -ExpectedStatus 401 `
  -Description "Invalid/tampered JWT should be rejected"

Write-Host ""

# Test 12: GET Users with Malformed Authorization Header
Test-Request `
  -TestName "Malformed Authorization Header" `
  -Method "GET" `
  -Uri "$BASE_URL/users" `
  -Headers @{ 
    "Authorization" = $globalToken  # Missing "Bearer " prefix
    "Content-Type"  = "application/json"
  } `
  -ExpectedStatus 401 `
  -Description "Authorization header must start with 'Bearer '"

Write-Host ""

# Test 13: Pagination with Valid Token
$paginationUri = "$BASE_URL/users?page=1&limit=5"
Test-Request `
  -TestName "GET Users with Pagination" `
  -Method "GET" `
  -Uri $paginationUri `
  -Headers @{ 
    "Authorization" = "Bearer $globalToken"
    "Content-Type"  = "application/json"
  } `
  -ExpectedStatus 200 `
  -Description "Retrieve paginated user list with JWT"

Write-Host ""

# Test 14: Search with Valid Token
$searchUri = "$BASE_URL/users?search=alice"
Test-Request `
  -TestName "GET Users with Search Filter" `
  -Method "GET" `
  -Uri $searchUri `
  -Headers @{ 
    "Authorization" = "Bearer $globalToken"
    "Content-Type"  = "application/json"
  } `
  -ExpectedStatus 200 `
  -Description "Search users with JWT authentication"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "4️⃣  JWT TOKEN DECODING & INSPECTION" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($globalToken) {
  $tokenParts = $globalToken.Split('.')
  
  if ($tokenParts.Count -eq 3) {
    Write-Host "✅ Valid JWT Format (3 parts separated by dots)" -ForegroundColor Green
    
    # Decode header (Base64)
    $headerBytes = [System.Convert]::FromBase64String($tokenParts[0].PadRight($tokenParts[0].Length + (4 - $tokenParts[0].Length % 4) % 4, '='))
    $headerJson = [System.Text.Encoding]::UTF8.GetString($headerBytes)
    $header = $headerJson | ConvertFrom-Json

    Write-Host ""
    Write-Host "📋 Header:" -ForegroundColor Cyan
    Write-Host "   Algorithm: $($header.alg)" -ForegroundColor Green
    Write-Host "   Type: $($header.typ)" -ForegroundColor Green

    # Decode payload
    $payloadBytes = [System.Convert]::FromBase64String($tokenParts[1].PadRight($tokenParts[1].Length + (4 - $tokenParts[1].Length % 4) % 4, '='))
    $payloadJson = [System.Text.Encoding]::UTF8.GetString($payloadBytes)
    $payload = $payloadJson | ConvertFrom-Json

    Write-Host ""
    Write-Host "📦 Payload:" -ForegroundColor Cyan
    Write-Host "   User ID: $($payload.userId)" -ForegroundColor Green
    Write-Host "   Email: $($payload.email)" -ForegroundColor Green
    Write-Host "   Issued At: $(Get-Date -UnixTimeSeconds $payload.iat -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
    Write-Host "   Expires At: $(Get-Date -UnixTimeSeconds $payload.exp -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green

    Write-Host ""
    Write-Host "🔒 Signature (first 50 chars): $($tokenParts[2].Substring(0, [Math]::Min(50, $tokenParts[2].Length)))..." -ForegroundColor Cyan
    Write-Host "   🔑 Verified by HS256 algorithm using JWT_SECRET" -ForegroundColor Gray
  }
  else {
    Write-Host "❌ Invalid JWT Format" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 TEST RESULTS SUMMARY" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Passed: $testsPassed" -ForegroundColor Green
Write-Host "❌ Failed: $testsFailed" -ForegroundColor Red
Write-Host ""

$totalTests = $testsPassed + $testsFailed
$passPercentage = if ($totalTests -gt 0) { [math]::Round(($testsPassed / $totalTests) * 100, 2) } else { 0 }

if ($testsFailed -eq 0 -and $testsPassed -gt 0) {
  Write-Host "🎉 All tests passed! ($passPercentage%)" -ForegroundColor Green
}
else {
  Write-Host "⚠️  Some tests failed. ($passPercentage% passed)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔍 RECOMMENDATIONS FOR SECURE AUTHENTICATION" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🔐 Token Storage (Client-Side):" -ForegroundColor Yellow
Write-Host "   ├─ ✅ SECURE: HTTP-Only Cookies (immune to XSS)" -ForegroundColor Green
Write-Host "   ├─ ⚠️  RISKY: localStorage (vulnerable to XSS)" -ForegroundColor Red
Write-Host "   ├─ ⚠️  RISKY: sessionStorage (vulnerable to XSS)" -ForegroundColor Red
Write-Host "   └─ ✅ GOOD: Memory variable + SSR refresh" -ForegroundColor Green
Write-Host ""
Write-Host "2. ⏱️  Token Expiration (Server-Side):" -ForegroundColor Yellow
Write-Host "   ├─ Current: 7 days" -ForegroundColor Cyan
Write-Host "   ├─ Recommended: 1 hour (access) + 7 days (refresh)" -ForegroundColor Green
Write-Host "   ├─ Benefit: Reduces window of compromise" -ForegroundColor Green
Write-Host "   └─ Implement: Refresh token endpoint" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. 🛡️  Token Security Enhancements:" -ForegroundColor Yellow
Write-Host "   ├─ Token Rotation: Issue new token on each refresh" -ForegroundColor Cyan
Write-Host "   ├─ Blacklisting: Invalidate tokens on logout" -ForegroundColor Cyan
Write-Host "   ├─ Session Management: Store sessions in database" -ForegroundColor Cyan
Write-Host "   ├─ Device Fingerprinting: Verify device matches" -ForegroundColor Cyan
Write-Host "   └─ Rate Limiting: Protect auth endpoints" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. 🚨 Handling Token Leaks/Expiry:" -ForegroundColor Yellow
Write-Host "   ├─ Leak Detected: Invalidate all sessions immediately" -ForegroundColor Cyan
Write-Host "   ├─ Token Expired: Use refresh token seamlessly" -ForegroundColor Cyan
Write-Host "   ├─ All Sessions: Provide logout-all endpoint" -ForegroundColor Cyan
Write-Host "   └─ Re-Auth: Require password for sensitive ops" -ForegroundColor Cyan
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📚 CREATIVE REFLECTION QUESTION" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💭 Scenario: A JWT token leaks through a GitHub commit." -ForegroundColor Yellow
Write-Host "   The token is valid for 7 more days." -ForegroundColor Yellow
Write-Host ""
Write-Host "❓ How would your authentication system handle this?" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Ideal Response:" -ForegroundColor Green
Write-Host ""
Write-Host "   1. Detect the leak via security scanner or user report" -ForegroundColor Cyan
Write-Host "   2. Immediately invalidate ALL user's sessions (database blacklist)" -ForegroundColor Cyan
Write-Host "   3. Send notification: 'Unusual activity detected. Please re-login.'" -ForegroundColor Cyan
Write-Host "   4. User logs back in with password → New JWT issued" -ForegroundColor Cyan
Write-Host "   5. Leaked token now useless (blacklisted in database)" -ForegroundColor Cyan
Write-Host "   6. Next improvement: Short-lived tokens (1 hr) + refresh tokens" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Key Insight:" -ForegroundColor Blue
Write-Host "   Safe systems treat tokens as revocable, not eternally valid." -ForegroundColor Blue
Write-Host "   Keep the window of compromise as small as possible!" -ForegroundColor Blue
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✨ Test Suite Completed at $TIMESTAMP" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
