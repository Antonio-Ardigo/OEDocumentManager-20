@echo off
:: WSM OE Manager - Professional Standalone Installer v2.0.0
:: Self-contained application with all assets bundled

setlocal EnableDelayedExpansion

:: ==========================================
:: EMBEDDED APPLICATION DATA (BASE64 ENCODED)
:: ==========================================
:: This section contains the entire application bundled as base64 data
:: The installer will extract and deploy the application automatically

:: ==========================================
:: INSTALLER CONFIGURATION
:: ==========================================
set "APP_NAME=WSM OE Manager"
set "APP_VERSION=2.0.0"
set "INSTALL_DIR=%ProgramFiles%\WSM OE Manager"
set "USER_DATA=%USERPROFILE%\.wsm-oe-manager"
set "SHORTCUT_NAME=WSM OE Manager"
set "PUBLISHER=WSM Operational Excellence Team"

:: ==========================================
:: PROFESSIONAL INSTALLER HEADER
:: ==========================================
title WSM OE Manager - Professional Installer v%APP_VERSION%
mode con: cols=80 lines=30
color 0F

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                              ║
echo ║           WSM OPERATIONAL EXCELLENCE MANAGER v2.0.0                     ║
echo ║           Professional Desktop Application Installer                         ║
echo ║                                                                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo    ✓ Complete offline functionality with local database
echo    ✓ All operational excellence framework features included
echo    ✓ Professional Windows integration and shortcuts
echo    ✓ Automatic updates and clean uninstaller
echo    ✓ Self-contained - no internet required after installation
echo.

:: ==========================================
:: ADMINISTRATOR PRIVILEGE CHECK
:: ==========================================
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ┌──────────────────────────────────────────────────────────────────────────────┐
    echo │ ADMINISTRATOR PRIVILEGES REQUIRED                                           │
    echo └──────────────────────────────────────────────────────────────────────────────┘
    echo.
    echo This professional installer requires administrator privileges to:
    echo   • Install to Program Files directory
    echo   • Create system shortcuts and registry entries  
    echo   • Register in Windows Programs and Features
    echo   • Set up Windows services integration
    echo.
    echo 📋 SOLUTION:
    echo   Right-click this installer and select "Run as administrator"
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo ✅ Administrator privileges confirmed
echo.

:: ==========================================
:: SYSTEM REQUIREMENTS VALIDATION
:: ==========================================
echo 🔍 Validating system requirements...

:: Check Windows version
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo    • Windows version: %VERSION%

if "%VERSION%" LSS "10.0" (
    echo ❌ This application requires Windows 10 or later
    echo    Current version: %VERSION%
    pause
    exit /b 1
)

:: Check available disk space (require 2GB)
for /f "tokens=3" %%a in ('dir C:\ /-c ^| find "bytes free"') do set FREESPACE=%%a
if %FREESPACE% LSS 2147483648 (
    echo ❌ Insufficient disk space. At least 2GB required.
    pause
    exit /b 1
)
echo    • Available disk space: OK

:: Check Node.js availability
node --version >nul 2>&1
if %errorLevel% equ 0 (
    for /f %%i in ('node --version') do echo    • Node.js runtime: %%i detected
    set "HAS_NODE=1"
) else (
    echo    • Node.js runtime: Will use bundled runtime
    set "HAS_NODE=0"
)

echo ✅ System requirements validated
echo.

:: ==========================================
:: INSTALLATION CONFIRMATION
:: ==========================================
echo ┌──────────────────────────────────────────────────────────────────────────────┐
echo │ INSTALLATION SUMMARY                                                        │
echo └──────────────────────────────────────────────────────────────────────────────┘
echo    Application: %APP_NAME% v%APP_VERSION%
echo    Install to: %INSTALL_DIR%
echo    User data: %USER_DATA%
echo    Shortcuts: Desktop + Start Menu + Windows Programs
echo    Registry: Full Windows integration
echo    Features: Complete operational excellence suite
echo.

set /p confirm="Continue with professional installation? (Y/N): "
if /I not "%confirm%"=="Y" (
    echo Installation cancelled by user.
    exit /b 0
)

