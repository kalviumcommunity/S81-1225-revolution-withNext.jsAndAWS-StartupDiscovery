# Test Zod Validation Script

Write-Host "🔍 Testing Zod Validation Implementation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Wait for server to be ready
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test 1: Valid User Creation
Write-Host "✅ Test 1: Valid User Creation" -ForegroundColor Green
Write-Host "POST /api/users with valid data" -ForegroundColor Gray
$validUser = @{
    name = "Alice Johnson"
    email = "alice@example.com"
    role = "user"
    age = 25
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/users" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer 1:admin"
            "Content-Type" = "application/json"
        } `
        -Body $validUser
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 2: Invalid User - Short Name
Write-Host "❌ Test 2: Invalid User - Name too short" -ForegroundColor Yellow
Write-Host "POST /api/users with name = 'A'" -ForegroundColor Gray
$invalidUser1 = @{
    name = "A"
    email = "test@example.com"
    role = "user"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/users" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer 1:admin"
            "Content-Type" = "application/json"
        } `
        -Body $invalidUser1
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 3
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Validation Error Response:" -ForegroundColor White
    $errorDetails | ConvertTo-Json -Depth 3
}

Write-Host ""
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 3: Invalid User - Bad Email
Write-Host "❌ Test 3: Invalid User - Bad email format" -ForegroundColor Yellow
Write-Host "POST /api/users with email = 'bademail'" -ForegroundColor Gray
$invalidUser2 = @{
    name = "Bob Smith"
    email = "bademail"
    role = "user"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/users" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer 1:admin"
            "Content-Type" = "application/json"
        } `
        -Body $invalidUser2
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 3
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Validation Error Response:" -ForegroundColor White
    $errorDetails | ConvertTo-Json -Depth 3
}

Write-Host ""
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 4: Invalid User - Age under 18
Write-Host "❌ Test 4: Invalid User - Age under 18" -ForegroundColor Yellow
Write-Host "POST /api/users with age = 15" -ForegroundColor Gray
$invalidUser3 = @{
    name = "Charlie Young"
    email = "charlie@example.com"
    role = "user"
    age = 15
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/users" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer 1:admin"
            "Content-Type" = "application/json"
        } `
        -Body $invalidUser3
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 3
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Validation Error Response:" -ForegroundColor White
    $errorDetails | ConvertTo-Json -Depth 3
}

Write-Host ""
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 5: Valid Task Creation
Write-Host "✅ Test 5: Valid Task Creation" -ForegroundColor Green
Write-Host "POST /api/tasks with valid data" -ForegroundColor Gray
$validTask = @{
    title = "Complete Zod Implementation"
    description = "Implement Zod validation for all API routes"
    status = "in-progress"
    priority = "high"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/tasks" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer 1:user"
            "Content-Type" = "application/json"
        } `
        -Body $validTask
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 6: Invalid Task - Title too short
Write-Host "❌ Test 6: Invalid Task - Title too short" -ForegroundColor Yellow
Write-Host "POST /api/tasks with title = 'AB'" -ForegroundColor Gray
$invalidTask = @{
    title = "AB"
    description = "This is a valid description that is long enough"
    status = "pending"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/tasks" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer 1:user"
            "Content-Type" = "application/json"
        } `
        -Body $invalidTask
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 3
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Validation Error Response:" -ForegroundColor White
    $errorDetails | ConvertTo-Json -Depth 3
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 Zod Validation Testing Complete!" -ForegroundColor Cyan
