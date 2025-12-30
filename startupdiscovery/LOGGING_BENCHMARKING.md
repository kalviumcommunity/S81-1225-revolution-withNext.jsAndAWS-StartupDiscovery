# 📊 Logging & Benchmarking Guide

**Kalvium Concept 2.16 - StartupDiscovery Project**

---

## Why Log Queries?

**You can't optimize what you can't measure.**

```
Without Logs:
"The app feels slow" 🤷
"Maybe it's the database?" 🤔
"Let's add random indexes?" 🎲

With Logs:
"Query X takes 2000ms" 📊
"It scans 10,000 rows" 🔍
"Add index on userId" ✅
"Now it's 50ms!" ⚡
```

---

## 1️⃣ Enable Prisma Query Logging

### Method 1: Environment Variable (Recommended)

Create `.env.local` or update `.env`:

```bash
# Enable detailed query logging
DEBUG="prisma:query"
```

Then run your app:

```bash
npm run dev
```

**Output:**
```
prisma:query SELECT "User"."id", "User"."email", "User"."name" FROM "User" WHERE "User"."email" = $1
prisma:query Duration: 5ms
```

### Method 2: Prisma Client Log Levels

Update `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
});

// Log every query with timing
prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Params: ' + e.params);
  console.log('Duration: ' + e.duration + 'ms');
  console.log('---');
});

export default prisma;
```

**Output:**
```
Query: SELECT * FROM "Startup" WHERE "userId" = $1
Params: [1]
Duration: 45ms
---
```

### Method 3: Custom Query Logger

Create `lib/query-logger.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

export function createPrismaClientWithLogging() {
  const prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
    ],
  });

  // Query statistics
  const stats = {
    totalQueries: 0,
    totalDuration: 0,
    slowQueries: [] as Array<{ query: string; duration: number }>,
  };

  prisma.$on('query', (e) => {
    stats.totalQueries++;
    stats.totalDuration += e.duration;

    // Log slow queries (>100ms)
    if (e.duration > 100) {
      console.warn('⚠️  SLOW QUERY:', e.duration + 'ms');
      console.warn('Query:', e.query);
      console.warn('Params:', e.params);
      
      stats.slowQueries.push({
        query: e.query,
        duration: e.duration,
      });
    }
  });

  // Print stats on exit
  process.on('beforeExit', () => {
    console.log('\n📊 Query Statistics:');
    console.log('Total queries:', stats.totalQueries);
    console.log('Total duration:', stats.totalDuration + 'ms');
    console.log('Average duration:', (stats.totalDuration / stats.totalQueries).toFixed(2) + 'ms');
    console.log('Slow queries (>100ms):', stats.slowQueries.length);
    
    if (stats.slowQueries.length > 0) {
      console.log('\n🐌 Slowest Queries:');
      stats.slowQueries
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .forEach((q, i) => {
          console.log(`${i + 1}. ${q.duration}ms - ${q.query.substring(0, 100)}...`);
        });
    }
  });

  return prisma;
}
```

**Usage:**
```typescript
// lib/prisma.ts
import { createPrismaClientWithLogging } from './query-logger';

const prisma = createPrismaClientWithLogging();

export default prisma;
```

---

## 2️⃣ Benchmarking: Before vs. After Optimization

### Test File: `scripts/benchmark.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query'],
});

interface BenchmarkResult {
  name: string;
  duration: number;
  rowCount: number;
}

async function benchmark(
  name: string,
  fn: () => Promise<any>
): Promise<BenchmarkResult> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;

  const rowCount = Array.isArray(result) ? result.length : 1;

  console.log(`✅ ${name}: ${duration}ms (${rowCount} rows)`);

  return { name, duration, rowCount };
}

async function runBenchmarks() {
  console.log('🏁 Starting benchmarks...\n');

  const results: BenchmarkResult[] = [];

  // Benchmark 1: Fetch all startups (no optimization)
  results.push(
    await benchmark('Fetch all startups (unoptimized)', async () => {
      return prisma.startup.findMany();
    })
  );

  // Benchmark 2: Fetch startups with select (optimized)
  results.push(
    await benchmark('Fetch startups with select (optimized)', async () => {
      return prisma.startup.findMany({
        select: {
          id: true,
          name: true,
          tagline: true,
          voteCount: true,
        },
      });
    })
  );

  // Benchmark 3: Fetch startups with N+1 (bad)
  results.push(
    await benchmark('Fetch startups with N+1 (bad)', async () => {
      const startups = await prisma.startup.findMany({ take: 10 });
      for (const startup of startups) {
        await prisma.user.findUnique({ where: { id: startup.userId } });
      }
      return startups;
    })
  );

  // Benchmark 4: Fetch startups with include (good)
  results.push(
    await benchmark('Fetch startups with include (good)', async () => {
      return prisma.startup.findMany({
        take: 10,
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      });
    })
  );

  // Benchmark 5: Filter by userId (without index)
  results.push(
    await benchmark('Filter by userId', async () => {
      return prisma.startup.findMany({
        where: { userId: 1 },
      });
    })
  );

  // Benchmark 6: Sort by voteCount (without index)
  results.push(
    await benchmark('Sort by voteCount', async () => {
      return prisma.startup.findMany({
        orderBy: { voteCount: 'desc' },
        take: 10,
      });
    })
  );

  // Benchmark 7: Pagination
  results.push(
    await benchmark('Paginated query (page 1)', async () => {
      return prisma.startup.findMany({
        take: 10,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });
    })
  );

  // Print summary
  console.log('\n📊 Benchmark Summary:');
  console.log('─'.repeat(60));
  results.forEach((r) => {
    console.log(`${r.name.padEnd(45)} ${r.duration.toString().padStart(6)}ms`);
  });
  console.log('─'.repeat(60));

  await prisma.$disconnect();
}

