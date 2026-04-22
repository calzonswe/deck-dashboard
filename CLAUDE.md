# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

Decksite is a self-hosted service status launchpad with three layers:

**1. Backend (Flask/Python)** - `backend/app.py`
- Reads app definitions from `config.json` (array of `{name, url}` objects)
- `/api/status` - Async endpoint using `aiohttp` for concurrent HEAD requests (200-399 = up)
- `/api/apps` GET/POST - List and add apps
- `/api/apps/<name>` PUT/DELETE - Update and remove apps
- Config writes use `fcntl.flock()` for thread-safe file locking
- Serves built frontend static files from `client/dist`

**2. Frontend (React 18/Vite)** - `client/`
- `App.jsx` - Main component with theme provider
- `components/` - `AppCard`, `AppList`, `AddAppModal`, `ThemeToggle`
- `hooks/useStatus.js` - Polls `/api/status` every 5 seconds
- `api/client.js` - API client for all backend communication
- `context/ThemeContext.jsx` - Light/dark mode with localStorage persistence
- Styling via CSS variables in `index.css` (data-theme attribute)

**3. Configuration**
- `config.json` - Source of truth for monitored services
- `.env` - PORT environment variable (default 5000)

## Common Development Commands

**Local Development:**
```bash
# Backend (terminal 1)
python backend/app.py

# Frontend dev server (terminal 2, client/)
npm run dev

# Build frontend for production (client/)
npm run build
```

**Docker:**
```bash
# Copy env template and configure
cp .env.example .env

# Build and run
docker-compose up --build
```

**Dependencies:**
- Backend: `pip install -r backend/requirements.txt`
- Frontend: `cd client && npm install`

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/status | Returns `{ "App Name": true/false }` |
| GET | /api/apps | Returns `[{ name, url }]` |
| POST | /api/apps | Add app `{ name, url }`, returns 201 or 409 (duplicate) |
| PUT | /api/apps/:name | Update URL, returns 404 if not found |
| DELETE | /api/apps/:name | Remove app, returns 204 or 404 |

## Key Implementation Details

- URL validation requires `http://` or `https://` scheme
- App names are sanitized to alphanumeric, spaces, hyphens, underscores (max 50 chars)
- Status polling interval: 5000ms
- Theme preference stored in localStorage under `decksite-theme`
- Docker volume mounts `config.json` for persistence across container restarts
