# 🚀 StartupDiscovery

**Advanced Data Fetching with Next.js App Router (SSG, SSR & Hybrid Rendering)**

## 📌 Project Overview

**StartupDiscovery** is an enterprise-ready full-stack web application built with **Next.js App Router**.
The platform allows users to discover startups, submit their own startup pitches, and explore ideas in real time.

This project demonstrates **advanced rendering strategies** in Next.js:

**Static Site Generation (SSG)**
**Server-Side Rendering (SSR)**
**Hybrid Rendering using Incremental Static Regeneration (ISR)**

The goal of this assignment is to understand **when and why** to use each rendering mode and how it impacts **performance, scalability, and cost**.


## 🧠 Rendering Strategies Used

### 1️⃣ Static Rendering (SSG)

**Page:** /about
**Rendering Mode:** Static Site Generation
**Configuration:**

js
export const revalidate = false;



**Why Static Rendering?**

The About page contains **static content** that rarely changes.
Pre-rendered at **build time**.
Served as plain HTML → **fastest possible load time**.

**Benefits:**

Excellent performance (low TTFB)
Zero server load after deployment
Ideal for marketing or informational pages


### 2️⃣ Dynamic Rendering (SSR)

**Page:** /dashboard or /profile
**Rendering Mode:** Server-Side Rendering
**Configuration:**

js
export const dynamic = 'force-dynamic';



**Data Fetching Example:**

js
const data = await fetch('https://api.example.com/user-data', {
  cache: 'no-store'
});



**Why Dynamic Rendering?**

Displays **user-specific data** (profile info, submitted startups).
Must always show the **latest real-time data**.
Cannot be cached safely.

**Benefits:**

Always fresh data
Ideal for authenticated pages
Accurate user-specific responses

**Trade-off:**

Higher server cost
Slightly slower than static pages


### 3️⃣ Hybrid Rendering (ISR)

**Page:** / (Homepage – Startup Listings)
**Rendering Mode:** Incremental Static Regeneration
**Configuration:**

js
export const revalidate = 60;



**Why Hybrid Rendering?**

Startup listings change frequently, but **not every second**.
Page is **static by default** and regenerates every 60 seconds.
Combines performance of SSG with freshness of SSR.

**Benefits:**

Fast initial load
Reduced server requests
Near real-time updates
Ideal for feeds, directories, and listings


## ⚙️ Caching & Performance Impact

| Rendering Type | Cache Behavior           | Performance Impact  |
| -------------- | ------------------------ | ------------------- |
| SSG            | Cached forever           | 🚀 Fastest          |
| SSR            | No cache                 | 🐢 Slower but fresh |
| ISR            | Cached with revalidation | ⚡ Balanced          |

By choosing the correct rendering strategy:

Server load is reduced
Cost is optimized
User experience improves significantly


## 🔍 Verification Using DevTools

**Static pages** load instantly without refetching data.
**Dynamic pages** show network requests on every reload.
**Hybrid pages** fetch data only after revalidation time expires.

Network Tab and console logs were used to verify:

Build-time rendering (SSG)
Request-time rendering (SSR)
Background regeneration (ISR)


## 📈 Scalability Reflection

**What if StartupDiscovery had 10× more users?**

Using **SSR everywhere** would:

  * Increase server load
  * Increase cloud costs
  * Slow down response times

**Optimized Strategy:**

Use **SSG** for static pages
Use **ISR** for public content and listings
Use **SSR only where necessary** (authenticated pages)

This hybrid approach ensures **scalability, performance, and cost-efficiency**.


## ✅ Key Learnings

Rendering strategy directly impacts **performance and cost**
Static rendering should be the default when possible
SSR should be used **selectively**
ISR is the best choice for scalable real-world applications
Next.js App Router provides fine-grained control over caching and rendering


## 📌 Conclusion

This assignment helped build a **performance-optimized, production-ready application** by applying real-world rendering strategies.
Choosing the right data fetching method is not just a technical decision — it’s a **product and business decision**.






## ☁️ Understanding Cloud Deployments: Docker → CI/CD → AWS/Azure

