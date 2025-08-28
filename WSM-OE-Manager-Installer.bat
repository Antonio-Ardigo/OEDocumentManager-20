@echo off
:: WSM OE Manager - Self-Installing Desktop Application
:: Professional Windows Installer v2.0

setlocal EnableDelayedExpansion

:: Configuration
set "APP_NAME=WSM OE Manager"
set "APP_VERSION=2.0.0"
set "INSTALL_DIR=%ProgramFiles%\WSM OE Manager"
set "USER_DATA=%USERPROFILE%\.wsm-oe-manager"
set "SHORTCUT_NAME=WSM OE Manager"

:: Check administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Administrator privileges confirmed
) else (
    echo.
    echo ==========================================
    echo ADMINISTRATOR PRIVILEGES REQUIRED
    echo ==========================================
    echo.
    echo This installer needs administrator privileges to:
    echo - Install to Program Files directory
    echo - Create system shortcuts
    echo - Register in Windows Programs
    echo.
    echo Please right-click this installer and select
    echo "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo ==========================================
echo WSM Operational Excellence Manager v%APP_VERSION%
echo Professional Desktop Installer
echo ==========================================
echo.

echo This will install WSM OE Manager as a desktop application.
echo.
echo Installation location: %INSTALL_DIR%
echo User data location: %USER_DATA%
echo.

set /p confirm="Continue with installation? (Y/N): "
if /I not "%confirm%"=="Y" (
    echo Installation cancelled.
    exit /b 0
)

echo.
echo Starting installation...

:: Create installation directory
echo Creating installation directory...
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%" || (
        echo ERROR: Could not create installation directory
        pause
        exit /b 1
    )
)

:: Create user data directory
echo Creating user data directory...
if not exist "%USER_DATA%" (
    mkdir "%USER_DATA%" || (
        echo ERROR: Could not create user data directory
        pause
        exit /b 1
    )
)

:: Copy application files (from current directory)
echo Copying application files...

:: Create the main application launcher
(
echo @echo off
echo :: WSM OE Manager Application Launcher
echo title WSM OE Manager v%APP_VERSION%
echo.
echo set "USER_DATA=%%USERPROFILE%%\.wsm-oe-manager"
echo set "PORT=5000"
echo.
echo :: Ensure user data directory exists
echo if not exist "%%USER_DATA%%" mkdir "%%USER_DATA%%"
echo.
echo :: Display startup message
echo echo ==========================================
echo echo WSM Operational Excellence Manager
echo echo Desktop Application v%APP_VERSION%
echo echo ==========================================
echo echo.
echo echo Starting application server...
echo echo Data Location: %%USER_DATA%%
echo echo Web Interface: http://localhost:%%PORT%%
echo echo.
echo echo The application will open in your default browser.
echo echo Keep this window open while using the application.
echo echo.
echo.
echo :: Change to the application directory
echo cd /d "%INSTALL_DIR%"
echo.
echo :: Start the application server
echo if exist "dist\index.js" (
echo     echo Starting WSM OE Manager server...
echo     node dist\index.js
echo ^) else (
echo     echo Starting development server...
echo     npm run dev
echo ^)
echo.
echo pause
) > "%INSTALL_DIR%\wsm-oe-manager.bat"

:: Copy the built application files
echo Copying built application...
if exist "dist" (
    xcopy /E /I /H /Y "dist\*" "%INSTALL_DIR%\dist\"
    echo Application files copied successfully
) else (
    echo Warning: dist directory not found, creating launcher only
)

:: Copy package.json and other necessary files
if exist "package.json" copy "package.json" "%INSTALL_DIR%\"
if exist "package-lock.json" copy "package-lock.json" "%INSTALL_DIR%\"

:: Copy shared schema and server files
if exist "shared" (
    xcopy /E /I /H /Y "shared\*" "%INSTALL_DIR%\shared\"
)

if exist "server" (
    xcopy /E /I /H /Y "server\*" "%INSTALL_DIR%\server\"
)

:: Create desktop shortcut
echo Creating desktop shortcut...
powershell -Command "
$WshShell = New-Object -comObject WScript.Shell;
$Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\%SHORTCUT_NAME%.lnk');
$Shortcut.TargetPath = '%INSTALL_DIR%\wsm-oe-manager.bat';
$Shortcut.WorkingDirectory = '%INSTALL_DIR%';
$Shortcut.Description = 'WSM Operational Excellence Manager - Desktop Application';
$Shortcut.IconLocation = 'shell32.dll,21';
$Shortcut.Save()
" 2>nul || (
    echo Creating batch file shortcut...
    copy "%INSTALL_DIR%\wsm-oe-manager.bat" "%USERPROFILE%\Desktop\%SHORTCUT_NAME%.bat" >nul
)

:: Create Start Menu shortcut
echo Creating Start Menu entry...
set "START_MENU=%ProgramData%\Microsoft\Windows\Start Menu\Programs"
if not exist "%START_MENU%\WSM OE Manager" mkdir "%START_MENU%\WSM OE Manager"

