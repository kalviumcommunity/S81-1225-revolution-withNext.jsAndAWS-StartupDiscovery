# Test script for security vulnerability fixes

$BASE_URL = "http://localhost:3000/api"

Write-Host "=== Testing Security Fixes ===" -ForegroundColor Green

# Valid token from whitelist
$VALID_TOKEN = "1:admin"
# Forged token that should be rejected
$FORGED_TOKEN = "999:admin"
# Invalid token format
$INVALID_TOKEN = "invalid-token"

Write-Host "`n1. Test Valid Token (should succeed)" -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $VALID_TOKEN"
    "Content-Type"  = "application/json"
}
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/users" -Method GET -Headers $headers
    Write-Host "✓ Valid token accepted: Status $($response.StatusCode)"
}
catch {
    Write-Host "✗ Valid token rejected: $($_.Exception.Message)"
}

Write-Host "`n2. Test Forged Token (should fail)" -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $FORGED_TOKEN"
    "Content-Type"  = "application/json"
}
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/users" -Method GET -Headers $headers
    Write-Host "✗ Forged token accepted (SECURITY ISSUE): Status $($response.StatusCode)"
}
catch {
    Write-Host "✓ Forged token rejected: Status $($_.Exception.Response.StatusCode)"
}

Write-Host "`n3. Test Invalid Token Format (should fail)" -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $INVALID_TOKEN"
    "Content-Type"  = "application/json"
}
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/users" -Method GET -Headers $headers
    Write-Host "✗ Invalid token accepted (SECURITY ISSUE): Status $($response.StatusCode)"
}
catch {
    Write-Host "✓ Invalid token rejected: Status $($_.Exception.Response.StatusCode)"
}

Write-Host "`n4. Test User Creation Without Role Escalation" -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $VALID_TOKEN"
    "Content-Type"  = "application/json"
}
$body = @{
    name  = "Test User"
    email = "testuser@example.com"
    age   = 28
    role  = "admin"  # Attempting to assign admin role
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $body
    $content = $response.Content | ConvertFrom-Json
    
    if ($content.data.user.role -eq "user") {
        Write-Host "✓ Role escalation prevented - user created with default 'user' role"
    }
    else {
        Write-Host "✗ Role escalation possible - user created with role: $($content.data.user.role)"
    }
}
catch {
    $error_response = $_.Exception.Response.Content.ToString() | ConvertFrom-Json
    Write-Host "Response: $($error_response | ConvertTo-Json)"
}

Write-Host "`n5. Test Validation Error Sanitization" -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $VALID_TOKEN"
    "Content-Type"  = "application/json"
}
$body = @{
    name  = "Test"
    email = "invalid-email"  # Invalid email format
    age   = "not-a-number"   # Invalid age
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $body
}
catch {
    $error_response = $_.Exception.Response.Content.ToString() | ConvertFrom-Json
    
    if ($error_response.errors) {
        Write-Host "✓ Validation errors received (sanitized):"
        foreach ($error in $error_response.errors) {
            Write-Host "  - Field: $($error.field), Message: $($error.message)"
        }
        
        # Check if error paths are sanitized (should only show field name, not full path)
        $hasFullPath = $error_response.errors | Where-Object { $_.field -like "*.*" }
        if ($hasFullPath) {
            Write-Host "✗ Warning: Error paths not fully sanitized"
        }
        else {
            Write-Host "✓ Error paths properly sanitized (no nested structure exposed)"
        }
    }
}

Write-Host "`n=== Security Test Complete ===" -ForegroundColor Green