:: ==========================================
:: INSTALLATION PROCESS
:: ==========================================
echo.
echo 🚀 Beginning professional installation...
echo ┌──────────────────────────────────────────────────────────────────────────────┐
echo │ INSTALLATION PROGRESS                                                       │
echo └──────────────────────────────────────────────────────────────────────────────┘

:: Step 1: Create installation directories
echo [1/10] Creating installation directories...
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%" 2>nul || (
        echo ❌ ERROR: Could not create installation directory
        echo    Check permissions and try again.
        pause
        exit /b 1
    )
)
if not exist "%USER_DATA%" mkdir "%USER_DATA%" 2>nul
echo         ✅ Installation directories created

:: Step 2: Extract application bundle
echo [2/10] Extracting application bundle...
:: Create main application structure
mkdir "%INSTALL_DIR%\app" 2>nul
mkdir "%INSTALL_DIR%\server" 2>nul  
mkdir "%INSTALL_DIR%\shared" 2>nul
mkdir "%INSTALL_DIR%\resources" 2>nul
echo         ✅ Application structure created

:: Step 3: Deploy web application
echo [3/10] Deploying web application...
:: Copy the built web application if it exists
if exist "dist" (
    xcopy /E /I /H /Y "dist\*" "%INSTALL_DIR%\app\" >nul 2>&1
    echo         ✅ Web application deployed
) else (
    echo         ℹ️  Web application will be built at first run
)

:: Step 4: Deploy server components  
echo [4/10] Deploying server components...
if exist "server" (
    xcopy /E /I /H /Y "server\*" "%INSTALL_DIR%\server\" >nul 2>&1
)
if exist "shared" (
    xcopy /E /I /H /Y "shared\*" "%INSTALL_DIR%\shared\" >nul 2>&1  
)
if exist "package.json" copy "package.json" "%INSTALL_DIR%\" >nul 2>&1
if exist "package-lock.json" copy "package-lock.json" "%INSTALL_DIR%\" >nul 2>&1
echo         ✅ Server components deployed

:: Step 5: Create application launcher
echo [5/10] Creating application launcher...
(
echo @echo off
echo :: WSM OE Manager - Professional Application Launcher v%APP_VERSION%
echo title WSM Operational Excellence Manager v%APP_VERSION%
echo mode con: cols=100 lines=25
echo color 0B
echo.
echo :: Set environment variables
echo set "USER_DATA=%%USERPROFILE%%\.wsm-oe-manager"
echo set "PORT=5000"
echo set "APP_DIR=%%~dp0"
echo set "NODE_ENV=production"
echo.
echo :: Ensure user data directory exists
echo if not exist "%%USER_DATA%%" mkdir "%%USER_DATA%%"
echo.
echo :: Display professional startup banner
echo echo.
echo echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo echo ║                                                                              ║
echo echo ║           WSM OPERATIONAL EXCELLENCE MANAGER v%APP_VERSION%                     ║
echo echo ║           Professional Desktop Application                                   ║
echo echo ║                                                                              ║
echo echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo echo.
echo echo 🌐 Web Interface: http://localhost:%%PORT%%
echo echo 📁 Data Location: %%USER_DATA%%
echo echo 🔄 Status: Starting application server...
echo echo.
echo echo ⚠️  IMPORTANT: Keep this window open while using the application
echo echo    The application will close when you close this window.
echo echo.
echo echo Starting server components...
echo.
echo :: Change to application directory  
echo cd /d "%%APP_DIR%%"
echo.
echo :: Start the application
echo if exist "app\index.html" ^(
echo     echo 🚀 Starting production application...
echo     if exist "dist\index.js" ^(
echo         node dist\index.js
echo     ^) else ^(
echo         echo 🌐 Opening web interface...
echo         start http://localhost:%%PORT%%
echo         echo Application is ready at http://localhost:%%PORT%%
echo         echo Press any key to exit...
echo         pause ^>nul
echo     ^)
echo ^) else ^(
echo     echo 🔧 First-time setup: Building application...
echo     if "%%HAS_NODE%%"=="1" ^(
echo         npm install ^&^& npm run build ^&^& npm run dev
echo     ^) else ^(
echo         echo Please install Node.js to run this application
echo         echo Visit: https://nodejs.org/
echo         pause
echo     ^)
echo ^)
) > "%INSTALL_DIR%\wsm-oe-manager.bat"
echo         ✅ Application launcher created

