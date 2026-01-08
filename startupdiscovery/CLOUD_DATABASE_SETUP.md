# Cloud Database Configuration (RDS / Azure SQL)

## Overview

This guide covers provisioning and configuring a managed PostgreSQL database in the cloud, with secure connection setup from your Next.js application.

**Completion Date**: January 8, 2026  
**Status**: ✅ Implementation Guide & Code Ready

---

## Part 1: AWS RDS PostgreSQL Setup

### Step 1: Create RDS Instance

1. **Open AWS Console** → Go to RDS Dashboard
2. **Click "Create Database"**
3. **Configuration**:
   - Engine: PostgreSQL
   - Version: Latest stable (14+)
   - DB Instance Class: `db.t3.micro` (free tier eligible)
   - DB Instance Name: `nextjsdb-prod`
   - Admin Username: `dbadmin`
   - Password: Use strong password (min 8 chars, mix of cases, numbers, symbols)

4. **Storage**:
   - Type: General Purpose (gp3)
   - Allocated Storage: 20 GB (free tier)
   - Enable auto-scaling up to 50 GB

5. **Connectivity**:
   - VPC: Default VPC
   - DB Subnet Group: default
   - Publicly Accessible: **Yes** (for development/testing)
   - VPC Security Group: Create new (name: `rds-postgres-sg`)

6. **Backup**:
   - Backup Retention Period: **7 days** (minimum recommended)
   - Backup Window: 03:00-04:00 UTC
   - Copy Backups to Another Region: Optional (for production)

7. **Monitoring**:
   - Enable CloudWatch Logs: PostgreSQL logs
   - Enable Performance Insights: Yes (7-day free retention)

8. **Click "Create Database"** → Wait 5-10 minutes for deployment

### Step 2: Configure Security Group

1. **Go to EC2 Dashboard** → Security Groups
2. **Find** `rds-postgres-sg`
3. **Edit Inbound Rules**:
   - Type: PostgreSQL
   - Protocol: TCP
   - Port: 5432
   - Source: `Your-IP/32` (or `0.0.0.0/0` for development only)

4. **Save Rules**

### Step 3: Retrieve Connection Details

After database is created:

- **Endpoint**: Your database endpoint (e.g., `nextjsdb-prod.xxxxx.us-east-1.rds.amazonaws.com`)
- **Port**: 5432
- **Username**: dbadmin
- **Database Name**: postgres (default)

### Step 4: Test Connection with psql

```bash
# Install psql (if not already installed)
# macOS: brew install postgresql
# Windows: Download PostgreSQL installer
# Linux: apt-get install postgresql-client

# Connect to your RDS instance
psql -h nextjsdb-prod.xxxxx.us-east-1.rds.amazonaws.com -U dbadmin -d postgres

# When prompted, enter your password
# If connection succeeds, you'll see: postgres=>
# Type: SELECT NOW();
# Should return current timestamp
```

**Expected Output**:

```
psql (14.0)
SSL connection (protocol: TLSv1.2, cipher: ECDHE-RSA-AES256-GCM-SHA384, compression: off)
Type "help" for help.

postgres=> SELECT NOW();
              now
-------------------------------
 2026-01-08 14:32:45.123456+00
(1 row)
```

---

## Part 2: Azure Database for PostgreSQL Setup

### Step 1: Create Azure PostgreSQL Server

1. **Open Azure Portal** → Search "Database for PostgreSQL"
2. **Click "Create"** → Single Server
3. **Basic Information**:
   - Subscription: Your subscription
   - Resource Group: Create new (e.g., `nextjs-app-rg`)
   - Server Name: `nextjsdb-prod` (globally unique)
   - Region: Your closest region
   - PostgreSQL Version: 13 or higher

4. **Compute + Storage**:
   - Pricing Tier: Basic (cheapest)
   - vCore: 1 vCore
   - Storage: 5 GB (auto-scaling available)

5. **Administration Account**:
   - Admin Username: `dbadmin`
   - Password: Strong password

6. **Click "Review + Create"** → **Create** → Wait 5-10 minutes

### Step 2: Configure Firewall Rules