This section documents my learning and implementation of **cloud deployment fundamentals**, covering how **StartupDiscovery** can be taken from a local development environment to a **cloud-ready, automated, and scalable deployment** using **Docker, CI/CD pipelines, and cloud platforms like AWS or Azure**.

---

## 🐳 Docker: Containerizing the Application

### What is Docker?

Docker allows us to package an application along with its dependencies into a **container**, ensuring it runs the same way across all environments (development, staging, production).

### How StartupDiscovery Was Containerized

A **Dockerfile** was created to define how the application image is built.

Example (simplified):

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Why Docker?

* Eliminates “works on my machine” issues
* Ensures consistent runtime across environments
* Makes cloud deployment predictable and portable

---

## 🔁 CI/CD: Automating Build & Deployment

### What is CI/CD?

CI/CD (Continuous Integration / Continuous Deployment) automates the process of:

1. Building the application
2. Running checks
3. Deploying it to the cloud

### CI/CD Using GitHub Actions

For **StartupDiscovery**, GitHub Actions is used to automate builds.

Example workflow:

```yaml
name: CI Pipeline

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: npm install

      - name: Build application
        run: npm run build
```

### Benefits of CI/CD

* Reduces manual deployment errors
* Ensures every commit is tested and build-ready
* Enables faster and safer releases

---

## ☁️ Cloud Deployment: AWS / Azure Overview

### Deployment Options Studied

The following cloud services were explored conceptually:

#### AWS

* **EC2** – Virtual servers for running Docker containers
* **Elastic Beanstalk** – Simplified deployment and scaling
* **S3** – Static asset storage
* **IAM & Secrets Manager** – Secure credentials management

#### Azure

* **Azure App Service** – Managed web application hosting
* **Azure Container Registry (ACR)** – Store Docker images
* **Azure Key Vault** – Secure secret storage

### Deployment Flow (High-Level)

```
Local Code
   ↓
Docker Image
   ↓
GitHub Actions (CI/CD)
   ↓
Cloud Platform (AWS / Azure)
```

This pipeline ensures **automation, security, and scalability**.

---

## 🔐 Environment Variables & Secrets Management

Sensitive data such as:

* Database URLs
* OAuth credentials
* API keys

are **never hardcoded**.

### How Secrets Are Handled

* Stored securely using **GitHub Secrets**
* Injected during CI/CD builds
* Environment-specific values for dev / staging / production

This prevents accidental leaks and keeps the repository secure.

---

## 🧠 Reflection & Learnings

### What Worked Well

* Docker made deployments predictable and portable
* CI/CD automation reduced manual effort
* Separating environments improved reliability

### Challenges Faced

* Understanding Docker build layers
* Debugging missing environment variables
* Learning how CI/CD injects secrets securely

### What I Would Improve Next

* Add automated tests in the CI pipeline
* Use Infrastructure as Code (Terraform)
* Deploy fully to AWS ECS or Azure App Service

---

## 🎥 Video Walkthrough

A 3–5 minute video walkthrough was recorded covering:

* Dockerfile explanation
* CI/CD workflow using GitHub Actions
* Cloud deployment concepts (AWS / Azure)
* Challenges faced and debugging steps

📎 **Video Link:**
👉 *(Google Drive – Anyone with the link can view)*

---

## 🎯 Final Takeaway

This lesson helped me understand how modern applications are:

* **Containerized with Docker**
* **Automated using CI/CD**
* **Deployed securely to the cloud**

These practices are essential for **real-world, production-ready software systems** and form the foundation of modern DevOps workflows.

---

## 🔀 GitHub Collaboration Workflow

This project implements a **professional team branching and pull request workflow** to ensure code quality, collaboration, and maintainability. This section documents the workflow, guidelines, and reflection on how it improves development.

---

### 📋 Branching Strategy

All development work follows a **structured branching convention** to maintain clarity and organization.

#### Branch Naming Format

```
<type>/<descriptive-name>
```

#### Branch Types

| Type | Purpose | Example |
|------|---------|---------|
| `feature/` | New functionality or enhancements | `feature/startup-listing-page` |
| `fix/` | Bug fixes and error corrections | `fix/navbar-mobile-overflow` |
| `chore/` | Maintenance, refactoring, dependencies | `chore/update-dependencies` |
| `docs/` | Documentation updates | `docs/setup-instructions` |

