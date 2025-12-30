# 🚀 Prisma Setup - Complete Installation Guide

## For Kalvium Assignment Submission

This guide walks you through setting up Prisma ORM from scratch.

---

## ✅ Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- VS Code or your preferred IDE

---

## 📦 Step-by-Step Installation

### 1️⃣ Install Dependencies

```bash
cd startupdiscovery

# Install Prisma packages
npm install prisma --save-dev
npm install @prisma/client

# Install other required packages if missing
npm install bcrypt
npm install --save-dev @types/bcrypt tsx
```

### 2️⃣ Initialize Prisma (Already Done)

```bash
# This creates prisma/schema.prisma and .env
npx prisma init --datasource-provider postgresql
```

✅ **Status:** Already completed in your project!

### 3️⃣ Configure Database Connection

Edit your `.env` file:

```env
# Local PostgreSQL example
DATABASE_URL="postgresql://postgres:password@localhost:5432/startupdiscovery?schema=public"

# Cloud PostgreSQL example (Supabase, Neon, Railway, etc.)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

**For Docker PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/startupdiscovery?schema=public"
```

### 4️⃣ Generate Prisma Client

```bash
npx prisma generate
```

This creates the type-safe Prisma Client based on your schema.

### 5️⃣ Run Database Migrations

```bash
# Create tables in your database
npx prisma migrate dev --name init

# You'll see output like:
# ✔ Generated Prisma Client
# ✔ Applied migration '20231230_init'
```

### 6️⃣ Seed Database (Optional)

```bash
# Populate database with demo data
npx prisma db seed

# Or directly:
npx tsx prisma/seed.ts
```

### 7️⃣ Test Your Setup

```bash
# Quick test
npx tsx scripts/quick-test.ts

# Full test suite
npx tsx scripts/test-db.ts

# Or using npm scripts (after installing)
npm run db:quick-test
npm run db:test
```

### 8️⃣ View Data in Browser

```bash
npx prisma studio
```

Opens at http://localhost:5555 - Visual database browser

---

## 🔍 Verify Installation

Run these commands to confirm everything works:

```bash
# 1. Check Prisma CLI
npx prisma --version

# 2. Check database connection
npx prisma db pull

# 3. Generate client
npx prisma generate

# 4. View schema
npx prisma format
```

---

## 📂 Files Created by This Setup

```
startupdiscovery/
├── prisma/
│   ├── schema.prisma          ✅ Already exists (complete schema)
│   ├── seed.ts                ✅ Already exists (demo data)
│   └── migrations/            ⬅️ Created by migrate dev
│       ├── migration_lock.toml
│       └── 20231230_init/
│           └── migration.sql
├── lib/
│   └── prisma.ts              ✅ Already exists (client singleton)
├── scripts/
│   ├── test-db.ts             ✅ Created (full test suite)
│   └── quick-test.ts          ✅ Created (quick verification)
├── .env                       ⬅️ Configure your DATABASE_URL here
├── PRISMA_SETUP_GUIDE.md      ✅ Created (full documentation)
├── PRISMA_QUICK_REFERENCE.md  ✅ Created (command cheat sheet)
└── DATABASE_SCHEMA_VISUAL.md  ✅ Created (ER diagram)
```

---

## 🎯 What Each File Does

### `prisma/schema.prisma`
- Defines database structure (tables, columns, relations)
- Source of truth for your data model
- Used to generate TypeScript types

### `lib/prisma.ts`
- Singleton Prisma Client instance
- Prevents "too many connections" in development
- Import this in your code: `import prisma from '@/lib/prisma'`

### `prisma/seed.ts`
- Populates database with demo data
- Useful for testing and development
- Creates users, startups, categories, tags, comments, etc.

### `scripts/test-db.ts`
- Comprehensive test suite
- Verifies database connection
- Shows complex query examples

### `scripts/quick-test.ts`
- Quick sanity check
- Confirms basic functionality
- Good for CI/CD pipelines

---

## 🛠️ Common Commands

