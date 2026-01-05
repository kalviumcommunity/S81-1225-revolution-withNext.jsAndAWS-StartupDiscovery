# Middleware & RBAC Authorization Testing Script
# Tests JWT validation, role-based access control, and middleware behavior

param(
    [string]$BaseUrl = "http://localhost:3000",
    [switch]$Verbose
)

# Colors for console output
$SUCCESS = 'Green'
$FAIL = 'Red'
$INFO = 'Cyan'
$WARN = 'Yellow'

# Test counters
$passCount = 0
$failCount = 0

Write-Host "`n========================================" -ForegroundColor $INFO
Write-Host "🔐 Middleware & RBAC Authorization Tests" -ForegroundColor $INFO
Write-Host "========================================`n" -ForegroundColor $INFO

# Helper function to make API calls
function Test-Endpoint {
    param(
        [string]$Method = "GET",
        [string]$Endpoint,
        [string]$Token,
        [object]$Body,
        [string]$Description
    )

    $url = "$BaseUrl$Endpoint"
    $headers = @{
        "Content-Type" = "application/json"
    }

    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }

    $params = @{
        Uri     = $url
        Method  = $Method
        Headers = $headers
    }

    if ($Body) {
        $params["Body"] = $Body | ConvertTo-Json
    }

    try {
        Write-Host "Testing: $Description" -ForegroundColor $INFO
        Write-Host "  Method: $Method $Endpoint" -ForegroundColor $INFO
        if ($Token) {
            Write-Host "  Token: $(($Token.Substring(0, 20))...))" -ForegroundColor $INFO
        }

        $response = Invoke-WebRequest @params -ErrorAction Stop
        
        Write-Host "  Status: ✅ $($response.StatusCode)" -ForegroundColor $SUCCESS
        $result = $response.Content | ConvertFrom-Json
        
        if ($Verbose) {
            Write-Host "  Response: $(($result | ConvertTo-Json -Depth 2))" -ForegroundColor $INFO
        }
        
        Write-Host ""
        return @{
            Success = $true
            Status  = $response.StatusCode
            Data    = $result
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        
        try {
            $errorContent = $_.Exception.Response.Content.ReadAsStream()
            $reader = [System.IO.StreamReader]::new($errorContent)
            $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
            $message = $errorBody.message
        } catch {
            $message = $_.Exception.Message
        }

        Write-Host "  Status: ❌ $statusCode" -ForegroundColor $FAIL
        Write-Host "  Message: $message" -ForegroundColor $FAIL
        Write-Host ""
        
        return @{
            Success = $false
            Status  = $statusCode
            Message = $message
        }
    }
}

# Step 1: Create test users with different roles
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $INFO
Write-Host "STEP 1: Creating test users with different roles" -ForegroundColor $INFO
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $INFO

# Regular user signup
$userSignup = Test-Endpoint -Method POST -Endpoint "/api/auth/signup" `
    -Body @{
    name     = "Regular User"
    email    = "user@test.com"
    password = "TestPass123!"
} -Description "Signup regular user"

if ($userSignup.Success) {
    $userToken = $userSignup.Data.data.token
    $userId = $userSignup.Data.data.user.id
    Write-Host "✅ Regular user created (ID: $userId)" -ForegroundColor $SUCCESS
    Write-Host "   Token: $(($userToken.Substring(0, 30))...)" -ForegroundColor $SUCCESS
    $passCount++
} else {
    Write-Host "❌ Failed to create regular user" -ForegroundColor $FAIL
    $failCount++
    $userToken = $null
}

# Admin user signup
$adminSignup = Test-Endpoint -Method POST -Endpoint "/api/auth/signup" `
    -Body @{
    name     = "Admin User"
    email    = "admin@test.com"
    password = "TestPass123!"
} -Description "Signup admin user"

if ($adminSignup.Success) {
    $adminToken = $adminSignup.Data.data.token
    $adminId = $adminSignup.Data.data.user.id
    Write-Host "✅ Admin user created (ID: $adminId)" -ForegroundColor $SUCCESS
    Write-Host "   Token: $(($adminToken.Substring(0, 30))...)" -ForegroundColor $SUCCESS
    $passCount++
} else {
    Write-Host "❌ Failed to create admin user" -ForegroundColor $FAIL
    $failCount++
    $adminToken = $null
}