**Why this matters:**
- Clear intent from branch name alone
- Easy to filter and search branches
- Maintains organized repository structure
- Professional standard in real-world teams

📖 **Full Guide:** [`.github/BRANCHING_GUIDE.md`](.github/BRANCHING_GUIDE.md)

---

### 📝 Pull Request Workflow

Every code change goes through a **Pull Request (PR)** process before merging to `main`.

#### PR Template

A standardized PR template is automatically loaded when creating pull requests:

- **Summary** – What this PR does
- **Changes Made** – Detailed list of modifications
- **Type of Change** – Feature, fix, chore, or docs
- **Screenshots/Evidence** – Visual proof of changes
- **Checklist** – Build passes, lint clean, self-reviewed
- **Testing Done** – How changes were verified

**Why this matters:**
- Ensures complete documentation of every change
- Forces developers to think through their work
- Provides clear context for reviewers
- Creates searchable history of project evolution

📄 **Template:** [`.github/pull_request_template.md`](.github/pull_request_template.md)

---

### ✅ Code Review Checklist

Every PR undergoes review using a **standardized checklist** covering:

#### Code Quality
- Readable, well-organized code
- No duplication
- Proper TypeScript usage
- Component structure follows best practices

#### Functionality
- Changes work as intended
- Edge cases handled
- No new bugs introduced

#### Standards
- ESLint checks pass
- Build succeeds
- No console errors/warnings

#### Security
- No exposed secrets
- Secure coding practices
- Dependencies up to date

#### Documentation
- Complex logic has comments
- PR description is complete
- README updated if needed

**Why this matters:**
- Catches bugs before they reach production
- Maintains consistent code quality
- Shares knowledge across the team
- Prevents technical debt

📋 **Full Checklist:** [`.github/CODE_REVIEW_CHECKLIST.md`](.github/CODE_REVIEW_CHECKLIST.md)

---

### 🛡️ Branch Protection Rules

The `main` branch is protected with the following rules:

#### 1. Require Pull Request Reviews
- At least **1 approval** required before merging
- No direct pushes to `main`
- Dismiss stale reviews when new commits are pushed

**Impact:** Ensures all code is peer-reviewed before going to production

#### 2. Require Status Checks
- Build must pass
- ESLint must pass
- All automated checks must succeed

**Impact:** Prevents broken code from reaching `main`

#### 3. Require Up-to-Date Branches
- Branch must include latest `main` changes before merging
- Prevents merge conflicts and integration issues

**Impact:** Ensures smooth, conflict-free merges

#### 4. No Bypass for Administrators
- Rules apply to everyone, including project leads
- Consistency across all contributors

**Impact:** Same standards for all team members

**Why this matters:**
- Protects production code from accidental errors
- Enforces quality gates automatically
- Creates accountability through review process
- Prevents shortcuts that lead to bugs

📖 **Detailed Guide:** [`.github/BRANCH_PROTECTION.md`](.github/BRANCH_PROTECTION.md)

---

### 🔄 Complete Workflow Example

```bash
# 1. Start from main branch
git checkout main
git pull origin main

# 2. Create feature branch following naming convention
git checkout -b feature/investor-dashboard

# 3. Make changes and commit
git add .
git commit -m "Add investor dashboard with analytics view"

# 4. Push branch to GitHub
git push origin feature/investor-dashboard

# 5. Create Pull Request on GitHub
# - PR template auto-loads
# - Fill in all sections
# - Add screenshots

# 6. Automated checks run
# - Build check
# - Lint check
# - All must pass ✅

# 7. Request review from teammate
# - Reviewer uses code review checklist
# - Provides feedback or approves

# 8. Address feedback (if any)
git add .
git commit -m "Address review feedback: optimize query"
git push origin feature/investor-dashboard

# 9. Merge after approval
# - Click "Merge pull request"
# - Delete branch after merge

# 10. Update local main
git checkout main
git pull origin main
```

---

### 📸 Evidence & Documentation

To demonstrate this workflow implementation, the following evidence is captured:

