@echo off
title Waste Management System - Configuration Tool
color 0A
cls

echo ===============================================
echo    WASTE MANAGEMENT SYSTEM - SETUP TOOL
echo ===============================================
echo.
echo Welcome to the Waste Management System!
echo This tool will help you configure your system.
echo.

:MAIN_MENU
cls
echo ===============================================
echo          CONFIGURATION MAIN MENU
echo ===============================================
echo.
echo [1] System Configuration
echo [2] Network Settings  
echo [3] Database Setup
echo [4] UI Customization
echo [5] Performance Settings
echo [6] Backup Configuration
echo [7] Start System
echo [8] View Current Settings
echo [9] Reset to Defaults
echo [0] Exit
echo.
set /p choice="Select an option (0-9): "

if "%choice%"=="1" goto SYSTEM_CONFIG
if "%choice%"=="2" goto NETWORK_CONFIG
if "%choice%"=="3" goto DATABASE_CONFIG
if "%choice%"=="4" goto UI_CONFIG
if "%choice%"=="5" goto PERFORMANCE_CONFIG
if "%choice%"=="6" goto BACKUP_CONFIG
if "%choice%"=="7" goto START_SYSTEM
if "%choice%"=="8" goto VIEW_SETTINGS
if "%choice%"=="9" goto RESET_DEFAULTS
if "%choice%"=="0" goto EXIT
goto MAIN_MENU

:SYSTEM_CONFIG
cls
echo ===============================================
echo           SYSTEM CONFIGURATION
echo ===============================================
echo.
echo [1] Set Organization Name
echo [2] Set System Administrator
echo [3] Configure Time Zone
echo [4] Set Default Units (kg/lbs)
echo [5] Configure Alert Thresholds
echo [6] Set Data Retention Policy
echo [0] Back to Main Menu
echo.
set /p syschoice="Select an option (0-6): "

if "%syschoice%"=="1" goto SET_ORG_NAME
if "%syschoice%"=="2" goto SET_ADMIN
if "%syschoice%"=="3" goto SET_TIMEZONE
if "%syschoice%"=="4" goto SET_UNITS
if "%syschoice%"=="5" goto SET_ALERTS
if "%syschoice%"=="6" goto SET_RETENTION
if "%syschoice%"=="0" goto MAIN_MENU
goto SYSTEM_CONFIG

:NETWORK_CONFIG
cls
echo ===============================================
echo            NETWORK CONFIGURATION
echo ===============================================
echo.
echo [1] Set Server Port (Default: 3001)
echo [2] Set Client Port (Default: 3000)
echo [3] Configure Network Interface
echo [4] Set CORS Origins
echo [5] Configure SSL/HTTPS
echo [6] Set API Rate Limits
echo [0] Back to Main Menu
echo.
set /p netchoice="Select an option (0-6): "

if "%netchoice%"=="1" goto SET_SERVER_PORT
if "%netchoice%"=="2" goto SET_CLIENT_PORT
if "%netchoice%"=="3" goto SET_INTERFACE
if "%netchoice%"=="4" goto SET_CORS
if "%netchoice%"=="5" goto SET_SSL
if "%netchoice%"=="6" goto SET_RATE_LIMITS
if "%netchoice%"=="0" goto MAIN_MENU
goto NETWORK_CONFIG

:DATABASE_CONFIG
cls
echo ===============================================
echo           DATABASE CONFIGURATION
echo ===============================================
echo.
echo [1] Set Database Type (SQLite/PostgreSQL/MySQL)
echo [2] Configure Database Connection
echo [3] Set Backup Schedule
echo [4] Configure Data Sync
echo [5] Set Storage Location
echo [6] Initialize Database
echo [0] Back to Main Menu
echo.
set /p dbchoice="Select an option (0-6): "

