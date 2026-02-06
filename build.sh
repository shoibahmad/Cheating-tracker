#!/bin/bash

# Exit on error
set -e

echo "Deploying..."

# Install Python Dependencies
echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

# Install Node Dependencies
echo "Installing Node dependencies..."
cd frontend
npm install

# Build Frontend
echo "Building Frontend..."
npm run build

# Go back to root
cd ..

echo "Build successful!"
