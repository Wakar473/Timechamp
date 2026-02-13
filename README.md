# WorkPulse - Multi-Tenant Employee Monitoring SaaS Platform

A production-ready, multi-tenant employee monitoring platform with **role-based access control**, **hierarchical team management**, and **real-time tracking**. Built with NestJS, PostgreSQL, Redis, and Socket.IO.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL 16+ (if running without Docker)
- Redis 7+ (if running without Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workpulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start with Docker (Recommended)**
   ```bash
   docker compose up -d
   ```

5. **Verify it's running**
   ```bash
   curl http://localhost:3000/health
   ```

### Local Development (without Docker)

```bash
# Start PostgreSQL and Redis (ports 5433, 6380)
docker compose up -d postgres redis

# Run migrations
npm run migration:run

# Start API in dev mode
npm run start:dev

# In another terminal, start worker
npm run start:worker
```

## 📚 Documentation

- **[API Reference](docs/API.md)** - Complete API endpoints documentation
- **[OpenAPI/Swagger](docs/swagger.yml)** - Import into Swagger Editor for interactive docs
- **[Access Control Guide](docs/ACCESS_CONTROL.md)** - Role-based permissions matrix
- **[LAN Setup Guide](docs/LAN_SETUP.md)** - Connect frontend team via LAN
- **[Architecture](docs/ARCHITECTURE.md)** - System design & how it works

## ✨ Features

### Core Features
- ✅ **Multi-tenant Architecture** - Complete organization isolation
- ✅ **Role-Based Access Control (RBAC)** - Admin, Manager, Employee roles
- ✅ **Hierarchical Team Management** - Manager-employee team structure
- ✅ **Work Session Tracking** - Start/stop sessions with project assignment
- ✅ **Activity Logging** - Track active/idle time with app names and URLs
- ✅ **Real-time Updates** - WebSocket events for live dashboard updates
- ✅ **Background Jobs** - Daily summaries, idle detection, overtime alerts
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Health Checks** - Monitor database and Redis connectivity

### Role-Based Features

**Admin:**
- Full organization control
- Invite users (admin/manager/employee) to any team
- Manage all projects and users
- View organization-wide analytics
- Change roles and permissions

**Manager:**
- Invite employees to their own team
- Create and manage team projects
- Assign team members to projects
- View team analytics
- Monitor team activity

**Employee:**
- Start/stop work sessions on assigned projects
- Log activity (active/idle time)
- View personal reports
- Access assigned projects

### System Features
- ✅ **System Project Fallback** - "Internal / Training" auto-assigned to all employees
- ✅ **Team Boundary Enforcement** - Managers isolated to their teams
- ✅ **Project Assignment Tracking** - Many-to-many user-project relationships
- ✅ **Online Presence Tracking** - Real-time user status

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | NestJS 10, TypeScript 5 |
| **Database** | PostgreSQL 16, TypeORM 0.3 |
| **Cache/Queue** | Redis 7, BullMQ 5 |
| **Real-time** | Socket.IO 4 |
| **Auth** | JWT, Passport, bcrypt |
| **DevOps** | Docker, Docker Compose |
| **Logging** | Pino |

## 📡 API Endpoints

### Authentication
```http
POST /auth/register  # Register organization & admin
POST /auth/login     # Login user
```

### Users Management
```http
GET  /users              # List users (role-scoped)
GET  /users/online       # Online users (last 5 min)
GET  /users/assignable   # Employees for project assignment
POST /users/invite       # Invite user (admin: any team, manager: own team)
PATCH /users/:id/role    # Update role (admin only)
PATCH /users/:id/status  # Enable/disable (admin only)
PATCH /users/:id/manager # Reassign manager (admin only)
GET  /users/:id          # Get user details
```

### Projects
```http
GET    /projects              # List projects (role-scoped)
GET    /projects/system       # Get system project
POST   /projects              # Create project
GET    /projects/:id          # Get project details
PATCH  /projects/:id          # Update project
DELETE /projects/:id          # Archive project (admin only)
POST   /projects/:id/assign   # Assign users to project
DELETE /projects/:id/assign/:userId  # Remove user from project
```

### Work Sessions
```http
POST /sessions/start          # Start work session (project required)
POST /sessions/:id/stop       # Stop work session
GET  /sessions/active         # Get active sessions (role-scoped)
POST /sessions/:id/activity   # Log activity (rate-limited: 1/10s)
```

### Activity Logging
```http
POST /sessions/:id/activity   # Log single activity
POST /activity/batch          # Batch log activities
```

### Health
```http
GET /health                   # Health check
```

See [API.md](docs/API.md) for complete documentation.

## 🌐 LAN Network Setup

To allow frontend team to connect via LAN:

1. **Get your IP address**
   ```bash
   hostname -I | awk '{print $1}'
   # Example: 192.168.1.100
   ```

2. **Update `.env`**
   ```bash
   HOST=0.0.0.0  # Listen on all interfaces
   PORT=3000
   ```

3. **Allow firewall**
   ```bash
   sudo ufw allow 3000/tcp
   ```

4. **Share with frontend team**
   ```
   API URL: http://192.168.1.100:3000
   ```

See [LAN_SETUP.md](docs/LAN_SETUP.md) for detailed guide.

## 🧪 Testing

### Run concurrency load test
```bash
node test/test-activity-load.js
```

This tests:
- User registration
- Session creation
- 100 concurrent activity updates
- Optimistic locking verification

## 🗄️ Database

### Run migrations
```bash
npm run migration:run
```

### Revert migration
```bash
npm run migration:revert
```

### Generate new migration
```bash
npm run migration:generate -- src/migrations/MigrationName
```

### Database schema
- `organizations` - Companies/tenants
- `users` - Employee accounts
- `projects` - Optional project tracking
- `work_sessions` - Work time tracking
- `activity_logs` - Detailed activity records
- `daily_summaries` - Daily aggregated stats
- `alerts` - System alerts (idle, overtime)

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_HOST` | PostgreSQL host | `localhost` |
| `DATABASE_PORT` | PostgreSQL port | `5433` |
| `DATABASE_USER` | Database user | `workpulse` |
| `DATABASE_PASSWORD` | Database password | `changeme` |
| `DATABASE_NAME` | Database name | `workpulse_db` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6380` |
| `JWT_SECRET` | JWT signing secret | (required) |
| `PORT` | API server port | `3000` |
| `HOST` | API server host | `localhost` |

## 🐳 Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker logs workpulse_api -f
docker logs workpulse_worker -f

# Stop all services
docker compose down

# Rebuild and restart
docker compose up --build -d

# Remove all containers and volumes
docker compose down -v
```

## 📁 Project Structure

```
workpulse/
├── src/
│   ├── modules/
│   │   ├── auth/              # JWT authentication
│   │   ├── users/             # User management (NEW - RBAC)
│   │   ├── projects/          # Project management (ENHANCED)
│   │   ├── sessions/          # Work session tracking
│   │   ├── activity/          # Activity logging
│   │   ├── reports/           # Analytics & reports
│   │   ├── websocket/         # Real-time events
│   │   ├── jobs/              # Background processors
│   │   └── health/            # Health checks
│   ├── entities/
│   │   ├── user.entity.ts             # User with manager hierarchy
│   │   ├── organization.entity.ts     # Multi-tenant container
│   │   ├── project.entity.ts          # Projects with types
│   │   ├── project-assignment.entity.ts  # User-project mapping (NEW)
│   │   ├── work-session.entity.ts     # Session tracking
│   │   ├── activity-log.entity.ts     # Activity records
│   │   ├── alert.entity.ts            # Idle/overtime alerts
│   │   └── daily-summary.entity.ts    # Daily aggregates
│   ├── common/
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts      # JWT validation
│   │   │   ├── roles.guard.ts         # Role-based access (NEW)
│   │   │   └── team-boundary.guard.ts # Manager team isolation (NEW)
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts     # Role metadata (NEW)
│   │   ├── utils/
│   │   │   └── query-filter.util.ts   # Role-based filters (NEW)
│   │   └── enums.ts                   # UserRole, ProjectType, etc.
│   └── main.ts
├── docs/
│   ├── API.md                 # API documentation
│   ├── swagger.yml            # OpenAPI 3.0 spec (NEW)
│   ├── ACCESS_CONTROL.md      # RBAC guide (NEW)
│   ├── LAN_SETUP.md          # Network setup
│   └── ARCHITECTURE.md        # System design
├── docker-compose.yml
└── package.json
```

## 🔐 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with 7-day expiration
- Role-based access control (Admin, Manager, Employee)
- Multi-tenant data isolation
- Input validation with DTOs
- SQL injection prevention via TypeORM

## 📈 Performance

- **Optimistic locking** prevents data corruption
- **Database indexing** on frequently queried columns
- **Redis caching** for online presence
- **Background jobs** for heavy processing
- **Connection pooling** via TypeORM

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check [Architecture Documentation](docs/ARCHITECTURE.md)
- Review [API Documentation](docs/API.md)
- Check Docker logs: `docker logs workpulse_api`

## 🎯 Roadmap

- [ ] Screenshots/screen recording
- [ ] Advanced analytics dashboard
- [ ] Mobile app support
- [ ] PDF report exports
- [ ] Project management integrations
- [ ] AI-powered insights

---

**Built with ❤️ using NestJS**
