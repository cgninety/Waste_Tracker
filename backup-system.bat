@echo off
title Waste Management System - Backup Utility
color 0E

echo ===============================================
echo      WASTE MANAGEMENT SYSTEM BACKUP UTILITY
echo ===============================================
echo.

set backup_dir=backups
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%

echo Creating backup for %timestamp%...
echo.

if not exist "%backup_dir%" mkdir "%backup_dir%"

set current_backup=%backup_dir%\backup_%timestamp%
mkdir "%current_backup%"

echo [1/5] Backing up configuration files...
if exist "config\" (
    xcopy /E /Y config "%current_backup%\config\"
) else (
    echo No configuration files found.
)

echo [2/5] Backing up database files...
if exist "data\" (
    xcopy /E /Y data "%current_backup%\data\"
) else (
    echo No database files found.
)

echo [3/5] Backing up logs...
if exist "logs\" (
    xcopy /E /Y logs "%current_backup%\logs\"
) else (
    echo No log files found.
)

echo [4/5] Backing up custom assets...
if exist "assets\" (
    xcopy /E /Y assets "%current_backup%\assets\"
) else (
    echo No custom assets found.
)

echo [5/5] Creating backup manifest...
echo Backup created on: %date% %time% > "%current_backup%\backup_manifest.txt"
echo System version: 1.0.0 >> "%current_backup%\backup_manifest.txt"
echo Backup location: %current_backup% >> "%current_backup%\backup_manifest.txt"

echo.
echo ===============================================
echo            BACKUP COMPLETED SUCCESSFULLY
echo ===============================================
echo.
echo Backup saved to: %current_backup%
echo.

REM Create compressed backup
echo Creating compressed backup...
if exist "C:\Program Files\7-Zip\7z.exe" (
    "C:\Program Files\7-Zip\7z.exe" a -tzip "%current_backup%.zip" "%current_backup%\*"
    echo Compressed backup created: %current_backup%.zip
) else (
    echo 7-Zip not found. Backup saved as folder only.
)

echo.
echo Backup operations complete!
echo.

REM Show backup directory
echo Would you like to open the backup directory? (Y/N)
set /p open_backup=""
if /i "%open_backup%"=="Y" explorer "%backup_dir%"

pause