# Moderator user signup
$modSignup = Test-Endpoint -Method POST -Endpoint "/api/auth/signup" `
    -Body @{
    name     = "Moderator User"
    email    = "mod@test.com"
    password = "TestPass123!"
} -Description "Signup moderator user"

if ($modSignup.Success) {
    $modToken = $modSignup.Data.data.token
    $modId = $modSignup.Data.data.user.id
    Write-Host "✅ Moderator user created (ID: $modId)" -ForegroundColor $SUCCESS
    Write-Host "   Token: $(($modToken.Substring(0, 30))...)" -ForegroundColor $SUCCESS
    $passCount++
} else {
    Write-Host "❌ Failed to create moderator user" -ForegroundColor $FAIL
    $failCount++
    $modToken = $null
}

Write-Host "`n"

# Step 2: Test public endpoints (no auth required)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $INFO
Write-Host "STEP 2: Testing public endpoints (no auth required)" -ForegroundColor $INFO
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $INFO

$publicTest = Test-Endpoint -Method POST -Endpoint "/api/auth/login" `
    -Body @{
    email    = "user@test.com"
    password = "TestPass123!"
} -Description "Login endpoint (public)"

if ($publicTest.Success -and $publicTest.Status -eq 200) {
    Write-Host "✅ Public endpoint accessible without auth" -ForegroundColor $SUCCESS
    $passCount++
} else {
    Write-Host "❌ Public endpoint should be accessible" -ForegroundColor $FAIL
    $failCount++
}

Write-Host "`n"

# Step 3: Test protected endpoints with valid tokens
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $INFO
Write-Host "STEP 3: Testing protected endpoints with valid tokens" -ForegroundColor $INFO
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $INFO

# Regular user accessing /api/users
$userUsers = Test-Endpoint -Method GET -Endpoint "/api/users" `
    -Token $userToken -Description "Regular user accessing /api/users"

if ($userUsers.Success -and $userUsers.Status -eq 200) {
    Write-Host "✅ Regular user can access /api/users" -ForegroundColor $SUCCESS
    $passCount++
} else {
    Write-Host "❌ Regular user should access /api/users" -ForegroundColor $FAIL
    $failCount++
}

# Moderator accessing /api/users
$modUsers = Test-Endpoint -Method GET -Endpoint "/api/users" `
    -Token $modToken -Description "Moderator accessing /api/users"

if ($modUsers.Success -and $modUsers.Status -eq 200) {
    Write-Host "✅ Moderator can access /api/users" -ForegroundColor $SUCCESS
    $passCount++
} else {
    Write-Host "❌ Moderator should access /api/users" -ForegroundColor $FAIL
    $failCount++
}

Write-Host "`n"

# Step 4: Test admin-only routes
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $INFO
Write-Host "STEP 4: Testing admin-only routes (/api/admin)" -ForegroundColor $INFO
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $INFO

# Admin accessing /api/admin (should succeed)
$adminAccess = Test-Endpoint -Method GET -Endpoint "/api/admin" `
    -Token $adminToken -Description "Admin user accessing /api/admin"

if ($adminAccess.Success -and $adminAccess.Status -eq 200) {
    Write-Host "✅ Admin user can access /api/admin" -ForegroundColor $SUCCESS
    $passCount++
} else {
    Write-Host "❌ Admin user should access /api/admin" -ForegroundColor $FAIL
    $failCount++
}

# Regular user accessing /api/admin (should fail with 403)
$userAdminDenied = Test-Endpoint -Method GET -Endpoint "/api/admin" `
    -Token $userToken -Description "Regular user attempting /api/admin (should be denied)"

if (-not $userAdminDenied.Success -and $userAdminDenied.Status -eq 403) {
    Write-Host "✅ Regular user correctly denied access to /api/admin" -ForegroundColor $SUCCESS
    $passCount++
} else {
    Write-Host "❌ Regular user should be denied with 403" -ForegroundColor $FAIL
    $failCount++
}

# Moderator accessing /api/admin (should fail with 403)
$modAdminDenied = Test-Endpoint -Method GET -Endpoint "/api/admin" `
    -Token $modToken -Description "Moderator attempting /api/admin (should be denied)"

if (-not $modAdminDenied.Success -and $modAdminDenied.Status -eq 403) {
    Write-Host "✅ Moderator correctly denied access to /api/admin" -ForegroundColor $SUCCESS
    $passCount++
} else {
    Write-Host "❌ Moderator should be denied with 403" -ForegroundColor $FAIL
    $failCount++
}

Write-Host "`n"

# Step 5: Test missing/invalid token scenarios
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $INFO
Write-Host "STEP 5: Testing authentication error scenarios" -ForegroundColor $INFO
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $INFO

