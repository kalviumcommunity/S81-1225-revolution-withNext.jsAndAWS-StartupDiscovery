# Prisma Quick Reference - StartupDiscovery

## 🚀 Quick Start Commands

```bash
# Setup database (first time)
npm run db:setup

# Quick test
npm run db:quick-test

# Full test suite
npm run db:test

# View data in browser
npm run prisma:studio
```

---

## 📦 Installation

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

---

## 🔄 Common Commands

### Generate Client

```bash
npx prisma generate
# or
npm run prisma:generate
```

### Run Migrations

```bash
npx prisma migrate dev --name migration_name
# or
npm run prisma:migrate
```

### Seed Database

```bash
npx prisma db seed
# or
npm run prisma:seed
```

### View Data

```bash
npx prisma studio
# or
npm run prisma:studio
```

### Reset Database (⚠️ Deletes all data)

```bash
npx prisma migrate reset
# or
npm run prisma:reset
```

---

## 📝 Query Examples

### Import Prisma Client

```typescript
import prisma from "@/lib/prisma";
```

### Find Many

```typescript
const users = await prisma.user.findMany({
  where: { isVerified: true },
  orderBy: { createdAt: "desc" },
  take: 10,
});
```

### Find Unique

```typescript
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" },
});
```

### Find First

```typescript
const startup = await prisma.startup.findFirst({
  where: { status: "PUBLISHED" },
});
```

### Create

```typescript
const user = await prisma.user.create({
  data: {
    email: "newuser@example.com",
    username: "newuser",
    passwordHash: "hashed_password",
  },
});
```

### Update

```typescript
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { name: "Updated Name" },
});
```

### Delete

```typescript
await prisma.user.delete({
  where: { id: 1 },
});
```

### Count

```typescript
const count = await prisma.user.count({
  where: { role: "ADMIN" },
});
```

---

## 🔗 Relations

### Include Relations

```typescript
const startup = await prisma.startup.findUnique({
  where: { id: 1 },
  include: {
    user: true,
    categories: {
      include: {
        category: true,
      },
    },
    comments: {
      take: 5,
    },
  },
});
```

### Select Specific Fields

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    username: true,
    email: true,
    startups: {
      select: {
        id: true,
        title: true,
      },
    },
  },
});
```

### Count Relations

```typescript
const startups = await prisma.startup.findMany({
  include: {
    _count: {
      select: {
        comments: true,
        votes: true,
        bookmarks: true,
      },
    },
  },
});
```

---

## 🔍 Advanced Queries

### Where Conditions

```typescript
const startups = await prisma.startup.findMany({
  where: {
    AND: [{ status: "PUBLISHED" }, { featured: true }],
    OR: [{ industry: "SaaS" }, { industry: "FinTech" }],
    voteCount: {
      gte: 10,
    },
    title: {
      contains: "AI",
      mode: "insensitive",
    },
  },
});
```

### Aggregations

```typescript
const stats = await prisma.startup.aggregate({
  _avg: { voteCount: true },
  _max: { viewCount: true },
  _min: { createdAt: true },
  _count: true,
});
```

### Group By

```typescript
const byIndustry = await prisma.startup.groupBy({
  by: ["industry"],
  _count: {
    id: true,
  },
  _avg: {
    voteCount: true,
  },
});
```

---

## 🔐 Transactions

### Sequential Operations

```typescript
const [user, startup] = await prisma.$transaction([
  prisma.user.create({
    data: {
      /* ... */
    },
  }),
  prisma.startup.create({
    data: {
      /* ... */
    },
  }),
]);
```

### Interactive Transactions

```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: {
      /* ... */
    },
  });
  const startup = await tx.startup.create({
    data: {
      userId: user.id,
      // ...
    },
  });
  return { user, startup };
});
```

---

## 📊 Schema Patterns

### One-to-Many

```prisma
model User {
  id       Int       @id @default(autoincrement())
  startups Startup[]
}

model Startup {
  id     Int  @id @default(autoincrement())
  userId Int
  user   User @relation(fields: [userId], references: [id])
}
```

### Many-to-Many (Explicit)

```prisma
model Startup {
  id   Int              @id @default(autoincrement())
  tags StartupTag[]
}

model Tag {
  id       Int          @id @default(autoincrement())
  startups StartupTag[]
}

model StartupTag {
  id        Int     @id @default(autoincrement())
  startupId Int
  tagId     Int
  startup   Startup @relation(fields: [startupId], references: [id])
  tag       Tag     @relation(fields: [tagId], references: [id])

  @@unique([startupId, tagId])
}
```

### Self-Relation

```prisma
model Comment {
  id       Int       @id @default(autoincrement())
  parentId Int?
  parent   Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies  Comment[] @relation("CommentReplies")
}
```

---

## 🎯 Best Practices

### ✅ DO

- Use `select` to fetch only needed fields
- Add indexes on frequently queried fields
- Use transactions for related operations
- Validate data before database operations
- Handle errors gracefully
- Use enums for fixed value sets

### ❌ DON'T

- Fetch all fields when you only need some
- Forget to add `onDelete` behavior
- Create multiple Prisma Client instances
- Store sensitive data without hashing
- Skip input validation
- Use raw queries unless necessary

---

## 🐛 Troubleshooting

### Error: Can't reach database server

```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
docker ps  # if using Docker
```

### Error: Table does not exist

```bash
# Run migrations
npx prisma migrate dev
```

### Error: Generated Prisma Client out of sync

```bash
# Regenerate client
npx prisma generate
```

### Too many database connections

```typescript
// Use singleton pattern in lib/prisma.ts
// See PRISMA_SETUP_GUIDE.md for implementation
```

---

## 📚 Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

---

**Project:** StartupDiscovery  
**Database:** PostgreSQL  
**ORM:** Prisma v6.2.0