```bash
# Development workflow
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open visual DB browser
npm run prisma:seed        # Seed database
npm run db:test            # Test database connection

# Database operations
npx prisma db push         # Push schema to DB (no migration)
npx prisma db pull         # Pull schema from DB
npx prisma migrate reset   # Reset DB (⚠️ deletes data)

# Production
npx prisma migrate deploy  # Apply migrations (production)
npx prisma generate        # Generate client (build step)
```

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Solution 1:** Check DATABASE_URL in `.env`
```bash
cat .env | grep DATABASE_URL
```

**Solution 2:** Ensure PostgreSQL is running
```bash
# Check if running
docker ps  # if using Docker
sudo systemctl status postgresql  # if on Linux

# Start if needed
docker-compose up -d  # Docker
sudo systemctl start postgresql  # Linux
```

**Solution 3:** Test connection manually
```bash
psql -h localhost -U postgres -d startupdiscovery
```

### Error: "Table does not exist"

```bash
# Run migrations to create tables
npx prisma migrate dev
```

### Error: "@prisma/client not found"

```bash
# Install missing packages
npm install @prisma/client
npx prisma generate
```

### Error: "Generated Prisma Client is outdated"

```bash
# Regenerate client
npx prisma generate
```

### Error: "Too many database connections"

✅ **Already solved!** Your `lib/prisma.ts` uses the singleton pattern.

---

## 📸 Evidence for Kalvium Submission

Capture these screenshots:

### 1. Schema File
```bash
# Show your schema.prisma
cat prisma/schema.prisma | head -50
```

### 2. Successful Migration
```bash
npx prisma migrate dev --name init
# Screenshot the terminal output
```

### 3. Prisma Studio
```bash
npx prisma studio
# Screenshot browser at localhost:5555 showing tables with data
```

### 4. Test Output
```bash
npx tsx scripts/test-db.ts
# Screenshot showing all tests passing
```

### 5. Sample Query
```bash
npx tsx scripts/quick-test.ts
# Screenshot showing data being fetched
```

### 6. VSCode IntelliSense
- Open any file that imports prisma
- Type `prisma.` and show autocomplete
- Demonstrates type safety

---

## 📚 Documentation Files

For your assignment submission, reference these files:

1. **PRISMA_SETUP_GUIDE.md** - Complete setup documentation
2. **PRISMA_QUICK_REFERENCE.md** - Command cheat sheet
3. **DATABASE_SCHEMA_VISUAL.md** - ER diagram and schema explanation
4. **This file** - Installation instructions

---

## ✨ Quick Start (TL;DR)

```bash
# 1. Install dependencies
npm install

# 2. Configure database
# Edit .env with your DATABASE_URL

# 3. Setup database
npx prisma migrate dev --name init
npx prisma db seed

# 4. Test
npx tsx scripts/quick-test.ts

# 5. View data
npx prisma studio
```

---

## 🎓 For Assignment Submission

Include in your submission:

✅ Screenshots of:
- Migration success
- Prisma Studio with data
- Test script output
- VSCode autocomplete

✅ Documentation:
- Link to PRISMA_SETUP_GUIDE.md
- Link to DATABASE_SCHEMA_VISUAL.md
- Link to your code using Prisma (API routes, etc.)

✅ Reflection (in PRISMA_SETUP_GUIDE.md):
- What you learned
- Benefits of Prisma
- Challenges faced
- Real-world applications

---

## 🚀 Next Steps

After setup is complete:

1. **Use Prisma in API Routes**
   ```typescript
   // app/api/startups/route.ts
   import prisma from '@/lib/prisma';
   
   export async function GET() {
     const startups = await prisma.startup.findMany();
     return Response.json(startups);
   }
   ```

2. **Add Authentication**
   - User signup/login with sessions
   - Password hashing with bcrypt

3. **Build Features**
   - Create/edit startups
   - Comment system
   - Voting functionality
   - User profiles

4. **Deploy to Production**
   - Set DATABASE_URL in production env
   - Run `npx prisma migrate deploy`
   - Ensure `npx prisma generate` runs on build

---

**Project:** StartupDiscovery  
**Assignment:** Kalvium Backend - Prisma ORM Integration  
**Date:** December 30, 2025

Good luck! 🎉
