# Stage 1: Build the frontend
FROM node:18-alpine as build
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm install

# Build Arguments
ARG VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY

# Copy the rest of the frontend source code
COPY frontend/ .
RUN npm run build

# Stage 2: Setup the backend
FROM python:3.11-slim

# Install system dependencies for OpenCV and Tesseract
# python:3.11-slim is Debian 12 (Bookworm), so libgl1-mesa-glx is not available. Using libgl1 instead.
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Create a non-root user for security and to suppress the pip warning
RUN useradd -m appuser && chown -R appuser /app

# Copy the current directory contents into the container at /app
COPY . .

# Copy the built frontend assets from the build stage
COPY --from=build /app/frontend/dist /app/frontend/dist

# Switch to the non-root user
USER appuser

# Install Python dependencies
# Using --user to avoid root-owned files and adding bin to PATH
RUN pip install --no-cache-dir --user -r requirements.txt

# Ensure the local bin is in PATH for the user
ENV PATH="/home/appuser/.local/bin:${PATH}"

# Expose port
EXPOSE 8000

# Run the application
# We need to use the full path to uvicorn if it's in the user's bin
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
