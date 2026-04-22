# AGENTS.md

This file provides instructions for agentic coding agents working in this repository.

## Project Overview

Decksite is a self-hosted service status launchpad. It monitors external URLs via HTTP HEAD requests and displays their status (up/down) in a React frontend backed by a Flask API server.

**Stack:**
- Backend: Python 3 / Flask / aiohttp
- Frontend: React 18 / Vite / CSS Variables
- Config: `config.json` (array of `{name, url}` objects)

---

## Build / Lint / Test Commands

### Backend (Python/Flask)
```bash
# Run the Flask server
python backend/app.py

# Install dependencies
pip install -r backend/requirements.txt

# Linting (if flake8 or ruff installed)
flake8 backend/app.py
ruff check backend/

# Note: No formal test framework is currently configured.
# To run a single test file manually, source it directly:
python -c "import backend.app; backend.app.load_config()"
```

### Frontend (React/Vite)
```bash
# Install dependencies
cd client && npm install

# Development server (proxies /api to localhost:5000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# ESLint (JSX linting)
npx eslint src/

# Run a single ESLint check on one file
npx eslint src/App.jsx
```

### Docker
```bash
# Build and run
docker-compose up --build
```

---

## Code Style Guidelines

### General Conventions

- **Two terminals required** for local dev: backend (Flask on port 5000) + frontend (Vite dev server on port 5173)
- Config writes use `fcntl.flock()` for thread-safety
- Backend serves built frontend from `client/dist`
- Theme stored in `localStorage` key: `decksite-theme`

### Backend (Python)

**Imports:**
```python
from flask import Flask, jsonify, render_template, request, send_from_directory
import requests
import json
import asyncio
import aiohttp
import os
import re
import fcntl
from typing import Dict, Any
from urllib.parse import urlparse
```

**Formatting:**
- 4-space indentation
- Type hints for function signatures (e.g., `-> list`, `-> Dict[str, bool]`)
- Docstrings for all public functions (Google style)
- Max line length: ~120 chars

**Naming:**
- Functions: `snake_case` (e.g., `load_config`, `check_url_status`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `CONFIG_FILE`)
- Types: `PascalCase` when using type aliases

**Error Handling:**
- Try/except blocks with specific exceptions
- Return meaningful error messages in JSON responses
- HTTP status codes: 400 (bad request), 404 (not found), 409 (conflict), 500 (server error)

**Async Patterns:**
- Use `async def` for coroutines
- `aiohttp.ClientSession()` for HTTP requests
- `asyncio.gather()` for concurrent operations
- HEAD requests with 5-second timeout
- Status 200-399 = "up"

### Frontend (React/JSX)

**Imports:**
```jsx
import { useState, useCallback, useEffect } from 'react';
import { fetchApps, deleteApp } from './api/client';
```

**Component Structure:**
```jsx
export function ComponentName({ prop1, prop2 }) {
  // Hooks at top
  const [state, setState] = useState(initialValue);

  // Callbacks for event handlers
  const handleClick = useCallback(() => { ... }, []);

  // Effects after callbacks
  useEffect(() => { ... }, [dep]);

  return ( ... );
}
```

**Naming:**
- Components: `PascalCase` (e.g., `AppCard`, `AddAppModal`)
- Hooks: `camelCase` starting with `use` (e.g., `useStatus`)
- Custom hooks return objects: `{ status, loading, error, refresh: checkStatus }`
- CSS classes: `kebab-case` (e.g., `app-card`, `status-indicator`)

**Formatting:**
- JSX in `.jsx` files (not `.js`)
- Named exports for reusable components
- Default export for root component (`App.jsx`)
- Props destructured in function signature
- Event handlers use `e.preventDefault()` and `e.stopPropagation()` where needed
- Accessibility: `aria-label` on icon-only buttons

**CSS / Theming:**
- CSS variables in `index.css`
- Theme via `data-theme` attribute on root
- Variables: `--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-secondary`, `--border-color`, `--accent-color`
- Light/dark mode with localStorage persistence

### TypeScript/JavaScript Patterns

**API Client Pattern (`client/src/api/client.js`):**
```javascript
const API_BASE = '/api';

export async function fetchStatus() {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}
```

**Custom Hook Pattern (`hooks/useStatus.js`):**
```javascript
import { useState, useEffect, useCallback } from 'react';
const POLL_INTERVAL = 5000;

export function useStatus() {
  const [status, setStatus] = useState({});
  const checkStatus = useCallback(async () => { ... }, []);
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkStatus]);
  return { status, loading, error, refresh: checkStatus };
}
```

---

## Architecture Reference

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/status | Returns `{ "App Name": true/false }` |
| GET | /api/apps | Returns `[{ name, url, host? }]` |
| POST | /api/apps | Add app, returns 201 or 409 |
| PUT | /api/apps/:name | Update URL/host, returns 404 if missing |
| DELETE | /api/apps/:name | Remove app, returns 204 or 404 |

### Data Model

**config.json:**
```json
[
  { "name": "Service Name", "url": "https://example.com" }
]
```

**App object in memory:**
```json
{ "name": "string", "url": "https://...", "host": "optional" }
```

### URL Validation Rules

- Must have `http://` or `https://` scheme
- Must have valid netloc (domain)
- App names: alphanumeric, spaces, hyphens, underscores (max 50 chars)

---

## Security Notes

- Never expose secrets in responses or logs
- Validate all user input (names, URLs)
- Use `fcntl.flock()` for config file writes
- CORS handled by Vite proxy in dev, direct serving in production
- `rel="noopener noreferrer"` on external links