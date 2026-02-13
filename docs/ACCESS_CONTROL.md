# Access Control Summary - WorkPulse Backend

## User Invitation & Management

### ADMIN Authority (Full Control)

**Can Do:**
- ✅ Invite **anyone**: Admin, Manager, or Employee
- ✅ Assign employees to **any manager** in the organization
- ✅ View **all users** in organization (id, name, email, role, status)
- ✅ Change user roles (promote/demote)
- ✅ Enable/disable user accounts
- ✅ Reassign employees between managers
- ✅ Remove users from organization

**Example - Admin Inviting Employee:**
```json
POST /users/invite
{
  "email": "john@company.com",
  "name": "John Doe",
  "role": "employee",
  "manager_id": "any-manager-uuid"  // Admin can choose ANY manager
}
```

---

### MANAGER Authority (Team-Scoped)

**Can Do:**
- ✅ Invite **employees only** (cannot invite admins or other managers)
- ✅ Employees are **automatically assigned to their own team**
- ✅ View only **their team members**
- ✅ Assign **their team members** to projects they created
- ✅ See projects they created

**Cannot Do:**
- ❌ Invite employees to other managers' teams
- ❌ Invite admins or managers
- ❌ Change user roles
- ❌ View other teams' members
- ❌ Reassign employees to other managers

**Example - Manager Inviting Employee:**
```json
POST /users/invite
{
  "email": "jane@company.com",
  "name": "Jane Smith",
  "role": "employee"
  // manager_id is AUTO-SET to the inviting manager's ID
  // If manager tries to set different manager_id, request is REJECTED
}
```

---

### EMPLOYEE Authority (Self-Only)

**Can Do:**
- ✅ View own profile
- ✅ Start/stop work sessions on assigned projects
- ✅ View assigned projects
- ✅ View own reports

**Cannot Do:**
- ❌ Invite users
- ❌ View other users
- ❌ Create projects
- ❌ Assign projects

---

## Automatic System Behaviors

### New Employee Onboarding
When any employee is invited (by admin or manager):
1. ✅ User account created with temporary password
2. ✅ **Automatically assigned to "Internal / Training" system project**
3. ✅ Assigned to specified manager (or inviting manager if manager invites)
4. ✅ Status set to ACTIVE

### System Project Protection
- ❌ Cannot be deleted
- ❌ Cannot be archived
- ✅ Always available as fallback
- ✅ Auto-assigned to all new employees

---

## Validation Rules

### Manager Assignment
- ✅ All employees **must** have a manager
- ✅ Manager must be in same organization
- ✅ Manager must have MANAGER or ADMIN role

### Team Boundaries
- ✅ Managers can only see/manage their direct reports
- ✅ Admins bypass all team boundaries
- ✅ Employees isolated to their own data

### Organization Isolation
- ✅ All operations scoped to user's organization
- ✅ Cannot access users/projects from other organizations
- ✅ Multi-tenant data isolation enforced

---

## API Endpoints Summary

| Endpoint | Admin | Manager | Employee |
|----------|-------|---------|----------|
| `GET /users` | All users | Team only | Self only |
| `GET /users/assignable` | All employees | Team employees | ❌ |
| `POST /users/invite` | Anyone, any team | Employees to own team | ❌ |
| `PATCH /users/:id/role` | ✅ | ❌ | ❌ |
| `PATCH /users/:id/status` | ✅ | ❌ | ❌ |
| `PATCH /users/:id/manager` | ✅ | ❌ | ❌ |
| `GET /projects` | All projects | Own projects | Assigned only |
| `POST /projects` | ✅ | ✅ | ❌ |
| `POST /projects/:id/assign` | Anyone | Team only | ❌ |
| `DELETE /projects/:id` | ✅ (archive) | ❌ | ❌ |

---

## Error Messages

**Manager tries to invite to another team:**
```json
{
  "statusCode": 403,
  "message": "Managers can only invite employees to their own team"
}
```

**Manager tries to invite admin/manager:**
```json
{
  "statusCode": 403,
  "message": "Managers can only invite employees"
}
```

**Employee not assigned to manager:**
```json
{
  "statusCode": 400,
  "message": "Employees must be assigned to a manager"
}
```

---

## Implementation Status

✅ **Complete and Tested**
- Admin full authority implemented
- Manager team boundary enforcement active
- Auto-assignment of system project working
- Documentation updated (API.md + swagger.yml)
- Build passing with no errors
