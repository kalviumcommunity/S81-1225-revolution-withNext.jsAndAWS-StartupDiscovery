# 📊 Database Schema Design - StartupDiscovery

## Entity-Relationship Overview

This document describes the relational database schema for the StartupDiscovery platform, designed to support a scalable startup discovery and pitching platform.

---

## 🎯 Core Entities

### 1. **User** (Authentication & Profiles)

**Purpose:** Store user accounts and profile information

**Primary Key:** `id` (Auto-incrementing Integer)

**Unique Constraints:**

- `email` - Each email must be unique
- `username` - Each username must be unique

**Indexes:**

- `email` - Fast lookup for authentication
- `username` - Fast lookup for profile pages
- `createdAt` - Sorting users by join date

**Relationships:**

- One-to-Many with `Startup` (A user can create multiple startups)
- One-to-Many with `Comment` (A user can make multiple comments)
- One-to-Many with `Vote` (A user can vote on multiple startups)
- One-to-Many with `Bookmark` (A user can bookmark multiple startups)
- One-to-Many with `Session` (A user can have multiple active sessions)
- Many-to-Many with `User` via `Follow` (Users can follow each other)

**Key Fields:**

- `role` - ENUM (USER, ADMIN, MODERATOR) for access control
- `isVerified` - Boolean for email verification status
- `lastLoginAt` - Timestamp for security tracking

---

### 2. **Startup** (Core Business Entity)

**Purpose:** Store startup pitches and information

**Primary Key:** `id` (Auto-incrementing Integer)

**Unique Constraints:**

- `slug` - URL-friendly unique identifier for SEO

**Foreign Keys:**

- `userId` → `User.id` (CASCADE on delete - removes startups when user is deleted)

**Indexes:**

- `userId` - Query all startups by a specific user
- `slug` - Fast lookup by URL slug
- `status` - Filter by publication status
- `publishedAt` - Sort by publication date
- `featured` - Quick filtering of featured startups
- `industry` - Filter by industry category

**Relationships:**

- Many-to-One with `User` (Created by one user)
- Many-to-Many with `Category` via `StartupCategory`
- Many-to-Many with `Tag` via `StartupTag`
- One-to-Many with `Comment`
- One-to-Many with `Vote`
- One-to-Many with `Bookmark`
- One-to-Many with `TeamMember`
- One-to-Many with `Media`
- One-to-Many with `Milestone`

**Key Fields:**

- `stage` - ENUM (IDEA, MVP, BETA, LAUNCHED, GROWTH, SCALING)
- `status` - ENUM (DRAFT, PUBLISHED, ARCHIVED, REJECTED)
- `viewCount` - Integer for analytics (denormalized for performance)
- `voteCount` - Integer for sorting/ranking (denormalized for performance)
- `fundingGoal` - Decimal(12,2) for monetary values

---

### 3. **Category** (Taxonomy)

**Purpose:** Organize startups into categories (e.g., SaaS, E-commerce, FinTech)

**Primary Key:** `id` (Auto-incrementing Integer)

**Unique Constraints:**

- `name` - Category names must be unique
- `slug` - URL-friendly identifier

**Indexes:**

- `slug` - Fast category page lookups

**Relationships:**

- Many-to-Many with `Startup` via `StartupCategory`

---

### 4. **Tag** (Folksonomy)

**Purpose:** User-generated tags for flexible categorization

**Primary Key:** `id` (Auto-incrementing Integer)

**Unique Constraints:**

- `name` - Tag names must be unique
- `slug` - URL-friendly identifier

**Indexes:**

- `slug` - Fast tag page lookups
- `useCount` - Sort tags by popularity

**Relationships:**

- Many-to-Many with `Startup` via `StartupTag`

**Key Fields:**

- `useCount` - Denormalized counter for tag popularity

---

## 🔗 Junction Tables (Many-to-Many Relationships)

### 5. **StartupCategory**

**Purpose:** Link startups to categories (a startup can have multiple categories)

**Primary Key:** `id` (Auto-incrementing Integer)

**Foreign Keys:**

- `startupId` → `Startup.id` (CASCADE on delete)
- `categoryId` → `Category.id` (CASCADE on delete)

**Unique Constraint:**

- `(startupId, categoryId)` - Prevent duplicate associations

**Indexes:**

- `startupId` - Find all categories for a startup
- `categoryId` - Find all startups in a category

---

### 6. **StartupTag**

**Purpose:** Link startups to tags

**Primary Key:** `id` (Auto-incrementing Integer)

**Foreign Keys:**

- `startupId` → `Startup.id` (CASCADE on delete)
- `tagId` → `Tag.id` (CASCADE on delete)

**Unique Constraint:**

- `(startupId, tagId)` - Prevent duplicate tags

**Indexes:**

- `startupId` - Find all tags for a startup
- `tagId` - Find all startups with a tag

---

