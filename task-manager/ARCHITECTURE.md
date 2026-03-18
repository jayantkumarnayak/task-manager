# Application Architecture

## Overview

Task Manager is a modern full-stack web application built with Next.js, demonstrating production-grade architecture with security, scalability, and maintainability as core principles.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer (React)                    │
│  ┌───────────────┬────────────────┬──────────────────────────┐  │
│  │  Login Page   │  Register Page │   Dashboard (Main App)   │  │
│  │               │                │  - Task List             │  │
│  │               │                │  - Task Form             │  │
│  │               │                │  - Filters & Search      │  │
│  └───────────────┴────────────────┴──────────────────────────┘  │
└───────────────────────┬──────────────────────────────────────────┘
                        │ HTTP Requests
                        │ (with JWT Token in Cookies)
┌───────────────────────▼──────────────────────────────────────────┐
│                    Middleware Layer (Next.js)                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Route Protection Middleware                             │   │
│  │  - Verify JWT Token                                      │   │
│  │  - Redirect unauthenticated users                        │   │
│  │  - Prevent logged-in users from accessing login/register │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────┬──────────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────────┐
│                     API Routes Layer (Next.js)                   │
│  ┌──────────────────┐      ┌──────────────────────────────────┐  │
│  │  Auth Routes     │      │      Task Routes                 │  │
│  │  ┌─────────────┐ │      │  ┌──────────────────────────────┐│  │
│  │  │ POST /login │ │      │  │ POST /tasks (Create)         ││  │
│  │  │ POST /regis │ │      │  │ GET /tasks (List w/ filter)  ││  │
│  │  │ GET /verify │ │      │  │ GET /tasks/[id] (Get)        ││  │
│  │  │ POST /logout│ │      │  │ PUT /tasks/[id] (Update)     ││  │
│  │  └─────────────┘ │      │  │ DELETE /tasks/[id] (Delete)  ││  │
│  └──────────────────┘      │  └──────────────────────────────┘│  │
└──────────────┬─────────────┴──────┬───────────────────────────────┘
               │                    │
               └────────┬───────────┘
                        │ Database Queries
┌───────────────────────▼──────────────────────────────────────────┐
│                   Business Logic Layer                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Validation (Zod Schemas)                                │   │
│  │  - Input validation                                      │   │
│  │  - Type safety                                           │   │
│  │  - Error generation                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Authentication Logic                                    │   │
│  │  - Password hashing (bcrypt)                             │   │
│  │  - JWT token generation                                  │   │
│  │  - Token verification                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Authorization Logic                                     │   │
│  │  - User ownership verification                           │   │
│  │  - Role-based access control                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────┬───────────────────────────────────────────┘
                       │ Mongoose Queries
┌──────────────────────▼───────────────────────────────────────────┐
│                    Data Layer (MongoDB)                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  User Collection                                        │    │
│  │  - email (unique)                                       │    │
│  │  - password (hashed)                                    │    │
│  │  - createdAt, updatedAt                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Task Collection                                        │    │
│  │  - userId (reference to User)                           │    │
│  │  - title, description                                   │    │
│  │  - status (pending, in-progress, completed)             │    │
│  │  - createdAt, updatedAt                                 │    │
│  │  - Indexes: (userId, createdAt), (userId, status)      │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App/
├── Layout (Global)
│   ├── Typography & Basic Styling
│   └── Global Providers
│
├── Pages/
│   ├── Login Page
│   │   └── LoginForm Component
│   │       - State management
│   │       - API calls
│   │       - Error handling
│   │       - Redirect on success
│   │
│   ├── Register Page
│   │   └── RegisterForm Component
│   │       - Password confirmation
│   │       - Duplicate email handling
│   │       - Validation
│   │
│   └── Dashboard Page
│       ├── Header (User info, Logout)
│       ├── TaskForm Component
│       │   - Create/Edit task
│       │   - Title, description, status
│       │
│       ├── Filters
│       │   ├── Status filter
│       │   └── Search box
│       │
│       └── TaskList Component
│           ├── Task cards
│           ├── Edit/Delete buttons
│           ├── Pagination controls
│           └── Empty state handling
```

### API Routes Architecture

```
/api/auth/
├── POST /register
│   ├── Validate input (Zod)
│   ├── Check duplicate email
│   ├── Hash password (bcrypt)
│   └── Save to MongoDB
│
├── POST /login
│   ├── Validate input
│   ├── Find user
│   ├── Compare password (bcrypt)
│   ├── Generate JWT token
│   └── Set HTTP-only cookie
│
├── GET /verify
│   ├── Extract and verify JWT
│   └── Return user data
│
└── POST /logout
    └── Clear JWT cookie

/api/tasks/
├── POST / (Create task)
│   ├── Verify authentication
│   ├── Validate input
│   ├── Create with user ownership
│   └── Return created task
│
├── GET / (List tasks)
│   ├── Verify authentication
│   ├── Build filter query
│   ├── Apply pagination
│   ├── Return paginated results
│   └── Include pagination metadata
│
├── GET /[id] (Get single task)
│   ├── Verify authentication
│   ├── Verify user ownership
│   └── Return task or 404
│
├── PUT /[id] (Update task)
│   ├── Verify authentication
│   ├── Verify user ownership
│   ├── Validate input
│   └── Update and return
│
└── DELETE /[id] (Delete task)
    ├── Verify authentication
    ├── Verify user ownership
    └── Delete and return success
```

## Data Flow

### Authentication Flow

```
User Input → Client Component
    │
    ▼
Validation (Client-side - React)
    │
    ▼
