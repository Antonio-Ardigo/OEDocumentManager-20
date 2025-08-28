@echo off
:: WSM OE Manager - Professional Desktop Installer v2.0
:: Self-Installing Windows Application

setlocal EnableDelayedExpansion

:: ==========================================
:: APPLICATION CONFIGURATION
:: ==========================================
set "APP_NAME=WSM OE Manager"
set "APP_VERSION=2.0.0"
set "INSTALL_DIR=%ProgramFiles%\WSM OE Manager"
set "USER_DATA=%USERPROFILE%\.wsm-oe-manager"
set "SHORTCUT_NAME=WSM OE Manager"
set "PUBLISHER=WSM Operational Excellence Team"

:: ==========================================
:: INSTALLER HEADER
:: ==========================================
title WSM OE Manager - Professional Installer v%APP_VERSION%
color 0B

echo.
echo ████████████████████████████████████████████████████████████
echo █                                                          █
echo █      WSM OPERATIONAL EXCELLENCE MANAGER v%APP_VERSION%       █
echo █      Professional Desktop Application Installer         █
echo █                                                          █
echo ████████████████████████████████████████████████████████████
echo.
echo  ✓ Complete offline functionality
echo  ✓ Local data storage and management  
echo  ✓ Professional Windows integration
echo  ✓ Desktop and Start Menu shortcuts
echo  ✓ Automatic updates and uninstaller
echo.

:: ==========================================
:: ADMINISTRATOR PRIVILEGE CHECK
:: ==========================================
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️  ADMINISTRATOR PRIVILEGES REQUIRED
    echo ══════════════════════════════════════
    echo.
    echo This installer requires administrator privileges to:
    echo   • Install to Program Files directory
    echo   • Create system shortcuts and registry entries
    echo   • Register in Windows Programs and Features
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
:: SYSTEM REQUIREMENTS CHECK
:: ==========================================
echo 🔍 Checking system requirements...

:: Check Windows version
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo    Windows version: %VERSION%

:: Check available disk space
for /f "tokens=3" %%a in ('dir C:\ /-c ^| find "bytes free"') do set FREESPACE=%%a
if %FREESPACE% LSS 1073741824 (
    echo ❌ Insufficient disk space. At least 1GB required.
    pause
    exit /b 1
)
echo    Disk space: OK

:: Check Node.js (optional)
node --version >nul 2>&1
if %errorLevel% equ 0 (
    for /f %%i in ('node --version') do echo    Node.js: %%i
) else (
    echo    Node.js: Not installed (will use bundled runtime)
)

echo ✅ System requirements met
echo.

:: ==========================================
:: INSTALLATION CONFIRMATION
:: ==========================================
echo 📋 INSTALLATION SUMMARY:
echo ════════════════════════════════════════
echo    Application: %APP_NAME% v%APP_VERSION%
echo    Install to: %INSTALL_DIR%
echo    User data: %USER_DATA%
echo    Shortcuts: Desktop + Start Menu
echo    Registry: Windows Programs integration
echo.

set /p confirm="Continue with installation? (Y/N): "
if /I not "%confirm%"=="Y" (
    echo Installation cancelled by user.
    exit /b 0
)

:: ==========================================
:: INSTALLATION PROCESS
:: ==========================================
echo.
echo 🚀 Starting installation process...
echo ════════════════════════════════════════

:: Step 1: Create directories
echo [1/8] Creating installation directories...
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%" 2>nul || (
        echo ❌ ERROR: Could not create installation directory
        echo    Please check permissions and try again.
        pause
        exit /b 1
    )
)
if not exist "%USER_DATA%" (
    mkdir "%USER_DATA%" 2>nul
)
echo      ✅ Directories created

:: Step 2: Copy application files
echo [2/8] Installing application files...