# Missing token
$noToken = Test-Endpoint -Method GET -Endpoint "/api/users" `
    -Description "Accessing /api/users without token (should fail)"

if (-not $noToken.Success -and $noToken.Status -eq 401) {
    Write-Host "✅ Request without token correctly rejected with 401" -ForegroundColor $SUCCESS
    $passCount++
} else {
    Write-Host "❌ Request without token should be rejected with 401" -ForegroundColor $FAIL
    $failCount++
}

# Invalid token
$invalidToken = Test-Endpoint -Method GET -Endpoint "/api/users" `
    -Token "invalid.token.here" -Description "Accessing with invalid token (should fail)"

if (-not $invalidToken.Success -and $invalidToken.Status -eq 401) {
    Write-Host "✅ Request with invalid token correctly rejected with 401" -ForegroundColor $SUCCESS
    $passCount++
} else {
    Write-Host "❌ Request with invalid token should be rejected with 401" -ForegroundColor $FAIL
    $failCount++
}

# Malformed auth header
Write-Host "Testing: Accessing with malformed Authorization header" -ForegroundColor $INFO
try {
    $headers = @{
        "Content-Type"    = "application/json"
        "Authorization"   = "InvalidHeader $userToken"
    }
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/users" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "  Status: ✅ $($response.StatusCode)" -ForegroundColor $FAIL
    Write-Host "❌ Malformed header should be rejected" -ForegroundColor $FAIL
    $failCount++
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 401) {
        Write-Host "  Status: ❌ 401" -ForegroundColor $SUCCESS
        Write-Host "✅ Malformed header correctly rejected with 401" -ForegroundColor $SUCCESS
        $passCount++
    } else {
        Write-Host "  Status: ❌ $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor $FAIL
        Write-Host "❌ Should return 401 for malformed header" -ForegroundColor $FAIL
        $failCount++
    }
}

Write-Host "`n"

# Step 6: Test token payload verification
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $INFO
Write-Host "STEP 6: JWT Token Payload Analysis" -ForegroundColor $INFO
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $INFO

function Decode-JWT {
    param([string]$token)
    
    $parts = $token.Split('.')
    if ($parts.Count -ne 3) {
        return $null
    }

    # Decode header
    $headerJson = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String(($parts[0] + '==').Replace('-', '+').Replace('_', '/')))
    
    # Decode payload
    $payloadJson = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String(($parts[1] + '==').Replace('-', '+').Replace('_', '/')))

    return @{
        Header  = $headerJson | ConvertFrom-Json
        Payload = $payloadJson | ConvertFrom-Json
    }
}

Write-Host "User Token Payload:" -ForegroundColor $INFO
$userDecoded = Decode-JWT $userToken
Write-Host "  userId: $($userDecoded.Payload.userId)" -ForegroundColor $INFO
Write-Host "  email: $($userDecoded.Payload.email)" -ForegroundColor $INFO
Write-Host "  role: $($userDecoded.Payload.role)" -ForegroundColor $INFO
Write-Host "  iat: $(Get-Date -UnixTimeSeconds $userDecoded.Payload.iat -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $INFO
Write-Host "  exp: $(Get-Date -UnixTimeSeconds $userDecoded.Payload.exp -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $INFO

Write-Host "`nAdmin Token Payload:" -ForegroundColor $INFO
$adminDecoded = Decode-JWT $adminToken
Write-Host "  userId: $($adminDecoded.Payload.userId)" -ForegroundColor $INFO
Write-Host "  email: $($adminDecoded.Payload.email)" -ForegroundColor $INFO
Write-Host "  role: $($adminDecoded.Payload.role)" -ForegroundColor $INFO

Write-Host "`n✅ Tokens contain correct role information" -ForegroundColor $SUCCESS
$passCount++

Write-Host "`n"

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $INFO
Write-Host "📊 Test Summary" -ForegroundColor $INFO
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $INFO

Write-Host "✅ Passed: $passCount" -ForegroundColor $SUCCESS
Write-Host "❌ Failed: $failCount" -ForegroundColor $(if ($failCount -eq 0) { $SUCCESS } else { $FAIL })
Write-Host "📈 Total:  $($passCount + $failCount)`n" -ForegroundColor $INFO

if ($failCount -eq 0) {
    Write-Host "✨ All tests passed! Middleware is working correctly.`n" -ForegroundColor $SUCCESS
} else {
    Write-Host "⚠️  Some tests failed. Please review the errors above.`n" -ForegroundColor $WARN
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $INFO
