# LAN Network Setup Guide for Frontend Team

## Overview
This guide helps your frontend team connect to the WorkPulse API running on your local machine via LAN.

---

## Prerequisites
- Backend and Frontend machines must be on the same LAN network
- Backend server must be running
- Firewall must allow incoming connections on port 3000

---

## Step 1: Find Your IP Address (Backend Machine)

### On Linux:
```bash
hostname -I | awk '{print $1}'
# Example output: 192.168.1.100
```

### On Windows:
```cmd
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

### On Mac:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Example output: inet 192.168.1.100
```

---

## Step 2: Configure Backend for LAN Access

### Update `.env` file:
```bash
# Change this:
# HOST=localhost

# To this (allow all network interfaces):
HOST=0.0.0.0
PORT=3000
```

### Update CORS in `src/main.ts` (if needed):
```typescript
app.enableCors({
  origin: '*',  // Allow all origins (development only)
  credentials: true,
});
```

---

## Step 3: Allow Firewall Access

### On Linux (Ubuntu/Debian):
```bash
# Allow port 3000
sudo ufw allow 3000/tcp

# Check status
sudo ufw status
```

### On Windows:
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Enter port `3000` → Next
6. Allow the connection → Next
7. Apply to all profiles → Next
8. Name it "WorkPulse API" → Finish

### On Mac:
```bash
# Mac firewall usually allows local network by default
# If needed, go to System Preferences → Security & Privacy → Firewall
```

---

## Step 4: Start the Backend Server

```bash
# Using Docker (recommended)
docker compose up -d

# Or using npm
npm run start:dev
```

Verify it's running:
```bash
curl http://localhost:3000/health
```

---

## Step 5: Share API URL with Frontend Team

Provide your frontend team with:
```
API Base URL: http://YOUR_IP_ADDRESS:3000
WebSocket URL: http://YOUR_IP_ADDRESS:3000

Example:
API Base URL: http://192.168.1.100:3000
WebSocket URL: http://192.168.1.100:3000
```

---

## Step 6: Frontend Team Configuration

### For React/Vue/Angular:
Create a `.env` file in the frontend project:
```bash
VITE_API_URL=http://192.168.1.100:3000
# or
REACT_APP_API_URL=http://192.168.1.100:3000
# or
VUE_APP_API_URL=http://192.168.1.100:3000
```

### For Axios:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.100:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

### For Socket.IO:
```javascript
import io from 'socket.io-client';

const socket = io('http://192.168.1.100:3000', {
  auth: {
    token: localStorage.getItem('access_token'),
  },
  transports: ['websocket'],
});
```

---

## Step 7: Test Connection

### From Frontend Machine:
```bash
# Test health endpoint
curl http://192.168.1.100:3000/health

# Expected response:
# {"status":"ok","info":{"database":{"status":"up"},"redis":{"status":"up"}}}
```

### From Browser:
Open browser and navigate to:
```
http://192.168.1.100:3000/health
```

You should see the health check JSON response.

---

## Troubleshooting

### Issue: "Connection refused" or "ERR_CONNECTION_REFUSED"

**Solutions:**
1. Verify backend is running: `docker ps` or check terminal
2. Check firewall is allowing port 3000
3. Verify both machines are on same network:
   ```bash
   # On backend machine
   ping FRONTEND_IP
   
   # On frontend machine
   ping BACKEND_IP
   ```
4. Ensure backend is listening on `0.0.0.0` not `localhost`

### Issue: "CORS error"

**Solution:**
Update `src/main.ts`:
```typescript
app.enableCors({
  origin: ['http://FRONTEND_IP:PORT', 'http://localhost:3000'],
  credentials: true,
});
```

### Issue: "Network unreachable"

**Solutions:**
1. Check if both devices are on same WiFi/LAN
2. Disable VPN on both machines
3. Check router settings (some routers block device-to-device communication)

### Issue: WebSocket connection fails

**Solution:**
Ensure WebSocket is using the correct transport:
```javascript
const socket = io('http://192.168.1.100:3000', {
  transports: ['websocket', 'polling'],  // Try both
});
```

---

## Security Notes

⚠️ **For Development Only:**
- The `origin: '*'` CORS setting is insecure for production
- Always use HTTPS in production
- Implement proper authentication and rate limiting

🔒 **For Production:**
- Use environment-specific CORS origins
- Enable HTTPS/TLS
- Use a reverse proxy (nginx/Apache)
- Implement API rate limiting
- Use secure JWT secrets

---

## Quick Reference

| Item | Value |
|------|-------|
| Backend IP | Run: `hostname -I \| awk '{print $1}'` |
| API Port | 3000 |
| Health Check | `http://YOUR_IP:3000/health` |
| WebSocket | `http://YOUR_IP:3000` |
| Database Port (if needed) | 5433 |
| Redis Port (if needed) | 6380 |

---

## Example Frontend Integration

```javascript
// api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.100:3000';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Usage
import api from './api';

// Login
const response = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password',
  organization_id: 'org-uuid',
});

localStorage.setItem('access_token', response.data.access_token);

// Start session
await api.post('/sessions/start', {
  project_id: 'project-uuid',
});
```
