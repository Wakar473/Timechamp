# WorkPulse API Documentation

## Base URL
- **Local Development**: `http://localhost:3000`
- **LAN Access**: `http://YOUR_IP:3000`
- **Swagger UI**: Import `docs/swagger.yml` into [Swagger Editor](https://editor.swagger.io/)

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Roles & Access Control

- **ADMIN**: Full access to organization. Can manage all users, projects, and see all reports.
- **MANAGER**: Access to their team. Can invite users to their team, create team projects, and see team analytics.
- **EMPLOYEE**: Personal access. Can start/stop sessions on assigned projects and see own reports.

---

## API Endpoints

### 1. Authentication

#### Register New Organization & Admin
**Endpoint**: `POST /auth/register`

**Full URL for Postman**: `http://10.10.0.43:3000/auth/register`

**Use Case**: Create a new organization and the first admin user.

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123",
  "confirm_password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "employee_id": "EMP001",
  "organization_name": "Acme Corp"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "employee_id": "EMP001",
    "role": "admin",
    "organization_id": "uuid",
    "status": "active"
  },
  "access_token": "eyJhbGciOi..."
}
```

**What Happens**:
- ✅ Creates new organization "Acme Corp"
- ✅ Creates admin user with full permissions
- ✅ Auto-creates "Internal / Training" system project
- ✅ Auto-assigns admin to system project
- ✅ Returns JWT token for immediate use

---

#### Register User to Existing Organization
**Endpoint**: `POST /auth/register`

**Full URL for Postman**: `http://10.10.0.43:3000/auth/register`

**Use Case**: Add a new user to an existing organization (requires organization_id).

**Request Body**:
```json
{
  "email": "employee@example.com",
  "password": "SecurePass123",
  "confirm_password": "SecurePass123",
  "first_name": "Jane",
  "last_name": "Smith",
  "employee_id": "EMP002",
  "organization_id": "7d100adb-88bb-48fe-88fc-5193b3e89dfb",
  "role": "employee"
}
```

---

#### Login
**Endpoint**: `POST /auth/login`

**Full URL for Postman**: `http://10.10.0.43:3000/auth/login`

**Request Body** (No organization_id needed):
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123"
}
```

**Response** (200 OK):
```json
{
  "user": { ... },
  "access_token": "eyJhbGciOi..."
}
```

---

#### Change Password
**Endpoint**: `PUT /auth/password`

**Full URL for Postman**: `http://10.10.0.43:3000/auth/password`

**Auth Required**: Yes (All users)

**Request Body**:
```json
{
  "old_password": "SecurePass123",
  "new_password": "NewSecurePass456",
  "confirm_password": "NewSecurePass456"
}
```

**Response** (200 OK):
```json
{
  "message": "Password changed successfully"
}
```

---

#### Reset User Password (Admin Only)
**Endpoint**: `PUT /auth/reset-password/:userId`

**Full URL for Postman**: `http://10.10.0.43:3000/auth/reset-password/USER_UUID`

**Auth Required**: Yes (Admin only)

**Request Body**:
```json
{
  "new_password": "ResetPass789",
  "confirm_password": "ResetPass789"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset successfully"
}
```

---

### 2. Users Management

#### List Users
`GET /users`
- Admin: All users in org
- Manager: Team members only

#### Online Users
`GET /users/online`
- Returns users seen in last 5 minutes.

#### Assignable Employees
`GET /users/assignable`
- Admin/Manager only
- Returns active employees for project assignment
- Admin: All employees in organization
- Manager: Only their team members

#### Invite User
`POST /users/invite`
- **Admin**: Can invite anyone (admin/manager/employee) and assign to any manager
- **Manager**: Can only invite employees to their own team (manager_id auto-set)
- **Automatically assigns system project to new employees**
```json
{
  "email": "new@example.com",
  "name": "New User",
  "role": "employee",
  "manager_id": "uuid" // Required for admin inviting employee, ignored for manager (auto-set to self)
}
```

#### Update Role (Admin only)
`PATCH /users/:id/role`
```json
{ "role": "manager" }
```

---

### 3. Projects

#### List Projects
`GET /projects`
- Admin: All projects
- Manager: Owned projects
- Employee: Assigned projects

#### Get System Project
`GET /projects/system`
- Returns the "Internal / Training" project.

#### Create Project
`POST /projects`
```json
{
  "name": "Client X",
  "description": "Project for Client X"
}
```

#### Assign Users
`POST /projects/:id/assign`
```json
{
  "user_ids": ["uuid1", "uuid2"]
}
```

#### Remove User
`DELETE /projects/:id/assign/:userId`

---

### 4. Work Sessions

#### Start Session (Project REQUIRED)
`POST /sessions/start`
- Note: `project_id` is now required.
```json
{ "project_id": "uuid" }
```

#### Stop Session
`POST /sessions/:id/stop`

#### Log Activity
`POST /sessions/:id/activity`
- **Rate Limit**: 1 request per 10 seconds.
```json
{
  "type": "active", // active | idle
  "appName": "VS Code",
  "windowTitle": "main.ts",
  "url": "https://..." 
}
```

---

### 5. Alerts

#### List Alerts
`GET /alerts`
- Admin: All alerts
- Manager: Team alerts
- Employee: Own alerts

#### Resolve Alert (Admin/Manager)
`PATCH /alerts/:id/resolve`

---

### 6. Reports & Analytics

#### Daily Summaries
`GET /reports/daily?date=2024-01-01`

#### Organization Analytics (Admin only)
`GET /reports/organization/analytics`

#### Team Analytics (Manager only)
`GET /reports/team/analytics`

---

## WebSocket Events

Subscribe to `http://localhost:3000` with JWT in `auth.token`.

- `USER_ONLINE`: User connected
- `USER_OFFLINE`: User disconnected
- `SESSION_UPDATE`: Timer or status change
- `INACTIVE_ALERT`: Triggered after 5m idle
- `OVERTIME_ALERT`: Triggered after 9h work
