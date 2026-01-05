# 🚀 Quick Reference - API Endpoints

## Start Server
```bash
cd startupdiscovery
npm run dev
```
**Server**: http://localhost:3000

---

## 👥 Users API

### GET All Users
```bash
curl http://localhost:3000/api/users
```

### GET with Pagination
```bash
curl "http://localhost:3000/api/users?page=1&limit=2"
```

### GET with Filter
```bash
curl "http://localhost:3000/api/users?role=admin"
```

### POST Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","role":"user"}'
```

### PUT Update User
```bash
curl -X PUT http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"id":1,"name":"Alice Smith"}'
```

### DELETE User
```bash
curl -X DELETE http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"id":6}'
```

---

## 📝 Tasks API

### GET All Tasks
```bash
curl http://localhost:3000/api/tasks
```

### GET with Filters
```bash
curl "http://localhost:3000/api/tasks?status=in-progress&priority=high"
```

### POST Create Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task","description":"Task description","priority":"high"}'
```

### PUT Update Task
```bash
curl -X PUT http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"id":2,"status":"completed"}'
```

### DELETE Task
```bash
curl -X DELETE http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"id":6}'
```

---

## 🚀 Projects API

### GET All Projects
```bash
curl http://localhost:3000/api/projects
```

### GET with Budget Filter
```bash
curl "http://localhost:3000/api/projects?minBudget=40000&maxBudget=60000"
```

### POST Create Project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name":"New Project",
    "description":"Project description",
    "category":"Web",
    "budget":50000,
    "startDate":"2026-02-01",
    "owner":"John Doe"
  }'
```

### PUT Update Project
```bash
curl -X PUT http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"id":1,"status":"completed"}'
```

### DELETE Project
```bash
curl -X DELETE http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"id":6}'
```

---

## 📊 Common Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `page` | Page number (default: 1) | `?page=2` |
| `limit` | Items per page (max: 100) | `?limit=20` |
| `role` | Filter by role (users) | `?role=admin` |
| `status` | Filter by status | `?status=active` |
| `priority` | Filter by priority (tasks) | `?priority=high` |
| `search` | Text search | `?search=alice` |
| `minBudget` | Minimum budget (projects) | `?minBudget=40000` |
| `maxBudget` | Maximum budget (projects) | `?maxBudget=60000` |

---

## 🎯 Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 500 | Server Error | Internal error |

---

## 📁 File Locations

- **API Routes**: `app/api/{resource}/route.ts`
- **Documentation**: `API_DOCUMENTATION.md`
- **Test Results**: `API_TEST_RESULTS.md`
- **Assignment README**: `README_API_ASSIGNMENT.md`
- **Completion Summary**: `ASSIGNMENT_COMPLETION.md`
- **Test Script**: `test-api-endpoints.ps1`

---

## 🧪 Run Tests

```bash
# PowerShell
.\test-api-endpoints.ps1

# Or individual tests
curl http://localhost:3000/api/users
curl http://localhost:3000/api/tasks
curl http://localhost:3000/api/projects
```

---

## 💡 Pro Tips

1. Use `| jq` with curl for pretty JSON (if jq installed)
2. Combine multiple filters: `?status=active&priority=high`
3. Check pagination metadata for totalPages
4. Error messages include details for debugging
5. All POST/PUT/DELETE require `Content-Type: application/json`

---

**Need Help?** Check `API_DOCUMENTATION.md` for complete reference!
