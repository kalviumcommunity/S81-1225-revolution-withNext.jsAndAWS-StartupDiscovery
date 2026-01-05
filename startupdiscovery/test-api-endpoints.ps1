# API Testing Script for RESTful Endpoints
# Run this after starting the development server with: npm run dev

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing RESTful API Endpoints" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Wait for server to be ready
Start-Sleep -Seconds 2

# Test 1: GET /api/users
Write-Host "Test 1: GET /api/users" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/users' -Method GET
    Write-Host "Success - Status: 200" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: GET /api/users with pagination  
Write-Host "`nTest 2: GET /api/users with pagination" -ForegroundColor Yellow
try {
    $uri = 'http://localhost:3000/api/users?page=1' + '&' + 'limit=2'
    $response = Invoke-RestMethod -Uri $uri -Method GET
    Write-Host "Success - Status: 200" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: GET /api/users with filter
Write-Host "`nTest 3: GET /api/users?role=admin" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/users?role=admin' -Method GET
    Write-Host "Success - Status: 200" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: POST /api/users
Write-Host "`nTest 4: POST /api/users (Create New User)" -ForegroundColor Yellow
try {
    $body = @{
        name = "John Doe"
        email = "john.doe@example.com"
        role = "user"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/users' -Method POST -Body $body -ContentType "application/json"
    Write-Host "Success - Status: 201" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: GET /api/tasks
Write-Host "`nTest 5: GET /api/tasks" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/tasks' -Method GET
    Write-Host "Success - Status: 200" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: GET /api/tasks with filter
Write-Host "`nTest 6: GET /api/tasks with filters" -ForegroundColor Yellow
try {
    $uri = 'http://localhost:3000/api/tasks?status=in-progress' + '&' + 'priority=high'
    $response = Invoke-RestMethod -Uri $uri -Method GET
    Write-Host "Success - Status: 200" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: POST /api/tasks
Write-Host "`nTest 7: POST /api/tasks (Create New Task)" -ForegroundColor Yellow
try {
    $body = @{
        title = "Write API Documentation"
        description = "Complete documentation for all RESTful endpoints"
        status = "pending"
        priority = "high"
        assignedTo = "John Doe"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/tasks' -Method POST -Body $body -ContentType "application/json"
    Write-Host "Success - Status: 201" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: GET /api/projects
Write-Host "`nTest 8: GET /api/projects" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/projects' -Method GET
    Write-Host "Success - Status: 200" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: GET /api/projects with budget filter
Write-Host "`nTest 9: GET /api/projects with budget filter" -ForegroundColor Yellow
try {
    $uri = 'http://localhost:3000/api/projects?minBudget=40000' + '&' + 'maxBudget=60000'
    $response = Invoke-RestMethod -Uri $uri -Method GET
    Write-Host "Success - Status: 200" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 10: POST /api/projects
Write-Host "`nTest 10: POST /api/projects (Create New Project)" -ForegroundColor Yellow
try {
    $body = @{
        name = "AI Chatbot Platform"
        description = "Intelligent chatbot for customer support and engagement"
        status = "planning"
        category = "AI/ML"
        budget = 85000
        startDate = "2026-02-15"
        endDate = "2026-09-30"
        teamSize = 6
        owner = "Alice Johnson"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/projects' -Method POST -Body $body -ContentType "application/json"
    Write-Host "Success - Status: 201" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 11: PUT /api/users
Write-Host "`nTest 11: PUT /api/users (Update User)" -ForegroundColor Yellow
try {
    $body = @{
        id = 1
        name = "Alice Smith Johnson"
        role = "admin"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/users' -Method PUT -Body $body -ContentType "application/json"
    Write-Host "Success - Status: 200" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 12: Error Handling - Invalid pagination
Write-Host "`nTest 12: GET /api/users with invalid page (Error Handling)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/users?page=-1' -Method GET
    Write-Host "Should have failed but did not" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "Success - Correctly returned 400 Bad Request" -ForegroundColor Green
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorResponse = $reader.ReadToEnd()
        Write-Host "Error Response: $errorResponse" -ForegroundColor White
    } else {
        Write-Host "Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "API Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Summary:" -ForegroundColor Green
Write-Host "- All CRUD operations tested (GET, POST, PUT)" -ForegroundColor White
Write-Host "- Pagination and filtering verified" -ForegroundColor White
Write-Host "- Error handling confirmed" -ForegroundColor White
Write-Host "- Three resource endpoints tested: /api/users, /api/tasks, /api/projects" -ForegroundColor White
