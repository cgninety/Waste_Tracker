@echo off
setlocal enabledelayedexpansion
title Waste Management System - Main Startup
cls

echo ===============================================
echo      WASTE MANAGEMENT SYSTEM - STARTUP
echo ===============================================
echo.

REM Clean startup - kill existing processes first
echo [1/6] Cleaning up existing processes...
call "%~dp0\cleanup-processes.bat"

REM Check Node.js installation
echo [2/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Install dependencies if needed
echo [3/6] Checking dependencies...
cd /d "%~dp0"
if not exist "node_modules\" (
    echo Installing root dependencies...
    npm install
)

cd server
if not exist "node_modules\" (
    echo Installing server dependencies...
    npm install
)

cd ../client
if not exist "node_modules\" (
    echo Installing client dependencies...
    npm install
)

cd ..

REM Build server
echo [4/6] Building server...
cd server
call npm run build
cd ..

REM Set environment variables
echo [5/6] Configuring environment...
set PORT=3003
set REACT_APP_API_URL=http://localhost:3004/api
set HOST=0.0.0.0

REM Start services
echo [6/6] Starting services...
echo.
echo Starting server on port 3004...
cd server
start "Waste Management Server" cmd /k "npm start"

REM Wait for server to start
timeout /t 5 >nul

echo Starting client on port 3003...
cd ../client
start "Waste Management Client" cmd /k "npm start"

echo.
echo ===============================================
echo System is starting up...
echo Server: http://localhost:3004
echo Client: http://localhost:3003
echo LAN Access: http://%COMPUTERNAME%:3003 (if firewall allows)
echo ===============================================
echo.
echo Press any key to view system status...
pause >nul

REM Show status
call "%~dp0\system-status.bat"

echo.
echo Startup completed. Windows will remain open for monitoring.
echo To stop all services, run: stop-all.bat
echo.
pause