if "%dbchoice%"=="1" goto SET_DB_TYPE
if "%dbchoice%"=="2" goto SET_DB_CONNECTION
if "%dbchoice%"=="3" goto SET_DB_BACKUP
if "%dbchoice%"=="4" goto SET_DB_SYNC
if "%dbchoice%"=="5" goto SET_DB_STORAGE
if "%dbchoice%"=="6" goto INIT_DATABASE
if "%dbchoice%"=="0" goto MAIN_MENU
goto DATABASE_CONFIG

:UI_CONFIG
cls
echo ===============================================
echo            UI CUSTOMIZATION
echo ===============================================
echo.
echo [1] Set Theme (Light/Dark)
echo [2] Configure Dashboard Colors
echo [3] Set Company Logo
echo [4] Configure Chart Settings
echo [5] Set Default Dashboard Layout
echo [6] Configure Reports Format
echo [0] Back to Main Menu
echo.
set /p uichoice="Select an option (0-6): "

if "%uichoice%"=="1" goto SET_THEME
if "%uichoice%"=="2" goto SET_COLORS
if "%uichoice%"=="3" goto SET_LOGO
if "%uichoice%"=="4" goto SET_CHARTS
if "%uichoice%"=="5" goto SET_LAYOUT
if "%uichoice%"=="6" goto SET_REPORTS
if "%uichoice%"=="0" goto MAIN_MENU
goto UI_CONFIG

:SET_ORG_NAME
cls
echo ===============================================
echo          SET ORGANIZATION NAME
echo ===============================================
echo.
set /p org_name="Enter your organization name: "
echo ORGANIZATION_NAME=%org_name%> config\system.env
echo.
echo Organization name set to: %org_name%
echo.
pause
goto SYSTEM_CONFIG

:SET_ADMIN
cls
echo ===============================================
echo         SET SYSTEM ADMINISTRATOR
echo ===============================================
echo.
set /p admin_name="Enter administrator name: "
set /p admin_email="Enter administrator email: "
echo ADMIN_NAME=%admin_name%>> config\system.env
echo ADMIN_EMAIL=%admin_email%>> config\system.env
echo.
echo Administrator configured successfully!
echo.
pause
goto SYSTEM_CONFIG

:SET_UNITS
cls
echo ===============================================
echo           SET DEFAULT UNITS
echo ===============================================
echo.
echo [1] Kilograms (kg)
echo [2] Pounds (lbs)
echo [3] Metric Tons (t)
echo.
set /p unit_choice="Select default weight unit (1-3): "

if "%unit_choice%"=="1" (
    echo DEFAULT_UNITS=kg>> config\system.env
    echo Default units set to Kilograms
)
if "%unit_choice%"=="2" (
    echo DEFAULT_UNITS=lbs>> config\system.env
    echo Default units set to Pounds
)
if "%unit_choice%"=="3" (
    echo DEFAULT_UNITS=t>> config\system.env
    echo Default units set to Metric Tons
)
echo.
pause
goto SYSTEM_CONFIG

:SET_SERVER_PORT
cls
echo ===============================================
echo            SET SERVER PORT
echo ===============================================
echo.
echo Current default: 3001
set /p server_port="Enter new server port: "
echo SERVER_PORT=%server_port%> config\network.env
echo.
echo Server port set to: %server_port%
echo.
pause
goto NETWORK_CONFIG

:SET_CLIENT_PORT
cls
echo ===============================================
echo            SET CLIENT PORT
echo ===============================================
echo.
echo Current default: 3000
echo.
echo Checking port availability...
netstat -an | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠ Port 3000 is currently in use
    echo.
    echo [1] Use port 3000 anyway (may cause conflicts)
    echo [2] Use next available port (3001, 3002, etc.)
    echo [3] Enter custom port number
    echo.
    set /p port_choice="Select option (1-3): "
    
    if "%port_choice%"=="1" (
        set client_port=3000
    )
    if "%port_choice%"=="2" (
        call :FIND_AVAILABLE_PORT 3001
        set client_port=%available_port%
    )
    if "%port_choice%"=="3" (
        set /p client_port="Enter custom port number: "
    )
) else (
    echo ✓ Port 3000 is available
    set /p client_port="Enter client port (default 3000): "
    if "%client_port%"=="" set client_port=3000
)

