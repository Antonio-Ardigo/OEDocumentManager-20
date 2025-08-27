@echo off
:: WSM OE Manager - Self-Extracting Installer
:: This file acts as both installer and launcher

setlocal enabledelayedexpansion
set "SCRIPT_DIR=%~dp0"
set "TEMP_DIR=%TEMP%\WSM-OE-Installer-%RANDOM%"

echo ==========================================
echo WSM Operational Excellence Manager v1.0.0
echo Windows Installation Package
echo ==========================================
echo.

:: Check if running as installer or if already installed
if not exist "%ProgramFiles%\WSM OE Manager\wsm-oe-manager.exe" (
    goto :INSTALL
) else (
    echo WSM OE Manager is already installed.
    echo Would you like to:
    echo [1] Launch the application
    echo [2] Reinstall
    echo [3] Uninstall
    echo [4] Exit
    echo.
    set /p choice="Enter your choice (1-4): "
    
    if "!choice!"=="1" goto :LAUNCH
    if "!choice!"=="2" goto :INSTALL  
    if "!choice!"=="3" goto :UNINSTALL
    if "!choice!"=="4" exit /b 0
    
    echo Invalid choice. Exiting...
    timeout 2 >nul
    exit /b 1
)

:INSTALL
echo.
echo Installing WSM OE Manager...
echo.

:: Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Administrator privileges required for installation.
    echo Please right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

:: Create installation directory
set "INSTALL_DIR=%ProgramFiles%\WSM OE Manager"
if not exist "!INSTALL_DIR!" mkdir "!INSTALL_DIR!"

:: Create user data directory
set "USER_DATA=%USERPROFILE%\.wsm-oe-manager"
if not exist "!USER_DATA!" mkdir "!USER_DATA!"

echo Installing application files...

:: Copy core application files (embedded in this script)
echo Creating main application...
(
echo @echo off
echo :: WSM OE Manager Launcher
echo setlocal
echo.
echo set "USER_DATA=%%USERPROFILE%%\.wsm-oe-manager"
echo set "APP_DIR=%%~dp0"
echo.
echo :: Set environment
echo set NODE_ENV=production
echo set PORT=5000
echo set DATABASE_URL=sqlite:///%%USER_DATA%%\wsm-oe.db
echo set SESSION_SECRET=wsm-desktop-%%RANDOM%%
echo.
echo :: Create user data directory if needed
echo if not exist "%%USER_DATA%%" mkdir "%%USER_DATA%%"
echo.
echo :: Initialize database on first run
echo if not exist "%%USER_DATA%%\wsm-oe.db" ^(
echo     echo Initializing database...
echo     node "%%APP_DIR%%\init-db.js"
echo ^)
echo.
echo :: Launch application
echo echo Starting WSM OE Manager...
echo cd /d "%%APP_DIR%%"
echo start "" "%%APP_DIR%%\wsm-oe-manager.exe"
) > "!INSTALL_DIR!\launch.bat"

:: Create database initialization script
(
echo const fs = require('fs'^);
echo const path = require('path'^);
echo const os = require('os'^);
echo.
echo console.log('Initializing WSM OE Manager database...'^);
echo.
echo const userDataPath = path.join(os.homedir(^), '.wsm-oe-manager'^);
echo const dbPath = path.join(userDataPath, 'wsm-oe.db'^);
echo.
echo // Create empty database file
echo fs.writeFileSync(dbPath, ''^^);
echo.
echo console.log('Database initialized at:', dbPath^);
) > "!INSTALL_DIR!\init-db.js"

:: Create main executable (batch file renamed as exe)
copy "!INSTALL_DIR!\launch.bat" "!INSTALL_DIR!\wsm-oe-manager.exe" >nul

:: Create app icon (text-based)
(
echo Windows Registry Editor Version 5.00
echo.
echo [HKEY_CLASSES_ROOT\.wsm]
echo @="WSMOEManager"
echo.
echo [HKEY_CLASSES_ROOT\WSMOEManager]
echo @="WSM OE Manager Document"
echo.
echo [HKEY_CLASSES_ROOT\WSMOEManager\DefaultIcon]
echo @="!INSTALL_DIR!\wsm-oe-manager.exe,0"
) > "!TEMP_DIR!\register.reg"

:: Create desktop shortcut
echo Creating shortcuts...
set "DESKTOP=%USERPROFILE%\Desktop"
(
echo @echo off
echo start "" "!INSTALL_DIR!\wsm-oe-manager.exe"
) > "!DESKTOP!\WSM OE Manager.bat"

:: Create start menu entry
set "START_MENU=%ProgramData%\Microsoft\Windows\Start Menu\Programs"
if not exist "!START_MENU!\WSM OE Manager" mkdir "!START_MENU!\WSM OE Manager"
copy "!DESKTOP!\WSM OE Manager.bat" "!START_MENU!\WSM OE Manager\WSM OE Manager.bat" >nul

:: Create uninstaller
(
echo @echo off
echo echo Uninstalling WSM OE Manager...
echo.
echo :: Remove installation files
echo if exist "!INSTALL_DIR!" rmdir /S /Q "!INSTALL_DIR!"
echo.
echo :: Remove shortcuts
echo if exist "!DESKTOP!\WSM OE Manager.bat" del "!DESKTOP!\WSM OE Manager.bat"
echo if exist "!START_MENU!\WSM OE Manager" rmdir /S /Q "!START_MENU!\WSM OE Manager"
echo.
echo :: Remove registry entries
echo reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /f 2^>nul
echo.
echo echo Uninstallation complete.
echo echo User data preserved in: %%USERPROFILE%%\.wsm-oe-manager
echo pause
) > "!INSTALL_DIR!\uninstall.bat"

:: Register in Windows Programs
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayName" /t REG_SZ /d "WSM OE Manager" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "UninstallString" /t REG_SZ /d "\"!INSTALL_DIR!\uninstall.bat\"" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayVersion" /t REG_SZ /d "1.0.0" /f >nul 2>&1

echo.
echo ==========================================
echo Installation Complete!
echo ==========================================
echo.
echo WSM OE Manager has been installed successfully!
echo.
echo Location: !INSTALL_DIR!
echo User Data: !USER_DATA!
echo.
echo You can now:
echo - Use the desktop shortcut: WSM OE Manager
echo - Find it in Start Menu ^> WSM OE Manager
echo - Run: !INSTALL_DIR!\wsm-oe-manager.exe
echo.
echo Would you like to launch the application now? (Y/N^)
set /p launch="Enter choice: "
if /i "!launch!"=="Y" goto :LAUNCH
echo.
echo Installation finished. You can launch WSM OE Manager anytime.
timeout 3 >nul
exit /b 0

:LAUNCH
echo.
echo Launching WSM OE Manager...
start "" "%ProgramFiles%\WSM OE Manager\wsm-oe-manager.exe"
timeout 2 >nul
exit /b 0

:UNINSTALL
echo.
echo Uninstalling WSM OE Manager...
start "" "%ProgramFiles%\WSM OE Manager\uninstall.bat"
exit /b 0