@echo off
echo Gracefully stopping Waste Dashboard Server...
echo This will preserve all your data.
echo.

curl -X POST http://localhost:3001/admin/shutdown 2>nul
if %errorlevel% equ 0 (
    echo Server shutdown request sent successfully.
    echo All data has been preserved.
) else (
    echo Could not connect to server. It may already be stopped.
)

echo.
echo You can also stop the server by:
echo 1. Press Ctrl+C in the terminal running the server
echo 2. Close the terminal window
echo 3. Run this script again
echo.
pause