# WorkPulse API - cURL Command Reference

Complete reference of all API endpoints with ready-to-use curl commands.

**Base URL**: `http://10.10.0.43:3000`

---

## 🔐 Authentication

### 1. Register New Organization & Admin
```bash
curl -X POST http://10.10.0.43:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123",
    "confirm_password": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe",
    "employee_id": "EMP001",
    "organization_name": "Acme Corp"
  }'
```

**Response**: Save the `access_token` and `organization_id` for subsequent requests.

---

### 2. Register User to Existing Organization
```bash
curl -X POST http://10.10.0.43:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@example.com",
    "password": "SecurePass123",
    "confirm_password": "SecurePass123",
    "first_name": "Jane",
    "last_name": "Smith",
    "employee_id": "EMP002",
    "organization_id": "YOUR_ORG_ID",
    "role": "employee"
  }'
```

---

### 3. Login (No Organization ID Required)
```bash
curl -X POST http://10.10.0.43:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123"
  }'
```

---

### 4. Change Password (All Users)
```bash
curl -X PUT http://10.10.0.43:3000/auth/password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "SecurePass123",
    "new_password": "NewSecurePass456",
    "confirm_password": "NewSecurePass456"
  }'
```

---

### 5. Reset User Password (Admin Only)
```bash
curl -X PUT http://10.10.0.43:3000/auth/reset-password/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "new_password": "ResetPass789",
    "confirm_password": "ResetPass789"
  }'
```

---

## 👥 Users Management

**Note**: Replace `YOUR_TOKEN` with your JWT token from login/register response.

### 6. List All Users (Role-Scoped)
```bash
curl -X GET http://10.10.0.43:3000/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 7. List Online Users
```bash
curl -X GET http://10.10.0.43:3000/users/online \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 8. List Assignable Employees
```bash
curl -X GET http://10.10.0.43:3000/users/assignable \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 9. Invite New User
**Admin** can invite anyone to any team. **Manager** can only invite employees to their own team.

```bash
curl -X POST http://10.10.0.43:3000/users/invite \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "first_name": "New",
    "last_name": "User",
    "employee_id": "EMP003",
    "role": "employee",
    "manager_id": "MANAGER_UUID"
  }'
```

---

### 10. Get User Details
```bash
curl -X GET http://10.10.0.43:3000/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 11. Update User Role (Admin Only)
```bash
curl -X PATCH http://10.10.0.43:3000/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "manager"
  }'
```

---

### 12. Update User Status (Admin Only)
```bash
curl -X PATCH http://10.10.0.43:3000/users/USER_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

---

### 13. Reassign Manager (Admin Only)
```bash
curl -X PATCH http://10.10.0.43:3000/users/USER_ID/manager \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "manager_id": "NEW_MANAGER_UUID"
  }'
```

---

## 📁 Projects Management

### 14. List All Projects (Role-Scoped)
```bash
curl -X GET http://10.10.0.43:3000/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 15. Get System Project
```bash
curl -X GET http://10.10.0.43:3000/projects/system \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 16. Create New Project
```bash
curl -X POST http://10.10.0.43:3000/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "description": "Project description"
  }'
```

---

### 17. Get Project Details
```bash
curl -X GET http://10.10.0.43:3000/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 18. Update Project
```bash
curl -X PATCH http://10.10.0.43:3000/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Name",
    "description": "Updated description"
  }'
```

---

### 19. Archive Project (Admin Only)
```bash
curl -X DELETE http://10.10.0.43:3000/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 20. Assign Users to Project
```bash
curl -X POST http://10.10.0.43:3000/projects/PROJECT_ID/assign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": ["USER_UUID_1", "USER_UUID_2"]
  }'
```

---

### 21. Remove User from Project
```bash
curl -X DELETE http://10.10.0.43:3000/projects/PROJECT_ID/assign/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⏱️ Work Sessions

### 22. Start Work Session
```bash
curl -X POST http://10.10.0.43:3000/sessions/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "PROJECT_UUID"
  }'
```

---

### 23. Stop Work Session
```bash
curl -X POST http://10.10.0.43:3000/sessions/SESSION_ID/stop \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 24. List Active Sessions (Role-Scoped)
```bash
curl -X GET http://10.10.0.43:3000/sessions/active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 25. Get My Active Session
```bash
curl -X GET http://10.10.0.43:3000/sessions/active/mine \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 26. Log Activity (Rate-Limited: 1/10s)
```bash
curl -X POST http://10.10.0.43:3000/sessions/SESSION_ID/activity \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "active",
    "appName": "VS Code",
    "windowTitle": "main.ts - WorkPulse",
    "url": "file:///path/to/file"
  }'
```

---

## 🔔 Alerts

### 27. List Alerts (Role-Scoped)
```bash
curl -X GET http://10.10.0.43:3000/alerts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 28. Resolve Alert
```bash
curl -X PATCH http://10.10.0.43:3000/alerts/ALERT_ID/resolve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Reports

### 29. Get Daily Summaries
```bash
curl -X GET "http://10.10.0.43:3000/reports/daily?date=2026-02-13" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 30. Organization Analytics (Admin Only)
```bash
curl -X GET http://10.10.0.43:3000/reports/organization/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 31. Team Analytics (Manager Only)
```bash
curl -X GET http://10.10.0.43:3000/reports/team/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🏥 Health Check

### 32. API Health Check (No Auth Required)
```bash
curl -X GET http://10.10.0.43:3000/health
```

---

## 🚀 Quick Start Workflow

### Step 1: Register & Get Token
```bash
# Register new organization
RESPONSE=$(curl -s -X POST http://10.10.0.43:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test123!",
    "confirm_password": "Test123!",
    "first_name": "Test",
    "last_name": "Admin",
    "employee_id": "EMP001",
    "organization_name": "Test Org"
  }')

# Extract token (requires jq)
TOKEN=$(echo $RESPONSE | jq -r '.access_token')
ORG_ID=$(echo $RESPONSE | jq -r '.user.organization_id')

echo "Token: $TOKEN"
echo "Org ID: $ORG_ID"
```

---

### Step 2: List Projects
```bash
curl -X GET http://10.10.0.43:3000/projects \
  -H "Authorization: Bearer $TOKEN"
```

---

### Step 3: Start a Session
```bash
# Get system project ID
PROJECT_RESPONSE=$(curl -s -X GET http://10.10.0.43:3000/projects/system \
  -H "Authorization: Bearer $TOKEN")

PROJECT_ID=$(echo $PROJECT_RESPONSE | jq -r '.id')

# Start session
curl -X POST http://10.10.0.43:3000/sessions/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"project_id\": \"$PROJECT_ID\"}"
```

---

## 📝 Tips

1. **Save your token**: Store the JWT token in an environment variable:
   ```bash
   export TOKEN="your_jwt_token_here"
   ```

2. **Pretty print JSON**: Add `| jq` to the end of curl commands:
   ```bash
   curl ... | jq
   ```

3. **Save response**: Redirect output to a file:
   ```bash
   curl ... > response.json
   ```

4. **Verbose mode**: Add `-v` flag to see request/response headers:
   ```bash
   curl -v ...
   ```
