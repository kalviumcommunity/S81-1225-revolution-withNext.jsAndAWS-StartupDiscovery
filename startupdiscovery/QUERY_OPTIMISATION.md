# ⚡ Query Optimisation Guide

**Kalvium Concept 2.16 - StartupDiscovery Project**

---

## Why Optimise Queries?

**Slow queries = Slow app = Poor user experience**

```
Unoptimized Query:  2000ms (2 seconds) 🐌
Optimized Query:      50ms (0.05 seconds) ⚡

100x faster! Same data, better code.
```

---

## 1️⃣ Over-Fetching: Select Only What You Need

### ❌ BEFORE (Fetches ALL fields)

```typescript
// Fetches EVERYTHING (description, password hash, timestamps, etc.)
const users = await prisma.user.findMany();

// Returns:
// [
//   {
//     id: 1,
//     email: 'alice@example.com',
//     name: 'Alice',
//     password: '$2b$10$...',        // ← Don't need
//     bio: 'Long bio text...',        // ← Don't need
//     avatarUrl: 'https://...',       // ← Don't need
//     createdAt: '2024-01-01...',     // ← Don't need
//     updatedAt: '2024-01-02...',     // ← Don't need
//     role: 'FOUNDER',
//     emailVerified: true,
//   },
//   // ... more users
// ]
```

**Problems:**

- 🐌 Fetches unused data (description, timestamps, etc.)
- 🐌 Transfers more data over network
- 🐌 Uses more memory
- ⚠️ **Sends password hash to frontend!** (security risk)

### ✅ AFTER (Select specific fields)

```typescript
// Fetch ONLY what you need
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
  },
});

// Returns:
// [
//   {
//     id: 1,
//     email: 'alice@example.com',
//     name: 'Alice',
//     role: 'FOUNDER',
//   },
//   // ... more users
// ]
```

**Benefits:**

- ✅ Only fetches 4 fields instead of 10
- ✅ Faster query execution
- ✅ Less data transferred
- ✅ Less memory used
- ✅ No password leak

**Performance Gain:**

```
Before: ~500ms (fetching 10 fields × 1000 users)
After:  ~150ms (fetching 4 fields × 1000 users)
Result: 3.3x faster ⚡
```

---

## 2️⃣ N+1 Query Problem: Use include/select

### ❌ BEFORE (N+1 queries - VERY SLOW)

```typescript
// Fetch all startups (1 query)
const startups = await prisma.startup.findMany();

// For EACH startup, fetch the user (N queries)
for (const startup of startups) {
  const user = await prisma.user.findUnique({
    where: { id: startup.userId },
  });
  console.log(startup.name, "by", user.name);
}

// Total queries: 1 + N
// If N = 100 startups → 101 database queries! 🐌
```

**What happens:**

```
Query 1: SELECT * FROM startups;                 // 1 query
Query 2: SELECT * FROM users WHERE id = 1;       // 100 more queries
Query 3: SELECT * FROM users WHERE id = 2;
Query 4: SELECT * FROM users WHERE id = 1;
...
Query 101: SELECT * FROM users WHERE id = 50;

Total: 101 queries for 100 startups!
```

**Performance:**

```
101 queries × 10ms each = 1010ms (1 second)
```

### ✅ AFTER (Single query with include)

```typescript
// Fetch startups WITH users in ONE query
const startups = await prisma.startup.findMany({
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
});

// Access user directly
for (const startup of startups) {
  console.log(startup.name, "by", startup.user.name);
}

// Total queries: 1
// Uses SQL JOIN under the hood
```

**What happens:**

```
Query 1:
  SELECT
    startups.*,
    users.id, users.name, users.email
  FROM startups
  LEFT JOIN users ON startups.userId = users.id;

Total: 1 query for 100 startups!
```

**Performance:**

```
1 query × 20ms = 20ms

Before: 1010ms
After:    20ms
Result: 50x faster! ⚡⚡⚡
```

---

