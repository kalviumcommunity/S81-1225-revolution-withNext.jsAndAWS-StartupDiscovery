# ✅ Complete Verification Guide & Evidence Collection

**Kalvium Concept 2.15 - Database Migrations & Seed Scripts**

This guide shows exactly how to verify everything works and collect evidence for your submission.

---

## 📋 Pre-Verification Checklist

Before you start, ensure:

- [ ] Database URL is in `.env` file (PostgreSQL running)
- [ ] All packages installed (`npm install`)
- [ ] Migrations are up to date (`npx prisma migrate status`)
- [ ] You can open Prisma Studio (`npx prisma studio`)

---

## ✅ Verification Step 1: Migration Status

**What to verify:** Migrations have been applied

```bash
npx prisma migrate status
```

**Expected Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

Following migrations have been applied to the database:
  20231227044526_init

Migrations pending:
  None
```

**Evidence Screenshot 1/8 - Migration Status**
- Take screenshot of terminal showing above output
- Shows migration has been applied
- Proves database is connected

**What to look for:**
- ✅ "Following migrations have been applied"
- ✅ At least one migration listed (20231227044526_init)
- ✅ "Migrations pending: None"

---

## ✅ Verification Step 2: Run Seed Script

**What to verify:** Seed script runs without errors

```bash
npx prisma db seed
```

**Expected Output:**
```
🌱 Starting database seed...

📁 Creating categories...
✅ Created/verified 6 categories

🏷️  Creating tags...
✅ Created/verified 8 tags

👥 Creating users...
✅ Created/verified 3 users

🚀 Creating startups...
✅ Created/verified 2 startups

💬 Creating comments...
✅ Created 2 comments

⬆️  Creating votes...
✅ Created/verified 3 votes

🔖 Creating bookmarks...
✅ Created/verified 3 bookmarks

👣 Creating follows...
✅ Created/verified 3 follows

═══════════════════════════════════════════════════
🎉 Database seeding completed successfully!
═══════════════════════════════════════════════════

📊 Seed Data Summary:
   ├─ Categories: 6
   ├─ Tags: 8
   ├─ Users: 3
   ├─ Startups: 2
   ├─ Comments: 2
   ├─ Votes: 3
   ├─ Bookmarks: 3
   └─ Follows: 3

💡 Next steps:
   1. View data: npx prisma studio
   2. Run tests: npm run db:test
   3. Start dev: npm run dev
