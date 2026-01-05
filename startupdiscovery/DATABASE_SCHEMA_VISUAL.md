# StartupDiscovery Database Schema

## 📊 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STARTUPDISCOVERY DATABASE                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       User           │
├──────────────────────┤
│ 🔑 id                │
│ 🔒 email (unique)    │
│ 🔒 username (unique) │
│    passwordHash      │
│    name              │
│    bio               │
│    avatarUrl         │
│    role              │──┐
│    isVerified        │  │
│    createdAt         │  │
│    updatedAt         │  │
│    lastLoginAt       │  │
└──────────────────────┘  │
         │                │
         │ 1              │ 1
         │                │
         │ *              │ *
         │                │
         ↓                ↓
┌──────────────────────┐  ┌──────────────────────┐
│      Startup         │  │      Session         │
├──────────────────────┤  ├──────────────────────┤
│ 🔑 id                │  │ 🔑 id (cuid)         │
│ 🔒 slug (unique)     │  │ 🔑 userId            │
│    title             │  │    token             │
│    tagline           │  │    expiresAt         │
│    description       │  │    createdAt         │
│    logoUrl           │  │    ipAddress         │
│    websiteUrl        │  │    userAgent         │
│    stage             │  └──────────────────────┘
│    industry          │
│    fundingGoal       │
│    location          │
│    viewCount         │
│    voteCount         │
│    status            │
│    featured          │
│    publishedAt       │
│    createdAt         │
│    updatedAt         │
│ 🔑 userId            │
└──────────────────────┘
         │
         ├─────────────────────────────────────────────────────┐
         │                                                     │
         │ 1                                              1    │
         │                                                     │
         │ *                                              *    │
         ↓                                                     ↓
┌──────────────────────┐                            ┌──────────────────────┐
│   StartupCategory    │                            │     StartupTag       │
├──────────────────────┤                            ├──────────────────────┤
│ 🔑 id                │                            │ 🔑 id                │
│ 🔑 startupId         │──┐                    ┌───│ 🔑 startupId         │
│ 🔑 categoryId        │  │                    │   │ 🔑 tagId             │
│    createdAt         │  │                    │   │    createdAt         │
└──────────────────────┘  │                    │   └──────────────────────┘
         │                │                    │            │
         │ *              │                    │            │ *
         │                │                    │            │
         │ 1              │                    │            │ 1
         ↓                │                    │            ↓
┌──────────────────────┐  │                    │   ┌──────────────────────┐
│     Category         │  │                    │   │        Tag           │
├──────────────────────┤  │                    │   ├──────────────────────┤
│ 🔑 id                │  │                    │   │ 🔑 id                │
│ 🔒 name (unique)     │  │                    │   │ 🔒 name (unique)     │
│ 🔒 slug (unique)     │  │                    │   │ 🔒 slug (unique)     │
│    description       │  │                    │   │    useCount          │
│    iconUrl           │  │                    │   │    createdAt         │
│    color             │  │                    │   └──────────────────────┘
│    createdAt         │  │                    │
└──────────────────────┘  │                    │
                          │                    │
                          │                    │
         ┌────────────────┴────────────────────┴─────────────┐
         │                                                    │
         │ 1                                             1    │
         │                                                    │
         │ *                                             *    │
         ↓                                                    ↓
┌──────────────────────┐                            ┌──────────────────────┐
│      Comment         │                            │        Vote          │
├──────────────────────┤                            ├──────────────────────┤
│ 🔑 id                │                            │ 🔑 id                │
│    content           │                            │    value             │
│ 🔑 userId            │───────┐                    │ 🔑 userId            │───┐
│ 🔑 startupId         │       │                    │ 🔑 startupId         │   │
│    parentId          │──┐    │                    │    createdAt         │   │
│    createdAt         │  │    │                    └──────────────────────┘   │
│    updatedAt         │  │    │                                               │
└──────────────────────┘  │    │                                               │
         │                │    │                                               │
         │ self-ref       │    │                                               │
         └────────────────┘    │                                               │
                               │                                               │
                               │                                               │
         ┌─────────────────────┴───────────────────────────────────────────────┘
         │
         │ 1
         │
         │ *
         ↓
┌──────────────────────┐
│      Bookmark        │
├──────────────────────┤
│ 🔑 id                │
│ 🔑 userId            │
│ 🔑 startupId         │
│    createdAt         │
└──────────────────────┘


┌──────────────────────┐        ┌──────────────────────┐
│       Follow         │        │     TeamMember       │
├──────────────────────┤        ├──────────────────────┤
│ 🔑 id                │        │ 🔑 id                │
│ 🔑 followerId        │─┐      │    name              │
│ 🔑 followingId       │ │      │    role              │
│    createdAt         │ │      │    bio               │
└──────────────────────┘ │      │    avatarUrl         │
         │               │      │    linkedinUrl       │
         └───────────────┴──┐   │    twitterUrl        │
                            │   │    createdAt         │
                     User ←─┘   │ 🔑 startupId         │────→ Startup
                                └──────────────────────┘


┌──────────────────────┐        ┌──────────────────────┐
│        Media         │        │     Milestone        │
├──────────────────────┤        ├──────────────────────┤
│ 🔑 id                │        │ 🔑 id                │
│    type              │        │    title             │
│    url               │        │    description       │
│    caption           │        │    achievedAt        │
│    order             │        │    order             │
│    createdAt         │        │    createdAt         │
│ 🔑 startupId         │────┐   │ 🔑 startupId         │────┐
└──────────────────────┘    │   └──────────────────────┘    │
                            │                               │
                            └───────────┬───────────────────┘
                                        │
                                        ↓
                                   Startup


