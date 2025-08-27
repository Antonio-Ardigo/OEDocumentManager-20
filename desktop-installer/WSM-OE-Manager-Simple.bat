@echo off
REM WSM OE Manager - Simple Launcher
REM Basic compatibility for older Windows versions

echo WSM Operational Excellence Manager
echo Starting application...
echo.

REM Create user data folder
set USER_DATA=%USERPROFILE%\.wsm-oe-manager
if not exist "%USER_DATA%" md "%USER_DATA%"

REM Simple startup message
echo Your WSM OE Manager is starting...
echo Data will be stored in: %USER_DATA%
echo.
echo The application will open in your web browser.
echo.

REM Launch in browser
start http://localhost:5000

REM Simple wait
echo Application starting...
ping localhost -n 4 >nul

echo.
echo WSM OE Manager should now be running in your browser.
echo You can close this window.
echo.
pause