# WorkPulse - Employee Monitoring SaaS Platform

A production-ready, multi-tenant employee monitoring platform built with NestJS, PostgreSQL, Redis, and Socket.IO.

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
- **[LAN Setup Guide](docs/LAN_SETUP.md)** - Connect frontend team via LAN
- **[Architecture](docs/ARCHITECTURE.md)** - System design & how it works

## ✨ Features

- ✅ **Multi-tenant Architecture** - Support multiple organizations
- ✅ **Work Session Tracking** - Start/stop work sessions with optimistic locking
- ✅ **Activity Logging** - Track active/idle time with app names and URLs
- ✅ **Real-time Updates** - WebSocket events for live dashboard updates
- ✅ **Background Jobs** - Daily summaries, idle detection, overtime alerts
- ✅ **JWT Authentication** - Secure token-based auth with role-based access
- ✅ **Health Checks** - Monitor database and Redis connectivity

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
POST /auth/register  # Register new user
POST /auth/login     # Login user
```

### Work Sessions
```http
POST /sessions/start          # Start work session
POST /sessions/:id/stop       # Stop work session
GET  /sessions/active         # Get active sessions
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

## 📊 Project Structure

```
workpulse/
├── src/
│   ├── main.ts              # API entry point
│   ├── worker.ts            # Worker entry point
│   ├── entities/            # Database models
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication
│   │   ├── sessions/        # Work sessions
│   │   ├── activity/        # Activity logging
│   │   ├── websocket/       # Real-time events
│   │   └── health/          # Health checks
│   ├── jobs/                # Background jobs
│   ├── migrations/          # Database migrations
│   └── config/              # Configuration
├── docs/                    # Documentation
├── test/                    # Tests
└── docker-compose.yml       # Docker orchestration
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
