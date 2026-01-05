# ⚡ Database Migrations - Quick Reference Cheat Sheet

**Quick commands you'll use most often.**

---

## 🚀 Essential Commands

### Development (Local)

```bash
# Create and apply new migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ deletes all data!)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Open Prisma Studio (browser UI)
npx prisma studio

# Run seed script
npx prisma db seed
npm run prisma:seed
```

### Production (Deployment)

```bash
# Apply all pending migrations (SAFE FOR PRODUCTION)
npx prisma migrate deploy

# Check what would be deployed (dry run)
npx prisma migrate deploy --dry-run

# View migration history
npx prisma migrate status
```

---

## 📋 Workflow Checklist

### Creating a New Feature That Changes Schema

```
1. Edit schema.prisma
   └─ Add new model or field

2. Run locally:
   └─ npx prisma migrate dev --name add_feature

3. Test locally:
   ├─ npm run dev
   ├─ npx prisma studio (verify)
   └─ npm run db:test

4. Commit to git:
   └─ git add prisma/ && git commit

5. Team pulls changes:
   └─ git pull && npx prisma migrate dev

6. Deploy to staging:
   └─ npx prisma migrate deploy

7. Deploy to production:
   └─ npx prisma migrate deploy
```

---

## 💾 Seed Script

### Run Seed

```bash
npx prisma db seed
# or
npm run prisma:seed
```

### Reset Everything

```bash
# Reset database + run migrations + seed
npx prisma migrate reset

# Same as:
# 1. npx prisma migrate resolve --rolled-back 20231227044526_init
# 2. npx prisma migrate deploy
# 3. npx prisma db seed
```

### Test Idempotency

```bash
# Run seed multiple times (should not error)
npx prisma db seed
npx prisma db seed
npx prisma db seed
# ✅ All should succeed without duplicates
```

---

## 🔍 Verification

### Check All Data Exists

```bash
npx prisma studio

# Then verify in browser:
# ✅ Users table has 3 rows
# ✅ Startups table has 2 rows
# ✅ Categories table has 6 rows
# ✅ Comments, votes, bookmarks, follows exist
```

### Query from Command Line

```bash
# Using Prisma Client in script
npx ts-node -O '{"module":"commonjs"}' -e "
  import { PrismaClient } from '@prisma/client';
  const prisma = new PrismaClient();
  (async () => {
    const users = await prisma.user.findMany();
    console.log('Users:', users.length);
    await prisma.\$disconnect();
  })();
"
```

---

## ⚠️ Common Issues & Fixes

| Issue                      | Fix                                                         |
| -------------------------- | ----------------------------------------------------------- |
| "Unique constraint failed" | Seed isn't idempotent. Use `upsert` or delete-before-create |
| Migrations won't apply     | Use `npx prisma migrate deploy` (not `migrate dev`)         |
| Can't access Prisma Studio | Port 5555 in use. Check: `lsof -i :5555`                    |
| "No migrations found"      | Run `npx prisma migrate dev --name init` first              |
| Database permission denied | Check DATABASE_URL in .env file                             |
| Out of sync with team      | Run `git pull` then `npx prisma migrate dev`                |

---

## 🏗️ Schema Change Examples

### Add a New Field

```prisma
// Before
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
}

// After - added name field
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?  // ← NEW
}
```

```bash
npx prisma migrate dev --name add_name_to_user
```

### Create New Table

```prisma
// Add new model
model Article {
  id        Int     @id @default(autoincrement())
  title     String
  content   String
  createdAt DateTime @default(now())
}
```

```bash
npx prisma migrate dev --name create_articles_table
```

### Add Relationship

```prisma
model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  articles  Article[] // ← NEW: one-to-many
}

model Article {
  id        Int     @id @default(autoincrement())
  title     String
  userId    Int
  user      User    @relation(fields: [userId], references: [id]) // ← NEW
}
```

```bash
npx prisma migrate dev --name add_articles_to_user
```

---

## 🛡️ Production Checklist

Before running migrations in production:

```
[ ] Backup database
    pg_dump prod_db > backup_2024_12_30.sql

[ ] Test in staging
    Deploy code → npx prisma migrate deploy → verify

[ ] Review migration SQL
    cat prisma/migrations/TIMESTAMP_name/migration.sql

[ ] Schedule off-peak
    Run during low-traffic hours

[ ] Have rollback plan
    Know how to restore backup

[ ] Monitor after
    Check logs, errors, performance

[ ] Notify team
    Let them know deployment happened
```

---

## 🔄 Idempotent Seed Patterns

### Pattern 1: Upsert (Simple)

```typescript
await prisma.category.upsert({
  where: { slug: "saas" },
  update: {},
  create: { name: "SaaS", slug: "saas" },
});
```

### Pattern 2: Find First, Create If Needed

```typescript
let category = await prisma.category.findFirst({
  where: { slug: "saas" },
});
if (!category) {
  category = await prisma.category.create({
    data: { name: "SaaS", slug: "saas" },
  });
}
```

### Pattern 3: Delete & Recreate (For Many-to-Many)

```typescript
await prisma.vote.deleteMany({
  where: { userId: 1 },
});
await prisma.vote.createMany({
  data: [
    { userId: 1, startupId: 1, value: 1 },
    // ...
  ],
});
```

---

## 📚 File Locations

```
prisma/
├── schema.prisma              ← Your models (edit this!)
├── seed.ts                    ← Demo data
├── migrations/
│   ├── migration_lock.toml    ← DO NOT EDIT
│   ├── 20231227044526_init/   ← Timestamped migration
│   │   └── migration.sql      ← DO NOT EDIT (version controlled)
│   └── TIMESTAMP_name/        ← More migrations...
└── .migrations.lock           ← Internal (DO NOT EDIT)

package.json
├── scripts.db:setup           ← First-time setup
├── scripts.db:test            ← Run tests
├── scripts.prisma:seed        ← Run seed
└── scripts.prisma:studio      ← Open UI
```

---

## 🆘 Emergency Commands

### Completely Reset (Development Only)

```bash
# ☠️ WARNING: DELETES ALL DATA
npx prisma migrate reset
```

### Manually Reset Database

```bash
# Only if migrate reset doesn't work
npx prisma migrate resolve --rolled-back 20231227044526_init
npx prisma migrate deploy
npx prisma db seed
```

### Recover from Bad Migration

```bash
# Restore from backup
psql production_db < backup_2024_12_30.sql
```

---

## ✅ Success Indicators

After running seed, you should see:

```
✅ 3 users created
✅ 2 startups created
✅ 6 categories created
✅ 8 tags created
✅ Comments, votes, bookmarks, follows populated
✅ No duplicate errors
✅ All data queryable in Prisma Studio
```

---

**Keep this handy while developing!** 📌