┌──────────────────────┐
│    Notification      │
├──────────────────────┤
│ 🔑 id                │
│    type              │
│    title             │
│    message           │
│    isRead            │
│    createdAt         │
│ 🔑 userId            │────→ User
│    startupId (opt)   │
│    commentId (opt)   │
└──────────────────────┘
```

---

## 📋 Table Summary

| Table            | Purpose               | Records | Key Relations                       |
| ---------------- | --------------------- | ------- | ----------------------------------- |
| **User**         | User accounts & auth  | ~       | → Startups, Comments, Votes         |
| **Session**      | User login sessions   | ~       | → User                              |
| **Startup**      | Main startup entities | ~       | → User, Categories, Tags            |
| **Category**     | Startup categories    | 6+      | ← Startups (M2M)                    |
| **Tag**          | Flexible tagging      | 8+      | ← Startups (M2M)                    |
| **Comment**      | User feedback         | ~       | → User, Startup, Parent Comment     |
| **Vote**         | Upvote/downvote       | ~       | → User, Startup                     |
| **Bookmark**     | Saved startups        | ~       | → User, Startup                     |
| **Follow**       | User following        | ~       | → User (follower), User (following) |
| **TeamMember**   | Startup team info     | ~       | → Startup                           |
| **Media**        | Images/videos/docs    | ~       | → Startup                           |
| **Milestone**    | Achievements          | ~       | → Startup                           |
| **Notification** | User notifications    | ~       | → User                              |

---

## 🔑 Relationship Types

### One-to-Many (1:N)

```
User ──< Startup
User ──< Comment
User ──< Vote
Startup ──< Comment
Startup ──< Vote
Startup ──< TeamMember
Startup ──< Media
Startup ──< Milestone
```

### Many-to-Many (M:N)

```
Startup >──< Category (via StartupCategory)
Startup >──< Tag (via StartupTag)
User >──< User (via Follow - followers/following)
```

### Self-Referential

```
Comment ──< Comment (parent/replies)
```

### Optional References

```
Notification ─┬─> Startup (nullable)
              └─> Comment (nullable)
```

---

## 📐 Schema Constraints

### Primary Keys

- All tables use auto-incrementing integers: `@id @default(autoincrement())`
- Exception: `Session` uses CUID: `@id @default(cuid())`

### Unique Constraints

```prisma
User.email         @unique
User.username      @unique
Startup.slug       @unique
Category.name      @unique
Category.slug      @unique
Tag.name           @unique
Tag.slug           @unique
Vote[userId, startupId]         @@unique
Bookmark[userId, startupId]     @@unique
Follow[followerId, followingId] @@unique
```

### Indexes

```prisma
User:       email, username, createdAt
Startup:    userId, slug, status, publishedAt, createdAt, featured, industry
Category:   slug
Tag:        slug, useCount
Comment:    userId, startupId, parentId, createdAt
Vote:       userId, startupId
Session:    userId, token, expiresAt
```

### Cascade Deletes

When a user or startup is deleted, all related records are automatically removed:

```
User deleted → Cascades to:
  - Startups
  - Comments
  - Votes
  - Bookmarks
  - Follows (both sides)
  - Sessions
  - Notifications

Startup deleted → Cascades to:
  - StartupCategory
  - StartupTag
  - Comments
  - Votes
  - Bookmarks
  - TeamMembers
  - Media
  - Milestones
```

---

## 🏗️ Design Patterns Used

### 1. **Junction Tables** (Many-to-Many)

- `StartupCategory` - Links Startups ↔ Categories
- `StartupTag` - Links Startups ↔ Tags

### 2. **Polymorphic Associations**

```prisma
Notification {
  startupId Int?  // Could reference a Startup
  commentId Int?  // Or a Comment
}
```

### 3. **Soft Enums**

```prisma
enum UserRole { USER, ADMIN, MODERATOR }
enum StartupStage { IDEA, MVP, BETA, LAUNCHED, GROWTH, SCALING }
enum StartupStatus { DRAFT, PUBLISHED, ARCHIVED, REJECTED }
enum MediaType { IMAGE, VIDEO, DOCUMENT }
enum NotificationType { NEW_COMMENT, NEW_VOTE, ... }
```

### 4. **Audit Timestamps**

```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

### 5. **Denormalization for Performance**

```prisma
Startup {
  viewCount Int @default(0)
  voteCount Int @default(0)
}
Tag {
  useCount Int @default(0)
}
```

### 6. **Nested Comments (Tree Structure)**

```prisma
Comment {
  parentId Int?
  parent   Comment?  @relation("CommentReplies")
  replies  Comment[] @relation("CommentReplies")
}
```

---

## 🎯 Query Patterns

### Get Startup with Full Details

```typescript
const startup = await prisma.startup.findUnique({
  where: { slug: "my-startup" },
  include: {
    user: true,
    categories: { include: { category: true } },
    tags: { include: { tag: true } },
    team: true,
    media: { orderBy: { order: "asc" } },
    milestones: { orderBy: { order: "asc" } },
    comments: {
      where: { parentId: null },
      include: {
        user: true,
        replies: { include: { user: true } },
      },
    },
    _count: {
      select: { votes: true, bookmarks: true, comments: true },
    },
  },
});
```

### Get User Profile

```typescript
const profile = await prisma.user.findUnique({
  where: { username: "alice_tech" },
  include: {
    startups: {
      where: { status: "PUBLISHED" },
      include: {
        _count: { select: { votes: true, comments: true } },
      },
    },
    _count: {
      select: {
        followers: true,
        following: true,
      },
    },
  },
});
```

---

**Database:** PostgreSQL  
**ORM:** Prisma 6.2.0  
**Total Tables:** 13  
**Total Enums:** 5
