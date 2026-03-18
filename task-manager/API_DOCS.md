# Task Manager API Documentation

Complete API reference for the Task Manager application with examples and response formats.

## Base URL
```
http://localhost:3000/api
https://your-deployed-app.com/api (Production)
```

## Authentication

All protected endpoints require a valid JWT token stored in HTTP-only cookies. On successful login, the server sets:
```
Set-Cookie: token=<jwt_token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800
```

## Error Response Format

All error responses follow this format:
```json
{
  "error": "Error message describing what went wrong",
  "details": [] // Optional: validation error details
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Resource created successfully
- `400` - Bad request or validation error
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal server error

---

## Authentication Endpoints

### POST /auth/register
**Create a new user account**

#### Request
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

#### Request Body
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| email | string | Yes | Valid email format |
| password | string | Yes | Min 6 characters, max 50 |

#### Response (201 Created)
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

#### Error Responses
```json
// Invalid email
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_string",
      "message": "Invalid email address",
      "path": ["email"]
    }
  ]
}

// Email already registered
{
  "error": "Email is already registered",
  "status": 409
}

// Password too short
{
  "error": "Validation failed",
  "details": [
    {
      "code": "too_small",
      "message": "Password must be at least 6 characters",
      "path": ["password"]
    }
  ]
}
```

---

### POST /auth/login
**Authenticate user and receive JWT token**

#### Request
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

#### Request Body
| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

#### Response (200 OK)
```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Sets HTTP-only Cookie:**
```
token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict
```

#### Error Responses
```json
// Invalid credentials
{
  "error": "Invalid email or password",
  "status": 401
}

// Validation error
{
  "error": "Validation failed",
  "details": []
}
```

---

### GET /auth/verify
**Verify current authentication status**

#### Request
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Cookie: token=<jwt_token>"
```

#### Response (200 OK)
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

#### Error Response (401 Unauthorized)
```json
{
  "error": "Unauthorized"
}
```

---

### POST /auth/logout
**Clear authentication and logout**

#### Request
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: token=<jwt_token>"
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Clears Cookie:**
```
token=; HttpOnly; Max-Age=0; Path=/
```

---

## Task Endpoints

### POST /tasks
**Create a new task**

#### Request
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{
    "title": "Complete project proposal",
    "description": "Write and submit the Q2 project proposal by Friday",
    "status": "in-progress"
  }'
```

#### Request Body
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| title | string | Yes | Min 1, max 100 characters |
| description | string | No | Max 500 characters |
| status | enum | No | pending, in-progress, or completed (default: pending) |

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "title": "Complete project proposal",
    "description": "Write and submit the Q2 project proposal by Friday",
    "status": "in-progress",
    "createdAt": "2024-03-18T10:30:45.123Z",
    "updatedAt": "2024-03-18T10:30:45.123Z"
  }
}
```

#### Error Responses
```json
// Unauthorized
{
  "error": "Unauthorized",
  "status": 401
}

// Validation error
{
  "error": "Validation failed",
  "details": [
    {
      "code": "too_big",
      "message": "Title must be less than 100 characters"
    }
  ]
}
```

---

### GET /tasks
**List user's tasks with pagination, filtering, and search**

#### Request
```bash
# Get first page
curl -X GET "http://localhost:3000/api/tasks" \
  -H "Cookie: token=<jwt_token>"

# With pagination
curl -X GET "http://localhost:3000/api/tasks?page=2&limit=5" \
  -H "Cookie: token=<jwt_token>"

# Filter by status
curl -X GET "http://localhost:3000/api/tasks?status=pending" \
  -H "Cookie: token=<jwt_token>"

# Search by title
curl -X GET "http://localhost:3000/api/tasks?search=report" \
  -H "Cookie: token=<jwt_token>"

# Combined filters
curl -X GET "http://localhost:3000/api/tasks?page=1&limit=10&status=completed&search=project" \
  -H "Cookie: token=<jwt_token>"
