@echo off
setlocal enabledelayedexpansion

echo ========================================
echo WSM OE Manager - Windows Installer
echo ========================================
echo.

:: Check for administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This installer requires administrator privileges.
    echo Please right-click and "Run as administrator"
    pause
    exit /b 1
)

:: Set installation directory
set "INSTALL_DIR=%ProgramFiles%\WSM OE Manager"
set "USER_DATA_DIR=%USERPROFILE%\.wsm-oe-manager"

echo Installing WSM OE Manager...
echo Installation directory: %INSTALL_DIR%
echo User data directory: %USER_DATA_DIR%
echo.

:: Create installation directory
if not exist "%INSTALL_DIR%" (
    echo Creating installation directory...
    mkdir "%INSTALL_DIR%"
)

:: Create user data directory
if not exist "%USER_DATA_DIR%" (
    echo Creating user data directory...
    mkdir "%USER_DATA_DIR%"
)

:: Copy application files
echo Copying application files...
xcopy /E /I /H /Y "%~dp0build\*" "%INSTALL_DIR%\"

:: Create desktop shortcut
echo Creating desktop shortcut...
set "SHORTCUT=%USERPROFILE%\Desktop\WSM OE Manager.lnk"
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT%'); $Shortcut.TargetPath = '%INSTALL_DIR%\wsm-oe-manager.exe'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Description = 'WSM Operational Excellence Manager'; $Shortcut.Save()"

:: Create start menu entry
echo Creating start menu entry...
set "START_MENU=%ProgramData%\Microsoft\Windows\Start Menu\Programs"
if not exist "%START_MENU%\WSM OE Manager" (
    mkdir "%START_MENU%\WSM OE Manager"
)
set "START_SHORTCUT=%START_MENU%\WSM OE Manager\WSM OE Manager.lnk"
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%START_SHORTCUT%'); $Shortcut.TargetPath = '%INSTALL_DIR%\wsm-oe-manager.exe'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Description = 'WSM Operational Excellence Manager'; $Shortcut.Save()"

:: Register uninstaller
echo Registering uninstaller...
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayName" /t REG_SZ /d "WSM OE Manager" /f
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "UninstallString" /t REG_SZ /d "\"%INSTALL_DIR%\uninstall.bat\"" /f
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "DisplayVersion" /t REG_SZ /d "1.0.0" /f
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "Publisher" /t REG_SZ /d "WSM Operational Excellence Team" /f
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f

:: Create uninstaller
echo Creating uninstaller...
(
echo @echo off
echo setlocal
echo echo Uninstalling WSM OE Manager...
echo.
echo :: Remove installation directory
echo if exist "%INSTALL_DIR%" ^(
echo     echo Removing installation files...
echo     rmdir /S /Q "%INSTALL_DIR%"
echo ^)
echo.
echo :: Remove desktop shortcut
echo if exist "%USERPROFILE%\Desktop\WSM OE Manager.lnk" ^(
echo     del "%USERPROFILE%\Desktop\WSM OE Manager.lnk"
echo ^)
echo.
echo :: Remove start menu entry
echo if exist "%ProgramData%\Microsoft\Windows\Start Menu\Programs\WSM OE Manager" ^(
echo     rmdir /S /Q "%ProgramData%\Microsoft\Windows\Start Menu\Programs\WSM OE Manager"
echo ^)
echo.
echo :: Remove registry entries
echo reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WSM OE Manager" /f
echo.
echo echo WSM OE Manager has been uninstalled.
echo echo Note: User data in %USERPROFILE%\.wsm-oe-manager has been preserved.
echo pause
) > "%INSTALL_DIR%\uninstall.bat"

:: Create launcher script
echo Creating launcher...
(
echo @echo off
echo cd /d "%INSTALL_DIR%"
echo set NODE_ENV=production
echo set DATABASE_URL=sqlite:///%USER_DATA_DIR%\wsm-oe.db
echo set SESSION_SECRET=wsm-oe-desktop-secret-%RANDOM%
echo start "" node electron-main.js
) > "%INSTALL_DIR%\wsm-oe-manager.bat"

:: Create executable wrapper (using PowerShell to create a proper executable launcher)
echo Creating executable launcher...
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.IO.File]::Copy('%INSTALL_DIR%\wsm-oe-manager.bat', '%INSTALL_DIR%\wsm-oe-manager.exe')"

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo WSM OE Manager has been installed to:
echo %INSTALL_DIR%
echo.
echo You can now:
echo - Double-click the desktop shortcut
echo - Find it in the Start Menu
echo - Access your data at: %USER_DATA_DIR%
echo.
echo Press any key to exit...
pause >nul