## 3️⃣ Multiple Writes: Use createMany Batching

### ❌ BEFORE (Individual creates - slow)

```typescript
// Create votes one by one (10 separate queries)
const tagIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

for (const tagId of tagIds) {
  await prisma.startupTag.create({
    data: {
      startupId: 1,
      tagId,
    },
  });
}

// Total: 10 database round-trips
// 10 × 15ms = 150ms
```

### ✅ AFTER (Batch create - fast)

```typescript
// Create all votes in ONE query
const tagIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

await prisma.startupTag.createMany({
  data: tagIds.map((tagId) => ({
    startupId: 1,
    tagId,
  })),
});

// Total: 1 database round-trip
// 1 × 25ms = 25ms
```

**Performance:**

```
Before: 10 queries × 15ms = 150ms
After:   1 query  × 25ms =  25ms
Result: 6x faster ⚡
```

**SQL Generated:**

```sql
-- Before (10 separate queries)
INSERT INTO startup_tags (startupId, tagId) VALUES (1, 1);
INSERT INTO startup_tags (startupId, tagId) VALUES (1, 2);
INSERT INTO startup_tags (startupId, tagId) VALUES (1, 3);
...

-- After (1 bulk insert)
INSERT INTO startup_tags (startupId, tagId) VALUES
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
  (1, 6), (1, 7), (1, 8), (1, 9), (1, 10);
```

---

## 4️⃣ Pagination: Use skip + take + orderBy

### ❌ BEFORE (Fetch everything - crashes with large data)

```typescript
// Fetch ALL startups (could be millions!)
const allStartups = await prisma.startup.findMany();

// If database has 100,000 startups:
// - 100,000 records loaded into memory
// - Transfers 50+ MB of data
// - Takes 5+ seconds
// - App crashes! 💥
```

### ✅ AFTER (Paginate - fast and scalable)

```typescript
// Page 1: First 10 startups
const page1 = await prisma.startup.findMany({
  take: 10, // Get 10 items
  skip: 0, // Skip 0 items (start from beginning)
  orderBy: {
    createdAt: "desc", // Newest first
  },
  select: {
    id: true,
    name: true,
    tagline: true,
    voteCount: true,
    createdAt: true,
  },
});

// Page 2: Next 10 startups
const page2 = await prisma.startup.findMany({
  take: 10, // Get 10 items
  skip: 10, // Skip first 10 items
  orderBy: {
    createdAt: "desc",
  },
  select: {
    id: true,
    name: true,
    tagline: true,
    voteCount: true,
    createdAt: true,
  },
});

// Page N: Calculate skip
function getPage(pageNumber: number, pageSize: number = 10) {
  return prisma.startup.findMany({
    take: pageSize,
    skip: (pageNumber - 1) * pageSize,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      tagline: true,
      voteCount: true,
    },
  });
}

// Usage
const page3 = await getPage(3, 10); // Skip 20, take 10
```

**Performance:**

```
Before: Fetch 100,000 records = 5000ms (5 seconds)
After:  Fetch 10 records      =   50ms (0.05 seconds)
Result: 100x faster ⚡⚡⚡
```

### Complete Pagination Helper

```typescript
interface PaginationParams {
  page?: number;
  pageSize?: number;
}

async function getStartupsPaginated(params: PaginationParams = {}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;

  // Get total count (for calculating total pages)
  const totalCount = await prisma.startup.count();

  // Get paginated data
  const startups = await prisma.startup.findMany({
    take: pageSize,
    skip: (page - 1) * pageSize,
    orderBy: {
      voteCount: "desc", // Most popular first
    },
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      voteCount: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    data: startups,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      hasNextPage: page * pageSize < totalCount,
      hasPreviousPage: page > 1,
    },
  };
}

// Usage
const result = await getStartupsPaginated({ page: 2, pageSize: 20 });
console.log("Startups:", result.data);
console.log("Page 2 of", result.pagination.totalPages);
console.log("Has next page?", result.pagination.hasNextPage);
```

