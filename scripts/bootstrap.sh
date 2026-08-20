#!/usr/bin/env bash
# ==============================================================================
# SecureEval - One-Command Environment Bootstrap Script
# ==============================================================================
set -euo pipefail

echo "🚀 Bootstrapping SecureEval monorepo environment..."

# 1. Setup Environment Files
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "✓ Created root .env from .env.example"
  fi
fi

if [ ! -f backend/.env ]; then
  if [ -f backend/.env.example ]; then
    cp backend/.env.example backend/.env
    echo "✓ Created backend/.env from backend/.env.example"
  fi
fi

# 2. Install Python Dependencies
echo "📦 Installing Python locked dependencies..."
python -m pip install --upgrade pip
pip install -r requirements-lock.txt
pip install -r backend/requirements-dev.txt

# 3. Install Frontend Dependencies
echo "📦 Installing Frontend locked dependencies..."
npm ci --prefix frontend

echo "✨ Bootstrap complete! Run 'make test' or 'docker compose up' to start."