powershell -Command "
$WshShell = New-Object -comObject WScript.Shell;
$Shortcut = $WshShell.CreateShortcut('%START_MENU%\WSM OE Manager\%SHORTCUT_NAME%.lnk');
$Shortcut.TargetPath = '%INSTALL_DIR%\wsm-oe-manager.bat';
$Shortcut.WorkingDirectory = '%INSTALL_DIR%';
$Shortcut.Description = 'WSM Operational Excellence Manager';
$Shortcut.IconLocation = 'shell32.dll,21';
$Shortcut.Save()
" 2>nul || (
    copy "%INSTALL_DIR%\wsm-oe-manager.bat" "%START_MENU%\WSM OE Manager\%SHORTCUT_NAME%.bat" >nul
)

:: Create uninstaller
echo Creating uninstaller...
(
echo @echo off
echo :: WSM OE Manager Uninstaller
echo title WSM OE Manager - Uninstaller
echo.
echo echo ==========================================
echo echo WSM OE Manager - Uninstaller
echo echo ==========================================
echo echo.
echo echo This will remove WSM OE Manager from your system.
echo echo Your user data will be preserved.
echo echo.
echo set /p confirm="Are you sure you want to uninstall? (Y/N): "
echo if /I not "%%confirm%%"=="Y" (
echo     echo Uninstall cancelled.
echo     pause
echo     exit /b 0
echo ^)
echo.
echo echo Removing application files...
echo if exist "%INSTALL_DIR%" rd /s /q "%INSTALL_DIR%"
echo.
echo echo Removing shortcuts...
echo if exist "%%USERPROFILE%%\Desktop\%SHORTCUT_NAME%.lnk" del "%%USERPROFILE%%\Desktop\%SHORTCUT_NAME%.lnk"
echo if exist "%%USERPROFILE%%\Desktop\%SHORTCUT_NAME%.bat" del "%%USERPROFILE%%\Desktop\%SHORTCUT_NAME%.bat"
echo if exist "%START_MENU%\WSM OE Manager" rd /s /q "%START_MENU%\WSM OE Manager"
echo.
echo echo Removing registry entries...
echo reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /f 2^>nul
echo.
echo echo ==========================================
echo echo Uninstall Complete
echo echo ==========================================
echo echo.
echo echo WSM OE Manager has been removed from your system.
echo echo.
echo echo NOTE: Your user data has been preserved at:
echo echo %USER_DATA%
echo echo.
echo echo If you want to completely remove all data, you can manually delete this folder.
echo echo.
echo pause
) > "%INSTALL_DIR%\uninstall.bat"

:: Register application in Windows Programs and Features
echo Registering in Windows Programs and Features...
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayName" /t REG_SZ /d "%APP_NAME%" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "UninstallString" /t REG_SZ /d "\"%INSTALL_DIR%\uninstall.bat\"" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayVersion" /t REG_SZ /d "%APP_VERSION%" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "Publisher" /t REG_SZ /d "WSM Operational Excellence Team" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayIcon" /t REG_SZ /d "\"%INSTALL_DIR%\wsm-oe-manager.bat\",0" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "NoModify" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "NoRepair" /t REG_DWORD /d 1 /f >nul

:: Create application info file
echo Creating application information...
(
echo WSM Operational Excellence Manager v%APP_VERSION%
echo Desktop Application - Professional Installer
echo.
echo Installation Details:
echo - Installation Date: %DATE% %TIME%
echo - Installation Path: %INSTALL_DIR%
echo - User Data Path: %USER_DATA%
echo - Version: %APP_VERSION%
echo.
echo USAGE:
echo - Desktop Shortcut: Double-click "%SHORTCUT_NAME%" on desktop
echo - Start Menu: Search for "WSM OE Manager"
echo - Direct Launch: Run wsm-oe-manager.bat from installation folder
echo.
echo FEATURES:
echo - Complete offline functionality
echo - Local data storage
echo - Professional Windows integration
echo - Desktop and Start Menu shortcuts
echo - Automatic uninstaller
echo.
echo UNINSTALL:
echo - Use Windows Settings ^> Apps ^> Apps ^& features
echo - Or run uninstall.bat from installation folder
echo.
echo SUPPORT:
echo This desktop application provides complete operational excellence
echo management capabilities with local data storage and offline functionality.
) > "%INSTALL_DIR%\application-info.txt"

echo.
echo ==========================================
echo Installation Completed Successfully!
echo ==========================================
echo.
echo WSM Operational Excellence Manager v%APP_VERSION% has been installed!
echo.
echo Installation Details:
echo - Location: %INSTALL_DIR%
echo - User Data: %USER_DATA%
echo - Desktop Shortcut: Created
echo - Start Menu Entry: Created
echo - Windows Programs: Registered
echo.
echo You can now start the application using:
echo 1. Desktop shortcut: "%SHORTCUT_NAME%"
echo 2. Start Menu: Search for "WSM OE Manager"
echo 3. Direct launch: "%INSTALL_DIR%\wsm-oe-manager.bat"
echo.
echo IMPORTANT: This desktop application runs locally on your computer
echo and provides complete operational excellence functionality offline.
echo.

:: Ask to launch application
set /p launch="Would you like to launch WSM OE Manager now? (Y/N): "
if /I "%launch%"=="Y" (
    echo.
    echo Launching WSM OE Manager...
    start "" "%INSTALL_DIR%\wsm-oe-manager.bat"
    timeout /t 2 >nul
) else (
    echo.
    echo Installation complete! You can launch WSM OE Manager anytime.
)

echo.
echo Thank you for installing WSM OE Manager!
echo Press any key to exit the installer...
pause >nul

endlocal