1. **Go to created Azure PostgreSQL server**
2. **Connection Security** tab
3. **Add Current Client IP**:
   - Click "Add current client IP"
   - Adds your IP automatically

4. **Add Firewall Rule for App Server**:
   - Rule Name: `allow-app-server`
   - Start IP: Your app server IP
   - End IP: Your app server IP
   - Click **Save**

### Step 3: Retrieve Connection String

Azure provides connection strings in multiple formats:

**Connection String (Application)**:

```
Server=nextjsdb-prod.postgres.database.azure.com;
Database=postgres;
Port=5432;
User Id=dbadmin@nextjsdb-prod;
Password=YourPassword;
SSL Mode=Require;
```

**For Next.js (use this format)**:

```
postgresql://dbadmin@nextjsdb-prod:YourPassword@nextjsdb-prod.postgres.database.azure.com:5432/postgres?sslmode=require
```

### Step 4: Test Connection

```bash
# Using psql
psql "postgresql://dbadmin@nextjsdb-prod:YourPassword@nextjsdb-prod.postgres.database.azure.com:5432/postgres?sslmode=require"

# Should see: postgres=>
# Type: SELECT NOW();
```

**Important Notes for Azure**:

- Username must be: `admin-username@server-name`
- Connection requires `sslmode=require`
- Free tier has limited storage (5 GB)

---

## Part 3: Connect from Next.js Application

### Step 1: Update .env.local

Create or update `.env.local`:

```bash
# Choose one based on your provider:

# AWS RDS
DATABASE_URL="postgresql://dbadmin:YourPassword@nextjsdb-prod.xxxxx.us-east-1.rds.amazonaws.com:5432/postgres"

# Azure PostgreSQL
DATABASE_URL="postgresql://dbadmin@nextjsdb-prod:YourPassword@nextjsdb-prod.postgres.database.azure.com:5432/postgres?sslmode=require"

# Prisma ORM specific
DATABASE_URL_DIRECT="postgresql://..."  # For direct connections
```

### Step 2: Update Prisma Configuration

The application already uses Prisma ORM. Update `prisma/.env` if needed:

```
DATABASE_URL="your-cloud-connection-string"
```

### Step 3: Run Migrations

After connecting to cloud database:

```bash
# Apply all pending migrations
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status
```

### Step 4: Generate Prisma Client

```bash
# Regenerate Prisma client for new database
npx prisma generate
```

---

## Part 4: Database Connection Module

### Create Cloud Database Utility

The application includes utilities for cloud database connection:

**Location**: `lib/cloudDatabase.ts`

**Features**:

- Connection pooling
- Retry logic with exponential backoff
- Connection timeout handling
- Health checks
- Error logging

**Usage in API Routes**:

```typescript
import { getConnection } from "@/lib/cloudDatabase";

export async function GET(req: Request) {
  try {
    const connection = await getConnection();
    const result = await connection.query("SELECT NOW()");
    return Response.json({ serverTime: result.rows[0] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Connection Pooling

Prisma automatically manages connection pooling:

```typescript
import prisma from "@/lib/prisma";

// Prisma handles connection pooling automatically
const users = await prisma.user.findMany();
```

---

## Part 5: Verification & Testing

### Test Endpoints Created

The application includes test endpoints in `app/api/cloud-db/`:

#### 1. Health Check

**Endpoint**: `GET /api/cloud-db/health`

```bash
curl https://yourdomain.com/api/cloud-db/health
```

**Expected Response**:

```json
{
  "status": "connected",
  "database": "PostgreSQL 14.2",
  "serverTime": "2026-01-08T14:32:45Z"
}
```

#### 2. Connection Test

**Endpoint**: `GET /api/cloud-db/test-connection`

Tests basic connectivity and returns system information.

#### 3. Performance Metrics

**Endpoint**: `GET /api/cloud-db/metrics`

Returns connection pool metrics and performance statistics.

### Test Script

Use PowerShell script to verify connectivity:

```powershell
# scripts/test-cloud-db.ps1
./test-cloud-db.ps1
```

---

## Part 6: Security Best Practices

### Network Security

#### AWS RDS:

- ✅ Enable VPC Security Groups
- ✅ Restrict inbound to specific IPs
- ✅ Use encryption at rest (enabled by default)
- ✅ Enable encryption in transit (SSL)
- ✅ Consider private subnet (no public access in production)

#### Azure PostgreSQL:

- ✅ Enable firewall rules
- ✅ Whitelist only required IPs
- ✅ Enforce SSL/TLS (required by default)
- ✅ Enable "Enforce SSL connection"
- ✅ Consider private endpoints (Azure Virtual Network)

### Application Security

**Environment Variables**:

```bash
# NEVER commit actual credentials
# Use .env.local (gitignored)
# For production, use:
# - AWS Secrets Manager (RDS)
# - Azure Key Vault (Azure SQL)
# - Environment variables on hosting platform
```

**Connection String Security**:

```typescript
// ✅ Correct: Use environment variables
const url = process.env.DATABASE_URL;

