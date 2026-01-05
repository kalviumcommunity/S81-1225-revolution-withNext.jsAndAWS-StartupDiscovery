# RESTful API Documentation

## Overview

This project implements a comprehensive RESTful API structure using Next.js file-based routing. The API follows industry best practices including consistent naming conventions, proper HTTP method usage, pagination, filtering, and robust error handling.

## API Architecture

### Directory Structure

```
app/api/
├── users/
│   └── route.ts
├── tasks/
│   └── route.ts
└── projects/
    └── route.ts
```

Each `route.ts` file implements multiple HTTP verbs (GET, POST, PUT, DELETE) for its corresponding resource.

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

---

## 📋 Users API

### 1. GET /api/users
Retrieve all users with pagination and filtering support.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `role` (string, optional): Filter by role (admin, user, moderator)
- `search` (string, optional): Search by name or email

**Example Request:**
```bash
# Get all users
curl -X GET http://localhost:3000/api/users

# Get users with pagination
curl -X GET "http://localhost:3000/api/users?page=1&limit=5"

# Filter by role
curl -X GET "http://localhost:3000/api/users?role=admin"

# Search users
curl -X GET "http://localhost:3000/api/users?search=alice"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "admin"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid pagination parameters
- `500 Internal Server Error`: Server error

---

### 2. POST /api/users
Create a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"  // optional, defaults to "user"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","role":"user"}'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 6,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid email format
- `409 Conflict`: User with email already exists

---

### 3. PUT /api/users
Update an existing user.

**Request Body:**
```json
{
  "id": 1,
  "name": "Alice Smith",  // optional
  "email": "alice.smith@example.com",  // optional
  "role": "admin"  // optional
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"id":1,"name":"Alice Smith"}'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "Alice Smith",
    "email": "alice@example.com",
    "role": "admin"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing ID or invalid email format
- `404 Not Found`: User not found
- `409 Conflict`: Email already in use

---

### 4. DELETE /api/users
Delete a user.

**Request Body:**
```json
{
  "id": 1
}
```

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"id":1}'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "admin"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing ID
- `404 Not Found`: User not found

---

## 📝 Tasks API

### 1. GET /api/tasks
Retrieve all tasks with pagination and filtering support.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `status` (string, optional): Filter by status (pending, in-progress, completed)
- `priority` (string, optional): Filter by priority (low, medium, high)
- `assignedTo` (string, optional): Filter by assigned person
- `search` (string, optional): Search in title and description

**Example Request:**
```bash
# Get all tasks
curl -X GET http://localhost:3000/api/tasks

# Filter by status
curl -X GET "http://localhost:3000/api/tasks?status=in-progress"

# Filter by priority
curl -X GET "http://localhost:3000/api/tasks?priority=high"

# Combined filters
curl -X GET "http://localhost:3000/api/tasks?status=pending&priority=high&page=1&limit=5"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Design API architecture",
      "description": "Create RESTful API design for the project",
      "status": "completed",
      "priority": "high",
      "assignedTo": "Alice Johnson",
      "createdAt": "2026-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 2. POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Implement authentication",
  "description": "Add JWT authentication to the API",
  "status": "pending",  // optional, defaults to "pending"
  "priority": "high",  // optional, defaults to "medium"
  "assignedTo": "Bob Smith"  // optional, defaults to "Unassigned"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Implement authentication","description":"Add JWT authentication","priority":"high"}'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 6,
    "title": "Implement authentication",
    "description": "Add JWT authentication",
    "status": "pending",
    "priority": "high",
    "assignedTo": "Unassigned",
    "createdAt": "2026-01-05T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid status/priority values

---

### 3. PUT /api/tasks
Update an existing task.

**Request Body:**
```json
{
  "id": 2,
  "status": "completed",  // optional
  "priority": "medium",  // optional
  "assignedTo": "Charlie Brown"  // optional
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"id":2,"status":"completed"}'
```

**Error Responses:**
- `400 Bad Request`: Missing ID or invalid values
- `404 Not Found`: Task not found

---

### 4. DELETE /api/tasks
Delete a task.

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"id":3}'
```

---

## 🚀 Projects API

### 1. GET /api/projects
Retrieve all projects with pagination and filtering support.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `status` (string, optional): Filter by status (planning, active, on-hold, completed, cancelled)
- `category` (string, optional): Filter by category
- `owner` (string, optional): Filter by owner name
- `minBudget` (number, optional): Filter by minimum budget
- `maxBudget` (number, optional): Filter by maximum budget
- `search` (string, optional): Search in name and description