---

## 5️⃣ Nested Includes: Fetch Related Data Efficiently

### ❌ BEFORE (Multiple queries)

```typescript
// Query 1: Get startup
const startup = await prisma.startup.findUnique({
  where: { id: 1 },
});

// Query 2: Get user
const user = await prisma.user.findUnique({
  where: { id: startup.userId },
});

// Query 3: Get category
const category = await prisma.category.findUnique({
  where: { id: startup.categoryId },
});

// Query 4: Get comments
const comments = await prisma.comment.findMany({
  where: { startupId: startup.id },
});

// Total: 4 queries
```

### ✅ AFTER (Single query with nested include)

```typescript
// ONE query fetches everything
const startup = await prisma.startup.findUnique({
  where: { id: 1 },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    },
    category: {
      select: {
        name: true,
        slug: true,
      },
    },
    comments: {
      take: 5, // Only get 5 most recent
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    },
    _count: {
      select: {
        votes: true,
        bookmarks: true,
      },
    },
  },
});

// Total: 1 query with SQL JOINs
```

**Performance:**

```
Before: 4 queries × 15ms = 60ms
After:  1 query  × 30ms = 30ms
Result: 2x faster ⚡
```

---

## 6️⃣ Count Queries: Use \_count Instead of findMany

### ❌ BEFORE (Fetch all, then count)

```typescript
// Fetches ALL votes, counts in JavaScript
const votes = await prisma.vote.findMany({
  where: { startupId: 1 },
});

const voteCount = votes.length;

// If there are 10,000 votes:
// - Fetches 10,000 records from database
// - Transfers all data to app
// - Counts in memory
// Very slow! 🐌
```

### ✅ AFTER (Count in database)

```typescript
// Counts in database, returns only the number
const voteCount = await prisma.vote.count({
  where: { startupId: 1 },
});

// Database does: SELECT COUNT(*) FROM votes WHERE startupId = 1;
// Returns: 10000 (just a number, not all records)
```

**Performance:**

```
Before: Fetch 10,000 votes = 500ms
After:  Count in database  =  10ms
Result: 50x faster ⚡⚡
```

---

## 7️⃣ Filtering: Use where Instead of JavaScript Filter

### ❌ BEFORE (Filter in JavaScript)

```typescript
// Fetch ALL startups, filter in JavaScript
const allStartups = await prisma.startup.findMany();

const activeStartups = allStartups.filter(
  (s) => s.status === "ACTIVE" && s.voteCount > 10
);

// Fetches 10,000 startups
// Filters in memory
// Slow! 🐌
```

### ✅ AFTER (Filter in database)

```typescript
// Let database do the filtering
const activeStartups = await prisma.startup.findMany({
  where: {
    status: "ACTIVE",
    voteCount: {
      gt: 10, // greater than 10
    },
  },
});

// Database does:
// SELECT * FROM startups
// WHERE status = 'ACTIVE' AND voteCount > 10;
```

**Performance:**

```
Before: Fetch 10,000 → filter to 100 = 800ms
After:  Fetch 100 directly           =  50ms
Result: 16x faster ⚡
```

---

## 8️⃣ Sorting: Use orderBy Instead of JavaScript Sort

### ❌ BEFORE (Sort in JavaScript)

```typescript
// Fetch all, sort in memory
const startups = await prisma.startup.findMany();

startups.sort((a, b) => b.voteCount - a.voteCount);
```

### ✅ AFTER (Sort in database)

```typescript
// Let database sort (uses indexes!)
const startups = await prisma.startup.findMany({
  orderBy: {
    voteCount: "desc",
  },
});

// Database does:
// SELECT * FROM startups ORDER BY voteCount DESC;
// Uses index on voteCount for fast sorting
```

**Performance:**

```
Before: Fetch + JS sort = 600ms
After:  DB sort         =  80ms (uses index)
Result: 7.5x faster ⚡
```

---

