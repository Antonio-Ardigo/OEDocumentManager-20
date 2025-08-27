@echo off
:: WSM OE Manager - Windows 10/11 Installer
:: Uses PowerShell for modern Windows compatibility

setlocal EnableDelayedExpansion

echo ==========================================
echo WSM Operational Excellence Manager v1.0.0
echo Windows 10/11 Professional Installer
echo ==========================================
echo.

:: Check Windows version (Windows 10/11 only)
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo Detected Windows version: %VERSION%

:: Verify Windows 10/11
if "%VERSION%" LSS "10.0" (
    echo ERROR: This installer requires Windows 10 or Windows 11
    echo Your version: %VERSION%
    pause
    exit /b 1
)

echo Windows 10/11 detected - proceeding with installation
echo.

:: Check administrator privileges using PowerShell
powershell -Command "if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) { exit 1 }"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Administrator privileges required
    echo Please right-click this installer and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo Administrator privileges confirmed
echo.

:: Set installation paths
set "INSTALL_DIR=%ProgramFiles%\WSM OE Manager"
set "USER_DATA=%USERPROFILE%\.wsm-oe-manager"
set "SHORTCUT_NAME=WSM OE Manager"

echo Installation directories:
echo - Program Files: !INSTALL_DIR!
echo - User Data: !USER_DATA!
echo.

:: Create installation directory
echo Creating installation directory...
if not exist "!INSTALL_DIR!" (
    mkdir "!INSTALL_DIR!" || (
        echo ERROR: Could not create installation directory
        pause
        exit /b 1
    )
)

:: Create user data directory
echo Creating user data directory...
if not exist "!USER_DATA!" (
    mkdir "!USER_DATA!" || (
        echo ERROR: Could not create user data directory
        pause
        exit /b 1
    )
)

:: Create main application launcher
echo Creating application launcher...
(
echo @echo off
echo :: WSM OE Manager Application Launcher
echo title WSM OE Manager
echo.
echo set "USER_DATA=%%USERPROFILE%%\.wsm-oe-manager"
echo.
echo :: Ensure user data directory exists
echo if not exist "%%USER_DATA%%" mkdir "%%USER_DATA%%"
echo.
echo :: Display startup message
echo echo ==========================================
echo echo WSM Operational Excellence Manager
echo echo Starting Application...
echo echo ==========================================
echo echo.
echo echo Data Location: %%USER_DATA%%
echo echo Web Interface: http://localhost:5000
echo echo.
echo echo The application will open in your default browser.
echo echo Make sure the main WSM application server is running.
echo echo.
echo.
echo :: Launch in default browser
echo start "" "http://localhost:5000"
echo.
echo echo WSM OE Manager is starting...
echo timeout /t 3 /nobreak ^>nul
echo.
echo :: Keep window open for troubleshooting
echo echo Application launched. You can close this window.
echo echo If the application doesn't open, check that the main server is running.
echo echo.
echo pause
) > "!INSTALL_DIR!\wsm-oe-manager.bat"

:: Create PowerShell script for desktop shortcut
echo Creating desktop shortcut using PowerShell...
powershell -Command "
$WshShell = New-Object -comObject WScript.Shell;
$Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\!SHORTCUT_NAME!.lnk');
$Shortcut.TargetPath = '!INSTALL_DIR!\wsm-oe-manager.bat';
$Shortcut.WorkingDirectory = '!INSTALL_DIR!';
$Shortcut.Description = 'WSM Operational Excellence Manager - Desktop Application';
$Shortcut.IconLocation = 'shell32.dll,21';
$Shortcut.Save()
" || (
    echo Warning: Could not create desktop shortcut via PowerShell
    echo Creating batch file shortcut instead...
    copy "!INSTALL_DIR!\wsm-oe-manager.bat" "%USERPROFILE%\Desktop\!SHORTCUT_NAME!.bat" >nul
)

:: Create Start Menu shortcut using PowerShell
echo Creating Start Menu entry...
set "START_MENU=%ProgramData%\Microsoft\Windows\Start Menu\Programs"
if not exist "!START_MENU!\WSM OE Manager" mkdir "!START_MENU!\WSM OE Manager"