**Example Request:**
```bash
# Get all projects
curl -X GET http://localhost:3000/api/projects

# Filter by status
curl -X GET "http://localhost:3000/api/projects?status=active"

# Filter by budget range
curl -X GET "http://localhost:3000/api/projects?minBudget=30000&maxBudget=60000"

# Complex filtering
curl -X GET "http://localhost:3000/api/projects?status=active&category=Web&page=1&limit=5"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Startup Discovery Platform",
      "description": "A platform to discover and track innovative startups",
      "status": "active",
      "category": "Web Application",
      "budget": 50000,
      "startDate": "2026-01-01",
      "endDate": "2026-06-30",
      "teamSize": 5,
      "owner": "Alice Johnson"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 2. POST /api/projects
Create a new project.

**Request Body:**
```json
{
  "name": "AI Chatbot",
  "description": "Intelligent chatbot for customer support",
  "status": "planning",  // optional, defaults to "planning"
  "category": "AI/ML",
  "budget": 80000,
  "startDate": "2026-02-01",
  "endDate": "2026-08-31",  // optional
  "teamSize": 4,  // optional, defaults to 1
  "owner": "John Doe"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name":"AI Chatbot",
    "description":"Intelligent chatbot",
    "category":"AI/ML",
    "budget":80000,
    "startDate":"2026-02-01",
    "owner":"John Doe"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": 6,
    "name": "AI Chatbot",
    "description": "Intelligent chatbot",
    "status": "planning",
    "category": "AI/ML",
    "budget": 80000,
    "startDate": "2026-02-01",
    "endDate": null,
    "teamSize": 1,
    "owner": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields, invalid budget/dates, or invalid status

---

### 3. PUT /api/projects
Update an existing project.

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"id":1,"status":"completed","budget":55000}'
```

---

### 4. DELETE /api/projects
Delete a project.

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"id":5}'
```

---

## Error Handling

All endpoints return consistent error responses with appropriate HTTP status codes:

### Status Codes
- `200 OK`: Successful GET, PUT, DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Invalid request parameters or body
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource (e.g., email already exists)
- `500 Internal Server Error`: Server-side error

### Error Response Format
```json
{
  "error": "Error message",
  "details": "Detailed error information (optional)"
}
```

---

## Pagination

All GET endpoints support pagination with consistent parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Pagination Response:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Testing with Postman

### Import Collection
You can test all endpoints using Postman. Here's a sample collection structure:

1. **Users Collection**
   - GET All Users
   - GET Users with Filters
   - POST Create User
   - PUT Update User
   - DELETE User

2. **Tasks Collection**
   - GET All Tasks
   - GET Tasks by Status
   - POST Create Task
   - PUT Update Task
   - DELETE Task

3. **Projects Collection**
   - GET All Projects
   - GET Projects by Budget
   - POST Create Project
   - PUT Update Project
   - DELETE Project

### Environment Variables
```
baseUrl: http://localhost:3000/api
```

---

## Running the API Locally

1. **Install Dependencies:**
```bash
npm install
```

2. **Start Development Server:**
```bash
npm run dev
```

3. **API will be available at:**
```
http://localhost:3000/api
```

---

## Design Principles & Best Practices

### 1. **Consistent Naming Conventions**
- ✅ Plural nouns for resource endpoints (`/users`, `/tasks`, `/projects`)
- ✅ Lowercase with hyphens for multi-word resources
- ✅ Clear, descriptive names that indicate the resource type

### 2. **RESTful HTTP Methods**
- `GET`: Retrieve resources (read-only, idempotent)
- `POST`: Create new resources
- `PUT`: Update existing resources (full update)
- `DELETE`: Remove resources

### 3. **Proper Status Codes**
- Success: 200 (OK), 201 (Created)
- Client Errors: 400 (Bad Request), 404 (Not Found), 409 (Conflict)
- Server Errors: 500 (Internal Server Error)

### 4. **Pagination & Filtering**
- Default pagination to prevent overwhelming responses
- Flexible filtering options for different use cases
- Consistent query parameter naming across endpoints

### 5. **Error Handling**
- Meaningful error messages
- Validation at multiple levels
- Consistent error response format

---

## Reflection: Why Structure and Naming Matter

### 🎯 Benefits for Team Collaboration

1. **Predictability**: When endpoints follow consistent patterns, developers can predict the API structure without documentation. If `/users` supports GET/POST/PUT/DELETE, developers expect the same from `/tasks` and `/projects`.

2. **Reduced Learning Curve**: New team members can quickly understand and start using the API. Clear naming like `/api/users?role=admin` is self-documenting.

3. **Easier Integration**: Frontend developers can build forms and UI components without constantly referring to documentation. The API structure maps naturally to UI components.

4. **Maintainability**: Consistent structure makes it easier to add new endpoints, refactor existing ones, or debug issues. Code reviews become more efficient.

5. **Scalability**: As the API grows, the organizational structure prevents chaos. New resources fit naturally into the existing hierarchy.

### 🔧 Real-World Impact

**Example Scenario:**
When a frontend developer needs to build a user management dashboard:
- They immediately know to call `GET /api/users` for the list
- They can easily add filters: `?role=admin&page=1&limit=10`
- Creating a new user is intuitive: `POST /api/users` with the user data
- Error handling is consistent across all endpoints

This consistency reduces back-and-forth communication, decreases bugs, and accelerates development velocity.

### 💡 Key Takeaway

> "Consistent API naming and structure make integration easier for teammates and frontend developers by creating a predictable, self-documenting interface that reduces cognitive load and accelerates development."

---

## Future Enhancements

- [ ] Authentication & Authorization (JWT)
- [ ] Rate limiting
- [ ] API versioning (`/api/v1/...`)
- [ ] Database integration (currently using in-memory store)
- [ ] Request validation with schemas (Zod/Yup)
- [ ] API documentation with Swagger/OpenAPI
- [ ] Caching strategies
- [ ] WebSocket support for real-time updates

---

## Contributing

When adding new API endpoints:

1. Follow the existing structure (`app/api/{resource}/route.ts`)
2. Implement all CRUD operations (GET, POST, PUT, DELETE)
3. Add pagination and filtering to GET endpoints
4. Use consistent error handling
5. Update this documentation
6. Add example curl commands

---

## License

This project is part of the Kalvium S81 assignment.

---

**Last Updated:** January 5, 2026
