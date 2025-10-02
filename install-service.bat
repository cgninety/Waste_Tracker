@echo off
title Waste Management System - Service Installer
color 0B

echo ===============================================
echo   WASTE MANAGEMENT SYSTEM SERVICE INSTALLER
echo ===============================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo This script requires administrator privileges.
    echo Please run as administrator.
    pause
    exit /b 1
)

echo Installing Waste Management System as Windows Service...
echo.

REM Install PM2 globally if not already installed
echo [1/4] Checking PM2 installation...
npm list -g pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing PM2...
    npm install -g pm2
    npm install -g pm2-windows-service
)

echo [2/4] Setting up PM2 ecosystem...
REM Create PM2 ecosystem file
echo module.exports = {> ecosystem.config.js
echo   apps: [>> ecosystem.config.js
echo     {>> ecosystem.config.js
echo       name: 'waste-management-server',>> ecosystem.config.js
echo       script: './server/dist/index.js',>> ecosystem.config.js
echo       instances: 1,>> ecosystem.config.js
echo       autorestart: true,>> ecosystem.config.js
echo       watch: false,>> ecosystem.config.js
echo       max_memory_restart: '1G',>> ecosystem.config.js
echo       env: {>> ecosystem.config.js
echo         NODE_ENV: 'production',>> ecosystem.config.js
echo         PORT: 3001>> ecosystem.config.js
echo       }>> ecosystem.config.js
echo     },>> ecosystem.config.js
echo     {>> ecosystem.config.js
echo       name: 'waste-management-client',>> ecosystem.config.js
echo       script: 'serve',>> ecosystem.config.js
echo       args: '-s ./client/build -l 3000',>> ecosystem.config.js
echo       instances: 1,>> ecosystem.config.js
echo       autorestart: true,>> ecosystem.config.js
echo       watch: false>> ecosystem.config.js
echo     }>> ecosystem.config.js
echo   ]>> ecosystem.config.js
echo };>> ecosystem.config.js

echo [3/4] Building application...
call npm run build

echo [4/4] Installing Windows service...
pm2-service-install -n WasteManagementSystem

echo.
echo Service installed successfully!
echo.
echo Service Management Commands:
echo - Start: pm2 start ecosystem.config.js
echo - Stop: pm2 stop all
echo - Restart: pm2 restart all
echo - Status: pm2 status
echo - Logs: pm2 logs
echo.

pause