echo CLIENT_PORT=%client_port%>> config\network.env
echo.
echo Client port set to: %client_port%
echo.
pause
goto NETWORK_CONFIG

:SET_INTERFACE
cls
echo ===============================================
echo         SET NETWORK INTERFACE
echo ===============================================
echo.
echo [1] Localhost only (127.0.0.1)
echo [2] All interfaces (0.0.0.0)
echo [3] Specific IP address
echo.
set /p interface_choice="Select network interface (1-3): "

if "%interface_choice%"=="1" (
    echo NETWORK_INTERFACE=127.0.0.1>> config\network.env
    echo Network interface set to localhost only
)
if "%interface_choice%"=="2" (
    echo NETWORK_INTERFACE=0.0.0.0>> config\network.env
    echo Network interface set to all interfaces
)
if "%interface_choice%"=="3" (
    set /p custom_ip="Enter IP address: "
    echo NETWORK_INTERFACE=%custom_ip%>> config\network.env
    echo Network interface set to: %custom_ip%
)
echo.
pause
goto NETWORK_CONFIG

:SET_THEME
cls
echo ===============================================
echo             SET UI THEME
echo ===============================================
echo.
echo [1] Light Theme
echo [2] Dark Theme
echo [3] Auto (System preference)
echo.
set /p theme_choice="Select theme (1-3): "

if "%theme_choice%"=="1" (
    echo DEFAULT_THEME=light> config\ui.env
    echo Theme set to Light
)
if "%theme_choice%"=="2" (
    echo DEFAULT_THEME=dark> config\ui.env
    echo Theme set to Dark
)
if "%theme_choice%"=="3" (
    echo DEFAULT_THEME=auto> config\ui.env
    echo Theme set to Auto
)
echo.
pause
goto UI_CONFIG

:SET_COLORS
cls
echo ===============================================
echo         CONFIGURE DASHBOARD COLORS
echo ===============================================
echo.
echo Configure colors for dashboard elements:
echo.
set /p color_recycled="Today's Recycled card color (hex, e.g., #3776A9): "
set /p color_waste="Non-Recyclable card color (hex, e.g., #05C793): "
set /p color_rate="Recycling Rate card color (hex, e.g., #087E8B): "
set /p color_processed="Total Processed card color (hex, e.g., #3776A9): "
set /p color_total="Total Waste card color (hex, e.g., #F8121D): "

echo COLOR_RECYCLED=%color_recycled%>> config\ui.env
echo COLOR_WASTE=%color_waste%>> config\ui.env
echo COLOR_RATE=%color_rate%>> config\ui.env
echo COLOR_PROCESSED=%color_processed%>> config\ui.env
echo COLOR_TOTAL=%color_total%>> config\ui.env

echo.
echo Dashboard colors configured successfully!
echo.
pause
goto UI_CONFIG

:START_SYSTEM
cls
echo ===============================================
echo            STARTING SYSTEM
echo ===============================================
echo.
echo Loading configuration...

if not exist "config\" mkdir config
if not exist "logs\" mkdir logs

echo.
echo Starting Waste Management System...
echo.
echo [1] Development Mode (with hot reload)
echo [2] Production Mode
echo [3] Background Service
echo.
set /p start_choice="Select startup mode (1-3): "

if "%start_choice%"=="1" (
    echo Starting in Development Mode...
    npm run dev
)
if "%start_choice%"=="2" (
    echo Starting in Production Mode...
    npm run build
    npm run start
)
if "%start_choice%"=="3" (
    echo Installing as Windows Service...
    call install-service.bat
)

pause
goto MAIN_MENU

:VIEW_SETTINGS
cls
echo ===============================================
echo          CURRENT CONFIGURATION
echo ===============================================
echo.

