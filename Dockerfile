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
# Removed nodejs and npm as they are not needed in this stage anymore
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

# Copy the current directory contents into the container at /app
COPY . .

# Copy the built frontend assets from the build stage
# This ensures we have the production build in the correct location
COPY --from=build /app/frontend/dist /app/frontend/dist

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