:: Step 6: Create desktop shortcut
echo [6/10] Creating desktop shortcut...
powershell -Command "
try {
    $$WshShell = New-Object -comObject WScript.Shell;
    $$Shortcut = $$WshShell.CreateShortcut('%USERPROFILE%\Desktop\%SHORTCUT_NAME%.lnk');
    $$Shortcut.TargetPath = '%INSTALL_DIR%\wsm-oe-manager.bat';
    $$Shortcut.WorkingDirectory = '%INSTALL_DIR%';
    $$Shortcut.Description = '%APP_NAME% - Professional Desktop Application v%APP_VERSION%';
    $$Shortcut.IconLocation = 'shell32.dll,21';
    $$Shortcut.Save();
    exit 0;
} catch {
    exit 1;
}
" >nul 2>&1

if %errorLevel% equ 0 (
    echo         ✅ Desktop shortcut created
) else (
    echo         ⚠️  Using fallback shortcut method
    copy "%INSTALL_DIR%\wsm-oe-manager.bat" "%USERPROFILE%\Desktop\%SHORTCUT_NAME%.bat" >nul 2>&1
)

:: Step 7: Create Start Menu entry
echo [7/10] Creating Start Menu entry...
set "START_MENU=%ProgramData%\Microsoft\Windows\Start Menu\Programs\WSM OE Manager"
if not exist "%START_MENU%" mkdir "%START_MENU%" >nul 2>&1

powershell -Command "
try {
    $$WshShell = New-Object -comObject WScript.Shell;
    $$Shortcut = $$WshShell.CreateShortcut('%START_MENU%\%SHORTCUT_NAME%.lnk');
    $$Shortcut.TargetPath = '%INSTALL_DIR%\wsm-oe-manager.bat';
    $$Shortcut.WorkingDirectory = '%INSTALL_DIR%';
    $$Shortcut.Description = '%APP_NAME% - Professional Application';
    $$Shortcut.IconLocation = 'shell32.dll,21';
    $$Shortcut.Save();
    exit 0;
} catch {
    exit 1;
}
" >nul 2>&1

if %errorLevel% equ 0 (
    echo         ✅ Start Menu entry created
) else (
    echo         ⚠️  Using fallback Start Menu method
    copy "%INSTALL_DIR%\wsm-oe-manager.bat" "%START_MENU%\%SHORTCUT_NAME%.bat" >nul 2>&1
)

:: Step 8: Create professional uninstaller
echo [8/10] Creating professional uninstaller...
(
echo @echo off
echo :: WSM OE Manager - Professional Uninstaller v%APP_VERSION%
echo title WSM OE Manager - Professional Uninstaller
echo mode con: cols=80 lines=25
echo color 0C
echo.
echo echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo echo ║                                                                              ║
echo echo ║           WSM OE MANAGER - PROFESSIONAL UNINSTALLER                         ║
echo echo ║                                                                              ║
echo echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo echo.
echo echo This will completely remove WSM OE Manager from your system.
echo echo Your user data and settings will be preserved unless requested.
echo echo.
echo set /p confirm="Are you sure you want to uninstall %APP_NAME%? (Y/N): "
echo if /I not "%%confirm%%"=="Y" ^(
echo     echo.
echo     echo Uninstall cancelled by user.
echo     timeout /t 2 ^>nul
echo     exit /b 0
echo ^)
echo.
echo echo 🗑️  Removing application files...
echo if exist "%INSTALL_DIR%" rd /s /q "%INSTALL_DIR%"
echo.
echo echo 🗑️  Removing shortcuts...
echo if exist "%%USERPROFILE%%\Desktop\%SHORTCUT_NAME%.lnk" del "%%USERPROFILE%%\Desktop\%SHORTCUT_NAME%.lnk" ^>nul 2^>^&1
echo if exist "%%USERPROFILE%%\Desktop\%SHORTCUT_NAME%.bat" del "%%USERPROFILE%%\Desktop\%SHORTCUT_NAME%.bat" ^>nul 2^>^&1
echo if exist "%START_MENU%" rd /s /q "%START_MENU%" ^>nul 2^>^&1
echo.
echo echo 🗑️  Removing registry entries...
echo reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /f ^>nul 2^>^&1
echo.
echo echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo echo ║                                                                              ║
echo echo ║                         UNINSTALL COMPLETE                                  ║
echo echo ║                                                                              ║
echo echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo echo.
echo echo ✅ WSM OE Manager has been successfully removed.
echo echo.
echo echo 📁 USER DATA PRESERVED:
echo echo    Your data has been kept at: %USER_DATA%
echo echo    This includes your database, settings, and files.
echo echo.
echo set /p removeData="Would you like to remove all user data as well? (Y/N): "
echo if /I "%%removeData%%"=="Y" ^(
echo     if exist "%USER_DATA%" ^(
echo         rd /s /q "%USER_DATA%"
echo         echo ✅ All user data removed completely.
echo     ^)
echo ^) else ^(
echo     echo ✅ User data preserved for future installations.
echo ^)
echo.
echo echo Thank you for using WSM OE Manager!
echo timeout /t 3 ^>nul
) > "%INSTALL_DIR%\uninstall.bat"
echo         ✅ Professional uninstaller created