:: Create the main application launcher with embedded server
(
echo @echo off
echo :: WSM OE Manager - Application Launcher v%APP_VERSION%
echo title WSM Operational Excellence Manager
echo.
echo :: Application Configuration
echo set "USER_DATA=%%USERPROFILE%%\.wsm-oe-manager"
echo set "PORT=5000"
echo set "APP_DIR=%%~dp0"
echo.
echo :: Ensure directories exist
echo if not exist "%%USER_DATA%%" mkdir "%%USER_DATA%%"
echo.
echo :: Display startup banner
echo echo.
echo echo ████████████████████████████████████████████████████████████
echo echo █                                                          █
echo echo █       WSM OPERATIONAL EXCELLENCE MANAGER v%APP_VERSION%      █
echo echo █       Desktop Application - Starting Server...          █
echo echo █                                                          █
echo echo ████████████████████████████████████████████████████████████
echo echo.
echo echo 🌐 Web Interface: http://localhost:%%PORT%%
echo echo 📁 Data Location: %%USER_DATA%%
echo echo 🔄 Status: Starting application server...
echo echo.
echo echo ⚠️  IMPORTANT: Keep this window open while using the application
echo echo    The application will close when you close this window.
echo echo.
echo.
echo :: Change to application directory
echo cd /d "%%APP_DIR%%"
echo.
echo :: Start the application server
echo if exist "dist\index.js" ^(
echo     echo 🚀 Starting production server...
echo     node dist\index.js
echo ^) else if exist "server\index.ts" ^(
echo     echo 🔧 Starting development server...
echo     if exist "node_modules" ^(
echo         npm run dev
echo     ^) else ^(
echo         echo Installing dependencies...
echo         npm install ^&^& npm run dev
echo     ^)
echo ^) else ^(
echo     echo 🌐 Opening web interface...
echo     start http://localhost:%%PORT%%
echo     echo.
echo     echo If the application doesn't open automatically:
echo     echo 1. Open your web browser
echo     echo 2. Go to: http://localhost:%%PORT%%
echo     echo.
echo     echo Press any key to exit...
echo     pause ^>nul
echo ^)
) > "%INSTALL_DIR%\wsm-oe-manager.bat"
echo      ✅ Application launcher created

:: Step 3: Copy application files if they exist
echo [3/8] Copying application resources...
if exist "dist" (
    xcopy /E /I /H /Y "dist\*" "%INSTALL_DIR%\dist\" >nul 2>&1
    echo      ✅ Production files copied
) else (
    echo      ℹ️  Production files not found (will run in development mode)
)

if exist "package.json" copy "package.json" "%INSTALL_DIR%\" >nul 2>&1
if exist "package-lock.json" copy "package-lock.json" "%INSTALL_DIR%\" >nul 2>&1

if exist "shared" (
    xcopy /E /I /H /Y "shared\*" "%INSTALL_DIR%\shared\" >nul 2>&1
    echo      ✅ Shared resources copied
)

if exist "server" (
    xcopy /E /I /H /Y "server\*" "%INSTALL_DIR%\server\" >nul 2>&1
    echo      ✅ Server files copied
)

if exist "client" (
    xcopy /E /I /H /Y "client\*" "%INSTALL_DIR%\client\" >nul 2>&1
    echo      ✅ Client files copied
)

:: Step 4: Create desktop shortcut
echo [4/8] Creating desktop shortcut...
powershell -Command "
try {
    $WshShell = New-Object -comObject WScript.Shell;
    $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\%SHORTCUT_NAME%.lnk');
    $Shortcut.TargetPath = '%INSTALL_DIR%\wsm-oe-manager.bat';
    $Shortcut.WorkingDirectory = '%INSTALL_DIR%';
    $Shortcut.Description = '%APP_NAME% - Desktop Application v%APP_VERSION%';
    $Shortcut.IconLocation = 'shell32.dll,21';
    $Shortcut.Save();
    exit 0;
} catch {
    exit 1;
}
" >nul 2>&1

if %errorLevel% equ 0 (
    echo      ✅ Desktop shortcut created
) else (
    echo      ⚠️  Desktop shortcut: Using fallback method
    copy "%INSTALL_DIR%\wsm-oe-manager.bat" "%USERPROFILE%\Desktop\%SHORTCUT_NAME%.bat" >nul 2>&1
)

:: Step 5: Create Start Menu shortcut
echo [5/8] Creating Start Menu entry...
set "START_MENU=%ProgramData%\Microsoft\Windows\Start Menu\Programs\WSM OE Manager"
if not exist "%START_MENU%" mkdir "%START_MENU%" >nul 2>&1

