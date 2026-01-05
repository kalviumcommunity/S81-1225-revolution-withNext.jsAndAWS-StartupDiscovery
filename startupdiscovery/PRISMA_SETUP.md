# 🗄️ Prisma Database Setup Guide

This guide will help you set up and work with the PostgreSQL database using Prisma.

## 📋 Prerequisites

- PostgreSQL database (Docker, local installation, or cloud provider)
- Node.js and npm installed

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd startupdiscovery
npm install
```

This will install:

- `@prisma/client` - Prisma Client for database queries
- `prisma` - Prisma CLI for migrations and schema management
- `bcrypt` - For password hashing (used in seed script)

### 2. Configure Environment Variables

Copy the example environment file and update with your database credentials:

```bash
cp ../.env.example .env
```

Edit `.env` and set your `DATABASE_URL`:

```env
# For Docker (default)
DATABASE_URL="postgresql://postgres:postgres@db:5432/startupdiscovery"

# For local PostgreSQL
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/startupdiscovery"

# For cloud providers (example: AWS RDS)
DATABASE_URL="postgresql://username:password@host.region.rds.amazonaws.com:5432/dbname"
```

### 3. Generate Prisma Client

Generate the Prisma Client based on your schema:

```bash
npm run prisma:generate
```

This creates the type-safe Prisma Client you'll use in your application.

### 4. Create Database Tables

Run the migration to create all tables in your database:

```bash
npm run prisma:migrate
```

When prompted, give your migration a name (e.g., "init" or "initial_schema").

### 5. Seed the Database (Optional)

Populate the database with sample data:

```bash
npm run prisma:seed
```

This will create:

- 6 categories (SaaS, E-commerce, FinTech, etc.)
- 8 tags
- 3 demo users
- 2 demo startups with complete data
- Sample votes, comments, bookmarks, and follows

**Demo User Credentials:**

- Email: `alice@example.com` / Password: `password123`
- Email: `bob@example.com` / Password: `password123`
- Email: `admin@startupdiscovery.com` / Password: `password123`

---

## 🔧 Prisma Commands

### View Database in Prisma Studio

Open a visual database browser:

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555` where you can view and edit data.

### Create a New Migration

After modifying `schema.prisma`:

```bash
npm run prisma:migrate
```

### Reset Database (⚠️ Deletes all data)

```bash
npx prisma migrate reset
```

This will:

1. Drop the database
2. Create a new database
3. Run all migrations
4. Seed the database

### Format Schema File

```bash
npx prisma format
```

### Validate Schema

```bash
npx prisma validate
```

---

## 📖 Using Prisma in Your Code

### Import Prisma Client

```typescript
import prisma from "@/lib/prisma";
```

### Example Queries

**Find all published startups:**

```typescript
const startups = await prisma.startup.findMany({
  where: { status: "PUBLISHED" },
  include: {
    user: {
      select: { name: true, avatarUrl: true },
    },
    categories: {
      include: { category: true },
    },
  },
  orderBy: { publishedAt: "desc" },
  take: 20,
});
```

**Create a new startup:**

```typescript
const newStartup = await prisma.startup.create({
  data: {
    title: "My Awesome Startup",
    slug: "my-awesome-startup",
    tagline: "Building the future",
    description: "Full description here...",
    stage: "IDEA",
    industry: "SaaS",
    status: "DRAFT",
    userId: currentUserId,
    categories: {
      create: [{ categoryId: 1 }],
    },
  },
});
```

**Vote on a startup:**

```typescript
await prisma.vote.upsert({
  where: {
    userId_startupId: {
      userId: currentUserId,
      startupId: startupId,
    },
  },
  update: { value: 1 },
  create: {
    userId: currentUserId,
    startupId: startupId,
    value: 1,
  },
});

// Update vote count (denormalized for performance)
await prisma.startup.update({
  where: { id: startupId },
  data: {
    voteCount: { increment: 1 },
  },
});
```

**Get user's bookmarks:**

```typescript
const bookmarks = await prisma.bookmark.findMany({
  where: { userId: currentUserId },
  include: {
    startup: {
      include: {
        user: true,
        categories: {
          include: { category: true },
        },
      },
    },
  },
});
```

---

## 🏗️ Database Schema Overview

### Core Tables

- **users** - User accounts and profiles
- **startups** - Startup listings
- **categories** - Predefined categories
- **tags** - User-generated tags

### Junction Tables

- **startup_categories** - Links startups to categories
- **startup_tags** - Links startups to tags

### Engagement Tables

- **comments** - User comments (supports nested replies)
- **votes** - Upvotes/downvotes
- **bookmarks** - Saved startups
- **follows** - User follows

### Additional Tables

- **team_members** - Startup team information
- **media** - Images, videos, documents
- **milestones** - Startup achievements
- **sessions** - Authentication sessions
- **notifications** - User notifications

See `DATABASE_SCHEMA.md` for detailed documentation.

---

## 🐳 Docker Database Setup

If using Docker, start the database:

```bash
cd ..
docker-compose up -d db
```

The PostgreSQL database will be available at `localhost:5432`.

---

## 🔒 Security Best Practices

### 1. Environment Variables

Never commit `.env` files. The `.env.example` template is safe to commit.

### 2. Database Connection Pooling

For production, consider using a connection pooler like PgBouncer:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

### 3. Query Optimization

- Use `select` to limit returned fields
- Add indexes for frequently queried columns
- Use `take` and `skip` for pagination
- Avoid N+1 queries with `include`

---

## 📊 Common Query Patterns

### Pagination

```typescript
const page = 1;
const perPage = 20;

const startups = await prisma.startup.findMany({
  skip: (page - 1) * perPage,
  take: perPage,
  orderBy: { createdAt: "desc" },
});

const total = await prisma.startup.count();
```

### Search

```typescript
const results = await prisma.startup.findMany({
  where: {
    OR: [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
    ],
  },
});
```

### Aggregations

```typescript
const stats = await prisma.startup.aggregate({
  _count: { id: true },
  _avg: { voteCount: true },
  _max: { viewCount: true },
});
```

---

## 🐛 Troubleshooting

### "Can't reach database server"

- Check if PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Check firewall/network settings

### "Prisma Client is not generated"

Run: `npm run prisma:generate`

### "Migration failed"

- Check database permissions
- Ensure database exists
- Review migration SQL for errors

### "Type errors with Prisma Client"

- Regenerate client: `npm run prisma:generate`
- Restart TypeScript server in VS Code

---

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js with Prisma](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)

---

## 🎯 Next Steps

1. Install dependencies: `npm install`
2. Set up `.env` file with your database URL
3. Generate Prisma Client: `npm run prisma:generate`
4. Run migrations: `npm run prisma:migrate`
5. Seed database: `npm run prisma:seed`
6. Start building your API routes and pages!

Happy coding! 🚀
