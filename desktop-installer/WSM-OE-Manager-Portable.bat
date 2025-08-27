@echo off
REM WSM OE Manager - Portable Version
REM No installation required - runs from any location

title WSM OE Manager - Portable Edition

echo ==========================================
echo WSM Operational Excellence Manager v1.0.0
echo Portable Edition
echo ==========================================
echo.

REM Set portable directory
set PORTABLE_DIR=%~dp0
set USER_DATA=%PORTABLE_DIR%data

echo Running from: %PORTABLE_DIR%
echo Data folder: %USER_DATA%
echo.

REM Create data directory if it doesn't exist
if not exist "%USER_DATA%" (
    echo Creating data directory...
    md "%USER_DATA%"
)

REM Create shortcut in current directory
if not exist "%PORTABLE_DIR%Start WSM OE Manager.bat" (
    echo Creating quick-start shortcut...
    echo @echo off > "%PORTABLE_DIR%Start WSM OE Manager.bat"
    echo title WSM OE Manager >> "%PORTABLE_DIR%Start WSM OE Manager.bat"
    echo echo Starting WSM OE Manager Portable... >> "%PORTABLE_DIR%Start WSM OE Manager.bat"
    echo call "%PORTABLE_DIR%WSM-OE-Manager-Portable.bat" >> "%PORTABLE_DIR%Start WSM OE Manager.bat"
)

REM Create readme file
if not exist "%PORTABLE_DIR%README.txt" (
    echo Creating documentation...
    echo WSM Operational Excellence Manager - Portable Edition > "%PORTABLE_DIR%README.txt"
    echo ======================================================= >> "%PORTABLE_DIR%README.txt"
    echo. >> "%PORTABLE_DIR%README.txt"
    echo This is the portable version of WSM OE Manager. >> "%PORTABLE_DIR%README.txt"
    echo No installation is required. >> "%PORTABLE_DIR%README.txt"
    echo. >> "%PORTABLE_DIR%README.txt"
    echo TO START: >> "%PORTABLE_DIR%README.txt"
    echo - Double-click "Start WSM OE Manager.bat" >> "%PORTABLE_DIR%README.txt"
    echo - Or run "WSM-OE-Manager-Portable.bat" >> "%PORTABLE_DIR%README.txt"
    echo. >> "%PORTABLE_DIR%README.txt"
    echo DATA LOCATION: >> "%PORTABLE_DIR%README.txt"
    echo - All data is stored in the "data" subfolder >> "%PORTABLE_DIR%README.txt"
    echo - You can move this entire folder to any location >> "%PORTABLE_DIR%README.txt"
    echo. >> "%PORTABLE_DIR%README.txt"
    echo VERSION: 1.0.0 >> "%PORTABLE_DIR%README.txt"
    echo DATE: %DATE% >> "%PORTABLE_DIR%README.txt"
)

echo ==========================================
echo Starting WSM OE Manager...
echo ==========================================
echo.
echo The application will open in your web browser.
echo.
echo Data is stored in: %USER_DATA%
echo.
echo IMPORTANT: Keep the main WSM application running
echo for full desktop functionality.
echo.

REM Start the application
echo Opening WSM OE Manager in your default browser...
start http://localhost:5000

echo.
echo WSM OE Manager is starting...
echo You can close this window once the application loads.
echo.
echo Press any key to close this launcher...
pause >nul