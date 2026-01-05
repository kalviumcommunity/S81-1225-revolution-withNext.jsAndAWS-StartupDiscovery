# 🗄️ Prisma ORM Setup Guide - StartupDiscovery

**Assignment:** Kalvium Backend Assignment - Prisma ORM Integration  
**Project:** StartupDiscovery (Next.js App Router)  
**Database:** PostgreSQL  
**Student:** [Your Name]

---

## 📋 Table of Contents

1. [What is Prisma ORM?](#what-is-prisma-orm)
2. [Installation & Initialization](#installation--initialization)
3. [Database Schema Definition](#database-schema-definition)
4. [Prisma Client Generation](#prisma-client-generation)
5. [Prisma Client Initialization](#prisma-client-initialization)
6. [Testing Database Connection](#testing-database-connection)
7. [Running Migrations](#running-migrations)
8. [Evidence & Screenshots](#evidence--screenshots)
9. [Reflection & Benefits](#reflection--benefits)

---

## 🤔 What is Prisma ORM?

**Prisma** is a next-generation Object-Relational Mapping (ORM) tool for Node.js and TypeScript applications. It provides a type-safe database client that makes database access easy and less error-prone.

### Why Use Prisma?

✅ **Type Safety** - Auto-generated TypeScript types prevent runtime errors  
✅ **Intuitive API** - Clean, readable queries instead of raw SQL  
✅ **Auto-completion** - IntelliSense support in your IDE  
✅ **Database Migrations** - Version-controlled schema changes  
✅ **Data Modeling** - Declarative schema definition  
✅ **Multi-database Support** - Works with PostgreSQL, MySQL, SQLite, SQL Server, MongoDB

### How Prisma Works

```
┌─────────────────┐
│  Prisma Schema  │  ← Define your data model
│  (schema.prisma)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Prisma Generate │  ← Generate type-safe client
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Prisma Client   │  ← Use in your application
│  (Type-safe!)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │  ← Your database
└─────────────────┘
```

---

## 🚀 Installation & Initialization

### Step 1: Install Prisma

Run these commands in your project directory (`startupdiscovery/`):

```bash
# Install Prisma CLI as a dev dependency
npm install prisma --save-dev

# Install Prisma Client for runtime use
npm install @prisma/client
```

**What gets installed:**

- `prisma` - CLI tool for migrations, introspection, and code generation
- `@prisma/client` - Runtime library for database queries

### Step 2: Initialize Prisma

```bash
# Initialize Prisma with PostgreSQL
npx prisma init --datasource-provider postgresql
```

**Files Created:**

1. **`prisma/schema.prisma`** - Your database schema definition file

   ```prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **`.env`** - Environment variables file (created if it doesn't exist)
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   ```

### Step 3: Configure Database Connection

Update your `.env` file with your PostgreSQL connection string:

```env
# Example for local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/startupdiscovery?schema=public"

# Example for cloud PostgreSQL (e.g., Supabase, Neon, Railway)
DATABASE_URL="postgresql://user:pass@db.host.com:5432/dbname"
```

---

## 📊 Database Schema Definition

The `schema.prisma` file defines your database structure using Prisma's declarative syntax.

### Complete Schema Overview

Our StartupDiscovery schema includes these core models:

```prisma
// User & Authentication
- User
- Session

// Startup Core
- Startup
- Category
- Tag
- StartupCategory (junction)
- StartupTag (junction)

// Engagement
- Comment
- Vote
- Bookmark
- Follow

// Collaboration
- TeamMember

// Assets
- Media
- Milestone

// System
- Notification
```

### Key Model Examples

#### 1️⃣ User Model

```prisma
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  name          String?
  bio           String?   @db.Text
  avatarUrl     String?
  role          UserRole  @default(USER)
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?

  // Relations (one-to-many)
  startups      Startup[]
  comments      Comment[]
  votes         Vote[]
  bookmarks     Bookmark[]

  // Self-referential many-to-many
  followers     Follow[]  @relation("UserFollowers")
  following     Follow[]  @relation("UserFollowing")

  sessions      Session[]
  notifications Notification[]

  // Performance indexes
  @@index([email])
  @@index([username])
  @@index([createdAt])
  @@map("users")
}

enum UserRole {
  USER
  ADMIN
  MODERATOR
}
```

**Key Features:**

- `@id @default(autoincrement())` - Auto-incrementing primary key
- `@unique` - Ensures email and username are unique
- `@default(now())` - Auto-sets timestamp on creation
- `@updatedAt` - Auto-updates on record modification
- `@@index` - Database indexes for faster queries
- `@@map("users")` - Custom table name in database

#### 2️⃣ Startup Model

```prisma
model Startup {
  id          Int            @id @default(autoincrement())
  title       String
  slug        String         @unique
  tagline     String
  description String         @db.Text
  logoUrl     String?
  websiteUrl  String?

  // Startup details
  stage       StartupStage   @default(IDEA)
  industry    String
  fundingGoal Decimal?       @db.Decimal(12, 2)
  location    String?

  // Metrics
  viewCount   Int            @default(0)
  voteCount   Int            @default(0)

  // Status
  status      StartupStatus  @default(DRAFT)
  featured    Boolean        @default(false)

  // Timestamps
  publishedAt DateTime?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  // Foreign key
  userId      Int

  // Relations
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  categories  StartupCategory[]
  tags        StartupTag[]
  comments    Comment[]
  votes       Vote[]
  bookmarks   Bookmark[]
  team        TeamMember[]
  media       Media[]
  milestones  Milestone[]

  // Indexes for common queries
  @@index([userId])
  @@index([slug])
  @@index([status])
  @@index([publishedAt])
  @@index([createdAt])
  @@index([featured])
  @@index([industry])
  @@map("startups")
}

enum StartupStage {
  IDEA
  MVP
  BETA
  LAUNCHED
  GROWTH
  SCALING
}

enum StartupStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  REJECTED
}
```

#### 3️⃣ Category & Tag Models (Many-to-Many)

```prisma
model Category {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  slug        String   @unique
  description String?
  iconUrl     String?
  color       String?
  createdAt   DateTime @default(now())

  startups StartupCategory[]

  @@index([slug])
  @@map("categories")
}

// Junction table for Startup-Category many-to-many
model StartupCategory {
  id         Int      @id @default(autoincrement())
  startupId  Int
  categoryId Int
  createdAt  DateTime @default(now())

  startup  Startup  @relation(fields: [startupId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@unique([startupId, categoryId])  // Prevent duplicate associations
  @@index([startupId])
  @@index([categoryId])
  @@map("startup_categories")
}

model Tag {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  slug      String   @unique
  useCount  Int      @default(0)
  createdAt DateTime @default(now())

  startups StartupTag[]

  @@index([slug])
  @@index([useCount])
  @@map("tags")
}
```

#### 4️⃣ Comment Model (with Nested Replies)

```prisma
model Comment {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Foreign keys
  userId    Int
  startupId Int
  parentId  Int?  // For nested replies

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  startup   Startup  @relation(fields: [startupId], references: [id], onDelete: Cascade)

  // Self-referential relation for replies
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies   Comment[] @relation("CommentReplies")

  @@index([userId])
  @@index([startupId])
  @@index([parentId])
  @@index([createdAt])
  @@map("comments")
}
```

#### 5️⃣ Vote Model (Composite Unique Constraint)

```prisma
model Vote {
  id        Int      @id @default(autoincrement())
  value     Int      // 1 for upvote, -1 for downvote
  createdAt DateTime @default(now())

  userId    Int
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  startupId Int
  startup   Startup @relation(fields: [startupId], references: [id], onDelete: Cascade)

  // A user can only vote once per startup
  @@unique([userId, startupId])
  @@index([userId])
  @@index([startupId])
  @@map("votes")
}
```

### 📐 Schema Design Principles

✅ **Primary Keys** - All models use `@id @default(autoincrement())`  
✅ **Foreign Keys** - Explicit relations with referential integrity  
✅ **Cascade Deletes** - `onDelete: Cascade` maintains data consistency  
✅ **Indexes** - Strategic indexes on frequently queried fields  
✅ **Unique Constraints** - Prevent duplicate data  
✅ **Timestamps** - Track creation and modification  
✅ **Enums** - Type-safe status values  
✅ **Junction Tables** - Proper many-to-many relationships

---

## ⚡ Prisma Client Generation

After defining your schema, generate the Prisma Client:

```bash
npx prisma generate
```

**What This Does:**

1. Reads your `schema.prisma` file
2. Generates TypeScript types for all models
3. Creates a type-safe database client
4. Stores generated code in `node_modules/.prisma/client`

**Generated Output Example:**

```
✔ Generated Prisma Client (5.22.0) to ./node_modules/@prisma/client

You can now start using Prisma Client:

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

**When to Run:**

- After changing `schema.prisma`
- After pulling new schema changes from git
- During build/deployment processes

**Tip:** Add to your `package.json`:

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "postinstall": "prisma generate"
  }
}
```

---

## 🔧 Prisma Client Initialization

Create a singleton Prisma Client instance to avoid connection issues in development.

### File: `lib/prisma.ts`

```typescript
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
```

### Why This Pattern?

**Problem:** Next.js hot-reloading creates multiple Prisma Client instances, exhausting database connections.

**Solution:** Store the client on `globalThis` in development:

- ✅ Survives hot-reloads
- ✅ Reuses existing connections
- ✅ Prevents "too many connections" errors

**Logging Configuration:**

- **Development:** Logs queries, errors, warnings (helpful for debugging)
- **Production:** Only logs errors (better performance)

### Usage in Your Code

```typescript
// In API routes or server components
import prisma from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany();
  return Response.json(users);
}
```

---

## 🧪 Testing Database Connection

Let's verify everything works with a test script.

### Create: `scripts/test-db.ts`

```typescript
import prisma from "../lib/prisma";

async function testDatabaseConnection() {
  console.log("🔍 Testing database connection...\n");

  try {
    // Test 1: Check connection
    await prisma.$connect();
    console.log("✅ Successfully connected to database\n");

    // Test 2: Count records
    const userCount = await prisma.user.count();
    const startupCount = await prisma.startup.count();
    const categoryCount = await prisma.category.count();

    console.log("📊 Database Statistics:");
    console.log(`   Users: ${userCount}`);
    console.log(`   Startups: ${startupCount}`);
    console.log(`   Categories: ${categoryCount}\n`);

    // Test 3: Fetch sample data
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    console.log("👥 Sample Users:");
    users.forEach((user) => {
      console.log(`   • ${user.username} (${user.email}) - ID: ${user.id}`);
    });

    // Test 4: Complex query with relations
    const startupsWithRelations = await prisma.startup.findMany({
      take: 2,
      include: {
        user: {
          select: {
            username: true,
            name: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    console.log("\n🚀 Sample Startups:");
    startupsWithRelations.forEach((startup) => {
      console.log(`   • ${startup.title}`);
      console.log(`     By: ${startup.user.name || startup.user.username}`);
      console.log(
        `     Comments: ${startup._count.comments}, Votes: ${startup._count.votes}`
      );
    });

    console.log("\n✅ All database tests passed!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Disconnected from database");
  }
}

testDatabaseConnection();
```

### Run the Test

```bash
# Using tsx (recommended)
npx tsx scripts/test-db.ts

# Or using ts-node
npx ts-node scripts/test-db.ts
```

### Expected Output

```
🔍 Testing database connection...

✅ Successfully connected to database

📊 Database Statistics:
   Users: 3
   Startups: 5
   Categories: 6

👥 Sample Users:
   • alice_tech (alice@example.com) - ID: 1
   • bob_founder (bob@example.com) - ID: 2
   • admin (admin@startupdiscovery.com) - ID: 3

🚀 Sample Startups:
   • CloudSync Pro
     By: Alice Johnson
     Comments: 2, Votes: 84
   • HealthTrack AI
     By: Bob Smith
     Comments: 1, Votes: 42

✅ All database tests passed!

🔌 Disconnected from database
```

---

## 🔄 Running Migrations

Migrations version-control your database schema changes.

### Create & Apply Migration

```bash
# Create a new migration based on schema changes
npx prisma migrate dev --name init

# What this does:
# 1. Compares schema.prisma to current database
# 2. Generates SQL migration file
# 3. Applies migration to database
# 4. Regenerates Prisma Client
```

### Migration Files

Created in `prisma/migrations/TIMESTAMP_init/migration.sql`:

```sql
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "bio" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
```

### Useful Migration Commands

```bash
# View migration status
npx prisma migrate status

# Apply pending migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Create migration without applying
npx prisma migrate dev --create-only
```

### Seeding Database

Populate your database with initial data:

```bash
# Run seed script
npx prisma db seed

# Or directly with tsx
npx tsx prisma/seed.ts
```

**Package.json configuration:**

```json
{
  "prisma": {
    "seed": "node --import tsx/esm prisma/seed.ts"
  }
}
```

---

## 📸 Evidence & Screenshots

### For Kalvium Submission

Capture these screenshots:

#### 1. Schema File

- Screenshot of `schema.prisma` showing model definitions

#### 2. Migration Success

```bash
npx prisma migrate dev --name init
```

- Capture terminal output showing successful migration

#### 3. Database in Prisma Studio

```bash
npx prisma studio
```

- Screenshot showing tables with data in browser (http://localhost:5555)

#### 4. Test Script Output

```bash
npx tsx scripts/test-db.ts
```

- Terminal output showing successful database queries

#### 5. Sample Query in Code

- Screenshot of API route or server action using Prisma
- Show IntelliSense/autocomplete for type safety

### Example Evidence Layout

```
📁 evidence/
  ├── 01-schema-definition.png
  ├── 02-migration-success.png
  ├── 03-prisma-studio-data.png
  ├── 04-test-query-output.png
  └── 05-typesafe-query-code.png
```

---

## 💡 Reflection & Benefits

### What I Learned

#### 1. Type Safety Eliminates Bugs

**Before Prisma (Raw SQL):**

```typescript
const users = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
// users: any - No type checking!
```

**With Prisma:**

```typescript
const user = await prisma.user.findUnique({ where: { id: userId } });
// user: User | null - Fully typed!
```

**Result:** TypeScript catches errors at compile-time, not runtime.

#### 2. Better Developer Experience

✅ **Auto-completion** - IDE suggests available fields and methods  
✅ **Compile-time validation** - Typos caught before running code  
✅ **Refactoring safety** - Rename a field, update everywhere automatically  
✅ **Clear error messages** - Prisma tells you exactly what's wrong

#### 3. Faster Development

- No need to write boilerplate SQL
- Migrations generated automatically
- Relations handled elegantly
- Complex queries simplified

**Example - Complex Join:**

```typescript
// Without Prisma: 50+ lines of SQL
const query = `
  SELECT s.*, u.name, 
         COUNT(DISTINCT c.id) as comment_count,
         COUNT(DISTINCT v.id) as vote_count
  FROM startups s
  LEFT JOIN users u ON s.user_id = u.id
  LEFT JOIN comments c ON s.id = c.startup_id
  LEFT JOIN votes v ON s.id = v.startup_id
  WHERE s.status = 'PUBLISHED'
  GROUP BY s.id, u.name
  ORDER BY s.created_at DESC
  LIMIT 10
`;

// With Prisma: Clean and readable
const startups = await prisma.startup.findMany({
  where: { status: "PUBLISHED" },
  include: {
    user: { select: { name: true } },
    _count: {
      select: { comments: true, votes: true },
    },
  },
  orderBy: { createdAt: "desc" },
  take: 10,
});
```

#### 4. Database Migration Safety

- Version-controlled schema changes
- Rollback capability
- Team synchronization
- Production-safe deployments

#### 5. Performance Optimization

Prisma provides:

- **Query optimization** - Efficient SQL generation
- **Connection pooling** - Reuse database connections
- **Batch operations** - Reduce round trips
- **N+1 query prevention** - Smart relation loading

### Challenges Faced

1. **Learning Curve** - Understanding Prisma's relation syntax
2. **Hot Reload Issues** - Solved with singleton pattern
3. **Migration Conflicts** - Learned to coordinate with team
4. **Complex Queries** - Some advanced SQL still needed raw queries

### Real-World Applications

This setup is production-ready for:

- 🚀 Startup platforms
- 📱 Social media apps
- 🛒 E-commerce sites
- 📚 Content management systems
- 💼 SaaS products

---

## 🎯 Conclusion

### Assignment Completion Checklist

- ✅ Installed and initialized Prisma
- ✅ Defined comprehensive database schema
- ✅ Generated Prisma Client
- ✅ Created singleton client initialization
- ✅ Tested database connection
- ✅ Ran successful migrations
- ✅ Seeded database with demo data
- ✅ Documented setup process
- ✅ Captured evidence screenshots
- ✅ Reflected on learning outcomes

### Key Takeaways

1. **Type safety** prevents runtime errors
2. **Developer experience** dramatically improves with Prisma
3. **Schema-first design** enforces good database practices
4. **Migrations** make schema changes safe and trackable
5. **Relations** are handled elegantly without manual SQL joins

### Next Steps

- [ ] Implement API routes using Prisma
- [ ] Add data validation with Zod
- [ ] Implement authentication with sessions
- [ ] Add real-time updates with Prisma subscriptions
- [ ] Optimize queries with indexes and caching
- [ ] Deploy to production with PostgreSQL

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Next.js + Prisma Guide](https://www.prisma.io/nextjs)
- [Database Best Practices](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate)

---

**Prepared for:** Kalvium Backend Assignment  
**Date:** December 30, 2025  
**Project:** StartupDiscovery Platform
