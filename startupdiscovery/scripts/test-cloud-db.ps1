# Cloud Database Connection Test Script
# Tests connectivity and health of cloud PostgreSQL database
# Usage: ./scripts/test-cloud-db.ps1

param(
    [string]$Url = "http://localhost:3000",
    [string]$TestName = "all"
)

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Cloud Database Connection Test                             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host ""
Write-Host "Target URL: $Url" -ForegroundColor Yellow
Write-Host "Test Name: $TestName" -ForegroundColor Yellow
Write-Host ""

# Test 1: Health Check
function Test-HealthCheck {
    Write-Host "Test 1: Health Check" -ForegroundColor Green
    Write-Host "─────────────────────────────────────────────────────────────────"
    
    try {
        $response = Invoke-WebRequest -Uri "$Url/api/cloud-db/health" -Method Get -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "✓ Status: $($data.status)" -ForegroundColor Green
        Write-Host "  Database: $($data.database)"
        Write-Host "  Server Time: $($data.serverTime)"
        Write-Host "  Pool Size: $($data.poolSize)"
        Write-Host ""
        return $true
    }
    catch {
        Write-Host "✗ Health check failed" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Test 2: Connection Test
function Test-Connection {
    Write-Host "Test 2: Connection Test" -ForegroundColor Green
    Write-Host "─────────────────────────────────────────────────────────────────"
    
    try {
        $response = Invoke-WebRequest -Uri "$Url/api/cloud-db/test" -Method Get -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.success) {
            Write-Host "✓ Connection successful" -ForegroundColor Green
            Write-Host "  Message: $($data.message)"
            Write-Host "  Database Info:"
            Write-Host "    - Version: $($data.databaseInfo.version)"
            Write-Host "    - Current DB: $($data.databaseInfo.currentDatabase)"
            Write-Host "    - Current User: $($data.databaseInfo.currentUser)"
        }
        else {
            Write-Host "✗ Connection test failed" -ForegroundColor Red
            Write-Host "  Error: $($data.error)"
            Write-Host "  Message: $($data.message)"
        }
        Write-Host ""
        return $data.success
    }
    catch {
        Write-Host "✗ Connection test failed" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Test 3: Metrics
function Test-Metrics {
    Write-Host "Test 3: Performance Metrics" -ForegroundColor Green
    Write-Host "─────────────────────────────────────────────────────────────────"
    
    try {
        $response = Invoke-WebRequest -Uri "$Url/api/cloud-db/metrics" -Method Get -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "✓ Metrics retrieved" -ForegroundColor Green
        Write-Host "  Connection Pool:"
        Write-Host "    - Idle: $($data.pool.idle)"
        Write-Host "    - Total: $($data.pool.total)"
        Write-Host "    - Waiting: $($data.pool.waiting)"
        Write-Host "    - Utilization: $($data.pool.utilization)%"
        Write-Host "  Database:"
        Write-Host "    - Status: $($data.database.status)"
        Write-Host "    - Version: $($data.database.version)"
        Write-Host "  Recommendations:"
        foreach ($rec in $data.recommendations) {
            Write-Host "    • $rec"
        }
        Write-Host ""
        return $true
    }
    catch {
        Write-Host "✗ Metrics test failed" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Run tests
$results = @{}

if ($TestName -eq "all" -or $TestName -eq "health") {
    $results["Health Check"] = Test-HealthCheck
}

if ($TestName -eq "all" -or $TestName -eq "connection") {
    $results["Connection Test"] = Test-Connection
}

if ($TestName -eq "all" -or $TestName -eq "metrics") {
    $results["Metrics"] = Test-Metrics
}

# Summary
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Test Summary                                               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

foreach ($test in $results.GetEnumerator()) {
    if ($test.Value) {
        Write-Host "✓ $($test.Key): PASSED" -ForegroundColor Green
        $passed++
    }
    else {
        Write-Host "✗ $($test.Key): FAILED" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "Total: $($passed + $failed) | Passed: $passed | Failed: $failed" -ForegroundColor Yellow
Write-Host ""

if ($failed -eq 0) {
    Write-Host "All tests passed! ✓" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "Some tests failed. Check configuration and database connectivity." -ForegroundColor Red
    exit 1
}
