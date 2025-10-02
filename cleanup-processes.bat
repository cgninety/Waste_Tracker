@echo off
title Waste Management - Process Cleanup
cls

echo Cleaning up existing Waste Management processes...
echo.

REM Try graceful shutdown first
echo [1/4] Attempting graceful shutdown on ports 3000-3010...
for /L %%p in (3000,1,3010) do (
    curl -X POST http://localhost:%%p/admin/shutdown >nul 2>&1
)

REM Wait for graceful shutdown
timeout /t 3 >nul 2>&1

echo [2/4] Killing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1

echo [3/4] Killing processes on waste management ports...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3002" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3003" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3004" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3005" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo [4/4] Clearing port locks...
REM Wait a moment for ports to be released
timeout /t 2 >nul 2>&1

echo.
echo Process cleanup completed.
echo.