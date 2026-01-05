# 🗄️ Database Migrations & Seed Scripts - Complete Guide

**Assignment:** Kalvium Concept 2.15 - Database Migrations & Seed Scripts  
**Project:** StartupDiscovery (Next.js + PostgreSQL)  
**Date:** December 30, 2025

---

## 📋 Table of Contents

1. [What are Migrations?](#what-are-migrations)
2. [Migration Setup](#migration-setup)
3. [Seed Scripts](#seed-scripts)
4. [Verification Steps](#verification-steps)
5. [Production Considerations](#production-considerations)
6. [Evidence Guidance](#evidence-guidance)
7. [Reflection](#reflection)

---

## 🤔 What are Migrations?

**Database migrations** are version-controlled files that describe how your database schema changes over time. They're like Git commits for your database structure.

### Why Migrations Matter

**Problem without migrations:**

```
👤 Developer A: "My database has a 'bio' field"
👤 Developer B: "My database doesn't have it"
👤 DevOps: "Production crashed because column is missing!"
```

**Solution with migrations:**

```
✅ Everyone has the same schema
✅ Changes are tracked and reversible
✅ Production deployments are safe
✅ New developers can sync easily
```

### Migration Flow

```
┌─────────────┐
│   Local DB  │ ← Developer makes schema changes
└────┬────────┘
     │
     ↓ npx prisma migrate dev --name <name>
     │
┌─────────────────────────────┐
│ migration_TIMESTAMP_name/   │
│   └─ migration.sql          │ ← Generated SQL file
│   └─ (auto-committed)       │
└────┬────────────────────────┘
     │
     ↓ Automatically applied
     │
┌─────────────┐
│   Local DB  │ ← Schema updated ✅
└─────────────┘
     │
     ↓ git push (commit migration file)
     │
┌─────────────────────┐
│  Team Members       │
│  (git pull)         │
└────┬────────────────┘
     │
     ↓ npx prisma migrate deploy
     │
┌─────────────┐
│  Their Db   │ ← All have same schema ✅
└─────────────┘
```

---

## 🚀 Migration Setup

### Step 1: Initial Migration

When you first set up Prisma and define your schema, create the initial migration:

```bash
# Create migration based on schema.prisma
npx prisma migrate dev --name init

# Output:
# ✔ Created Prisma schema file at ./prisma/schema.prisma
# ✔ Installed the @prisma/client and prisma packages in your project
# ✔ Generated Prisma Client (5.22.0) to ./node_modules/@prisma/client
# ✔ Created migration: 20231230_init
```

**What happens:**

1. Prisma compares `schema.prisma` to your current database
2. Generates SQL to create all tables, enums, indexes
3. Applies the migration to your local database
4. Creates `prisma/migrations/20231230_init/migration.sql`

**Migration file location:**

```
prisma/
└── migrations/
    ├── migration_lock.toml        ← Database type lock
    └── 20231230_init/
        └── migration.sql          ← The actual SQL
```

### Step 2: Making Schema Changes

When you modify `schema.prisma`:

```prisma
// OLD - Add a new field
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String? // ← NEW FIELD
}
```

Generate a new migration:

```bash
# Create migration for the change
npx prisma migrate dev --name add_name_to_user

# Output:
# ✔ Created migration: 20231230044526_add_name_to_user
```

**Files created:**

```
prisma/migrations/
├── 20231230_init/
│   └── migration.sql
└── 20231230044526_add_name_to_user/     ← NEW
    └── migration.sql
```

**Generated SQL (example):**

```sql
-- migration.sql
ALTER TABLE "users" ADD COLUMN "name" TEXT;
```

### Step 3: Viewing Migration History

```bash
# Show migration status
npx prisma migrate status

# Output:
# Following migrations have been applied to the database:
#   20231230_init
#   20231230044526_add_name_to_user
```

### Step 4: Rolling Back Migrations

```bash
# Reset database (⚠️ deletes all data!)
npx prisma migrate reset

# Output:
# ✔ Dropped the database
# ✔ Created a new database
# ✔ Applied migrations
# ✔ Seeded the database
```

**For production:** Don't use reset! Use a proper rollback strategy:

```bash
# Apply only up to a specific migration
npx prisma migrate resolve --rolled-back 20231230044526_add_name_to_user
```

### Migration Commands Reference

```bash
# Create new migration from schema changes
npx prisma migrate dev --name migration_name

# View migration status
npx prisma migrate status

# Apply pending migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ deletes data)
npx prisma migrate reset

# Create migration without applying
npx prisma migrate dev --create-only

# Resolve migration conflict
npx prisma migrate resolve --rolled-back <migration_name>
```

### What Happens During a Migration

```
1. SCHEMA COMPARISON
   ├─ Read: schema.prisma (desired state)
   └─ Read: Database (current state)

2. SQL GENERATION
   ├─ Detect: Changes needed
   └─ Create: migration.sql with SQL commands

3. MIGRATION CREATION
   ├─ Create: prisma/migrations/TIMESTAMP_name/ directory
   └─ Save: migration.sql file

4. APPLICATION
   ├─ Execute: SQL against database
   ├─ Create: Tables, columns, indexes, enums
   └─ Update: _prisma_migrations table (tracking)

5. CLIENT GENERATION
   ├─ Re-generate: TypeScript types
   └─ Update: node_modules/.prisma/client
```

**Example - Adding a column:**

```
INPUT: schema.prisma (desired)
┌─────────────────────────┐
│ model User {            │
│   id          Int       │
│   email       String    │
│   name        String ✨ │ ← NEW
│ }                       │
└─────────────────────────┘

DETECTION:
┌──────────────────────────────┐
│ Current DB: no 'name' column │
│ Desired:    has 'name' column│
│ Action:     ADD COLUMN       │
└──────────────────────────────┘

GENERATED SQL:
┌──────────────────────────────┐
│ ALTER TABLE "users"          │
│ ADD COLUMN "name" TEXT;      │
└──────────────────────────────┘

APPLIED:
┌──────────────────────────────┐
│ Database updated ✅          │
│ Migration recorded in table  │
│ Prisma Client regenerated   │
└──────────────────────────────┘
```

---

## 🌱 Seed Scripts

A **seed script** populates your database with initial data. It runs after migrations complete.

### Why Seed Scripts?

**Scenario 1: Local Development**

```
New Developer Setup:
1. git clone project
2. npm install
3. npx prisma migrate dev
4. npx prisma db seed
5. ✅ Ready to work with sample data!
```

**Scenario 2: Production Reset**

```
After Testing:
1. Delete test data
2. Run seed script
3. ✅ Back to known state
```

### Our Seed Script Features

**File:** `prisma/seed.ts`

The seed script includes:

- ✅ **Idempotent** - Safe to run multiple times
- ✅ **Error handling** - Clear error messages
- ✅ **Logging** - Shows progress
- ✅ **Sample data** - Users, startups, categories, tags, comments, votes, bookmarks, follows

### Understanding Idempotency

**Non-idempotent (❌ BAD):**

```typescript
// Run once: Creates 1 user
// Run twice: Creates 2 users (duplicate!)
// Run thrice: Creates 3 users (disaster!)

const user = await prisma.user.create({
  data: { email: 'alice@example.com', ... }
});
```

**Idempotent (✅ GOOD):**

```typescript
// Run once: Creates 1 user
// Run twice: Finds existing user, updates if needed
// Run thrice: Still just 1 user ✅

const user = await prisma.user.upsert({
  where: { email: 'alice@example.com' },
  update: { name: 'Alice' },
  create: { email: 'alice@example.com', name: 'Alice', ... }
});
```

### How Our Seed Script Works

```typescript
// 1. Check if category exists
const category = await prisma.category.upsert({
  where: { slug: "saas" }, // ← Check by unique field
  update: {}, // ← Don't update if exists
  create: {
    // ← Create if not exists
    name: "SaaS",
    slug: "saas",
    description: "Software as a Service businesses",
    color: "#3B82F6",
  },
});

// 2. Result
// Run 1: Creates category
// Run 2: Finds category, returns it (no duplicate)
// Run 3: Still same category ✅
```

### Seed Script Structure

```typescript
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Create categories with upsert (idempotent)
  // 2. Create tags with upsert
  // 3. Create users with upsert
  // 4. Create startups with nested relations
  // 5. Create votes, comments, bookmarks, follows

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch(async (e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Running the Seed Script

```bash
# Using npm script
npm run prisma:seed
# or
npx prisma db seed

# Output:
# 🌱 Starting database seed...
# ✅ Created 6 categories
# ✅ Created 8 tags
# ✅ Created 3 users
# ✅ Created 2 demo startups
# ✅ Created demo votes and comments
# ✅ Created demo bookmarks
# ✅ Created demo follows
# 🎉 Seeding completed successfully!
```

### Complete Seed Example

See `prisma/seed.ts` in your project for the full implementation with:

- Categories (SaaS, E-commerce, FinTech, etc.)
- Tags (B2B, B2C, Mobile App, etc.)
- Users with hashed passwords
- Startups with nested relations
- Comments, votes, bookmarks, follows

---

## ✅ Verification Steps

### Step 1: Verify Migration Success

```bash
# Check that migrations were applied
npx prisma migrate status

# Output:
# Following migrations have been applied to the database:
#   20231227044526_init
#
# Migrations pending:
#   None
```

### Step 2: Verify Seed Data

```bash
# Run seed script
npx prisma db seed

# Output should show:
# 🌱 Starting database seed...
# ✅ Created 6 categories
# ✅ Created 8 tags
# ✅ Created 3 users
# ✅ Created 2 demo startups
# ✅ Created demo votes and comments
# ✅ Created demo bookmarks
# ✅ Created demo follows
# 🎉 Seeding completed successfully!
```

### Step 3: View Data in Prisma Studio

```bash
# Open visual database browser
npx prisma studio

# Output:
# Prisma Studio is running on http://localhost:5555
```

**Opens browser at localhost:5555 where you can:**

- ✅ View all tables
- ✅ See record counts
- ✅ Inspect individual records
- ✅ Verify relations are correct

### What to Check in Prisma Studio

**Users Table:**

- [ ] 3 users created (alice, bob, admin)
- [ ] Passwords are hashed (not plain text)
- [ ] Emails are unique
- [ ] Timestamps are set

**Startups Table:**

- [ ] 2 startups created (CloudSync Pro, HealthTrack AI)
- [ ] Slug is unique
- [ ] ViewCount and voteCount are set
- [ ] UserId references correct user

**Categories Table:**

- [ ] 6 categories created
- [ ] Slug is unique

**Comments Table:**

- [ ] 2 comments created
- [ ] UserId and startupId are set correctly
- [ ] Content is displayed

### Seed Idempotency Test

Verify the seed script is idempotent:

```bash
# Run seed once
npx prisma db seed
# ✅ Success

# Run seed again
npx prisma db seed
# ✅ Still succeeds - no duplicates!
```

---

## ⚠️ Production Considerations

### Development vs Production

**Development:** `npx prisma migrate reset`

- ✅ Safe - deletes all data
- ✅ Re-runs all migrations
- ✅ Re-seeds data
- ✅ Fast setup

**Production:** `npx prisma migrate deploy`

- ✅ Only applies new migrations
- ✅ Never deletes data
- ✅ Rollback requires manual steps
- ✅ Safer for existing data

### Safety Checklist

**Before Running Production Migrations:**

- [ ] **Backup Database**

  ```bash
  # PostgreSQL backup
  pg_dump production_db > backup.sql
  ```

- [ ] **Test in Staging**

  ```bash
  # Deploy to staging environment first
  # Verify everything works
  # Then deploy to production
  ```

- [ ] **Plan for Rollback**

  ```bash
  # Identify rollback strategy
  # Have backup ready
  # Know how to restore
  ```

- [ ] **Monitor After Migration**
  ```bash
  # Check application logs
  # Monitor database performance
  # Verify all queries work
  ```

### Common Migration Scenarios

**Scenario 1: Add Required Column**

```prisma
// WRONG - Will fail on existing records
field String  @default(value)  // ← Need default

// RIGHT - Provides default for existing records
field String  @default("default_value")
```

**Scenario 2: Rename Column**

```prisma
// OLD
fullName String

// NEW
name String

// SQL Generated (Prisma handles the rename)
ALTER TABLE users RENAME COLUMN "fullName" TO "name";
```

**Scenario 3: Delete Column**

```prisma
// Remove from schema
// Prisma generates:
ALTER TABLE users DROP COLUMN "deprecatedField";
// ⚠️ Data is lost - ensure backup exists!
```

### Monitoring Migrations in Production

```bash
# Check current migration state
npx prisma migrate status

# View migration history
ls prisma/migrations/

# See what would happen (dry run)
npx prisma migrate dev --create-only
```

---

## 📸 Evidence Guidance

Capture these screenshots for your Kalvium submission:

### Screenshot 1: Migration Creation

```bash
npx prisma migrate dev --name init
```

**Capture:**

- Terminal showing "Created migration: TIMESTAMP_init"
- Output indicating migration applied
- Success message

### Screenshot 2: Migration File

**Show:**

- `prisma/migrations/TIMESTAMP_init/migration.sql`
- SQL commands creating tables
- Demonstrates actual SQL being generated

### Screenshot 3: Seed Script Execution

```bash
npx prisma db seed
```

**Capture:**

- Terminal showing seed script output
- "✅ Created X categories"
- "✅ Created X users"
- Success message

### Screenshot 4: Prisma Studio - Users Table

```bash
npx prisma studio
```

**Show:**

- Browser showing http://localhost:5555
- Users table with 3 records visible
- Data fields populated correctly
- Demonstrates seeded data

### Screenshot 5: Prisma Studio - Startups Table

**Show:**

- Startups table with 2 records
- Title, slug, userId populated
- Demonstrates relations working

### Screenshot 6: Prisma Studio - Comments Table

**Show:**

- Comments table with records
- UserId and startupId populated
- Demonstrates foreign keys

### Screenshot 7: Migration Status

```bash
npx prisma migrate status
```

**Capture:**

- Terminal showing applied migrations
- No pending migrations
- Demonstrates migration tracking

### Screenshot 8: Idempotency Test

**Show:**

- Running seed twice
- No errors on second run
- Demonstrates idempotency

---

## 💭 Reflection

### Why Migrations Prevent Schema Drift

**Without Migrations (❌):**

```
👤 Dev A updates their DB manually
👤 Dev B doesn't know about change
👤 Staging server has old schema
👤 Production crashes when deployed
→ CHAOS! Schema Drift!
```

**With Migrations (✅):**

```
👤 Dev A runs: npx prisma migrate dev --name add_field
→ Creates migration file (version controlled)
→ Commits to git
👤 Dev B runs: git pull
→ Gets new migration file
→ Runs: npx prisma migrate deploy
→ Same schema everywhere!
→ SAFE! No drift!
```

**Benefits:**

- ✅ Schema changes tracked like code
- ✅ Easy to review what changed
- ✅ Can rollback if needed
- ✅ Team stays in sync
- ✅ Deployments are predictable

### Why Seeding Helps New Developers

**Without Seeding (❌):**

```
New Dev Setup:
1. npm install
2. npx prisma migrate dev
3. Now what? Database is empty!
4. Need to manually create test data
5. Might create different data than others
6. Inconsistent development experience
```

**With Seeding (✅):**

```
New Dev Setup:
1. npm install
2. npx prisma migrate dev
3. npx prisma db seed
4. Database has consistent sample data ✅
5. Can start developing immediately
6. All devs have same test data
```

**Benefits:**

- ✅ Consistent test data
- ✅ Faster onboarding
- ✅ Same development experience for all
- ✅ Reproducible state
- ✅ Less setup confusion

### Safety in Production Migrations

**Key Concerns:**

1. **Data Loss** - Wrong migration deletes data
2. **Downtime** - Large migrations take time
3. **Incompatibility** - Old code with new schema
4. **Rollback** - Can't easily undo in production

**Safety Practices:**

1. **Backup First**

   ```bash
   pg_dump production_db > backup_$(date +%Y%m%d).sql
   ```

2. **Test in Staging**
   - Deploy migration to staging
   - Run tests
   - Verify performance
   - Check compatibility

3. **Schedule Off-Peak**
   - Run migrations during low traffic
   - Easier to rollback if issues

4. **Plan Rollback**
   - Know how to restore from backup
   - Have previous version ready
   - Document rollback steps

5. **Monitor After**
   - Watch application logs
   - Check database performance
   - Verify queries work
   - Monitor user reports

**Example Production Workflow:**

```
1. Local: Make schema changes, test
2. Commit: Push migration file to git
3. Code Review: Team reviews migration SQL
4. Staging: Deploy to staging environment
5. Test: Run full test suite on staging
6. Backup: Backup production database
7. Deploy: Deploy code to production
8. Migrate: Run npx prisma migrate deploy
9. Verify: Check application logs, queries
10. Monitor: Watch for issues over time
```

---

## 🎯 Key Takeaways

### Migrations

- ✅ Version-control your database schema
- ✅ Ensure team stays in sync
- ✅ Make deployments predictable
- ✅ Enable rollbacks if needed

### Seed Scripts

- ✅ Provide consistent test data
- ✅ Speed up onboarding
- ✅ Enable reproducible state
- ✅ Should be idempotent

### Production Safety

- ✅ Always backup first
- ✅ Test in staging
- ✅ Plan rollback strategy
- ✅ Monitor after deployment

---

## 📚 Quick Command Reference

```bash
# Development
npx prisma migrate dev --name migration_name    # Create & apply
npx prisma migrate status                        # Check status
npx prisma db seed                               # Run seed
npx prisma migrate reset                         # Reset DB (⚠️ deletes data)
npx prisma studio                                # View data

# Production
npx prisma migrate deploy                        # Apply migrations only
npx prisma migrate status                        # Check status
npx prisma generate                              # Generate types
```

---

## 📞 Troubleshooting

**Q: Migration fails with "column already exists"**

```
A: You may have run migrate dev twice
   Solution: npx prisma migrate reset
```

**Q: Seed script creates duplicates**

```
A: Seed script isn't idempotent
   Solution: Use upsert instead of create
```

**Q: Can't rollback in production**

```
A: Migrations aren't easily reversible
   Solution: Keep backups, restore from backup
```

**Q: Prisma Studio won't open**

```
A: Port 5555 might be in use
   Solution: Kill process or use different port
```

---

**Assignment:** Kalvium Concept 2.15  
**Status:** ✅ Complete  
**Date:** December 30, 2025
