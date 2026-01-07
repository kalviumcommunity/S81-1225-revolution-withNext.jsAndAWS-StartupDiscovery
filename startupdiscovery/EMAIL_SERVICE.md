# Email Service Integration Guide - SendGrid

## Overview

This document provides a complete guide to the email service integration using SendGrid. The system enables transactional emails for user notifications, account verification, password resets, and other automated communications.

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Application                           │
└──────────────┬──────────────────────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌─────────────────┐  ┌──────────────────┐
│ lib/email.ts    │  │ app/api/email/*  │
│ Email utilities │  │ API endpoints    │
└────────┬────────┘  └────────┬─────────┘
         │                    │
         └────────┬───────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  SendGrid API   │
         │  (REST/SMTP)    │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │   User Inbox    │
         │   (Email)       │
         └─────────────────┘
```

### Email Flow

```
1. Application triggers email event
   └─> Account signup
   └─> Password reset request
   └─> Email verification
   └─> Startup featured notification
   └─> Custom notification

2. Email request sent to lib/email.ts
   └─> Validate parameters
   └─> Format email content
   └─> Add metadata

3. SendGrid processes email
   └─> Verify sender authentication
   └─> Check rate limits
   └─> Queue message
   └─> Send to recipient

4. Email delivered
   └─> Inbox delivery
   └─> Bounce handling
   └─> Open tracking (optional)
   └─> Click tracking (optional)
```

## Setup Instructions

### 1. Create SendGrid Account

1. Sign up at https://sendgrid.com (free tier available)
2. Verify your sender email or domain
3. Generate API key in Settings → API Keys
4. Add API key to environment variables

### 2. Configure Environment Variables

```bash
# .env.local
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_SENDER=no-reply@yourdomain.com
SENDGRID_SANDBOX_MODE=false  # true for testing without sending
```

### 3. Verify Sender Identity

**For development (single email):**

1. Go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Enter your email address
4. Click verification link in email
5. Set as default sender

**For production (domain):**

1. Go to Settings → Sender Authentication
2. Click "Authenticate Your Domain"
3. Add DNS records to your domain
4. Wait for verification (may take 24-48 hours)

### 4. Install Dependencies

```bash
npm install @sendgrid/mail
```

## API Endpoints

### 1. Send Custom Email

**Endpoint:** `POST /api/email`

**Request:**

```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Hello from Startup Discovery",
    "html": "<h1>Welcome</h1><p>Check out these startups...</p>",
    "text": "Welcome to Startup Discovery"
  }'
```

**Response:**

```json
{
  "success": true,
  "messageId": "010101abc123def456",
  "message": "Email sent successfully"
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Failed to send email",
  "error": "Invalid 'from' email address format"
}
```

### 2. Send Welcome Email (Template)

**Request:**

```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "newuser@example.com",
    "subject": "Welcome to Startup Discovery",
    "templateType": "welcome",
    "templateData": {
      "userName": "Alice Johnson"
    }
  }'
```

### 3. Send Email Verification

**Request:**

```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Verify Your Email",
    "templateType": "email_verification",
    "templateData": {
      "userName": "Alice",
      "verificationUrl": "https://app.startupdiscovery.com/verify?token=abc123"
    }
  }'
```

### 4. Send Password Reset

**Request:**

```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Reset Your Password",
    "templateType": "password_reset",
    "templateData": {
      "userName": "Alice",
      "resetUrl": "https://app.startupdiscovery.com/reset?token=xyz789"
    }
  }'
```

### 5. Send Startup Featured Notification

**Request:**

```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "founder@startup.com",
    "subject": "Your Startup is Featured!",
    "templateType": "startup_featured",
    "templateData": {
      "startupName": "TechCorp",
      "startupUrl": "https://app.startupdiscovery.com/startups/techcorp"
    }
  }'
```

## Email Templates

### 1. Welcome Template

**Purpose:** Greet new users and encourage exploration

**Includes:**

- Personalized greeting
- Welcome message with emoji
- List of key features
- Call-to-action button
- Support contact link

**Usage:**

```typescript
import { sendWelcomeEmail } from "@/lib/email";

await sendWelcomeEmail("user@example.com", "Alice");
```

### 2. Email Verification Template

**Purpose:** Request email confirmation for account security

**Includes:**

- Verification request message
- Verification link with expiry info (24 hours)
- Direct link copy-paste option
- Security note

**Usage:**

```typescript
import { sendEmailVerification } from "@/lib/email";

const verificationUrl = `https://app.startupdiscovery.com/verify?token=${token}`;
await sendEmailVerification("user@example.com", "Alice", verificationUrl);
```

### 3. Password Reset Template

**Purpose:** Allow users to securely reset passwords

**Includes:**

- Password reset request confirmation
- Reset link with expiry info (1 hour)
- Security warning for unauthorized requests
- Direct link copy-paste option

**Usage:**

```typescript
import { sendPasswordReset } from "@/lib/email";

const resetUrl = `https://app.startupdiscovery.com/reset?token=${token}`;
await sendPasswordReset("user@example.com", "Alice", resetUrl);
```

### 4. Startup Featured Template

**Purpose:** Celebrate startup milestones

**Includes:**

- Congratulations message with emoji
- Feature announcement
- Benefits explanation
- Link to featured startup

**Usage:**

```typescript
import { sendStartupFeatured } from "@/lib/email";

const startupUrl = `https://app.startupdiscovery.com/startups/techcorp`;
await sendStartupFeatured("founder@startup.com", "TechCorp", startupUrl);
```

## Implementation Guide

### 1. Basic Email Sending

```typescript
import { sendEmail } from "@/lib/email";

// Send simple email
const result = await sendEmail({
  to: "user@example.com",
  subject: "Welcome!",
  html: "<h1>Hello!</h1>",
  text: "Hello!",
});

if (result.success) {
  console.log(`Email sent with ID: ${result.messageId}`);
}
```

### 2. Template-Based Emails

```typescript
import { sendWelcomeEmail, sendPasswordReset } from "@/lib/email";

// Send welcome email
await sendWelcomeEmail("newuser@example.com", "Alice Johnson");

// Send password reset
await sendPasswordReset(
  "user@example.com",
  "Alice",
  "https://app.example.com/reset?token=xyz"
);
```

### 3. Batch Email Sending

```typescript
import { batchSendEmails } from "@/lib/email";

const recipients = [
  {
    email: "user1@example.com",
    subject: "Special Offer",
    html: "<h1>50% off!</h1>",
  },
  {
    email: "user2@example.com",
    subject: "Special Offer",
    html: "<h1>50% off!</h1>",
  },
];

const results = await batchSendEmails(recipients);
results.forEach((result) => {
  console.log(result.success ? "✓ Sent" : "✗ Failed");
});
```

### 4. Custom Email with Advanced Options

```typescript
import { sendEmail } from "@/lib/email";

const result = await sendEmail({
  to: ["user1@example.com", "user2@example.com"],
  cc: "manager@example.com",
  bcc: "admin@example.com",
  replyTo: "support@example.com",
  subject: "Project Update",
  html: "<h1>Update</h1>",
  text: "Update text version",
});
```

## Configuration

### Environment Variables

```bash
# SendGrid API Configuration
SENDGRID_API_KEY=your_api_key_here
SENDGRID_SENDER=no-reply@yourdomain.com
SENDGRID_SANDBOX_MODE=false
```

### Sandbox Mode

For testing without sending real emails:

```bash
SENDGRID_SANDBOX_MODE=true
```

In sandbox mode:

- Emails are validated but not delivered
- No charges incurred
- Perfect for development/testing
- Set to `false` in production

## Monitoring and Logging

### Message IDs

Every successful email includes a unique message ID:

```typescript
const result = await sendEmail({...});
if (result.success) {
  console.log(`Message ID: ${result.messageId}`);
  // Store in database for tracking
}
```

### Logs Structure

All email events are logged with:

- Timestamp
- Recipient count
- Message ID
- Subject
- Success/failure status
- Error details (if failed)

**Example log:**

```json
{
  "level": "info",
  "message": "Email sent successfully",
  "meta": {
    "to": 1,
    "subject": "Welcome!",
    "messageId": "010101abc123",
    "sandboxMode": false
  },
  "timestamp": "2024-01-08T10:30:00Z"
}
```

### Debugging

Enable detailed logging in development:

```typescript
// lib/email.ts
logger.info("Email payload", { to, subject, html });
logger.info("SendGrid response", response);
```

## Rate Limiting

### SendGrid Plans

| Plan       | Rate Limit | Monthly Limit |
| ---------- | ---------- | ------------- |
| Free       | 100/day    | 3,000/month   |
| Pro        | 500/day    | 15,000/month  |
| Enterprise | Custom     | Custom        |

### Best Practices

1. **Implement retry logic** for failed sends
2. **Queue emails** during peak usage
3. **Batch process** multiple recipients
4. **Monitor bounce rates** (optimal: < 0.5%)

## Bounce and Complaint Handling

### Bounce Types

**Hard Bounce:**

- Permanent delivery failure
- Invalid email address
- Domain doesn't exist
- Action: Remove from list

**Soft Bounce:**

- Temporary delivery failure
- Mailbox full
- Server temporarily down
- Action: Retry after 24 hours

### Configuration

Enable bounce notifications:

1. Go to Settings → Event Webhooks
2. Add webhook URL
3. Select bounce events
4. Process webhooks in your API

**Webhook payload:**

```json
{
  "event": "bounce",
  "email": "user@example.com",
  "bounce_type": "permanent",
  "timestamp": 1234567890
}
```

## Production Checklist

- [ ] Domain verified in SendGrid
- [ ] API key stored in environment variables
- [ ] Sender email configured
- [ ] Sandbox mode disabled
- [ ] Bounce handling configured
- [ ] Logging implemented
- [ ] Error handling implemented
- [ ] Rate limiting considered
- [ ] Templates tested
- [ ] Load testing completed

## Troubleshooting

### Issue: "Invalid 'from' email address"

**Solution:**

1. Verify sender email in SendGrid
2. Ensure email is in verified identities
3. Check environment variable spelling

### Issue: "Authentication failed"

**Solution:**

1. Verify API key is correct
2. Check API key hasn't expired
3. Regenerate API key if needed
4. Ensure SENDGRID_API_KEY variable is set

### Issue: "Rate limit exceeded"

**Solution:**

1. Check plan limits
2. Implement exponential backoff
3. Use queue for batch sending
4. Upgrade SendGrid plan

### Issue: "Email not received"

**Solution:**

1. Check spam/junk folder
2. Verify recipient email address
3. Check SendGrid logs for bounces
4. Test with sandbox mode disabled
5. Verify domain authentication

## Advanced Features

### 1. Custom Headers

```typescript
import sgMail from "@sendgrid/mail";

sgMail.send({
  // ... other fields
  headers: {
    "X-Custom-Header": "value",
    "X-User-ID": "12345",
  },
});
```

### 2. Scheduled Send

```typescript
const sendTime = Math.floor(new Date(futureDate).getTime() / 1000);

await sendEmail({
  // ... fields
  sendAt: sendTime,
});
```

### 3. Email Validation

```typescript
const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
if (!isValid) {
  throw new Error("Invalid email format");
}
```

## Cost Estimation

### SendGrid Pricing

- Free Plan: 100 emails/day (perfect for development)
- Pro Plan: Starts at $99.95/month for 100K emails
- Enterprise: Custom pricing

### Monthly Cost Examples

- 10K emails/month: $10-15 (Pro plan)
- 100K emails/month: $99.95-149 (Pro plan)
- 1M+ emails: Enterprise pricing

## Conclusion

The email service integration provides:

- ✅ Transactional email capability
- ✅ Pre-built professional templates
- ✅ Secure credential handling
- ✅ Comprehensive error handling
- ✅ Full audit logging
- ✅ Production-ready implementation

For questions or issues, refer to SendGrid documentation: https://docs.sendgrid.com
