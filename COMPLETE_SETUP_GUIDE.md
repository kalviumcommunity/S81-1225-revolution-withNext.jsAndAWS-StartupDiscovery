# 🚀 Complete Setup & Deployment Guide

## Quick Start (For Development)

### Prerequisites
- Node.js 20+
- Docker Desktop (for database)
- Git

### 1. Clone and Install

```bash
git clone https://github.com/kalviumcommunity/S81-1225-revolution-withNext.jsAndAWS-StartupDiscovery.git
cd S81-1225-revolution-withNext.jsAndAWS-StartupDiscovery/startupdiscovery
npm install
```

### 2. Set Up Environment

```bash
# Already done - .env file is copied from .env.example
# Verify the .env file contains correct database URLs
```

### 3. Start Database with Docker

```bash
# From the root directory (not startupdiscovery folder)
cd ..
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379

### 4. Initialize Database

```bash
# Return to startupdiscovery folder
cd startupdiscovery

# Generate Prisma Client (already done)
npx prisma generate

# Run migrations to create database schema
npx prisma migrate dev --name init

# Seed database with sample data
npm run prisma:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## 📁 Project Structure

```
startupdiscovery/
├── app/
│   ├── page.tsx              # Homepage (ISR - revalidate: 60)
│   ├── about/
│   │   └── page.tsx          # About page (SSG - revalidate: false)
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard (SSR - dynamic)
│   └── startups/
│       └── [slug]/
│           ├── page.tsx      # Startup details (ISR - revalidate: 300)
│           └── not-found.tsx # 404 page
├── lib/
│   └── prisma.ts             # Prisma client singleton
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Sample data
└── .env                      # Environment variables
```

---

## 🎯 Rendering Strategies Implemented

### 1. Static Site Generation (SSG) - `/about`
```typescript
export const revalidate = false;
```
- Pre-rendered at build time
- Never changes after build
- Fastest possible load time
- Perfect for static content

### 2. Incremental Static Regeneration (ISR) - `/` (Homepage)
```typescript
export const revalidate = 60;
```
- Initially static
- Revalidates every 60 seconds
- Best balance of performance and freshness
- Ideal for startup listings

### 3. Server-Side Rendering (SSR) - `/dashboard`
```typescript
export const dynamic = 'force-dynamic';
```
- Rendered on every request
- Always shows latest data
- Perfect for user-specific dashboards
- No caching

### 4. ISR with Longer Interval - `/startups/[slug]`
```typescript
export const revalidate = 300;
```
- Revalidates every 5 minutes
- Good for individual pages with moderate update frequency

---

## 🐳 Docker Deployment

### Build and Run Everything

```bash
# From project root
docker-compose build
docker-compose up
```

This builds and starts:
1. **app** - Next.js application on port 3000
2. **db** - PostgreSQL database
3. **redis** - Redis cache

### Docker Commands

```bash
# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build

# Clean restart (removes volumes/data)
docker-compose down -v
docker-compose up --build
```

---

## 🔧 Database Management

### Run Migrations
```bash
npx prisma migrate dev
```

### Reset Database
```bash
npx prisma migrate reset
```

### Open Prisma Studio (Database GUI)
```bash
npx prisma studio
```

### Seed Database
```bash
npm run prisma:seed
```

---

## ✅ Code Quality

### Linting
```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
```

### Formatting
```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

### Type Checking
```bash
npm run type-check
```

### Pre-commit Hooks
Husky automatically runs on every commit:
- ESLint
- Prettier
- Type checking

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Next.js)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Option 2: Docker (AWS/Azure/DigitalOcean)

1. Build Docker image:
   ```bash
   docker build -t startupdiscovery ./startupdiscovery
   ```

2. Push to container registry:
   ```bash
   docker tag startupdiscovery your-registry/startupdiscovery
   docker push your-registry/startupdiscovery
   ```

3. Deploy to cloud platform (EC2, ECS, App Service, etc.)

### Option 3: Self-Hosted with Docker Compose

```bash
# On production server
git clone <repo>
cd S81-1225-revolution-withNext.jsAndAWS-StartupDiscovery
docker-compose up -d
```

---

## 🔐 Environment Variables (Production)

Update `.env` for production:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@your-db-host:5432/startupdiscovery
REDIS_URL=redis://your-redis-host:6379
JWT_SECRET=<generate-strong-random-secret>
SESSION_SECRET=<generate-strong-random-secret>
```

---

## 📊 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push:

1. **Lint & Format Check** - Ensures code quality
2. **Type Check** - TypeScript validation
3. **Build** - Verifies application builds successfully
4. **Docker Build** - Tests Docker image creation

---

## 🧪 Testing the Application

### 1. Test Homepage (ISR)
- Visit http://localhost:3000
- Should show startup listings
- Data refreshes every 60 seconds

### 2. Test About Page (SSG)
- Visit http://localhost:3000/about
- Static content, never changes
- Ultra-fast load time

### 3. Test Dashboard (SSR)
- Visit http://localhost:3000/dashboard
- Shows real-time statistics
- Refresh to see updated timestamp

### 4. Test Startup Details
- Visit http://localhost:3000/startups/cloudsync-pro
- View full startup details
- Revalidates every 5 minutes

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
docker-compose restart db

# View database logs
docker-compose logs db
```

### Prisma Errors
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset and reseed database
npx prisma migrate reset
npm run prisma:seed
```

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in package.json
"dev": "next dev -p 3001"
```

### Docker Issues
```bash
# Clean Docker system
docker system prune -f

# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

---

## 📚 Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **Docker Documentation**: https://docs.docker.com
- **GitHub Actions**: https://docs.github.com/en/actions

---

## ✨ Features Implemented

✅ Homepage with startup listings (ISR)
✅ About page (SSG)
✅ Dashboard with real-time stats (SSR)
✅ Individual startup pages (ISR)
✅ PostgreSQL database with Prisma ORM
✅ Redis caching support
✅ Docker containerization
✅ Docker Compose orchestration
✅ GitHub Actions CI/CD
✅ Code quality tools (ESLint, Prettier, Husky)
✅ TypeScript type safety
✅ Comprehensive documentation

---

## 🎓 Learning Outcomes

This project demonstrates:
- Advanced Next.js rendering strategies (SSG, SSR, ISR)
- Production-ready Docker setup
- Database design and ORM usage
- CI/CD automation
- Code quality best practices
- Environment configuration
- Cloud deployment readiness

**Ready for submission to Kalvium!** 🎉
