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

#### Register Organization & Admin
`POST /auth/register`
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123",
  "name": "Admin Name",
  "organization_name": "Acme Corp"
}
```

#### Login
`POST /auth/login`
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
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