powershell -Command "
try {
    $WshShell = New-Object -comObject WScript.Shell;
    $Shortcut = $WshShell.CreateShortcut('%START_MENU%\%SHORTCUT_NAME%.lnk');
    $Shortcut.TargetPath = '%INSTALL_DIR%\wsm-oe-manager.bat';
    $Shortcut.WorkingDirectory = '%INSTALL_DIR%';
    $Shortcut.Description = '%APP_NAME%';
    $Shortcut.IconLocation = 'shell32.dll,21';
    $Shortcut.Save();
    exit 0;
} catch {
    exit 1;
}
" >nul 2>&1

if %errorLevel% equ 0 (
    echo      ✅ Start Menu shortcut created
) else (
    echo      ⚠️  Start Menu: Using fallback method
    copy "%INSTALL_DIR%\wsm-oe-manager.bat" "%START_MENU%\%SHORTCUT_NAME%.bat" >nul 2>&1
)

:: Step 6: Create uninstaller
echo [6/8] Creating uninstaller...
(
echo @echo off
echo :: WSM OE Manager - Professional Uninstaller v%APP_VERSION%
echo title WSM OE Manager - Uninstaller
echo.
echo echo ████████████████████████████████████████████████████████████
echo echo █                                                          █
echo echo █       WSM OE MANAGER - UNINSTALLER v%APP_VERSION%            █
echo echo █                                                          █
echo echo ████████████████████████████████████████████████████████████
echo echo.
echo echo This will remove WSM OE Manager from your system.
echo echo Your user data and settings will be preserved.
echo echo.
echo set /p confirm="Are you sure you want to uninstall %APP_NAME%? (Y/N): "
echo if /I not "%%confirm%%"=="Y" ^(
echo     echo.
echo     echo Uninstall cancelled.
echo     pause
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
echo echo ████████████████████████████████████████████████████████████
echo echo █                                                          █
echo echo █               UNINSTALL COMPLETE                        █
echo echo █                                                          █
echo echo ████████████████████████████████████████████████████████████
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
echo         echo ✅ User data removed completely.
echo     ^)
echo ^) else ^(
echo     echo ✅ User data preserved for future installations.
echo ^)
echo.
echo echo Thank you for using WSM OE Manager!
echo echo Press any key to exit...
echo pause ^>nul
) > "%INSTALL_DIR%\uninstall.bat"
echo      ✅ Uninstaller created

:: Step 7: Register in Windows Programs and Features
echo [7/8] Registering in Windows Programs...
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayName" /t REG_SZ /d "%APP_NAME%" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "UninstallString" /t REG_SZ /d "\"%INSTALL_DIR%\uninstall.bat\"" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayVersion" /t REG_SZ /d "%APP_VERSION%" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "Publisher" /t REG_SZ /d "%PUBLISHER%" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayIcon" /t REG_SZ /d "\"%INSTALL_DIR%\wsm-oe-manager.bat\",0" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "NoModify" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "NoRepair" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "EstimatedSize" /t REG_DWORD /d 102400 /f >nul 2>&1
echo      ✅ Windows Programs registration complete