// ❌ Wrong: Hardcoded credentials
const url = "postgresql://user:pass@host:5432/db";
```

**Role-Based Access**:

```sql
-- Create limited database user for app
CREATE USER nextjs_app WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE "nextjsdb" TO nextjs_app;
GRANT USAGE ON SCHEMA public TO nextjs_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nextjs_app;
```

---

## Part 7: Backups & Recovery

### AWS RDS Backups

**Automated Backups**:

- Retention: 7 days (configured during creation)
- Frequency: Continuous with point-in-time recovery
- Location: AWS S3 (automatically)

**Manual Snapshot**:

```
RDS Dashboard → Databases → Select instance
→ Actions → Take snapshot → Name: backup-2026-01-08
```

**Restore from Snapshot**:

```
RDS Dashboard → Snapshots → Select snapshot
→ Actions → Restore DB Instance → New instance name
```

**Estimated Cost**: ~$0.023/GB-month for backup storage

### Azure PostgreSQL Backups

**Automated Backups**:

- Retention: 7 days (Basic), 35 days (General Purpose)
- Frequency: Daily + continuous transaction logs
- Location: Geo-redundant storage

**Manual Backup**:

```
Azure Portal → Server → Backups
→ Manual backup → "Yes" to create snapshot
```

**Restore**:

```
Azure Portal → Backups → Restore
→ Select point-in-time → Create new server
```

**Estimated Cost**: ~$0.005/GB-day for backup storage

---

## Part 8: Scaling & Performance

### Read Replicas

**AWS Read Replica**:

```
RDS Dashboard → Select instance
→ Instance Actions → Create read replica
→ New instance name: nextjsdb-read-replica
→ Region: Another region for disaster recovery
```

**Benefits**:

- Distribute read queries
- Enable disaster recovery
- Enable logical backups without primary impact

**Cost**: ~Same as primary database

**Azure Read Replica**:

```
Azure Portal → Replication tab
→ Create Replica → Different region
→ Name: nextjsdb-read-replica
```

### Scaling Storage

**AWS Auto-Scaling**:

- Enabled during creation
- Scales up to 50 GB automatically
- Scales up when storage > 90% utilized

**Azure Auto-Scaling**:

- Manual scaling via portal
- Or implement monitoring + alerts
- Resize compute/storage separately

### Query Optimization

**Enable Query Monitoring**:

```sql
-- Enable slow query logs
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- 1 second
SELECT pg_reload_conf();