1. ✅ Branch protection rules screenshot
2. ✅ Pull request with status checks passing
3. ✅ Code review approval
4. ✅ Successfully merged PR
5. ✅ Branch naming examples
6. ✅ PR template in use

📖 **Evidence Guide:** [`.github/EVIDENCE_GUIDE.md`](.github/EVIDENCE_GUIDE.md)

---

### 🎓 Reflection: How This Workflow Improves Development

#### 1. Code Quality

**Before:**
- Code could be pushed directly to `main` without review
- Bugs could slip through unnoticed
- Inconsistent code style
- No automated quality checks

**After:**
- Every line of code is reviewed by at least one other developer
- ESLint enforces consistent style automatically
- Build checks prevent broken code from merging
- Higher overall code quality and fewer production bugs

**Real Impact:** Bugs are caught during review instead of in production, saving debugging time and preventing user-facing issues.

---

#### 2. Team Collaboration

**Before:**
- No visibility into what others are working on
- Unclear change history
- Difficult to understand why changes were made
- Knowledge siloed within individuals

**After:**
- PRs provide clear documentation of all changes
- Team members learn from each other's code during reviews
- Discussion threads capture decision-making context
- Knowledge sharing through code review process

**Real Impact:** The whole team understands the codebase better. New members can read PR history to understand project evolution.

---

#### 3. Development Velocity

**Before:**
- Bugs discovered late in development or production
- Time wasted fixing preventable issues
- Unclear what's safe to change
- Fear of breaking things slows development

**After:**
- Issues caught early in PR review stage (cheaper to fix)
- Automated checks provide fast feedback
- Confidence to make changes knowing reviews will catch issues
- Protected `main` branch means it's always deployable

**Real Impact:** Although reviews add a step, they save time overall by preventing bugs, reducing debugging, and enabling confident iteration.

---

#### 4. Accountability & Professionalism

**Before:**
- Hard to track who changed what and why
- No formal approval process
- Inconsistent documentation

**After:**
- Clear authorship and approval trail
- Every change documented and justified
- Professional development practices
- Portfolio-ready project structure

**Real Impact:** This workflow demonstrates professional software engineering practices, making the project suitable for portfolios, job interviews, and real-world team environments.

---

### 🚀 Key Learnings

1. **Code review is not about finding fault** – it's about improving code quality and sharing knowledge
2. **Branch protection prevents mistakes** – automated checks catch errors humans might miss
3. **Structured workflows enable scale** – what works for 2 developers works for 20
4. **Documentation through PRs creates living project history** – future developers can understand why decisions were made
5. **Small overhead, massive long-term benefit** – spending 5 minutes on a PR review prevents hours of debugging

---

### 📚 Documentation Index

All workflow documentation is located in `.github/`:

- [`BRANCHING_GUIDE.md`](.github/BRANCHING_GUIDE.md) – Branch naming conventions and examples
- [`pull_request_template.md`](.github/pull_request_template.md) – Auto-loaded PR template
- [`CODE_REVIEW_CHECKLIST.md`](.github/CODE_REVIEW_CHECKLIST.md) – Comprehensive review guidelines
- [`BRANCH_PROTECTION.md`](.github/BRANCH_PROTECTION.md) – Branch protection setup and rationale
- [`EVIDENCE_GUIDE.md`](.github/EVIDENCE_GUIDE.md) – Screenshot and documentation requirements

---

### 🎯 Workflow Principles

This GitHub workflow is built on these core principles:

1. **Quality over speed** – Take time to review, but maintain momentum
2. **Automation over manual checks** – Let tools do the repetitive work
3. **Transparency over silos** – Everything is visible and documented
4. **Collaboration over individual work** – Multiple eyes make better code
5. **Prevention over fixing** – Catch issues before they become problems

By implementing this professional workflow, **StartupDiscovery** demonstrates production-ready development practices aligned with industry standards and team collaboration best practices.

---

## 🐳 Docker & Docker Compose Setup

**StartupDiscovery** uses Docker and Docker Compose to create a consistent, reproducible development environment. This ensures that the application runs the same way on every developer's machine and in production.

### 📦 What is Docker?

