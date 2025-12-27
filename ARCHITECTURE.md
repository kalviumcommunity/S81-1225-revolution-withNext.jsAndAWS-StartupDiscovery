# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│                     http://localhost:3000                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION                           │
│                     (Port 3000)                                  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Homepage   │  │  About Page  │  │  Dashboard   │         │
│  │    (ISR)     │  │    (SSG)     │  │    (SSR)     │         │
│  │  revalidate  │  │  revalidate  │  │   dynamic    │         │
│  │     60s      │  │    false     │  │  force-dyn.  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │  Startup     │  │  API Routes  │                            │
│  │  Details     │  │   /api/*     │                            │
│  │   (ISR)      │  │  (Dynamic)   │                            │
│  │ revalidate   │  │              │                            │
│  │    300s      │  │              │                            │
│  └──────────────┘  └──────────────┘                            │
└────────────┬────────────────────────────┬──────────────────────┘
             │                            │
             ▼                            ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│   PRISMA ORM CLIENT     │  │    REDIS CACHE          │
│   Type-safe queries     │  │    (Port 6379)          │
│                         │  │                         │
└────────────┬────────────┘  └─────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│              POSTGRESQL DATABASE                         │
│                  (Port 5432)                            │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Users   │ │ Startups │ │ Comments │ │  Votes   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │   Tags   │ │Categories│ │   Team   │ │Bookmarks │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Rendering Flow Diagram

### Static Site Generation (SSG) - `/about`
```
Build Time:
┌──────────────┐
│  npm build   │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Fetch Data      │
│  (if needed)     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Generate HTML   │
│  (Static)        │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Store in        │
│  .next/server    │
└──────────────────┘

Request Time:
User → Server → Static HTML ⚡ (Instant)
```

### Server-Side Rendering (SSR) - `/dashboard`
```
Every Request:
User Request
     │
     ▼
┌──────────────────┐
│  Fetch from DB   │ ← Fresh data every time
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Render HTML     │
└──────┬───────────┘
       │
       ▼
User ← HTML Response

⏱️ Slower but always fresh
```

### Incremental Static Regeneration (ISR) - `/`
```
First Request (or after revalidation):
User Request
     │
     ▼
┌──────────────────┐
│  Serve cached    │
│  HTML (if valid) │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Background:     │
│  Regenerate if   │
│  expired (60s)   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Update cache    │
└──────────────────┘

⚡ Fast + Fresh (best of both worlds)
```

---

## Docker Architecture

```
┌───────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE                         │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              App Container (startupdiscovery-app)   │ │
│  │                                                     │ │
│  │  ┌───────────────────────────────────────────────┐ │ │
│  │  │         Multi-Stage Dockerfile                │ │ │
│  │  │                                               │ │ │
│  │  │  Stage 1: deps    → Install dependencies     │ │ │
│  │  │  Stage 2: builder → Build application        │ │ │
│  │  │  Stage 3: runner  → Production runtime       │ │ │
│  │  └───────────────────────────────────────────────┘ │ │
│  │                                                     │ │
│  │  Port: 3000                                         │ │
│  │  Network: startupdiscovery-network                  │ │
│  └─────────────────────┬───────────────────────────────┘ │
│                        │                                 │
│  ┌────────────────────┴─────────────────────────────┐   │
│  │                                                   │   │
│  ▼                                                   ▼   │
│  ┌─────────────────────┐      ┌──────────────────────┐  │
│  │  Database Container │      │   Redis Container    │  │
│  │  (startupdiscovery) │      │ (startupdiscovery-   │  │
│  │                     │      │      redis)          │  │
│  │  PostgreSQL 15      │      │   Redis 7 Alpine     │  │
│  │  Port: 5432         │      │   Port: 6379         │  │
│  │  Volume: postgres   │      │   Volume: redis      │  │
│  └─────────────────────┘      └──────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## CI/CD Pipeline Flow

```
┌────────────────────────────────────────────────────────────┐
│                      GITHUB PUSH                            │
└───────────────────────┬────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────┐
│              GITHUB ACTIONS TRIGGER                         │
└───────────────────────┬────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Lint &     │ │    Build     │ │   Docker     │
│   Format     │ │ Application  │ │   Build      │
│   Check      │ │              │ │   Test       │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ├────────────────┼────────────────┤
       │                │                │
       ▼                ▼                ▼
┌────────────────────────────────────────────────┐
│            ALL CHECKS PASS ✅                   │
└────────────────────────────────────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │  Ready to Merge  │
              └──────────────────┘
```

---

## Data Flow

### Homepage Request (ISR)
```
User Request
     │
     ▼
┌────────────────┐
│  Cache Check   │
└────┬───────────┘
     │
     ├─── If cached & valid → Return cached HTML ⚡
     │
     └─── If expired:
            │
            ▼
     ┌─────────────────┐
     │  Prisma Query   │
     │  Get Startups   │
     └────┬────────────┘
          │
          ▼
     ┌─────────────────┐
     │  PostgreSQL DB  │
     │  Return rows    │
     └────┬────────────┘
          │
          ▼
     ┌─────────────────┐
     │  Render HTML    │
     └────┬────────────┘
          │
          ▼
     ┌─────────────────┐
     │  Update Cache   │
     │  (60s TTL)      │
     └────┬────────────┘
          │
          ▼
     Return to User
```

### Dashboard Request (SSR)
```
User Request
     │
     ▼
┌────────────────────┐
│  No Cache Check    │
│  (force-dynamic)   │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│  Multiple Prisma   │
│  Queries           │
│  - Count startups  │
│  - Count users     │
│  - Get recent      │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│  PostgreSQL DB     │
│  Execute queries   │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│  Render HTML       │
│  with fresh data   │
└────┬───────────────┘
     │
     ▼
Return to User (always fresh!)
```

---

## File System Architecture

```
S81-1225-revolution-withNext.jsAndAWS-StartupDiscovery/
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # Automated testing
│
├── startupdiscovery/                 # Main application
│   ├── app/
│   │   ├── page.tsx                  # Homepage (ISR)
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles
│   │   ├── about/
│   │   │   └── page.tsx             # About (SSG)
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Dashboard (SSR)
│   │   ├── startups/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx         # Details (ISR)
│   │   │       └── not-found.tsx    # 404
│   │   └── api/
│   │       └── stats/
│   │           └── route.ts         # API endpoint
│   │
│   ├── lib/
│   │   └── prisma.ts                # Prisma singleton
│   │
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── seed.ts                  # Sample data
│   │
│   ├── Dockerfile                   # Production image
│   ├── .dockerignore                # Docker excludes
│   ├── next.config.ts               # Next.js config
│   ├── tsconfig.json                # TypeScript config
│   ├── .eslintrc.json               # ESLint config
│   ├── .prettierrc                  # Prettier config
│   └── package.json                 # Dependencies
│
├── docker-compose.yml               # Service orchestration
├── .env.example                     # Environment template
├── README.md                        # Main documentation
├── QUICK_START.md                   # Quick reference
├── COMPLETE_SETUP_GUIDE.md          # Detailed setup
├── DEPLOYMENT_CHECKLIST.md          # Production guide
└── PROJECT_STATUS.md                # Implementation status
```

---

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────┐
│              USER INTERFACE LAYER                    │
│  Next.js 15 • React 19 • Tailwind CSS • TypeScript  │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────┐
│           APPLICATION LOGIC LAYER                    │
│  Server Components • API Routes • Rendering Logic   │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────┐
│              DATA ACCESS LAYER                       │
│         Prisma ORM • Type-safe queries              │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────┐
│              PERSISTENCE LAYER                       │
│    PostgreSQL Database • Redis Cache                │
└─────────────────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────┐
│           INFRASTRUCTURE LAYER                       │
│  Docker • Docker Compose • GitHub Actions           │
└─────────────────────────────────────────────────────┘
```

---

## Performance Optimization Strategy

```
┌──────────────────────────────────────────────────────┐
│           PERFORMANCE TIER SYSTEM                     │
│                                                      │
│  Tier 1: Static (SSG)                               │
│  ├─ About page                                      │
│  └─ Cost: $0/month • Speed: Instant                 │
│                                                      │
│  Tier 2: Incremental Static (ISR)                   │
│  ├─ Homepage (60s revalidation)                     │
│  ├─ Startup pages (300s revalidation)               │
│  └─ Cost: Low • Speed: Very Fast                    │
│                                                      │
│  Tier 3: Server-Side (SSR)                          │
│  ├─ Dashboard                                       │
│  ├─ User-specific pages                             │
│  └─ Cost: Moderate • Speed: Fast • Always Fresh     │
│                                                      │
│  Tier 4: API Routes (Dynamic)                       │
│  ├─ REST endpoints                                  │
│  └─ Cost: Pay per request • Speed: Fast             │
└──────────────────────────────────────────────────────┘
```

---

This architecture demonstrates enterprise-grade design principles:
- ✅ Separation of concerns
- ✅ Scalability
- ✅ Performance optimization
- ✅ Cost efficiency
- ✅ Maintainability