if exist "config\system.env" (
    echo --- SYSTEM SETTINGS ---
    type config\system.env
    echo.
)

if exist "config\network.env" (
    echo --- NETWORK SETTINGS ---
    type config\network.env
    echo.
)

if exist "config\ui.env" (
    echo --- UI SETTINGS ---
    type config\ui.env
    echo.
)

if exist "config\database.env" (
    echo --- DATABASE SETTINGS ---
    type config\database.env
    echo.
)

echo.
pause
goto MAIN_MENU

:RESET_DEFAULTS
cls
echo ===============================================
echo            RESET TO DEFAULTS
echo ===============================================
echo.
echo WARNING: This will reset ALL settings to default values!
echo.
set /p confirm="Are you sure? (Y/N): "

if /i "%confirm%"=="Y" (
    if exist "config\" rmdir /s /q config
    mkdir config
    echo # Default System Configuration> config\system.env
    echo ORGANIZATION_NAME=Waste Management System>> config\system.env
    echo DEFAULT_UNITS=kg>> config\system.env
    
    echo # Default Network Configuration> config\network.env
    echo SERVER_PORT=3001>> config\network.env
    echo CLIENT_PORT=3000>> config\network.env
    echo NETWORK_INTERFACE=0.0.0.0>> config\network.env
    
    echo # Default UI Configuration> config\ui.env
    echo DEFAULT_THEME=light>> config\ui.env
    echo COLOR_RECYCLED=#3776A9>> config\ui.env
    echo COLOR_WASTE=#05C793>> config\ui.env
    echo COLOR_RATE=#087E8B>> config\ui.env
    echo COLOR_PROCESSED=#3776A9>> config\ui.env
    echo COLOR_TOTAL=#F8121D>> config\ui.env
    
    echo.
    echo All settings have been reset to defaults!
)
echo.
pause
goto MAIN_MENU

:EXIT
cls
echo ===============================================
echo     Thank you for using Waste Management
echo              System Configuration Tool
echo ===============================================
echo.
echo Configuration saved successfully!
echo You can run this tool again anytime to modify settings.
echo.
pause
exit

REM Additional configuration sections can be added here...

:SET_ALERTS
cls
echo ===============================================
echo         CONFIGURE ALERT THRESHOLDS
===============================================
echo.
set /p alert_threshold="Enter recycling rate alert threshold (%%): "
set /p waste_limit="Enter daily waste limit warning (kg): "
echo ALERT_THRESHOLD=%alert_threshold%>> config\system.env
echo WASTE_LIMIT=%waste_limit%>> config\system.env
echo.
echo Alert thresholds configured!
pause
goto SYSTEM_CONFIG

:SET_RETENTION
cls
echo ===============================================
echo        SET DATA RETENTION POLICY
===============================================
echo.
echo [1] 30 days
echo [2] 90 days  
echo [3] 1 year
echo [4] 2 years
echo [5] Indefinite
echo.
set /p retention_choice="Select retention period (1-5): "

if "%retention_choice%"=="1" echo DATA_RETENTION=30>> config\system.env
if "%retention_choice%"=="2" echo DATA_RETENTION=90>> config\system.env
if "%retention_choice%"=="3" echo DATA_RETENTION=365>> config\system.env
if "%retention_choice%"=="4" echo DATA_RETENTION=730>> config\system.env
if "%retention_choice%"=="5" echo DATA_RETENTION=0>> config\system.env

echo Data retention policy set!
pause
goto SYSTEM_CONFIG

:FIND_AVAILABLE_PORT
set /a test_port=%1
:PORT_LOOP
netstat -an | findstr ":%test_port%" >nul 2>&1
if %errorlevel% equ 0 (
    set /a test_port+=1
    if %test_port% gtr 65535 (
        echo Error: No available ports found
        set available_port=3000
        goto :eof
    )
    goto PORT_LOOP
) else (
    set available_port=%test_port%
    echo Found available port: %available_port%
)
goto :eof