Docker packages your application and all its dependencies into a **container** – a lightweight, standalone executable unit that runs consistently across different environments.

**Benefits:**
- ✅ **Consistency:** "Works on my machine" becomes "Works everywhere"
- ✅ **Isolation:** Each service runs in its own container
- ✅ **Portability:** Easy to deploy to any cloud platform
- ✅ **Team Collaboration:** Everyone uses identical environments

---

### 🏗️ Architecture Overview

Our Docker setup includes **3 services**:

```
┌─────────────────────────────────────────────────┐
│              startupdiscovery-network            │
│                  (Bridge Network)                │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────┐│
│  │   Next.js    │  │  PostgreSQL  │  │ Redis  ││
│  │     App      │  │      DB      │  │ Cache  ││
│  │  Port: 3000  │  │  Port: 5432  │  │  6379  ││
│  └──────────────┘  └──────────────┘  └────────┘│
│         │                 │                │    │
│         └─────── depends_on ──────────────┘    │
│                                                  │
│  Volumes: postgres-data, redis-data             │
└─────────────────────────────────────────────────┘
```

---

### 📄 Dockerfile Explanation

**Location:** `startupdiscovery/Dockerfile`

The Dockerfile uses a **multi-stage build** approach to create an optimized production image.

#### **Stage 1: Dependencies**
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production
```

**What it does:**
- Starts with lightweight Node.js 20 Alpine Linux image (~50MB vs ~900MB for full Node)
- Sets `/app` as working directory
- Copies only package files (leverages Docker layer caching)
- Installs production dependencies only using `npm ci` (faster, reproducible)

**Why multi-stage?** Keeps final image small by excluding build tools and dev dependencies.

---

#### **Stage 2: Builder**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build
```

**What it does:**
- Creates fresh stage for building
- Installs all dependencies (including devDependencies needed for build)
- Copies entire application source code
- Builds Next.js app (`npm run build` creates optimized `.next` folder)

**Why separate stage?** Build dependencies (~200MB) are discarded after build completes.

---

#### **Stage 3: Runner (Production)**
```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**What it does:**
- Creates final production image
- Sets `NODE_ENV=production` for optimizations
- Creates `nextjs` user (security best practice – don't run as root)
- Copies **only** built files from builder stage (not source code)
- Changes file ownership to `nextjs` user
- Exposes port 3000 for external access
- Starts app using `node server.js` (Next.js standalone server)

**Why standalone output?** Next.js bundles everything needed into a single folder, reducing image size and startup time.

---

### 🐙 Docker Compose Explanation

**Location:** `docker-compose.yml` (root directory)

Docker Compose orchestrates multiple containers as a single application.

#### **Service 1: Next.js App (`app`)**
```yaml
app:
  container_name: startupdiscovery-app
  build:
    context: ./startupdiscovery
    dockerfile: Dockerfile
  ports:
    - "3000:3000"
  environment:
    - DATABASE_URL=postgresql://postgres:postgres@db:5432/startupdiscovery
    - REDIS_URL=redis://redis:6379
  depends_on:
    - db
    - redis
  networks:
    - startupdiscovery-network
  restart: unless-stopped
```

**What it does:**
- Builds Docker image from `startupdiscovery/Dockerfile`
- Maps host port 3000 to container port 3000 (`host:container`)
- Injects environment variables (DATABASE_URL, REDIS_URL)
- Waits for `db` and `redis` to start before starting app
- Connects to shared network
- Automatically restarts if crashes (but not if manually stopped)

**Environment Variables:**
- `DATABASE_URL`: Connection string to PostgreSQL (uses service name `db` as hostname)
- `REDIS_URL`: Connection string to Redis (uses service name `redis` as hostname)

---

#### **Service 2: PostgreSQL Database (`db`)**
```yaml
db:
  container_name: startupdiscovery-db
  image: postgres:15-alpine
  ports:
    - "5432:5432"
  environment:
    - POSTGRES_USER=postgres
    - POSTGRES_PASSWORD=postgres
    - POSTGRES_DB=startupdiscovery
  volumes:
    - postgres-data:/var/lib/postgresql/data
  networks:
    - startupdiscovery-network
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 10s
    timeout: 5s
    retries: 5