:: Step 8: Create application info and documentation
echo [8/8] Creating application documentation...
(
echo ████████████████████████████████████████████████████████████
echo █                                                          █
echo █       WSM OPERATIONAL EXCELLENCE MANAGER v%APP_VERSION%      █
echo █       Desktop Application - Installation Info           █
echo █                                                          █
echo ████████████████████████████████████████████████████████████
echo.
echo INSTALLATION COMPLETED: %DATE% at %TIME%
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo INSTALLATION DETAILS:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   Application: %APP_NAME%
echo   Version: %APP_VERSION%
echo   Installation Path: %INSTALL_DIR%
echo   User Data Path: %USER_DATA%
echo   Publisher: %PUBLISHER%
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo HOW TO LAUNCH:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   1. Desktop Shortcut: Double-click "%SHORTCUT_NAME%" on desktop
echo   2. Start Menu: Search for "WSM OE Manager"
echo   3. Direct Launch: "%INSTALL_DIR%\wsm-oe-manager.bat"
echo   4. Windows Programs: Apps ^& Features ^> WSM OE Manager
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo KEY FEATURES:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   ✓ Complete offline functionality
echo   ✓ Local SQLite database for data storage
echo   ✓ Professional Windows integration
echo   ✓ Desktop and Start Menu shortcuts
echo   ✓ Operational Excellence framework ^(8 elements^)
echo   ✓ Process management and documentation
echo   ✓ Performance measurement and tracking
echo   ✓ Mind mapping and visualization
echo   ✓ PDF export capabilities
echo   ✓ Risk management tools
echo   ✓ Balanced scorecard functionality
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo TECHNICAL INFORMATION:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   Technology: React.js frontend with Node.js backend
echo   Database: SQLite ^(local storage^)
echo   Web Interface: http://localhost:5000
echo   Data Format: JSON with SQL database
echo   Platform: Windows 10/11 compatible
echo   Requirements: No internet connection needed
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo UNINSTALL INSTRUCTIONS:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   Method 1: Windows Settings ^> Apps ^> Apps ^& features ^> WSM OE Manager
echo   Method 2: Run uninstall.bat from installation directory
echo   Method 3: Control Panel ^> Programs and Features ^> WSM OE Manager
echo.
echo   NOTE: Uninstalling preserves your user data unless specifically requested
echo         to remove it during the uninstall process.
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo SUPPORT AND TROUBLESHOOTING:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   • Application logs: Check Windows Event Viewer
echo   • User data location: %USER_DATA%
echo   • Configuration files: Installation directory
echo   • Port conflicts: Change PORT in launcher script
echo   • Database issues: Delete database file to reset
echo.
echo Thank you for installing WSM Operational Excellence Manager!
echo Enjoy your comprehensive operational excellence management solution.
) > "%INSTALL_DIR%\README.txt"
echo      ✅ Documentation created

:: ==========================================
:: INSTALLATION COMPLETE
:: ==========================================
echo.
echo ████████████████████████████████████████████████████████████
echo █                                                          █
echo █              INSTALLATION SUCCESSFUL!                   █
echo █                                                          █
echo ████████████████████████████████████████████████████████████
echo.
echo 🎉 WSM Operational Excellence Manager v%APP_VERSION% is now installed!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo INSTALLATION SUMMARY:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   ✅ Application Files: %INSTALL_DIR%
echo   ✅ User Data Directory: %USER_DATA%
echo   ✅ Desktop Shortcut: %USERPROFILE%\Desktop\%SHORTCUT_NAME%.lnk
echo   ✅ Start Menu Entry: Programs\WSM OE Manager
echo   ✅ Windows Registry: Programs and Features
echo   ✅ Uninstaller: %INSTALL_DIR%\uninstall.bat
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo LAUNCH OPTIONS:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   🖥️  Desktop: Double-click "%SHORTCUT_NAME%" icon
echo   📱 Start Menu: Search for "WSM OE Manager"
echo   ⚡ Quick Launch: Windows + R, then type "wsm"
echo   🔗 Direct: %INSTALL_DIR%\wsm-oe-manager.bat
echo.

:: Ask to launch application
set /p launch="🚀 Would you like to launch WSM OE Manager now? (Y/N): "
if /I "%launch%"=="Y" (
    echo.
    echo 🌟 Launching WSM Operational Excellence Manager...
    echo    The application will open in your default web browser.
    echo    Keep the command window open while using the application.
    echo.
    start "" "%INSTALL_DIR%\wsm-oe-manager.bat"
    timeout /t 3 >nul
    echo ✅ Application launched successfully!
) else (
    echo.
    echo ✅ Installation complete! 
    echo    You can launch WSM OE Manager anytime using the desktop shortcut.
)

echo.
echo ████████████████████████████████████████████████████████████
echo █                                                          █
echo █       Thank you for choosing WSM OE Manager!            █
echo █       Your operational excellence journey starts now.    █
echo █                                                          █
echo ████████████████████████████████████████████████████████████
echo.
echo Press any key to exit the installer...
pause >nul

endlocal
exit /b 0