runBenchmarks().catch(console.error);
```

**Run Benchmarks:**
```bash
npx tsx scripts/benchmark.ts
```

**Example Output:**
```
🏁 Starting benchmarks...

✅ Fetch all startups (unoptimized): 450ms (1000 rows)
✅ Fetch startups with select (optimized): 120ms (1000 rows)
✅ Fetch startups with N+1 (bad): 850ms (10 rows)
✅ Fetch startups with include (good): 45ms (10 rows)
✅ Filter by userId: 250ms (100 rows)
✅ Sort by voteCount: 180ms (10 rows)
✅ Paginated query (page 1): 35ms (10 rows)

📊 Benchmark Summary:
────────────────────────────────────────────────────────────
Fetch all startups (unoptimized)                    450ms
Fetch startups with select (optimized)              120ms
Fetch startups with N+1 (bad)                       850ms
Fetch startups with include (good)                   45ms
Filter by userId                                    250ms
Sort by voteCount                                   180ms
Paginated query (page 1)                             35ms
────────────────────────────────────────────────────────────
```

---

## 3️⃣ Benchmark: Before and After Adding Indexes

### Before Indexes

**Run:**
```bash
# Make sure indexes are NOT added yet
npx tsx scripts/benchmark.ts > benchmark-before.txt
```

**Output (`benchmark-before.txt`):**
```
Filter by userId: 250ms (100 rows)
Sort by voteCount: 180ms (10 rows)
Sort by createdAt: 200ms (10 rows)
```

### Add Indexes

```bash
# Update schema.prisma with @@index directives
npx prisma migrate dev --name add_indexes
```

### After Indexes

**Run:**
```bash
# Run benchmarks again
npx tsx scripts/benchmark.ts > benchmark-after.txt
```

**Output (`benchmark-after.txt`):**
```
Filter by userId: 5ms (100 rows)    ← 50x faster! ⚡
Sort by voteCount: 8ms (10 rows)    ← 22.5x faster! ⚡
Sort by createdAt: 6ms (10 rows)    ← 33x faster! ⚡
```

### Compare Results

```bash
# View side-by-side
diff benchmark-before.txt benchmark-after.txt
```

---

## 4️⃣ Performance Monitoring in Production

### Add Timing Middleware

Create `lib/timing-middleware.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export function withTiming(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = Date.now();

    try {
      await handler(req, res);
    } finally {
      const duration = Date.now() - start;
      console.log(`[${req.method}] ${req.url} - ${duration}ms`);

      // Log slow requests (>1000ms)
      if (duration > 1000) {
        console.warn(`⚠️  SLOW REQUEST: ${req.url} took ${duration}ms`);
      }
    }
  };
}
```

**Usage in API Route:**
```typescript
// app/api/startups/route.ts
import { withTiming } from '@/lib/timing-middleware';
import prisma from '@/lib/prisma';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startups = await prisma.startup.findMany({
    take: 10,
    include: {
      user: { select: { name: true } },
    },
  });

  res.json(startups);
}

export default withTiming(handler);
```

**Output:**
```
[GET] /api/startups - 45ms
```

---

## 5️⃣ Query Analysis Tools

### EXPLAIN ANALYZE (PostgreSQL)

See exactly how PostgreSQL executes a query:

```typescript
// scripts/explain-query.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function explainQuery() {
  const result = await prisma.$queryRaw`
    EXPLAIN ANALYZE
    SELECT * FROM "Startup" 
    WHERE "userId" = 1 
    ORDER BY "createdAt" DESC;
  `;

  console.log(result);
  await prisma.$disconnect();
}

explainQuery();
```

**Without Index:**
```
Seq Scan on "Startup"  (cost=0.00..500.00 rows=100 width=200) (actual time=0.050..45.123 rows=100 loops=1)
  Filter: ("userId" = 1)
  Rows Removed by Filter: 9900
Planning Time: 0.123 ms
Execution Time: 45.456 ms
```

**With Index:**
```
Index Scan using "Startup_userId_idx" on "Startup"  (cost=0.29..8.50 rows=100 width=200) (actual time=0.025..1.234 rows=100 loops=1)
  Index Cond: ("userId" = 1)
Planning Time: 0.089 ms
Execution Time: 1.567 ms
```

**28x faster with index!** ⚡

---

## 6️⃣ Logging Best Practices

### Development Environment

```typescript
// lib/prisma.ts
const isDevelopment = process.env.NODE_ENV === 'development';

