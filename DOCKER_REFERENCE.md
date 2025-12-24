# 🐳 Docker Quick Reference - StartupDiscovery

## Essential Commands

### Build & Run
```bash
# Build and start all containers
docker-compose up --build

# Run in background (detached mode)
docker-compose up -d --build

# Build without starting
docker-compose build
```

### Verify & Monitor
```bash
# Check running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Check logs (all services)
docker-compose logs

# Check logs (specific service)
docker-compose logs app
docker-compose logs db
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f app

# Check resource usage
docker stats
```

### Stop & Clean
```bash
# Stop containers (keeps volumes)
docker-compose down

# Stop and remove volumes (DELETES DATA)
docker-compose down -v

# Restart specific service
docker-compose restart app
```

### Debug & Execute
```bash
# Execute command in running container
docker exec -it startupdiscovery-app sh

# Check PostgreSQL database
docker exec -it startupdiscovery-db psql -U postgres -d startupdiscovery

# Test Redis connection
docker exec -it startupdiscovery-redis redis-cli ping

# View container environment variables
docker exec startupdiscovery-app env
```

### Maintenance
```bash
# Check disk usage
docker system df

# Clean unused resources
docker system prune

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes (WARNING: DATA LOSS)
docker volume prune
```

## Verification Checklist

✅ **Step 1:** Build successful
```bash
docker-compose build
# Expected: "Successfully built" message
```

✅ **Step 2:** Containers running
```bash
docker ps
# Expected: 3 containers (app, db, redis) with "Up" status
```

✅ **Step 3:** App accessible
```bash
curl http://localhost:3000
# Expected: HTML response
```

✅ **Step 4:** Database ready
```bash
docker-compose logs db | grep "ready to accept connections"
# Expected: Success message
```

✅ **Step 5:** Redis ready
```bash
docker exec startupdiscovery-redis redis-cli ping
# Expected: PONG
```

## Troubleshooting

### Port conflicts
```bash
# Find what's using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database not ready
```bash
# Wait and restart app
docker-compose restart app
```

### Clear everything and start fresh
```bash
docker-compose down -v
docker system prune -f
docker-compose up --build
```

## Evidence Screenshots for Kalvium

1. **Build Output:** `docker-compose build`
2. **Running Containers:** `docker ps`
3. **Browser:** `http://localhost:3000`
4. **Logs:** `docker-compose logs app`
5. **Database:** `docker exec -it startupdiscovery-db psql -U postgres -c "\l"`