```

**Evidence Screenshot 2/8 - Seed Script Output**
- Take screenshot of complete terminal output
- Should show all ✅ marks
- Should show success message
- Should show data summary

**What to look for:**
- ✅ No error messages
- ✅ All entities created
- ✅ "Database seeding completed successfully!"
- ✅ Summary shows correct counts

---

## ✅ Verification Step 3: Prisma Studio - Users Table

**What to verify:** Users table has data (idempotent operation)

```bash
npx prisma studio
```

Then navigate to Users table in browser (http://localhost:5555)

**Expected Data:**

| Email | Name | Role |
|-------|------|------|
| alice@example.com | Alice | FOUNDER |
| bob@example.com | Bob | INVESTOR |
| admin@example.com | Admin | ADMIN |

**Evidence Screenshot 3/8 - Users Table in Studio**
- Open Prisma Studio
- Click on "User" table
- Take screenshot showing:
  - 3 users visible
  - Email addresses visible
  - Names populated
  - No duplicate rows

**What to look for:**
- ✅ Exactly 3 user records
- ✅ Unique email addresses
- ✅ Names populated (Alice, Bob, Admin)
- ✅ Role field populated
- ✅ Timestamps present (createdAt, updatedAt)

---

## ✅ Verification Step 4: Prisma Studio - Startups Table

**What to verify:** Startups table has data with proper relationships

```bash
# Already have npx prisma studio running from Step 3
# Just click "Startup" table in the sidebar
```

**Expected Data:**

| Name | Slug | Founder |
|------|------|---------|
| CloudSync Pro | cloudsync-pro | alice@example.com |
| HealthTrack AI | healthtrack-ai | alice@example.com |

**Evidence Screenshot 4/8 - Startups Table in Studio**
- Click "Startup" table in Prisma Studio
- Take screenshot showing:
  - 2 startups visible
  - Slug values present
  - User relationships populated
  - View counts and tags visible

**What to look for:**
- ✅ Exactly 2 startup records
- ✅ Unique slug values
- ✅ UserId is populated
- ✅ Category and Tags relationships shown
- ✅ Timestamps present

---

## ✅ Verification Step 5: Prisma Studio - Categories Table

**What to verify:** Categories table has all 6 categories

```bash
# Already have npx prisma studio running
# Click "Category" table in the sidebar
```

**Expected Data:**
1. SaaS
2. E-commerce
3. FinTech
4. HealthTech
5. EdTech
6. B2B

**Evidence Screenshot 5/8 - Categories Table in Studio**
- Click "Category" table
- Take screenshot showing:
  - 6 categories visible
  - All names present
  - Slug values unique
  - Color codes populated

**What to look for:**
- ✅ Exactly 6 category records
- ✅ All names visible
- ✅ Unique slug values
- ✅ Description populated
- ✅ Color field populated (hex codes)

---

## ✅ Verification Step 6: Prisma Studio - Comments, Votes, Bookmarks

**What to verify:** Relationship tables properly populated

**Evidence Screenshot 6/8 - Comments Table**
- Click "Comment" table
- Should show 2 comment records
- Each linked to a User and Startup

**Evidence Screenshot 7/8 - Votes Table**
- Click "Vote" table
- Should show 3 vote records
- Each has userId, startupId, value

**Evidence Screenshot 8/8 - Bookmarks Table**
- Click "Bookmark" table
- Should show 3 bookmark records
- Each has userId, startupId

**What to look for in each table:**
- ✅ Data is present
- ✅ Foreign keys populated
- ✅ No null values where shouldn't be
- ✅ All relationships are valid

---

## ✅ Verification Step 7: Test Idempotency

**What to verify:** Seed script is idempotent (safe to run multiple times)

```bash
# Run seed script a SECOND time
npx prisma db seed
```

**Expected Output:**
```
🌱 Starting database seed...

📁 Creating categories...
✅ Created/verified 6 categories

🏷️  Creating tags...
✅ Created/verified 8 tags

👥 Creating users...
✅ Created/verified 3 users
... (all with "Created/verified")

🎉 Database seeding completed successfully!
```

**NO ERRORS** - this proves idempotency!

**What to look for:**
- ✅ No "Unique constraint failed" errors
- ✅ No "duplicate key" errors
- ✅ All items show "Created/verified"
- ✅ Success message at end
- ✅ Same data counts as before

**Why this matters:**
- Idempotent = safe to run anytime
- Don't create duplicates
- Can run during CI/CD pipeline
- Team developers can run freely

---

## ✅ Verification Step 8: Schema File Audit

**What to verify:** Schema file has proper structure

```bash
cat prisma/schema.prisma
```

**Expected Structure:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  // 8+ fields with proper types
}

model Startup {
  // 12+ fields with relationships
}

model Category {
  // fields
}

model Vote {
  // user and startup relationships
}

// ... more models
```

**What to look for:**
- ✅ PostgreSQL datasource configured
- ✅ PrismaClient generator present
- ✅ All models properly defined
- ✅ Relationships defined with @relation
- ✅ Unique constraints where needed
- ✅ Enums defined properly

---

## 📸 Evidence Collection Summary

**8 Required Screenshots:**