```

**What it does:**
- Uses official PostgreSQL 15 Alpine image (production-ready database)
- Exposes port 5432 for database connections
- Creates database named `startupdiscovery` with user `postgres`
- Mounts named volume `postgres-data` for **data persistence**
- Health check verifies database is ready before app connects

**Volume (`postgres-data`):**
- Stores database data outside container
- Data survives container restarts and deletions
- Located in Docker's volume directory (`/var/lib/docker/volumes/`)

---

#### **Service 3: Redis Cache (`redis`)**
```yaml
redis:
  container_name: startupdiscovery-redis
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis-data:/data
  networks:
    - startupdiscovery-network
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 3s
    retries: 5
```

**What it does:**
- Uses official Redis 7 Alpine image (in-memory cache/database)
- Exposes port 6379 for Redis connections
- Mounts `redis-data` volume for persistence (optional but recommended)
- Health check pings Redis to verify it's ready

---

### 🌐 Networking Explained

```yaml
networks:
  startupdiscovery-network:
    driver: bridge
```

**What is a bridge network?**
- Creates isolated network for containers to communicate
- Containers can reach each other using **service names** as hostnames
- Example: App connects to `db:5432` instead of `localhost:5432`
- External access requires port mapping (`ports` configuration)

**Why use custom network?**
- Security: Containers only talk to each other, not other Docker containers
- DNS: Automatic service name resolution
- Isolation: Clean separation from other projects

---

### 💾 Volumes Explained

```yaml
volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
```

**What are volumes?**
- Persistent storage managed by Docker
- Survive container deletions and restarts
- Stored outside container filesystem

**Without volumes:** Deleting container = losing all data  
**With volumes:** Deleting container = data preserved

**Location:** `/var/lib/docker/volumes/` on host machine

---

### 🚀 Running the Application

#### **1. Build and Start Containers**
```bash
docker-compose up --build
```

**What happens:**
1. Builds Next.js Docker image (first time: 3-5 minutes)
2. Pulls PostgreSQL and Redis images from Docker Hub
3. Creates network and volumes
4. Starts all three containers
5. Shows combined logs from all services

**Flags:**
- `--build`: Forces rebuild (use after code changes)
- `-d`: Detached mode (runs in background)

---

#### **2. Verify Running Containers**
```bash
docker ps
```

**Expected output:**
```
CONTAINER ID   IMAGE                    STATUS         PORTS                    NAMES
abc123def456   startupdiscovery-app     Up 30 seconds  0.0.0.0:3000->3000/tcp   startupdiscovery-app
def456ghi789   postgres:15-alpine       Up 35 seconds  0.0.0.0:5432->5432/tcp   startupdiscovery-db
ghi789jkl012   redis:7-alpine           Up 35 seconds  0.0.0.0:6379->6379/tcp   startupdiscovery-redis
```

**What to check:**
- ✅ STATUS shows "Up X seconds/minutes"
- ✅ All three containers are listed
- ✅ Ports are correctly mapped

---

#### **3. Access the Application**
```bash
# Open browser
http://localhost:3000

# Or test with curl
curl http://localhost:3000
```

**What to verify:**
- ✅ App loads without errors
- ✅ No connection errors in logs
- ✅ Database connection successful (check logs)

---

#### **4. Stop Containers**
```bash
# Stop and remove containers (keeps volumes)
docker-compose down

# Stop, remove containers AND volumes (deletes data)
docker-compose down -v
```

---

#### **5. View Logs**
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs app
docker-compose logs db
docker-compose logs redis

# Follow logs (real-time)
docker-compose logs -f app
```

---

### 🛠️ Common Issues & Solutions

#### **Issue 1: Port Already in Use**
**Error:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use
```

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 on host
```

---

#### **Issue 2: Slow Build Times**
**Problem:** First build takes 5-10 minutes

**Solutions:**
- ✅ **Normal for first build** – subsequent builds use cache (~30 seconds)
- ✅ Don't change `package.json` unnecessarily (breaks cache)
- ✅ Use `.dockerignore` to exclude `node_modules`, `.next`, etc.

