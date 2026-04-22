# 💻 Decksite Status Launchpad

Decksite is a self-hosted service status dashboard designed to monitor and display the operational status of various online services in a centralized and aesthetically pleasing manner.

## 🚀 Features

*   **Service Monitoring:** Monitors the status of multiple external URLs using HTTP HEAD requests.
*   **Three-Layer Architecture:** Composed of a Python/Flask backend, a React/Vite frontend, and a `config.json` source of truth.
*   **Real-time Status:** Uses a dedicated frontend hook to poll the backend API every 5 seconds for status updates.
*   **Theming:** Supports Light and Dark mode with persistence via `localStorage`.

## 🧱 Architecture Overview

The application is structured into three main parts:

### 1. Backend (Python/Flask) - `backend/app.py`
The backend handles all service interaction and serves the static frontend build.

*   **`config.json`:** The single source of truth, containing an array of `{name, url}` objects for all monitored services.
*   **`/api/status` (GET):** The core endpoint. It performs asynchronous `HEAD` requests to all configured URLs.
    *   **Response:** Returns a JSON object mapping service names to their status (`{ "App Name": true/false }`).
    *   **Logic:** A status of 200-399 (up) is considered "up" (`true`).
*   **`/api/apps` (GET/POST):** Manages the list of monitored applications.
    *   **GET:** Lists all configured apps.
    *   **POST:** Adds a new app `{ name, url }`. Returns 201 on success or 409 on duplicate name.
*   **`/api/apps/<name>` (PUT/DELETE):** Allows updating or removing an app entry.

### 2. Frontend (React 18/Vite) - `client/`
The client is a modern React application responsible for rendering the status dashboard.

*   **`App.jsx`:** The main container component that utilizes the `ThemeContext` and displays the `AppList`.
*   **`hooks/useStatus.js`:** Manages the state and polling logic, calling `/api/status` every 5000ms.
*   **`api/client.js`:** A dedicated client for all backend communications.
*   **Theming:** The theme preference (Light/Dark) is stored in `localStorage` under the key `decksite-theme`.

### 3. Configuration
*   **`config.json`:** **Crucial:** Defines which services are monitored. All services must adhere to the `http://` or `https://` scheme for URL validation.

## ⚙️ Setup and Installation

Follow these steps to get the local development environment running.

### 1. Dependencies

You must install both the backend and frontend dependencies.

```bash
# Backend dependencies
pip install -r backend/requirements.txt

# Frontend dependencies
cd client
npm install
```

### 2. Environment Variables

Create a `.env` file and populate it with your necessary environment variables.

```bash
cp .env.example .env
# Ensure you set the PORT if needed.
```

## 🚀 Running Locally

The application requires two terminals to run simultaneously.

**Terminal 1: Run the Backend**
This terminal starts the Flask server and handles all API requests.

```bash
python backend/app.py
```

**Terminal 2: Run the Frontend Dev Server**
This terminal starts the React development server.

```bash
cd client
npm run dev
```
*Note: The backend serves built frontend static files from `client/dist`.*

## 🛠️ API Reference

All endpoints are relative to the backend server's root URL.

| Method | Endpoint | Description | Example Request Body |
| :--- | :--- | :--- | :--- |
| GET | `/api/status` | Returns the current status of all monitored apps. | N/A |
| GET | `/api/apps` | Lists all configured apps. | N/A |
| POST | `/api/apps` | Adds a new app. | `{"name": "Google", "url": "https://google.com"}` |
| PUT | `/api/apps/:name` | Updates the URL for an existing app. | `{"url": "https://new-google.com"}` |
| DELETE | `/api/apps/:name` | Removes an app from monitoring. | N/A |

## 🏗️ Building for Production

To prepare the application for deployment, run the following commands:

```bash
# 1. Build the frontend static assets
cd client
npm run build

# 2. (Optional) Run any backend migrations or setup steps
# ...
```
The resulting static files will be served by the backend from the `client/dist` directory.