```
1. ✅ Migration Status
   └─ Terminal showing: npx prisma migrate status

2. ✅ Seed Script Success
   └─ Terminal showing: npx prisma db seed (full output)

3. ✅ Users Table (Prisma Studio)
   └─ Browser showing 3 users with data

4. ✅ Startups Table (Prisma Studio)
   └─ Browser showing 2 startups with relationships

5. ✅ Categories Table (Prisma Studio)
   └─ Browser showing 6 categories

6. ✅ Comments Table (Prisma Studio)
   └─ Browser showing 2 comments with relationships

7. ✅ Votes/Bookmarks Table (Prisma Studio)
   └─ Browser showing relationship data

8. ✅ Second Seed Run (Idempotency Test)
   └─ Terminal showing: npx prisma db seed (second run, no errors)
```

---

## 🎯 Kalvium Submission Checklist

**Technical Implementation (40%)**
- [ ] Migrations file exists and is tracked in git
- [ ] Migrations have been applied (verified in step 1)
- [ ] Seed script runs without errors (verified in step 2)
- [ ] Seed script is idempotent (verified in step 7)
- [ ] All 13 models have data in database
- [ ] Relationships are properly established

**Documentation (30%)**
- [ ] DATABASE_MIGRATIONS_GUIDE.md created (600+ lines)
- [ ] DATABASE_MIGRATIONS_ASSIGNMENT.md created (5 deliverables)
- [ ] MIGRATIONS_CHEAT_SHEET.md created (quick reference)
- [ ] All files explain concepts clearly
- [ ] Code examples provided throughout

**Code Quality (20%)**
- [ ] seed.ts uses upsert/idempotent patterns
- [ ] Proper error handling implemented
- [ ] Code is well-commented
- [ ] Follows TypeScript best practices
- [ ] Follows Node.js conventions

**Evidence (10%)**
- [ ] 8 screenshots collected (see above)
- [ ] Screenshots show working system
- [ ] Screenshots demonstrate idempotency
- [ ] All tables visible in Prisma Studio

---

## 🚀 Quick Execution Plan

**Do this in order:**

```bash
# 1. Verify migrations
npx prisma migrate status

# 2. Run seed (first time)
npx prisma db seed

# 3. Open Studio and capture screenshots
npx prisma studio
# Take screenshots 3, 4, 5, 6, 7 in browser

# 4. Test idempotency
npx prisma db seed

# 5. All done!
# You now have:
# ✅ Working migrations
# ✅ Idempotent seed script
# ✅ Full database with data
# ✅ All 8 screenshots
# ✅ 3 comprehensive docs
```

---

## 💡 Pro Tips

**For better screenshots:**

1. **Use full terminal width** - shows more content
2. **Zoom in before screenshot** - text is more readable (Ctrl/Cmd +)
3. **Clear terminal first** - shows clean output (clear)
4. **Use high quality** - use Print Screen or screenshot tool
5. **Name them clearly** - "01-migration-status.png", etc.

**File naming for submission:**
```
01-migration-status.png
02-seed-script-output.png
03-users-table.png
04-startups-table.png
05-categories-table.png
06-comments-table.png
07-votes-bookmarks-table.png
08-idempotency-test.png
```

---

## ✅ Before You Submit

Make sure you have:

- [ ] All 5 deliverables files created
  - [ ] DATABASE_MIGRATIONS_GUIDE.md
  - [ ] DATABASE_MIGRATIONS_ASSIGNMENT.md
  - [ ] MIGRATIONS_CHEAT_SHEET.md
  - [ ] prisma/seed.ts (improved)
  - [ ] prisma/migrations/ (applied)

- [ ] All 8 screenshots taken
  - [ ] Clearly showing system works
  - [ ] Demonstrating idempotency

- [ ] Seed script verification
  - [ ] Runs without errors
  - [ ] Idempotent (runs 2+ times)
  - [ ] Creates correct data

- [ ] Documentation verification
  - [ ] All files are detailed
  - [ ] Code examples included
  - [ ] Reflection section complete

---

**Ready to submit?** Follow the checklist above and you're good to go! 🎉

Good luck with your Kalvium assignment! 🚀
