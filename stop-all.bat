@echo off
title Waste Management System - Stop All
cls

echo ===============================================
echo      WASTE MANAGEMENT SYSTEM - SHUTDOWN
echo ===============================================
echo.

echo Stopping all Waste Management processes...
echo.

REM Use the consolidated cleanup script
call "%~dp0\cleanup-processes.bat"

echo [Final] Verifying shutdown...

REM Kill ts-node processes (backend server)
wmic process where "name='node.exe' and commandline like '%%ts-node%%'" delete >nul 2>&1

REM Kill react-scripts processes (frontend server)
wmic process where "name='node.exe' and commandline like '%%react-scripts%%'" delete >nul 2>&1

REM Kill any Node.js process using our typical ports
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000.*LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3001.*LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3002.*LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3003.*LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat-ano 2^>nul ^| findstr ":3004.*LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3005.*LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo [3/3] Cleanup complete!
echo.
echo All waste management system instances have been stopped.
echo Ports have been released and are ready for fresh startup.
echo.
pause