API Call → /api/auth/login
    │
    ├─→ Validate input (Server-side - Zod)
    │
    ├─→ Find user in MongoDB
    │
    ├─→ Compare passwords (bcrypt)
    │
    ├─→ Invalid? → Return 401
    │
    └─→ Valid?
         │
         ├─→ Generate JWT token
         │
         ├─→ Set HTTP-only cookie
         │
         └─→ Return user data + 200
            │
            ▼
Response → Update UI
    │
    ▼
User Redirected to Dashboard
```

### Task Creation Flow

```
User fills form → TaskForm Component
    │
    ▼
Client-side validation
    │
    ▼
API Call → POST /api/tasks
    │
    ├─→ Extract JWT from cookie
    │
    ├─→ Verify token validity
    │
    │   Invalid? → Return 401
    │
    ├─→ Validate input (Zod)
    │   Invalid? → Return 400 with details
    │
    ├─→ Add userId from JWT to task
    │
    ├─→ Create document in MongoDB
    │
    └─→ Return created task + 201
        │
        ▼
Response → Update TaskList
    │
    ▼
Clear form, show success message
```

### Task List Filtering Flow

```
User: Click filter / Search → Dashboard Component
    │
    ▼
Update filter state
    │
    ▼
API Call → GET /api/tasks?filters=...
    │
    ├─→ Verify authentication
    │
    ├─→ Build MongoDB query
    │   ├─→ Always filter by userId
    │   ├─→ If status: add status filter
    │   └─→ If search: add regex title filter
    │
    ├─→ Count total matching documents
    │
    ├─→ Fetch page data with limit
    │
    └─→ Return tasks + pagination metadata
        │
        ▼
Response → Update TaskList
    │
    ▼
Render filtered tasks + pagination controls
```

## Security Architecture

### Authentication Security

1. **Password Security**
   - Passwords hashed with bcrypt (10 salt rounds)
   - Never stored or transmitted in plain text
   - Validated on both client and server

2. **JWT Token Security**
   - Signed with JWT_SECRET (kept in environment variables)
   - 7-day expiration
   - Stored in HTTP-only cookies (prevents XSS)
   - Not accessible via JavaScript

3. **Cookie Security**
   - HttpOnly flag prevents JavaScript access
   - Secure flag (HTTPS only in production)
   - SameSite=Strict prevents CSRF attacks
   - Path-limited to root

### Authorization Security

1. **Route Protection Middleware**
   - Middleware.ts verifies JWT on protected routes
   - Unauthenticated users redirected to login
   - Prevents unauthorized access

2. **Authorization Checks in APIs**
   - Every task operation verifies user ownership
   - Users can only access their own tasks
   - All authorization happens server-side
   - No reliance on client-side checks

### Input Security

1. **Validation**
   - Zod schemas validate all inputs
   - Type-safe validation prevents injection attacks
   - Proper error messages without exposing internals

2. **Database Safety**
   - Mongoose prevents direct MongoDB injection
   - Environment variables store credentials
   - Unique indexes prevent duplicate emails

## Scalability Considerations

### Database Optimization

1. **Indexing Strategy**
   ```javascript
   // User collection
   - Email index (unique)
   
   // Task collection
   - (userId, createdAt) index for sorting
   - (userId, status) index for filtering
   ```

2. **Query Optimization**
   - Limited field selection with `.lean()`
   - Pagination prevents large result sets
   - Indexes used for fast queries

### Backend Scalability

1. **Stateless Design**
   - No server-side sessions
   - JWT-based auth (can scale horizontally)
   - Middleware is lightweight

2. **Resources**
   - Connection pooling (Mongoose default)
   - Async/await for non-blocking I/O
   - Error handling prevents crashes

## Deployment Architecture

### Development Environment
```
npm run dev
├── Next.js dev server
├── Hot module reload
├── Source maps
└── localhost:3000
```

### Production Environment
```
npm run build && npm start
├── Optimized bundle
├── Static optimization
├── Minified code
└── Production error handling
```

### Cloud Deployment Options

1. **Vercel (Recommended)**
   - Native Next.js support
   - Automatic deployments
   - Environment variables management
   - Built-in CDN

2. **Railway / Render / AWS**
   - Docker containerization
   - Custom server configuration
   - Full control over environment

## Technology Choices & Rationale

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React | Component-based, reusable UI |
| Framework | Next.js | Full-stack, server-side rendering, API routes |
| Database | MongoDB | Flexible schema, JSON-like documents |
| ORM | Mongoose | Type safety, validation, indexing |
| Auth | JWT + bcrypt | Stateless, scalable, secure |
| Validation | Zod | Type-safe, excellent DX |
| Styling | Tailwind CSS | Utility-based, responsive design |
| Language | TypeScript | Type safety, better IDE support |

## Error Handling Strategy

1. **Client-side**
   - Form validation before submission
   - User-friendly error messages
   - Retry mechanisms
   - Loading states

2. **Server-side**
   - Try-catch blocks around all operations
   - Proper logging
   - HTTP appropriate status codes
   - Structured error responses

3. **Database**
   - Connection error handling
   - Validation error handling
   - Duplicate key error handling
   - Timeout handling

## Future Enhancements

1. **Features**
   - Task categories/tags
   - Due dates and reminders
   - Task priorities
   - Recurring tasks
   - Collaboration/sharing

2. **Performance**
   - Caching strategies (Redis)
   - Database query optimization
   - Frontend bundle optimization
   - Image optimization

3. **Security**
   - Two-factor authentication
   - OAuth integration (Google, GitHub)
   - Rate limiting
   - Audit logging
   - Data encryption at rest

4. **Operations**
   - Monitoring and alerting
   - Log aggregation
   - Performance metrics
   - Automated backups
   - Disaster recovery