## 💬 Engagement Entities

### 7. **Comment**

**Purpose:** User comments on startups (with nested replies)

**Primary Key:** `id` (Auto-incrementing Integer)

**Foreign Keys:**

- `userId` → `User.id` (CASCADE on delete)
- `startupId` → `Startup.id` (CASCADE on delete)
- `parentId` → `Comment.id` (CASCADE on delete - for threaded replies)

**Indexes:**

- `userId` - Find all comments by a user
- `startupId` - Load all comments for a startup
- `parentId` - Load replies to a comment
- `createdAt` - Sort comments chronologically

**Relationships:**

- Self-referencing: `parent` and `replies` for nested comment threads

---

### 8. **Vote**

**Purpose:** User upvotes/downvotes on startups

**Primary Key:** `id` (Auto-incrementing Integer)

**Foreign Keys:**

- `userId` → `User.id` (CASCADE on delete)
- `startupId` → `Startup.id` (CASCADE on delete)

**Unique Constraint:**

- `(userId, startupId)` - One vote per user per startup

**Indexes:**

- `userId` - Find all votes by a user
- `startupId` - Calculate vote totals for a startup

**Key Fields:**

- `value` - Integer (1 for upvote, -1 for downvote)

---

### 9. **Bookmark**

**Purpose:** Users can save/bookmark startups for later

**Primary Key:** `id` (Auto-incrementing Integer)

**Foreign Keys:**

- `userId` → `User.id` (CASCADE on delete)
- `startupId` → `Startup.id` (CASCADE on delete)

**Unique Constraint:**

- `(userId, startupId)` - Can't bookmark the same startup twice

**Indexes:**

- `userId` - Load user's bookmarks
- `startupId` - Count bookmarks for a startup

---

### 10. **Follow**

**Purpose:** Users can follow other users

**Primary Key:** `id` (Auto-incrementing Integer)

**Foreign Keys:**

- `followerId` → `User.id` (CASCADE on delete - the user doing the following)
- `followingId` → `User.id` (CASCADE on delete - the user being followed)

**Unique Constraint:**

- `(followerId, followingId)` - Can't follow same user twice

**Indexes:**

- `followerId` - Get all users someone follows
- `followingId` - Get all followers of a user

---

## 👥 Collaboration Entities

### 11. **TeamMember**

**Purpose:** Team members associated with a startup

**Primary Key:** `id` (Auto-incrementing Integer)

**Foreign Keys:**

- `startupId` → `Startup.id` (CASCADE on delete)

**Indexes:**

- `startupId` - Load team for a startup

**Key Fields:**

- `role` - Job title/position
- `linkedinUrl`, `twitterUrl` - Social profiles

---

## 📁 Media & Assets

### 12. **Media**

**Purpose:** Images, videos, documents attached to startups

**Primary Key:** `id` (Auto-incrementing Integer)

**Foreign Keys:**

- `startupId` → `Startup.id` (CASCADE on delete)

**Indexes:**

- `startupId` - Load all media for a startup
- `order` - Sort media items

**Key Fields:**

- `type` - ENUM (IMAGE, VIDEO, DOCUMENT)
- `order` - Integer for display ordering

---

## 📈 Progress Tracking

### 13. **Milestone**

**Purpose:** Track startup achievements and progress

**Primary Key:** `id` (Auto-incrementing Integer)

**Foreign Keys:**

- `startupId` → `Startup.id` (CASCADE on delete)

**Indexes:**

- `startupId` - Load milestones for a startup
- `order` - Display in chronological order

**Key Fields:**

- `achievedAt` - Nullable DateTime (null = planned, not yet achieved)

---

## 🔔 Notifications

### 14. **Notification**

**Purpose:** User notifications for various events

**Primary Key:** `id` (Auto-incrementing Integer)

**Foreign Keys:**

- `userId` → `User.id` (CASCADE on delete)

**Indexes:**

- `userId` - Load user's notifications
- `isRead` - Filter unread notifications
- `createdAt` - Sort by recency

**Key Fields:**

- `type` - ENUM (NEW_COMMENT, NEW_VOTE, NEW_FOLLOWER, STARTUP_PUBLISHED, etc.)
- `startupId`, `commentId` - Optional context references

---

## 🔐 Authentication

### 15. **Session**

**Purpose:** Manage user sessions for authentication

**Primary Key:** `id` (CUID - Collision-resistant unique identifier)

**Foreign Keys:**

- `userId` → `User.id` (CASCADE on delete)

**Unique Constraints:**

- `token` - Session tokens must be unique

**Indexes:**

- `userId` - Find all sessions for a user
- `token` - Validate session tokens
- `expiresAt` - Clean up expired sessions

**Key Fields:**

- `expiresAt` - DateTime for session expiry
- `ipAddress`, `userAgent` - Security tracking

---

## 📐 Database Constraints Summary

### PRIMARY KEYS