const prisma = new PrismaClient({
  log: isDevelopment
    ? ['query', 'info', 'warn', 'error'] // Verbose in dev
    : ['error'], // Only errors in production
});
```

### Production Environment

```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
  ],
});

// Log only slow queries in production
prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    console.warn({
      type: 'slow_query',
      query: e.query,
      duration: e.duration,
      params: e.params,
      timestamp: new Date().toISOString(),
    });
  }
});
```

---

## 7️⃣ Monitoring Metrics to Track

### Query Performance Metrics

```typescript
interface QueryMetrics {
  totalQueries: number;
  averageDuration: number;
  slowQueries: number;
  p50Duration: number; // 50th percentile
  p95Duration: number; // 95th percentile
  p99Duration: number; // 99th percentile
}

class QueryMonitor {
  private durations: number[] = [];

  logQuery(duration: number) {
    this.durations.push(duration);
  }

  getMetrics(): QueryMetrics {
    const sorted = [...this.durations].sort((a, b) => a - b);
    const count = sorted.length;

    return {
      totalQueries: count,
      averageDuration: sorted.reduce((a, b) => a + b, 0) / count,
      slowQueries: sorted.filter((d) => d > 1000).length,
      p50Duration: sorted[Math.floor(count * 0.5)],
      p95Duration: sorted[Math.floor(count * 0.95)],
      p99Duration: sorted[Math.floor(count * 0.99)],
    };
  }

  printReport() {
    const metrics = this.getMetrics();
    console.log('\n📊 Query Performance Report:');
    console.log('Total Queries:', metrics.totalQueries);
    console.log('Average Duration:', metrics.averageDuration.toFixed(2) + 'ms');
    console.log('Slow Queries (>1s):', metrics.slowQueries);
    console.log('P50 Duration:', metrics.p50Duration + 'ms');
    console.log('P95 Duration:', metrics.p95Duration + 'ms');
    console.log('P99 Duration:', metrics.p99Duration + 'ms');
  }
}

// Usage
const monitor = new QueryMonitor();

prisma.$on('query', (e) => {
  monitor.logQuery(e.duration);
});

// Print report every 60 seconds
setInterval(() => {
  monitor.printReport();
}, 60000);
```

---

## 8️⃣ Benchmarking Checklist

Before optimizing:
- [ ] Enable query logging
- [ ] Run benchmark script
- [ ] Save results (`benchmark-before.txt`)
- [ ] Identify slow queries (>100ms)
- [ ] Note which queries scan full tables

After optimizing:
- [ ] Add indexes to frequently queried fields
- [ ] Run migration (`npx prisma migrate dev`)
- [ ] Run benchmark script again
- [ ] Save results (`benchmark-after.txt`)
- [ ] Compare before/after timings
- [ ] Verify speedup (should be 10x-100x)

---

## 9️⃣ Real-World Example: Full Optimization Flow

### Step 1: Identify Slow Query

**Log output:**
```
prisma:query SELECT * FROM "Startup" WHERE "userId" = 1 ORDER BY "createdAt" DESC
prisma:query Duration: 250ms
```

### Step 2: Analyze Query

```typescript
// This query is slow because:
// 1. No index on userId → full table scan
// 2. No index on createdAt → slow sorting
// 3. Fetching all fields (SELECT *)
```

### Step 3: Add Indexes

```prisma
model Startup {
  // ... fields

  @@index([userId, createdAt]) // Composite index for both filtering and sorting
}
```

### Step 4: Run Migration

```bash
npx prisma migrate dev --name optimize_startup_queries
```

### Step 5: Optimize Query

```typescript
// Before
const startups = await prisma.startup.findMany({
  where: { userId: 1 },
  orderBy: { createdAt: 'desc' },
});

// After (with select)
const startups = await prisma.startup.findMany({
  where: { userId: 1 },
  orderBy: { createdAt: 'desc' },
  select: {
    id: true,
    name: true,
    tagline: true,
    voteCount: true,
  },
});
```

### Step 6: Verify Improvement

**Log output:**
```
prisma:query SELECT id, name, tagline, voteCount FROM "Startup" WHERE "userId" = 1 ORDER BY "createdAt" DESC
prisma:query Duration: 5ms
```

**Result: 50x faster!** (250ms → 5ms) ⚡⚡

---

## 🎯 Summary

### Tools & Techniques

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `DEBUG="prisma:query"` | See all queries | Development debugging |
| `prisma.$on('query')` | Custom logging | Production monitoring |
| Benchmark script | Measure performance | Before/after optimization |
| EXPLAIN ANALYZE | See query plan | Understanding slow queries |
| Timing middleware | Track API latency | Production monitoring |

### Key Metrics to Track

```
Development:
├─ Query duration (all queries)
├─ Row count returned
├─ Number of queries per request
└─ Slow queries (>100ms)

Production:
├─ Slow queries (>1000ms)
├─ Error rate
├─ 95th percentile latency
└─ Query count per minute
```

---

**Assignment:** Kalvium Concept 2.16  
**Topic:** Logging & Benchmarking  
**Status:** ✅ Complete  
**Next:** Complete README Documentation  

Good luck! 🚀