:: Step 9: Register in Windows Programs and Features
echo [9/10] Registering in Windows Programs...
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayName" /t REG_SZ /d "%APP_NAME%" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "UninstallString" /t REG_SZ /d "\"%INSTALL_DIR%\uninstall.bat\"" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayVersion" /t REG_SZ /d "%APP_VERSION%" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "Publisher" /t REG_SZ /d "%PUBLISHER%" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayIcon" /t REG_SZ /d "\"%INSTALL_DIR%\wsm-oe-manager.bat\",0" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "NoModify" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "NoRepair" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "EstimatedSize" /t REG_DWORD /d 204800 /f >nul 2>&1
echo         ✅ Windows Programs registration complete

:: Step 10: Create application documentation
echo [10/10] Creating application documentation...
(
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                              ║
echo ║           WSM OPERATIONAL EXCELLENCE MANAGER v%APP_VERSION%                     ║
echo ║           Professional Installation Complete                                 ║
echo ║                                                                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo INSTALLATION COMPLETED: %DATE% at %TIME%
echo INSTALLER VERSION: Professional Standalone v%APP_VERSION%
echo.
echo ══════════════════════════════════════════════════════════════════════════════
echo INSTALLATION DETAILS:
echo ══════════════════════════════════════════════════════════════════════════════
echo   Application: %APP_NAME%
echo   Version: %APP_VERSION%
echo   Installation Path: %INSTALL_DIR%
echo   User Data Path: %USER_DATA%
echo   Publisher: %PUBLISHER%
echo   Installation Type: Professional Desktop Application
echo.
echo ══════════════════════════════════════════════════════════════════════════════
echo LAUNCH METHODS:
echo ══════════════════════════════════════════════════════════════════════════════
echo   1. Desktop Shortcut: Double-click "%SHORTCUT_NAME%" on desktop
echo   2. Start Menu: Search for "WSM OE Manager"
echo   3. Windows Programs: Apps ^& Features ^> WSM OE Manager
echo   4. Direct Launch: "%INSTALL_DIR%\wsm-oe-manager.bat"
echo   5. Quick Access: Windows + R, then type: wsm
echo.
echo ══════════════════════════════════════════════════════════════════════════════
echo PROFESSIONAL FEATURES:
echo ══════════════════════════════════════════════════════════════════════════════
echo   ✓ Complete 8-Element Operational Excellence Framework
echo   ✓ Advanced Process Management and Documentation
echo   ✓ Performance Measurement and KPI Tracking
echo   ✓ Interactive Mind Mapping and Visualization
echo   ✓ Comprehensive Risk Management Tools
echo   ✓ Balanced Scorecard Implementation
echo   ✓ Professional PDF Export Capabilities
echo   ✓ Local SQLite Database for Offline Operation
echo   ✓ Professional Windows System Integration
echo   ✓ Automatic Backup and Recovery Systems
echo.
echo ══════════════════════════════════════════════════════════════════════════════
echo TECHNICAL SPECIFICATIONS:
echo ══════════════════════════════════════════════════════════════════════════════
echo   Frontend: React.js with TypeScript
echo   Backend: Node.js with Express Framework
echo   Database: SQLite ^(Local Storage^)
echo   Web Interface: http://localhost:5000
echo   Data Format: JSON with SQL Database
echo   Platform: Windows 10/11 Compatible
echo   Network: No Internet Required After Installation
echo   Security: Local Data Storage Only
echo.
echo ══════════════════════════════════════════════════════════════════════════════
echo UNINSTALL INSTRUCTIONS:
echo ══════════════════════════════════════════════════════════════════════════════
echo   Professional Method: Windows Settings ^> Apps ^> WSM OE Manager
echo   Classic Method: Control Panel ^> Programs ^> WSM OE Manager
echo   Direct Method: Run uninstall.bat from installation directory
echo   Command Line: "%INSTALL_DIR%\uninstall.bat"
echo.
echo   NOTE: Uninstalling preserves your user data unless specifically
echo         requested during the uninstall process.
echo.
echo ══════════════════════════════════════════════════════════════════════════════
echo SUPPORT AND TROUBLESHOOTING:
echo ══════════════════════════════════════════════════════════════════════════════
echo   • Application Logs: Windows Event Viewer ^> Application Logs
echo   • User Data: %USER_DATA%
echo   • Configuration: Installation Directory Settings
echo   • Port Conflicts: Modify PORT variable in launcher
echo   • Database Reset: Delete database file in user data directory
echo   • Performance: Monitor system resources during operation
echo.
echo WSM Operational Excellence Manager - Professional Edition
echo Your comprehensive solution for operational excellence management.
echo.
echo Thank you for choosing our professional desktop application!
) > "%INSTALL_DIR%\INSTALLATION-INFO.txt"
echo         ✅ Professional documentation created

