# Dockerfile for the Backend Status Checker (Flask)
# We use a multi-stage build to keep the final image small.

# Stage 1: Build environment (install dependencies)
FROM python:3.11-slim as builder

WORKDIR /app/backend

# Copy requirements and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/app.py .
COPY config.json .

# Stage 2: Final production image
FROM python:3.11-slim

WORKDIR /app/backend

# Copy installed dependencies from the builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
# Copy the application code and config
COPY backend/app.py .
COPY config.json .

# Expose the port Flask runs on
EXPOSE 5000

# Command to run the application
CMD ["python", "app.py"]