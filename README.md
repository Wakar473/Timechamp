# WorkPulse Frontend Dashboard

Modern admin dashboard for WorkPulse workforce productivity platform built with React, TypeScript, and Tailwind CSS.

## Features

- ✅ JWT Authentication
- ✅ Real-time WebSocket updates
- ✅ Dashboard with live stats
- ✅ Projects CRUD operations
- ✅ Productivity reports
- ✅ Team monitoring
- ✅ Responsive design

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Server state management
- **React Router** - Routing
- **Socket.IO** - Real-time updates
- **Zustand** - Global state
- **Heroicons** - Icons
- **date-fns** - Date utilities

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

## Project Structure

```
src/
├── api/              # API client & endpoints
├── components/       # Reusable UI components
│   ├── common/       # Buttons, Cards, etc.
│   └── layout/       # Layout components
├── features/         # Feature modules
├── hooks/            # Custom React hooks
├── lib/              # Utilities
├── pages/            # Route pages
├── services/         # WebSocket services
├── store/            # Global state
└── types/            # TypeScript types
```

## Available Pages

- **/login** - Authentication
- **/** - Dashboard with real-time stats
- **/team** - Team monitoring
- **/projects** - Projects management
- **/reports** - Analytics & reports

## Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Integration with Backend

The frontend automatically connects to:
- REST API: `VITE_API_URL`
- WebSocket: `VITE_WS_URL`

Make sure the backend is running before starting the frontend.

## WebSocket Events

The dashboard listens to:
- `USER_ONLINE` - User connected
- `USER_OFFLINE` - User disconnected
- `SESSION_UPDATE` - Activity updated
- `INACTIVE_ALERT` - Idle alert
- `OVERTIME_ALERT` - Overtime warning

## Development

```bash
# Run dev server
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## License

MIT
