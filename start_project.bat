@echo off
echo ==========================================
echo Starting SecureEval Project
echo ==========================================

echo Starting Backend Server...
start "SecureEval Backend" cmd /k "uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Frontend Server...
cd frontend
start "SecureEval Frontend" cmd /k "npm run dev"

echo ==========================================
echo Servers are starting in separate windows.
echo Backend: http://localhost:8000/docs
echo Frontend: http://localhost:5173
echo ==========================================
pause