powershell -Command "
$WshShell = New-Object -comObject WScript.Shell;
$Shortcut = $WshShell.CreateShortcut('!START_MENU!\WSM OE Manager\!SHORTCUT_NAME!.lnk');
$Shortcut.TargetPath = '!INSTALL_DIR!\wsm-oe-manager.bat';
$Shortcut.WorkingDirectory = '!INSTALL_DIR!';
$Shortcut.Description = 'WSM Operational Excellence Manager';
$Shortcut.IconLocation = 'shell32.dll,21';
$Shortcut.Save()
" || (
    echo Warning: Could not create Start Menu shortcut via PowerShell
    copy "!INSTALL_DIR!\wsm-oe-manager.bat" "!START_MENU!\WSM OE Manager\!SHORTCUT_NAME!.bat" >nul
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
echo if exist "!INSTALL_DIR!" rd /s /q "!INSTALL_DIR!"
echo.
echo echo Removing shortcuts...
echo if exist "%%USERPROFILE%%\Desktop\!SHORTCUT_NAME!.lnk" del "%%USERPROFILE%%\Desktop\!SHORTCUT_NAME!.lnk"
echo if exist "%%USERPROFILE%%\Desktop\!SHORTCUT_NAME!.bat" del "%%USERPROFILE%%\Desktop\!SHORTCUT_NAME!.bat"
echo if exist "!START_MENU!\WSM OE Manager" rd /s /q "!START_MENU!\WSM OE Manager"
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
echo echo !USER_DATA!
echo echo.
echo echo If you want to completely remove all data, you can manually delete this folder.
echo echo.
echo pause
) > "!INSTALL_DIR!\uninstall.bat"

:: Register application in Windows Programs and Features
echo Registering in Windows Programs and Features...
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayName" /t REG_SZ /d "WSM OE Manager" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "UninstallString" /t REG_SZ /d "\"!INSTALL_DIR!\uninstall.bat\"" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayVersion" /t REG_SZ /d "1.0.0" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "Publisher" /t REG_SZ /d "WSM Operational Excellence Team" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayIcon" /t REG_SZ /d "\"!INSTALL_DIR!\wsm-oe-manager.bat\",0" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "InstallLocation" /t REG_SZ /d "!INSTALL_DIR!" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "NoModify" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "NoRepair" /t REG_DWORD /d 1 /f >nul

:: Create application info file
echo Creating application information...
(
echo WSM Operational Excellence Manager
echo Version: 1.0.0
echo Target: Windows 10/11
echo Installation Date: %DATE% %TIME%
echo Installation Path: !INSTALL_DIR!
echo User Data Path: !USER_DATA!
echo.
echo USAGE:
echo - Desktop Shortcut: Double-click "!SHORTCUT_NAME!" on desktop
echo - Start Menu: Search for "WSM OE Manager"
echo - Direct Launch: Run wsm-oe-manager.bat from installation folder
echo.
echo UNINSTALL:
echo - Use Windows Settings ^> Apps ^> Apps ^& features
echo - Or run uninstall.bat from installation folder
echo.
echo SUPPORT:
echo This desktop launcher connects to the main WSM OE application.
echo Ensure the main application server is running for full functionality.
) > "!INSTALL_DIR!\application-info.txt"

echo.
echo ==========================================
echo Installation Completed Successfully!
echo ==========================================
echo.
echo WSM Operational Excellence Manager has been installed!
echo.
echo Installation Details:
echo - Location: !INSTALL_DIR!
echo - User Data: !USER_DATA!
echo - Desktop Shortcut: Created
echo - Start Menu Entry: Created
echo - Windows Programs: Registered
echo.
echo You can now start the application using:
echo 1. Desktop shortcut: "!SHORTCUT_NAME!"
echo 2. Start Menu: Search for "WSM OE Manager"
echo 3. Windows key + R, then type: "!INSTALL_DIR!\wsm-oe-manager.bat"
echo.
echo IMPORTANT: This desktop version connects to your main WSM application.
echo Make sure your main WSM server is running for full functionality.
echo.

:: Ask to launch application
set /p launch="Would you like to launch WSM OE Manager now? (Y/N): "
if /I "!launch!"=="Y" (
    echo.
    echo Launching WSM OE Manager...
    start "" "!INSTALL_DIR!\wsm-oe-manager.bat"
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