@echo off
echo Build Script Started...

REM 1. Install Backend Dependencies
echo Installing Python dependencies...
pip install -r backend/requirements.txt
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install Python dependencies
    exit /b %ERRORLEVEL%
)

REM 2. Install Frontend Dependencies
echo Installing Node dependencies...
cd frontend
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install Node dependencies
    exit /b %ERRORLEVEL%
)

REM 3. Build Frontend
echo Building Frontend...
call npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to build Frontend
    exit /b %ERRORLEVEL%
)

echo Build Complete!
cd ..