```

#### Query Parameters
| Parameter | Type | Default | Validation |
|-----------|------|---------|-----------|
| page | number | 1 | Min 1 |
| limit | number | 10 | Min 1, max 100 |
| status | string | - | pending, in-progress, or completed |
| search | string | - | Case-insensitive title search |

#### Response (200 OK)
```json
{
  "success": true,
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "title": "Complete project proposal",
      "description": "Write and submit the Q2 project proposal",
      "status": "in-progress",
      "createdAt": "2024-03-18T10:30:45.123Z",
      "updatedAt": "2024-03-18T10:30:45.123Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439011",
      "title": "Review team feedback",
      "description": "",
      "status": "pending",
      "createdAt": "2024-03-18T09:15:00.000Z",
      "updatedAt": "2024-03-18T09:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Error Responses
```json
// Unauthorized
{
  "error": "Unauthorized",
  "status": 401
}

// Invalid pagination
{
  "error": "Invalid pagination parameters",
  "status": 400
}

// Invalid status
{
  "error": "Invalid status value",
  "status": 400
}
```

---

### GET /tasks/{id}
**Get a single task by ID**

#### Request
```bash
curl -X GET "http://localhost:3000/api/tasks/507f1f77bcf86cd799439012" \
  -H "Cookie: token=<jwt_token>"
```

#### Response (200 OK)
```json
{
  "success": true,
  "task": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "title": "Complete project proposal",
    "description": "Write and submit the Q2 project proposal by Friday",
    "status": "in-progress",
    "createdAt": "2024-03-18T10:30:45.123Z",
    "updatedAt": "2024-03-18T10:30:45.123Z"
  }
}
```

#### Error Responses
```json
// Invalid task ID
{
  "error": "Invalid task ID",
  "status": 400
}

// Task not found or not owned by user
{
  "error": "Task not found",
  "status": 404
}

// Unauthorized
{
  "error": "Unauthorized",
  "status": 401
}
```

---

### PUT /tasks/{id}
**Update a task (partial update supported)**

#### Request
```bash
# Update status
curl -X PUT "http://localhost:3000/api/tasks/507f1f77bcf86cd799439012" \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{
    "status": "completed"
  }'

# Update multiple fields
curl -X PUT "http://localhost:3000/api/tasks/507f1f77bcf86cd799439012" \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{
    "title": "Updated task title",
    "description": "Updated description",
    "status": "in-progress"
  }'
```

#### Request Body
All fields are optional:
| Field | Type | Validation |
|-------|------|-----------|
| title | string | Min 1, max 100 characters |
| description | string | Max 500 characters |
| status | enum | pending, in-progress, or completed |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Task updated successfully",
  "task": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "title": "Updated task title",
    "description": "Updated description",
    "status": "in-progress",
    "createdAt": "2024-03-18T10:30:45.123Z",
    "updatedAt": "2024-03-18T10:31:12.456Z"
  }
}
```

#### Error Responses
```json
// Task not found
{
  "error": "Task not found",
  "status": 404
}

// Validation error
{
  "error": "Validation failed",
  "details": []
}

// Unauthorized
{
  "error": "Unauthorized",
  "status": 401
}
```

---

### DELETE /tasks/{id}
**Delete a task**

#### Request
```bash
curl -X DELETE "http://localhost:3000/api/tasks/507f1f77bcf86cd799439012" \
  -H "Cookie: token=<jwt_token>"
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### Error Responses
```json
// Task not found or not owned by user
{
  "error": "Task not found",
  "status": 404
}

// Invalid task ID
{
  "error": "Invalid task ID",
  "status": 400
}

// Unauthorized
{
  "error": "Unauthorized",
  "status": 401
}
```

---

## Implementation Examples

### JavaScript/Fetch

```javascript
// Register
async function register(email, password) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
}

// Login
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include cookies
    body: JSON.stringify({ email, password })
  });
  return response.json();
}

// Create task
async function createTask(title, description, status = 'pending') {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ title, description, status })
  });
  return response.json();
}

// Get tasks with filters
async function getTasks(page = 1, status = '', search = '') {
  const params = new URLSearchParams({
    page: page.toString(),
    ...(status && { status }),
    ...(search && { search })
  });
  
  const response = await fetch(`/api/tasks?${params}`, {
    credentials: 'include'
  });
  return response.json();
}
```

### cURL Examples

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"user@example.com","password":"password123"}'

# Create task (using saved cookies)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"My Task","status":"pending"}'

# Get tasks with filters
curl "http://localhost:3000/api/tasks?status=pending&search=task" \
  -b cookies.txt
```

---

## Rate Limiting

Currently, there is no rate limiting. For production deployment, implement rate limiting middleware to prevent abuse.

## CORS

CORS is not explicitly configured. The application runs on the same domain (Next.js full-stack) so CORS issues should not occur.

## Versioning

Current API version: **v1** (not versioned in URL, may be added in future versions)

---

## Changelog

### v1.0.0 (2024-03-18)
- Initial release
- Authentication endpoints
- Task CRUD endpoints
- Pagination and filtering
- Search functionality