**Check cache usage:**
```bash
docker-compose build --progress=plain
```

---

#### **Issue 3: Database Connection Failed**
**Error:**
```
Error: connect ECONNREFUSED db:5432
```

**Solution:**
```bash
# Wait for health check to pass
docker-compose logs db

# Look for:
# "database system is ready to accept connections"

# Restart app service
docker-compose restart app
```

**Why it happens:** App starts before database is ready. Health checks minimize this, but rare timing issues can occur.

---

#### **Issue 4: Changes Not Reflected**
**Problem:** Code changes don't appear in running container

**Solution:**
```bash
# Rebuild image
docker-compose up --build

# Or rebuild specific service
docker-compose build app
docker-compose up -d
```

**Why:** Production build requires rebuild (unlike `npm run dev` hot reload).

---

#### **Issue 5: Out of Disk Space**
**Problem:** Docker images/volumes consume too much space

**Solution:**
```bash
# Check disk usage
docker system df

# Clean unused images, containers, networks
docker system prune

# Clean volumes (WARNING: deletes data)
docker volume prune
```

---

### 📸 Evidence for Kalvium Submission

#### **Screenshot 1: Successful Build**
```bash
docker-compose build
```

**Capture:**
- ✅ All build stages completing (deps → builder → runner)
- ✅ "Successfully built" message
- ✅ Image ID displayed

---

#### **Screenshot 2: Running Containers**
```bash
docker ps
```

**Capture:**
- ✅ All 3 containers running (app, db, redis)
- ✅ Correct port mappings
- ✅ "Up X seconds" status

---

#### **Screenshot 3: Application Running**
**Capture browser showing:**
- ✅ `http://localhost:3000` loaded successfully
- ✅ No console errors
- ✅ App rendering correctly

---

#### **Screenshot 4: Container Logs**
```bash
docker-compose logs app
```

**Capture:**
- ✅ "Server started on http://0.0.0.0:3000"
- ✅ No error messages
- ✅ Successful database/Redis connections (if applicable)

---

#### **Screenshot 5: Database Connection**
```bash
docker exec -it startupdiscovery-db psql -U postgres -d startupdiscovery -c "\l"
```

**Capture:**
- ✅ Database `startupdiscovery` exists
- ✅ Connection successful

---

### 🧠 Reflection: Why Docker Compose Improves Team Consistency

#### **Before Docker:**
- ❌ "Works on my machine" syndrome
- ❌ Manual installation of PostgreSQL, Redis, Node.js
- ❌ Version mismatches (Node 18 vs 20, Postgres 14 vs 15)
- ❌ Different OS configurations (macOS vs Linux vs Windows)
- ❌ 30-60 minute setup time for new developers

#### **After Docker:**
- ✅ Single command: `docker-compose up`
- ✅ Identical environments for all developers
- ✅ Zero dependency installation on host machine
- ✅ Works across macOS, Linux, Windows (WSL2)
- ✅ 5-minute setup time (download images once)

---

#### **Real-World Benefits:**

**1. Onboarding Speed:**
New team member runs:
```bash
git clone <repo>
docker-compose up
```
→ Fully working environment in minutes

**2. Debugging Consistency:**
- Bug reported on dev machine
- Reproduce exact environment with Docker
- No "can't reproduce on my machine" issues

**3. Production Parity:**
- Development = Production (same Node version, DB version)
- Reduces deployment surprises
- Easier to debug production issues locally

**4. Dependency Isolation:**
- Multiple projects can use different versions
- No global dependency conflicts
- Clean machine after project ends

**5. CI/CD Integration:**
- Same Docker image used in testing and production
- Predictable deployments
- Faster pipeline execution

---

### 🎯 Key Takeaways

1. **Docker containers = consistent environments everywhere**
2. **Multi-stage builds = smaller, faster images**
3. **Docker Compose = orchestrate multiple services easily**
4. **Volumes = data persistence across restarts**
5. **Networks = secure inter-service communication**
6. **Health checks = reliable startup ordering**

By containerizing **StartupDiscovery**, we ensure every developer, tester, and deployment environment runs the exact same application stack – eliminating environment-related bugs and accelerating development velocity.

