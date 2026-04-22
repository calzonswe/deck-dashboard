# Dockerfile for Decksite - Multi-stage build for frontend + backend

# Stage 1: Build the React frontend
FROM node:20-alpine as frontend-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci

# Copy client source code
COPY client/ ./

# Build the frontend
RUN npm run build

# Stage 2: Build Python dependencies
FROM python:3.11-slim as backend-builder

WORKDIR /app/backend

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 3: Final production image
FROM python:3.11-slim

WORKDIR /app

# Copy installed Python dependencies
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/client/dist ./client/dist

# Copy config.json (will be overridden by volume mount)
COPY config.json ./config.json

# Expose the port
EXPOSE 5000

# Set environment variables
ENV FLASK_ENV=production

# Run the application
CMD ["python", "backend/app.py"]