-- Check slow queries
SELECT query, mean_time FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;
```

---

## Part 9: Cost Estimation

### AWS RDS (db.t3.micro)

| Component                              | Cost               |
| -------------------------------------- | ------------------ |
| Database instance (730 hrs/month)      | $8-10/month        |
| Storage (20 GB @ $0.23/GB)             | $4.60/month        |
| Data transfer (outbound)               | $0-5/month         |
| Backup storage (included in free tier) | Free (first 20 GB) |
| **Total Monthly**                      | **~$12-15/month**  |

**Production Estimate** (db.t3.small):

- Instance: $20-30/month
- Storage: $10-20/month
- Data transfer: $5-50/month
- Backups: $2-5/month
- **Total: $37-105/month**

### Azure PostgreSQL (Basic)

| Component                 | Cost              |
| ------------------------- | ----------------- |
| Compute (1 vCore)         | $15-20/month      |
| Storage (5 GB @ $0.10/GB) | $0.50/month       |
| Backup storage (35 days)  | $0.10-1/month     |
| **Total Monthly**         | **~$15-21/month** |

**Production Estimate** (General Purpose):

- Compute: $50-100/month
- Storage: $5-15/month
- Backups: $5-10/month
- **Total: $60-125/month**

---

## Part 10: Troubleshooting

### Connection Refused

**Error**: `Error: connect ECONNREFUSED`

**Solutions**:

1. Verify endpoint is correct
2. Check security group/firewall allows your IP
3. Verify database is running (not stopped)
4. Test with psql locally first

### SSL Connection Error

**Error**: `Error: The server does not support SSL connections`

**Solutions**:

1. Add `?sslmode=require` to connection string
2. Ensure certificate validation enabled
3. For Azure: SSL is mandatory

### Authentication Failed

**Error**: `Error: password authentication failed`

**Solutions**:

1. Verify username and password are correct
2. Check character encoding (special chars)
3. For Azure: Username must be `user@servername`
4. Reset password in cloud console

### Performance Issues

**Slow Queries**:

1. Enable slow query logs
2. Use EXPLAIN ANALYZE to profile queries
3. Add appropriate indexes
4. Consider read replicas for read-heavy workloads

---

## Part 11: Migration Path (Local to Cloud)

### Step 1: Backup Local Database

```bash
# Export local PostgreSQL database
pg_dump -U postgres -d nextjsdb > backup.sql
```

### Step 2: Create Cloud Database Schema

```bash
# Apply migrations to cloud database
DATABASE_URL="your-cloud-connection-string" \
npx prisma migrate deploy
```

### Step 3: Import Data (Optional)

```bash
# Connect to cloud database and import backup
psql -h cloud-endpoint -U admin -d postgres < backup.sql
```

### Step 4: Update Application

```bash
# Update .env.local with cloud connection string
DATABASE_URL="postgresql://user:pass@cloud-endpoint:5432/db"

# Test application
npm run dev
```

### Step 5: Verify Migration

- Test all API endpoints
- Verify data integrity
- Check query performance
- Monitor database metrics

---

## Part 12: Files Created/Modified

| File                                | Purpose                      | Type     |
| ----------------------------------- | ---------------------------- | -------- |
| `lib/cloudDatabase.ts`              | Cloud DB connection module   | Created  |
| `app/api/cloud-db/health/route.ts`  | Health check endpoint        | Created  |
| `app/api/cloud-db/test/route.ts`    | Connection test endpoint     | Created  |
| `app/api/cloud-db/metrics/route.ts` | Performance metrics endpoint | Created  |
| `scripts/test-cloud-db.ps1`         | Connection test script       | Created  |
| `.env.example`                      | Updated with cloud DB vars   | Modified |
| `CLOUD_DATABASE_SETUP.md`           | This documentation           | Created  |
| `README.md`                         | Cloud DB section added       | Modified |

---

## Part 13: Next Steps

- [ ] Create cloud database instance (AWS RDS or Azure)
- [ ] Configure network access and security groups
- [ ] Update `.env.local` with connection string
- [ ] Run `npx prisma migrate deploy`
- [ ] Test endpoints: `/api/cloud-db/health`
- [ ] Set up automated backups
- [ ] Configure monitoring and alerts
- [ ] Plan read replica for production
- [ ] Document actual connection details
- [ ] Set up CI/CD to automate migrations

---

## Resources

- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [Azure Database for PostgreSQL](https://docs.microsoft.com/en-us/azure/postgresql/)
- [Prisma Database Setup](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-createrole.html)
- [Database Best Practices](https://aws.amazon.com/rds/best-practices/)

---

## Summary

This implementation provides:
✅ Step-by-step guides for AWS RDS and Azure PostgreSQL
✅ Security best practices and network configuration
✅ Connection testing and verification tools
✅ Backup and disaster recovery strategies
✅ Cost estimation and scaling guidance
✅ Production-ready code and utilities
✅ Troubleshooting guide for common issues

You now have everything needed to provision and connect to a cloud database in production!
