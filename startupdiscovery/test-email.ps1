# PowerShell Test Script for Email Service API
# Tests all email endpoints and templates

# Configuration
$BaseURL = "http://localhost:3000"
$EmailAPI = "$BaseURL/api/email"

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

# Counters
$TestsPassed = 0
$TestsFailed = 0

# Function to print headers
function Write-Header {
    param([string]$Title)
    Write-Host "`n" -ForegroundColor $Cyan
    Write-Host "=" * 60 -ForegroundColor $Cyan
    Write-Host "  $Title" -ForegroundColor $Cyan
    Write-Host "=" * 60 -ForegroundColor $Cyan
}

# Function to print test result
function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Message = ""
    )
    
    if ($Success) {
        Write-Host "✓ $TestName" -ForegroundColor $Green
        $Script:TestsPassed++
    } else {
        Write-Host "✗ $TestName" -ForegroundColor $Red
        if ($Message) {
            Write-Host "  Error: $Message" -ForegroundColor $Red
        }
        $Script:TestsFailed++
    }
}

# Function to make API request
function Invoke-EmailAPI {
    param(
        [string]$TestName,
        [hashtable]$Payload
    )
    
    try {
        Write-Host "`nTest: $TestName" -ForegroundColor $Yellow
        Write-Host "Payload:" -ForegroundColor $Yellow
        $Payload | ConvertTo-Json | Write-Host
        
        $response = Invoke-RestMethod `
            -Uri $EmailAPI `
            -Method POST `
            -Headers @{"Content-Type" = "application/json"} `
            -Body ($Payload | ConvertTo-Json) `
            -ErrorAction Stop
        
        Write-Host "Response:" -ForegroundColor $Green
        $response | ConvertTo-Json | Write-Host
        
        if ($response.success -eq $true) {
            Write-TestResult $TestName $true
            return $response
        } else {
            Write-TestResult $TestName $false $response.message
            return $null
        }
    }
    catch {
        Write-TestResult $TestName $false $_.Exception.Message
        return $null
    }
}

# ==================================================
# Test Suite
# ==================================================

Write-Header "EMAIL SERVICE API TEST SUITE"

Write-Host "Base URL: $BaseURL" -ForegroundColor $Cyan
Write-Host "Testing endpoint: $EmailAPI`n" -ForegroundColor $Cyan

# Check if server is running
Write-Host "Checking if server is running..." -ForegroundColor $Yellow
try {
    $health = Invoke-RestMethod "$BaseURL/api/health" -ErrorAction SilentlyContinue
    Write-Host "✓ Server is running" -ForegroundColor $Green
} catch {
    Write-Host "⚠ Server may not be running at $BaseURL" -ForegroundColor $Yellow
    Write-Host "Start the server with: npm run dev`n" -ForegroundColor $Yellow
}

# ==================================================
# Test 1: Welcome Email
# ==================================================
Write-Header "TEST 1: WELCOME EMAIL"

$payload = @{
    to = "test-welcome@example.com"
    subject = "Welcome to Startup Discovery"
    templateType = "welcome"
    templateData = @{
        userName = "Alice Johnson"
    }
}

$result1 = Invoke-EmailAPI "Send Welcome Email" $payload

# ==================================================
# Test 2: Email Verification
# ==================================================
Write-Header "TEST 2: EMAIL VERIFICATION"

$payload = @{
    to = "test-verify@example.com"
    subject = "Verify Your Email Address"
    templateType = "email_verification"
    templateData = @{
        userName = "Bob Smith"
        verificationUrl = "https://app.startupdiscovery.com/verify?token=abc123def456"
    }
}

$result2 = Invoke-EmailAPI "Send Email Verification" $payload

# ==================================================
# Test 3: Password Reset
# ==================================================
Write-Header "TEST 3: PASSWORD RESET"

$payload = @{
    to = "test-reset@example.com"
    subject = "Reset Your Password"
    templateType = "password_reset"
    templateData = @{
        userName = "Carol White"
        resetUrl = "https://app.startupdiscovery.com/reset?token=xyz789abc123"
    }
}

$result3 = Invoke-EmailAPI "Send Password Reset" $payload

# ==================================================
# Test 4: Startup Featured
# ==================================================
Write-Header "TEST 4: STARTUP FEATURED NOTIFICATION"

$payload = @{
    to = "founder@techcorp.com"
    subject = "Your Startup is Featured!"
    templateType = "startup_featured"
    templateData = @{
        startupName = "TechCorp AI"
        startupUrl = "https://app.startupdiscovery.com/startups/techcorp-ai"
    }
}

$result4 = Invoke-EmailAPI "Send Startup Featured" $payload

# ==================================================
# Test 5: Custom HTML Email
# ==================================================
Write-Header "TEST 5: CUSTOM HTML EMAIL"

$payload = @{
    to = "test-custom@example.com"
    subject = "Custom Notification"
    html = @"
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Hello Test User!</h1>
        <p>This is a custom HTML email to test the API.</p>
        <p style="color: #666; font-size: 12px;">
          If you did not request this email, please ignore it.
        </p>
      </body>
    </html>
"@
    text = "Custom test email"
}

$result5 = Invoke-EmailAPI "Send Custom HTML Email" $payload

# ==================================================
# Test 6: Email with Multiple Recipients (CC/BCC)
# ==================================================
Write-Header "TEST 6: EMAIL WITH CC AND BCC"

$payload = @{
    to = "primary@example.com"
    cc = "cc-recipient@example.com"
    bcc = "bcc-recipient@example.com"
    replyTo = "support@startupdiscovery.com"
    subject = "Team Update"
    html = "<h1>Team Update</h1><p>Here's this week's update...</p>"
    text = "Team update text version"
}

$result6 = Invoke-EmailAPI "Send Email with CC/BCC" $payload

# ==================================================
# Test 7: Multiple Recipients
# ==================================================
Write-Header "TEST 7: MULTIPLE RECIPIENTS"

$payload = @{
    to = @("user1@example.com", "user2@example.com", "user3@example.com")
    subject = "Announcement"
    html = "<h1>Important Announcement</h1>"
    text = "Important announcement"
}

$result7 = Invoke-EmailAPI "Send to Multiple Recipients" $payload

# ==================================================
# Test 8: Error Handling - Missing Required Field
# ==================================================
Write-Header "TEST 8: ERROR HANDLING - MISSING FIELDS"

$payload = @{
    # Missing 'to' field
    subject = "Test Email"
    html = "Test content"
}

try {
    $response = Invoke-RestMethod `
        -Uri $EmailAPI `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body ($payload | ConvertTo-Json) `
        -ErrorAction Stop
    
    if ($response.success -eq $false) {
        Write-TestResult "Error handling for missing 'to'" $true
    } else {
        Write-TestResult "Error handling for missing 'to'" $false "Should have failed"
    }
} catch {
    # Expected to fail
    Write-TestResult "Error handling for missing 'to'" $true
}

# ==================================================
# Test 9: Error Handling - Invalid Email Format
# ==================================================
Write-Header "TEST 9: ERROR HANDLING - INVALID EMAIL"

$payload = @{
    to = "not-an-email"
    subject = "Test"
    html = "Test"
}

try {
    $response = Invoke-RestMethod `
        -Uri $EmailAPI `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body ($payload | ConvertTo-Json) `
        -ErrorAction Stop
    
    if ($response.success -eq $false) {
        Write-TestResult "Error handling for invalid email" $true
    } else {
        Write-TestResult "Error handling for invalid email" $false "Should have failed"
    }
} catch {
    Write-TestResult "Error handling for invalid email" $true
}

# ==================================================
# Test 10: CORS Preflight
# ==================================================
Write-Header "TEST 10: CORS PREFLIGHT"

try {
    $response = Invoke-WebRequest `
        -Uri $EmailAPI `
        -Method OPTIONS `
        -Headers @{
            "Origin" = "http://localhost:3001"
            "Access-Control-Request-Method" = "POST"
        } `
        -SkipHttpErrorCheck
    
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-TestResult "CORS preflight response" $true
        Write-Host "  CORS Header: $corsHeader" -ForegroundColor $Green
    } else {
        Write-TestResult "CORS preflight response" $false "No CORS header"
    }
} catch {
    Write-TestResult "CORS preflight response" $false $_.Exception.Message
}

# ==================================================
# Summary
# ==================================================
Write-Header "TEST SUMMARY"

$TotalTests = $TestsPassed + $TestsFailed
$SuccessRate = if ($TotalTests -gt 0) { 
    [math]::Round(($TestsPassed / $TotalTests) * 100, 2) 
} else { 
    0 
}

Write-Host "Total Tests:    $TotalTests" -ForegroundColor $Cyan
Write-Host "Passed:         $TestsPassed" -ForegroundColor $Green
Write-Host "Failed:         $TestsFailed" -ForegroundColor $(if ($TestsFailed -eq 0) { $Green } else { $Red })
Write-Host "Success Rate:   $SuccessRate%" -ForegroundColor $(if ($SuccessRate -ge 80) { $Green } else { $Yellow })

Write-Host "`n" -ForegroundColor $Cyan

# ==================================================
# Performance Testing (Optional)
# ==================================================
Write-Header "PERFORMANCE ANALYSIS"

Write-Host "Benchmarking email sending performance..." -ForegroundColor $Yellow

$iterations = 5
$times = @()

for ($i = 1; $i -le $iterations; $i++) {
    $payload = @{
        to = "perf-test-$i@example.com"
        subject = "Performance Test Email $i"
        html = "<p>This is performance test iteration $i</p>"
    }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        $response = Invoke-RestMethod `
            -Uri $EmailAPI `
            -Method POST `
            -Headers @{"Content-Type" = "application/json"} `
            -Body ($payload | ConvertTo-Json) `
            -ErrorAction SilentlyContinue
        
        $stopwatch.Stop()
        $times += $stopwatch.ElapsedMilliseconds
        
        Write-Host "  Iteration $i : $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor $Green
    } catch {
        $stopwatch.Stop()
        Write-Host "  Iteration $i : Failed" -ForegroundColor $Red
    }
}

if ($times.Count -gt 0) {
    $avgTime = [math]::Round(($times | Measure-Object -Average).Average, 2)
    $minTime = ($times | Measure-Object -Minimum).Minimum
    $maxTime = ($times | Measure-Object -Maximum).Maximum
    
    Write-Host "`nPerformance Metrics:" -ForegroundColor $Yellow
    Write-Host "  Average: $avgTime ms" -ForegroundColor $Cyan
    Write-Host "  Minimum: $minTime ms" -ForegroundColor $Cyan
    Write-Host "  Maximum: $maxTime ms" -ForegroundColor $Cyan
    Write-Host "  Target:  < 100ms (excellent)" -ForegroundColor $Cyan
}

# ==================================================
# Recommendations
# ==================================================
Write-Header "RECOMMENDATIONS"

@"
1. PRODUCTION SETUP
   - Verify sender email/domain in SendGrid
   - Set SENDGRID_SANDBOX_MODE=false
   - Configure bounce and complaint webhooks
   - Implement retry logic for failed sends

2. EMAIL TEMPLATES
   - Customize templates with brand colors
   - Add company logo and branding
   - Test email rendering across clients
   - Add unsubscribe link (required by law)

3. MONITORING
   - Track email delivery metrics
   - Monitor bounce rates (target: < 0.5%)
   - Set up alerts for high bounce rates
   - Log all email events with message IDs

4. RATE LIMITING
   - Implement queue for batch sends
   - Add rate limiting by user/IP
   - Monitor SendGrid rate limits
   - Scale SendGrid plan as needed

5. COMPLIANCE
   - Include company address in emails
   - Add unsubscribe mechanism
   - Comply with CAN-SPAM regulations
   - Maintain email list hygiene

"@ | Write-Host -ForegroundColor $Cyan

Write-Host "`nTests completed at: $(Get-Date)`n" -ForegroundColor $Cyan
