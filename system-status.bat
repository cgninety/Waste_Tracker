@echo off
title Waste Management System - System Status
color 0B

echo ===============================================
echo      WASTE MANAGEMENT SYSTEM STATUS CHECK
echo ===============================================
echo.

echo [SYSTEM REQUIREMENTS CHECK]
echo.

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('node --version') do echo ✓ Node.js: %%a
) else (
    echo ✗ Node.js: Not installed
    set has_errors=1
)

REM Check NPM
echo Checking NPM...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('npm --version') do echo ✓ NPM: v%%a
) else (
    echo ✗ NPM: Not installed
    set has_errors=1
)

echo.
echo [CONFIGURATION STATUS]
echo.

REM Check configuration files
if exist "config\system.env" (
    echo ✓ System configuration: Found
) else (
    echo ✗ System configuration: Missing
    set has_errors=1
)

if exist "config\network.env" (
    echo ✓ Network configuration: Found
) else (
    echo ✗ Network configuration: Missing
    set has_errors=1
)

if exist "config\ui.env" (
    echo ✓ UI configuration: Found
) else (
    echo ✗ UI configuration: Missing
    set has_errors=1
)

echo.
echo [DEPENDENCIES STATUS]
echo.

REM Check if dependencies are installed
if exist "node_modules\" (
    echo ✓ Dependencies: Installed
) else (
    echo ✗ Dependencies: Missing (run 'npm install')
    set has_errors=1
)

if exist "client\node_modules\" (
    echo ✓ Client dependencies: Installed
) else (
    echo ✗ Client dependencies: Missing
    set has_errors=1
)

if exist "server\node_modules\" (
    echo ✓ Server dependencies: Installed
) else (
    echo ✗ Server dependencies: Missing
    set has_errors=1
)

echo.
echo [BUILD STATUS]
echo.

if exist "client\build\" (
    echo ✓ Client build: Available
) else (
    echo ✗ Client build: Missing (run 'npm run build')
)

if exist "server\dist\" (
    echo ✓ Server build: Available
) else (
    echo ✗ Server build: Missing (run 'npm run build')
)

echo.
echo [NETWORK STATUS]
echo.

REM Check if ports are available
netstat -an | findstr ":3001" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠ Port 3001: In use (Server may be running)
) else (
    echo ✓ Port 3001: Available
)

netstat -an | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠ Port 3000: In use (Client may be running)
) else (
    echo ✓ Port 3000: Available
)

echo.
echo [STORAGE STATUS]
echo.

if exist "data\" (
    echo ✓ Data directory: Available
    for /f %%a in ('dir /b data 2^>nul ^| find /c /v ""') do echo   - Files: %%a
) else (
    echo ✗ Data directory: Missing
)

if exist "logs\" (
    echo ✓ Logs directory: Available
    for /f %%a in ('dir /b logs 2^>nul ^| find /c /v ""') do echo   - Files: %%a
) else (
    echo ⚠ Logs directory: Missing (will be created on startup)
)

echo.
echo ===============================================

if defined has_errors (
    echo        SYSTEM STATUS: ISSUES DETECTED
    echo.
    echo Please resolve the issues above before starting the system.
    echo Run 'configure-system.bat' to fix configuration issues.
) else (
    echo          SYSTEM STATUS: READY
    echo.
    echo All checks passed! System is ready to start.
)

echo ===============================================
echo.

echo [QUICK ACTIONS]
echo [1] Start System
echo [2] Run Configuration
echo [3] Install Dependencies  
echo [4] View Logs
echo [0] Exit
echo.
set /p action="Select action (0-4): "

if "%action%"=="1" call start.bat
if "%action%"=="2" call configure-system.bat
if "%action%"=="3" (
    echo Installing dependencies...
    npm install
    echo Dependencies installed!
    pause
)
if "%action%"=="4" (
    if exist "logs\" (
        dir logs
        echo.
        echo Select a log file to view or press any key to continue...
        pause
    ) else (
        echo No log files found.
        pause
    )
)

if not "%action%"=="0" goto :eof