## 9️⃣ Conditional Includes: Only Fetch When Needed

### ✅ Fetch user's bookmarks only if needed

```typescript
interface GetStartupsOptions {
  includeBookmarks?: boolean;
  userId?: number;
}

async function getStartups(options: GetStartupsOptions = {}) {
  return prisma.startup.findMany({
    take: 10,
    include: {
      user: {
        select: { name: true },
      },
      // Only fetch bookmarks if requested
      ...(options.includeBookmarks &&
        options.userId && {
          bookmarks: {
            where: {
              userId: options.userId,
            },
          },
        }),
    },
  });
}

// Without bookmarks (faster)
const startupsPublic = await getStartups();

// With bookmarks (only when user is logged in)
const startupsForUser = await getStartups({
  includeBookmarks: true,
  userId: 1,
});
```

---

## 🔟 Complete Before/After Example

### ❌ BEFORE (Unoptimized)

```typescript
// Get trending startups (SLOW VERSION)
async function getTrendingStartupsBAD() {
  // Fetch EVERYTHING
  const startups = await prisma.startup.findMany();

  // Filter in JavaScript
  const active = startups.filter((s) => s.status === "ACTIVE");

  // Sort in JavaScript
  active.sort((a, b) => b.voteCount - a.voteCount);

  // Take first 10
  const top10 = active.slice(0, 10);

  // Fetch user for each startup (N+1 queries!)
  for (const startup of top10) {
    const user = await prisma.user.findUnique({
      where: { id: startup.userId },
    });
    startup.user = user;
  }

  return top10;
}

// Performance: ~2000ms (2 seconds) 🐌
```

### ✅ AFTER (Optimized)

```typescript
// Get trending startups (FAST VERSION)
async function getTrendingStartupsGOOD() {
  return prisma.startup.findMany({
    where: {
      status: "ACTIVE", // Filter in database
    },
    orderBy: {
      voteCount: "desc", // Sort in database
    },
    take: 10, // Limit in database
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      voteCount: true,
      createdAt: true,
      user: {
        // Include user (no N+1!)
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
}

// Performance: ~50ms (0.05 seconds) ⚡
// 40x faster!
```

---

## 📊 Summary: Optimisation Techniques

| Technique         | Before              | After               | Speedup     |
| ----------------- | ------------------- | ------------------- | ----------- |
| **Select fields** | Fetch all 10 fields | Fetch only 4 fields | 3.3x faster |
| **Fix N+1**       | 101 queries         | 1 query with JOIN   | 50x faster  |
| **Batch creates** | 10 queries          | 1 bulk insert       | 6x faster   |
| **Pagination**    | Fetch 100k records  | Fetch 10 records    | 100x faster |
| **Count in DB**   | Fetch + count       | COUNT query         | 50x faster  |
| **Filter in DB**  | Fetch all + filter  | WHERE clause        | 16x faster  |
| **Sort in DB**    | Fetch + sort        | ORDER BY            | 7.5x faster |

---

## ✅ Best Practices Checklist

### Query Design

- [ ] Use `select` to fetch only needed fields
- [ ] Use `include` to fetch relations (avoid N+1)
- [ ] Use `where` to filter in database
- [ ] Use `orderBy` to sort in database
- [ ] Use `take` + `skip` for pagination
- [ ] Use `count()` instead of `findMany().length`

### Performance

- [ ] Batch writes with `createMany`
- [ ] Use transactions for related writes
- [ ] Add indexes to frequently queried fields
- [ ] Avoid fetching large text fields unless needed
- [ ] Use cursor-based pagination for large datasets

### Security

- [ ] Never send password hashes to frontend
- [ ] Use `select` to exclude sensitive fields
- [ ] Validate user input before queries
- [ ] Use parameterized queries (Prisma does this automatically)

---

**Assignment:** Kalvium Concept 2.16  
**Topic:** Query Optimisation  
**Status:** ✅ Complete  
**Next:** Database Indexes

Good luck! 🚀
