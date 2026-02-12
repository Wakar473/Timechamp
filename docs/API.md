# WorkPulse API Documentation

## Base URL
- **Local Development**: `http://localhost:3000`
- **LAN Access**: `http://YOUR_IP:3000` (see LAN Setup below)
- **Production**: Configure via environment variables

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 1. Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "organization_id": "uuid-of-organization",
  "role": "employee"  // Optional: admin, manager, employee (default)
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "employee",
    "organization_id": "uuid",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "organization_id": "uuid-of-organization"
}
```

**Response:** Same as register

---

### 2. Work Sessions

#### Start Work Session
```http
POST /sessions/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": "uuid-of-project"  // Optional
}
```

**Response:**
```json
{
  "id": "session-uuid",
  "user_id": "user-uuid",
  "organization_id": "org-uuid",
  "project_id": "project-uuid",
  "start_time": "2024-01-01T09:00:00.000Z",
  "status": "active",
  "total_active_seconds": 0,
  "total_idle_seconds": 0
}
```

#### Stop Work Session
```http
POST /sessions/:sessionId/stop
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "session-uuid",
  "end_time": "2024-01-01T17:00:00.000Z",
  "status": "stopped",
  "total_active_seconds": 28800,
  "total_idle_seconds": 600
}
```

#### Get Active Sessions
```http
GET /sessions/active
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "session-uuid",
    "start_time": "2024-01-01T09:00:00.000Z",
    "total_active_seconds": 3600,
    "status": "active"
  }
]
```

---

### 3. Activity Logging

#### Log Single Activity
```http
POST /sessions/:sessionId/activity
Authorization: Bearer <token>
Content-Type: application/json

{
  "activityType": "active",  // "active" or "idle"
  "durationSeconds": 60,
  "appName": "VS Code",      // Optional
  "url": "file:///project/main.ts",  // Optional
  "screenshot_timestamp": "2024-01-01T09:00:00.000Z"  // Optional
}
```

**Response:**
```json
{
  "message": "Activity logged successfully",
  "session": {
    "id": "session-uuid",
    "total_active_seconds": 3660,
    "total_idle_seconds": 0
  }
}
```

#### Batch Log Activities
```http
POST /activity/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session-uuid",
  "activities": [
    {
      "timestamp": "2024-01-01T09:00:00.000Z",
      "activityType": "active",
      "durationSeconds": 60,
      "appName": "Chrome",
      "url": "https://github.com",
      "screenshot_timestamp": "2024-01-01T09:00:00.000Z"  // Optional
    },
    {
      "timestamp": "2024-01-01T09:01:00.000Z",
      "activityType": "active",
      "durationSeconds": 60,
      "appName": "VS Code"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Batch activities logged successfully",
  "count": 2,
  "session": {
    "total_active_seconds": 3780
  }
}
```

---

### 4. Projects

#### Create Project
```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Complete redesign of company website"  // Optional
}
```

**Response:**
```json
{
  "id": "project-uuid",
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "organization_id": "org-uuid",
  "created_by": "user-uuid",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### List All Projects
```http
GET /projects
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "project-uuid",
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "organization_id": "org-uuid",
    "created_by": "user-uuid",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Single Project
```http
GET /projects/:id
Authorization: Bearer <token>
```

**Response:** Same as create response

#### Update Project
```http
PUT /projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Website Redesign v2",  // Optional
  "description": "Updated description"  // Optional
}
```

**Response:** Updated project object

#### Delete Project
```http
DELETE /projects/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

---

### 5. Reports

#### Get Daily Summary
```http
GET /reports/daily?date=2024-01-01&userId=user-uuid
Authorization: Bearer <token>
```

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `userId` (optional): User ID to fetch report for (defaults to current user)

**Response:**
```json
{
  "user_id": "user-uuid",
  "date": "2024-01-01",
  "total_work_seconds": 28800,
  "active_seconds": 25200,
  "idle_seconds": 3600,
  "productivity_score": 87.5,
  "sessions_count": 1
}
```

#### Get User Productivity Report
```http
GET /reports/user/:userId?startDate=2024-01-01&endDate=2024-01-07
Authorization: Bearer <token>
```

**Path Parameters:**
- `userId` (required): User ID to fetch report for

**Query Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format

**Response:**
```json
{
  "user_id": "user-uuid",
  "start_date": "2024-01-01",
  "end_date": "2024-01-07",
  "total_work_seconds": 172800,
  "total_active_seconds": 151200,
  "total_idle_seconds": 21600,
  "average_productivity_score": 87.5,
  "days_worked": 6,
  "daily_summaries": [
    {
      "id": "summary-uuid",
      "date": "2024-01-01",
      "total_work_seconds": 28800,
      "active_seconds": 25200,
      "idle_seconds": 3600,
      "productivity_score": 87.5
    }
  ]
}
```

---

### 6. Health Check

#### Check API Health
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  },
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

---

## WebSocket Events

### Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events Received from Server

#### USER_ONLINE
Emitted when a user connects
```json
{
  "userId": "user-uuid",
  "organizationId": "org-uuid",
  "timestamp": "2024-01-01T09:00:00.000Z"
}
```

#### USER_OFFLINE
Emitted when a user disconnects
```json
{
  "userId": "user-uuid",
  "organizationId": "org-uuid",
  "timestamp": "2024-01-01T17:00:00.000Z"
}
```

#### SESSION_UPDATE
Emitted when session data changes
```json
{
  "sessionId": "session-uuid",
  "userId": "user-uuid",
  "total_active_seconds": 3600,
  "status": "active"
}
```

#### INACTIVE_ALERT
Emitted when user is idle > 5 minutes
```json
{
  "userId": "user-uuid",
  "message": "User has been inactive for 5 minutes",
  "idleMinutes": 5
}
```

#### OVERTIME_ALERT
Emitted when work time > 9 hours
```json
{
  "userId": "user-uuid",
  "message": "User has worked for 9 hours",
  "workHours": 9
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "timestamp": "2024-01-01T09:00:00.000Z",
  "path": "/api/endpoint"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Rate Limiting

**Activity Logging Endpoint:** Max 1 request per 10 seconds per user

The `POST /sessions/:id/activity` endpoint is rate-limited to prevent excessive updates:
- **Limit**: 1 request per 10 seconds
- **Response when exceeded**: `429 Too Many Requests`

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

**Note:** This matches the assignment requirement for bonus feature: "Max 1 activity update per 10 sec"

---

## CORS Configuration

By default, CORS is enabled for all origins in development. Configure for production in `src/main.ts`.
