@echo off
title Waste Management System - Main Launcher
cls

:MAIN_SCREEN
cls
echo ===============================================
echo      WASTE MANAGEMENT SYSTEM - LAUNCHER
echo ===============================================
echo.
echo [1] Start System (Port 3003/3004)  [4] System Status
echo [2] Stop All Services              [5] View Logs  
echo [3] Configure System               [0] Exit
echo.
echo Current Configuration:
echo   Client: http://localhost:3003
echo   Server: http://localhost:3004
echo   LAN Access: Available on all network interfaces
echo.

netstat -an | findstr ":3003" >nul 2>&1 && echo Client: Running on Port 3003 || echo Client: Stopped
netstat -an | findstr ":3004" >nul 2>&1 && echo Server: Running on Port 3004 || echo Server: Stopped

echo.
set /p "choice=Select option (0-5): "

if "%choice%"=="1" goto START_SYSTEM
if "%choice%"=="2" goto STOP_SYSTEM
if "%choice%"=="3" goto CONFIGURE
if "%choice%"=="4" goto STATUS_CHECK
if "%choice%"=="5" goto VIEW_LOGS
if "%choice%"=="0" goto EXIT

goto MAIN_SCREEN

:START_SYSTEM
cls
echo ===============================================
echo           STARTING SYSTEM
echo ===============================================
echo.
call start-system.bat
goto MAIN_SCREEN

:STOP_SYSTEM
cls
echo ===============================================
echo           STOPPING SYSTEM
echo ===============================================
echo.
call stop-all.bat
echo.
pause
goto MAIN_SCREEN
echo.
call start.bat
goto MAIN_SCREEN

:LAN_START
cls
echo ===============================================
echo        START WITH LAN ACCESS (RECOMMENDED)
===============================================
echo.
echo Starting system with network access enabled...
echo This allows access from mobile devices and other computers
echo on your network.
echo.
call start-lan.bat
goto MAIN_SCREEN

:CONFIGURE
cls
echo ===============================================
echo             SYSTEM CONFIGURATION
echo ===============================================
call configure-system.bat
goto MAIN_SCREEN

:STATUS_CHECK
cls
echo ===============================================
echo               SYSTEM STATUS
echo ===============================================
call system-status.bat
pause
goto MAIN_SCREEN

:VIEW_LOGS
cls
echo ===============================================
echo                 VIEW LOGS
echo ===============================================
echo.
if exist "server\logs\combined.log" (
    echo Recent server logs:
    tail -n 20 "server\logs\combined.log" 2>nul || type "server\logs\combined.log"
) else (
    echo No server logs found.
)
echo.
pause
goto MAIN_SCREEN

:INSTALL_SERVICE
cls
echo ===============================================
echo            WINDOWS SERVICE INSTALLER
===============================================
call install-service.bat
goto MAIN_SCREEN

:STATUS_CHECK
cls
echo ===============================================
echo              SYSTEM STATUS CHECK
===============================================
call system-status.bat
goto MAIN_SCREEN

:BACKUP
cls
echo ===============================================
echo               BACKUP UTILITY
===============================================
call backup-system.bat
goto MAIN_SCREEN

:VIEW_LOGS
cls
echo ===============================================
echo                VIEW LOGS
===============================================
echo.
if exist "logs\" (
    echo Available log files:
    echo.
    dir /b logs\*.log 2>nul
    echo.
    echo [1] Combined Logs
    echo [2] Error Logs Only
    echo [3] Open Logs Folder
    echo [0] Back to Main Menu
    echo.
    set /p log_choice="Select option (0-3): "
    
    if "%log_choice%"=="1" (
        if exist "logs\combined.log" type "logs\combined.log"
    )
    if "%log_choice%"=="2" (
        if exist "logs\error.log" type "logs\error.log"  
    )
    if "%log_choice%"=="3" (
        explorer logs
    )
) else (
    echo No log files found.
    echo Logs will be created when the system starts.
)
echo.
pause
goto MAIN_SCREEN

:LAN_GUIDE
cls
echo ===============================================
echo            LAN ACCESS GUIDE
===============================================
echo.
echo Opening LAN Access Guide...
echo.
if exist "LAN_ACCESS_GUIDE.md" (
    start notepad "LAN_ACCESS_GUIDE.md"
) else (
    echo Guide file not found. Creating basic instructions...
    echo.
    echo Quick LAN Access Instructions:
    echo ══════════════════════════════
    echo.
    echo 1. Run option [2] "Start with LAN Access"
    echo 2. Note the IP address displayed (e.g., 192.168.1.100:3000)
    echo 3. On mobile/tablet, connect to same WiFi network
    echo 4. Open browser and go to the displayed IP address
    echo 5. Allow Windows Firewall access when prompted
    echo.
    echo For detailed guide, see LAN_ACCESS_GUIDE.md
    echo.
)
pause
goto MAIN_SCREEN

:ABOUT
cls
echo ===============================================
echo               ABOUT THIS SYSTEM
===============================================
echo.
echo  Waste Management System v1.0
echo  ═══════════════════════════════
echo.
echo  A comprehensive waste tracking and recycling
echo  management system with real-time monitoring,
echo  analytics, and reporting capabilities.
echo.
echo  Features:
echo  • Real-time waste tracking
echo  • Recycling rate monitoring  
echo  • Category-based waste sorting
echo  • Historical trend analysis
echo  • Interactive dashboard
echo  • Automated alerts
echo  • Data backup and recovery
echo  • Network configuration
echo  • Custom themes and branding
echo.
echo  System Requirements:
echo  • Windows 10/11
echo  • Node.js 16+ 
echo  • 4GB RAM minimum
echo  • 1GB disk space
echo.
echo  Support: Visit documentation or contact admin
echo.
pause
goto MAIN_SCREEN

:EXIT
cls
echo.
echo     ████████████████████████████████████████████████████████████████████████
echo     █                                                                      █
echo     █                     Thank you for using                             █
echo     █                   WASTE MANAGEMENT SYSTEM                           █
echo     █                                                                      █
echo     █               Your environmental impact matters!                     █
echo     █                                                                      █
echo     ████████████████████████████████████████████████████████████████████████
echo.
echo                              Goodbye! 👋
echo.
timeout /t 2 /nobreak >nul
exit