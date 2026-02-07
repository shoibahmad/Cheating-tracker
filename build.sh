#!/bin/bash
# Exit on error
set -e

echo "Build Script Started..."

# 1. Install Backend Dependencies
echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

# 2. Install Frontend Dependencies
echo "Installing Node dependencies..."
cd frontend
npm install

# 3. Build Frontend
echo "Building Frontend..."
npm run build

echo "Build Complete!"
