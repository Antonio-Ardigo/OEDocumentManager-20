@echo off
REM WSM OE Manager - Universal Windows Installer
REM Compatible with Windows 7, 8, 10, 11

echo ==========================================
echo WSM Operational Excellence Manager v1.0.0
echo Universal Windows Installer
echo ==========================================
echo.

REM Basic compatibility check
ver | find "Windows" >nul
if errorlevel 1 (
    echo This installer requires Windows operating system
    pause
    exit /b 1
)

REM Check for administrator privileges (works on all Windows versions)
openfiles >nul 2>&1
if errorlevel 1 (
    echo.
    echo NOTICE: This installer requires administrator privileges.
    echo Please right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

REM Set basic variables (compatible syntax)
set INSTALL_DIR=%ProgramFiles%\WSM OE Manager
set USER_DATA=%USERPROFILE%\.wsm-oe-manager
set DESKTOP_DIR=%USERPROFILE%\Desktop

echo Installing WSM OE Manager...
echo Target directory: %INSTALL_DIR%
echo User data: %USER_DATA%
echo.

REM Create directories
echo Creating installation directories...
if not exist "%INSTALL_DIR%" md "%INSTALL_DIR%"
if not exist "%USER_DATA%" md "%USER_DATA%"

REM Create main application launcher (simple version)
echo Creating application launcher...
echo @echo off > "%INSTALL_DIR%\wsm-oe-manager.bat"
echo REM WSM OE Manager Launcher >> "%INSTALL_DIR%\wsm-oe-manager.bat"
echo set USER_DATA=%USERPROFILE%\.wsm-oe-manager >> "%INSTALL_DIR%\wsm-oe-manager.bat"
echo if not exist "%%USER_DATA%%" md "%%USER_DATA%%" >> "%INSTALL_DIR%\wsm-oe-manager.bat"
echo echo Starting WSM OE Manager... >> "%INSTALL_DIR%\wsm-oe-manager.bat"
echo echo Application will start in your default web browser >> "%INSTALL_DIR%\wsm-oe-manager.bat"
echo echo Data will be stored in: %%USER_DATA%% >> "%INSTALL_DIR%\wsm-oe-manager.bat"
echo start http://localhost:5000 >> "%INSTALL_DIR%\wsm-oe-manager.bat"
echo echo WSM OE Manager is starting... >> "%INSTALL_DIR%\wsm-oe-manager.bat"
echo timeout /t 3 /nobreak ^>nul >> "%INSTALL_DIR%\wsm-oe-manager.bat"

REM Create desktop shortcut (simple batch file)
echo Creating desktop shortcut...
echo @echo off > "%DESKTOP_DIR%\WSM OE Manager.bat"
echo echo Starting WSM OE Manager... >> "%DESKTOP_DIR%\WSM OE Manager.bat"
echo call "%INSTALL_DIR%\wsm-oe-manager.bat" >> "%DESKTOP_DIR%\WSM OE Manager.bat"

REM Create start menu folder and shortcut
echo Creating start menu entry...
set START_MENU=%ProgramData%\Microsoft\Windows\Start Menu\Programs\WSM OE Manager
if not exist "%START_MENU%" md "%START_MENU%"
copy "%DESKTOP_DIR%\WSM OE Manager.bat" "%START_MENU%\WSM OE Manager.bat" >nul

REM Create uninstaller
echo Creating uninstaller...
echo @echo off > "%INSTALL_DIR%\uninstall.bat"
echo echo Uninstalling WSM OE Manager... >> "%INSTALL_DIR%\uninstall.bat"
echo if exist "%INSTALL_DIR%" rd /s /q "%INSTALL_DIR%" >> "%INSTALL_DIR%\uninstall.bat"
echo if exist "%DESKTOP_DIR%\WSM OE Manager.bat" del "%DESKTOP_DIR%\WSM OE Manager.bat" >> "%INSTALL_DIR%\uninstall.bat"
echo if exist "%START_MENU%" rd /s /q "%START_MENU%" >> "%INSTALL_DIR%\uninstall.bat"
echo echo WSM OE Manager has been uninstalled. >> "%INSTALL_DIR%\uninstall.bat"
echo echo Your data in %USER_DATA% has been preserved. >> "%INSTALL_DIR%\uninstall.bat"
echo pause >> "%INSTALL_DIR%\uninstall.bat"

REM Create application info file
echo Creating application info...
echo WSM Operational Excellence Manager > "%INSTALL_DIR%\app-info.txt"
echo Version: 1.0.0 >> "%INSTALL_DIR%\app-info.txt"
echo Installation Date: %DATE% %TIME% >> "%INSTALL_DIR%\app-info.txt"
echo Installation Path: %INSTALL_DIR% >> "%INSTALL_DIR%\app-info.txt"
echo User Data Path: %USER_DATA% >> "%INSTALL_DIR%\app-info.txt"
echo. >> "%INSTALL_DIR%\app-info.txt"
echo To uninstall: Run uninstall.bat >> "%INSTALL_DIR%\app-info.txt"

REM Try to register in Windows (optional, may fail on some systems)
echo Registering application...
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayName" /t REG_SZ /d "WSM OE Manager" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "UninstallString" /t REG_SZ /d "%INSTALL_DIR%\uninstall.bat" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayVersion" /t REG_SZ /d "1.0.0" /f >nul 2>&1

echo.
echo ==========================================
echo Installation Complete!
echo ==========================================
echo.
echo WSM OE Manager has been successfully installed!
echo.
echo Installation location: %INSTALL_DIR%
echo User data location: %USER_DATA%
echo.
echo You can now start the application by:
echo 1. Double-clicking the desktop shortcut: "WSM OE Manager"
echo 2. Using Start Menu: Programs ^> WSM OE Manager
echo 3. Running: %INSTALL_DIR%\wsm-oe-manager.bat
echo.
echo IMPORTANT NOTE:
echo This desktop version connects to the web application.
echo Make sure the main application is running for full functionality.
echo.
set /p choice="Would you like to start WSM OE Manager now? (Y/N): "
if /I "%choice%"=="Y" (
    echo Starting application...
    call "%INSTALL_DIR%\wsm-oe-manager.bat"
) else (
    echo.
    echo Installation complete. You can start the application anytime.
)

echo.
echo Press any key to exit the installer...
pause >nul