All tables use auto-incrementing integers except:

- `Session` uses CUID for distributed systems compatibility

### FOREIGN KEYS with CASCADE DELETE

All foreign keys use `ON DELETE CASCADE` to maintain referential integrity:

- Deleting a user removes all their startups, comments, votes, etc.
- Deleting a startup removes all associated comments, votes, media, etc.

### UNIQUE CONSTRAINTS

- Email and username uniqueness for users
- Slug uniqueness for SEO-friendly URLs
- Composite uniqueness for junction tables (prevent duplicates)
- Session token uniqueness

### CHECK CONSTRAINTS (Enforced at application level)

- Vote value must be 1 or -1
- Funding goal must be positive
- Email format validation

### INDEXES for Performance

**Critical indexes:**

- Foreign keys (automatic query optimization)
- Unique fields (authentication lookups)
- Timestamp fields (sorting, filtering)
- Status/enum fields (filtering)
- Denormalized counters (sorting by popularity)

---

## 🏗️ Design Decisions

### 1. **Denormalization for Performance**

- `Startup.viewCount` and `Startup.voteCount` - Cached aggregates to avoid expensive COUNT queries
- `Tag.useCount` - Avoids counting junction table rows

### 2. **Soft Deletes vs Hard Deletes**

- Currently using **hard deletes** with CASCADE
- Could add `deletedAt` timestamp for soft deletes if audit trail is needed

### 3. **ENUM Types**

- Used for constrained values (UserRole, StartupStage, MediaType, etc.)
- Provides type safety and prevents invalid data

### 4. **Text vs String Fields**

- `@db.Text` for long content (descriptions, bios, comments)
- `String` (VARCHAR) for short fields (names, titles)

### 5. **Decimal for Currency**

- `fundingGoal` uses `Decimal(12,2)` for precise monetary calculations
- Avoids floating-point precision issues

### 6. **Timestamps**

- `createdAt` - Record creation (default to `now()`)
- `updatedAt` - Auto-updated on modifications (`@updatedAt`)
- Separate timestamps for specific events (publishedAt, lastLoginAt, etc.)

### 7. **Self-Referencing Relationships**

- `Comment` supports nested replies via `parentId`
- `User` follows via `Follow` junction table

---

## 🔍 Query Optimization Patterns

### Common Queries & Indexes

**1. Load Homepage Feed:**

```sql
SELECT * FROM startups
WHERE status = 'PUBLISHED'
ORDER BY publishedAt DESC
LIMIT 20;
```

✅ **Indexed:** `status`, `publishedAt`

**2. Load User's Startups:**

```sql
SELECT * FROM startups
WHERE userId = ?;
```

✅ **Indexed:** `userId`

**3. Load Startup with Relations:**

```sql
SELECT s.*, u.name, u.avatarUrl
FROM startups s
JOIN users u ON s.userId = u.id
WHERE s.slug = ?;
```

✅ **Indexed:** `slug`, `userId`

**4. Search Featured Startups:**

```sql
SELECT * FROM startups
WHERE featured = true AND status = 'PUBLISHED';
```

✅ **Indexed:** `featured`, `status`

**5. Get User's Bookmarks:**

```sql
SELECT s.* FROM startups s
JOIN bookmarks b ON s.id = b.startupId
WHERE b.userId = ?;
```

✅ **Indexed:** `userId` on bookmarks

---

## 🎨 ER Diagram (Text Representation)

```
┌─────────────┐
│    USER     │
└──────┬──────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌─────────────┐  ┌─────────────┐
│   STARTUP   │  │   COMMENT   │
└──────┬──────┘  └─────────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│    VOTE     │  │  BOOKMARK   │  │  CATEGORY   │  │     TAG     │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
                                           │              │
                                           ▼              ▼
                                   ┌──────────────────────────┐
                                   │  STARTUP_CATEGORY/TAG    │
                                   └──────────────────────────┘

Additional Relations:
- STARTUP ─→ TEAM_MEMBER (1:N)
- STARTUP ─→ MEDIA (1:N)
- STARTUP ─→ MILESTONE (1:N)
- USER ─→ FOLLOW (M:N self-referencing)
- USER ─→ SESSION (1:N)
- USER ─→ NOTIFICATION (1:N)
```

---

## 🚀 Next Steps

1. **Initialize Prisma:**

   ```bash
   npm install prisma @prisma/client
   npx prisma generate
   ```

2. **Set up PostgreSQL database** (via Docker or cloud provider)

3. **Run migrations:**

   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed initial data:**
   - Create seed script in `prisma/seed.ts`
   - Add categories, tags, sample users/startups

5. **Set up Prisma Client** in Next.js:
   - Create `lib/prisma.ts` singleton
   - Use in Server Components and API routes

---

## 📚 Additional Resources

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don't_Do_This)
- [Database Indexing Strategies](https://use-the-index-luke.com/)