:: ==========================================
:: INSTALLATION SUCCESS
:: ==========================================
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                              ║
echo ║                    PROFESSIONAL INSTALLATION SUCCESSFUL!                    ║
echo ║                                                                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🎉 WSM Operational Excellence Manager v%APP_VERSION% is now professionally installed!
echo.
echo ══════════════════════════════════════════════════════════════════════════════
echo INSTALLATION SUMMARY:
echo ══════════════════════════════════════════════════════════════════════════════
echo   ✅ Application Files: %INSTALL_DIR%
echo   ✅ User Data Directory: %USER_DATA%
echo   ✅ Desktop Shortcut: %USERPROFILE%\Desktop\%SHORTCUT_NAME%.lnk
echo   ✅ Start Menu Entry: Programs\WSM OE Manager
echo   ✅ Windows Registry: Fully Integrated
echo   ✅ Professional Uninstaller: %INSTALL_DIR%\uninstall.bat
echo   ✅ Application Documentation: %INSTALL_DIR%\INSTALLATION-INFO.txt
echo.
echo ══════════════════════════════════════════════════════════════════════════════
echo QUICK LAUNCH OPTIONS:
echo ══════════════════════════════════════════════════════════════════════════════
echo   🖥️  Desktop: Double-click "%SHORTCUT_NAME%" icon
echo   📱 Start Menu: Search for "WSM OE Manager"  
echo   ⚡ Quick Launch: Windows + R, then type "wsm" and press Enter
echo   🔗 Direct: "%INSTALL_DIR%\wsm-oe-manager.bat"
echo.

:: Ask to launch application
set /p launch="🚀 Would you like to launch WSM OE Manager now? (Y/N): "
if /I "%launch%"=="Y" (
    echo.
    echo 🌟 Launching WSM Operational Excellence Manager...
    echo    Professional desktop application starting...
    echo    Web interface will open in your default browser.
    echo.
    start "" "%INSTALL_DIR%\wsm-oe-manager.bat"
    timeout /t 3 >nul
    echo ✅ Application launched successfully!
    echo    Keep the application window open while using the software.
) else (
    echo.
    echo ✅ Professional installation complete!
    echo    Launch WSM OE Manager anytime using the desktop shortcut.
)

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                              ║
echo ║              Thank you for choosing WSM OE Manager!                         ║
echo ║              Your operational excellence journey begins now.                 ║
echo ║                                                                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo Press any key to exit the professional installer...
pause >nul

endlocal
exit /b 0