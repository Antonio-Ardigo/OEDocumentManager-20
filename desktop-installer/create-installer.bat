@echo off
setlocal enabledelayedexpansion

echo ========================================
echo WSM OE Manager - Creating Windows Installer
echo ========================================
echo.

:: Get the current directory
set "INSTALLER_DIR=%~dp0"
set "PROJECT_DIR=%INSTALLER_DIR%.."

echo Building application...
cd /d "%PROJECT_DIR%"

:: Build the web application
echo Step 1: Building web application...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build web application
    pause
    exit /b 1
)

:: Create build directory in installer folder
echo Step 2: Preparing installer build...
if exist "%INSTALLER_DIR%build" rmdir /S /Q "%INSTALLER_DIR%build"
mkdir "%INSTALLER_DIR%build"

:: Copy web application dist files
echo Step 3: Copying web application files...
xcopy /E /I /H /Y "%PROJECT_DIR%\dist\*" "%INSTALLER_DIR%build\"

:: Copy Electron files
echo Step 4: Copying desktop application files...
copy "%INSTALLER_DIR%electron-main.js" "%INSTALLER_DIR%build\"
copy "%INSTALLER_DIR%electron-preload.js" "%INSTALLER_DIR%build\"
copy "%INSTALLER_DIR%electron-builder.yml" "%INSTALLER_DIR%build\"

:: Copy assets
if exist "%INSTALLER_DIR%assets" (
    echo Step 5: Copying assets...
    xcopy /E /I /H /Y "%INSTALLER_DIR%assets\*" "%INSTALLER_DIR%build\assets\"
)

:: Create package.json for production
echo Step 6: Creating production package.json...
(
echo {
echo   "name": "wsm-oe-manager",
echo   "version": "1.0.0",
echo   "description": "WSM Operational Excellence Manager - Desktop Application",
echo   "main": "electron-main.js",
echo   "author": "WSM Operational Excellence Team",
echo   "license": "MIT",
echo   "scripts": {
echo     "start": "node electron-main.js"
echo   },
echo   "dependencies": {
echo     "better-sqlite3": "^9.2.2",
echo     "express": "^4.21.2",
echo     "express-session": "^1.18.1",
echo     "drizzle-orm": "^0.39.1"
echo   }
echo }
) > "%INSTALLER_DIR%build\package.json"

:: Install production dependencies
echo Step 7: Installing production dependencies...
cd /d "%INSTALLER_DIR%build"
call npm install --production --no-optional
if %errorlevel% neq 0 (
    echo Warning: Some dependencies failed to install, but continuing...
)

:: Copy database setup files
echo Step 8: Copying database files...
copy "%PROJECT_DIR%\server\db-local.ts" "%INSTALLER_DIR%build\db-local.js" 2>nul || echo Database file not found, will be created at runtime

:: Create startup script
echo Step 9: Creating startup script...
(
echo const { app, BrowserWindow } = require('electron'^);
echo const path = require('path'^);
echo const { spawn } = require('child_process'^);
echo const os = require('os'^);
echo const fs = require('fs'^);
echo.
echo // Create user data directory
echo const userDataPath = path.join(os.homedir(^), '.wsm-oe-manager'^);
echo if (^!fs.existsSync(userDataPath^)^) {
echo   fs.mkdirSync(userDataPath, { recursive: true }^);
echo }
echo.
echo app.setPath('userData', userDataPath^);
echo.
echo let mainWindow;
echo let serverProcess;
echo.
echo function createWindow(^) {
echo   mainWindow = new BrowserWindow({
echo     width: 1400,
echo     height: 1000,
echo     webPreferences: {
echo       nodeIntegration: false,
echo       contextIsolation: true,
echo       enableRemoteModule: false
echo     },
echo     show: false
echo   }^);
echo.
echo   // Start server
echo   const serverPath = path.join(__dirname, 'index.js'^);
echo   serverProcess = spawn('node', [serverPath], {
echo     env: {
echo       ...process.env,
echo       NODE_ENV: 'production',
echo       PORT: '5000',
echo       DATABASE_URL: `sqlite://${path.join(userDataPath, 'wsm-oe.db'^)}`,
echo       SESSION_SECRET: 'wsm-oe-desktop-secret-' + Math.random(^).toString(36^).substring(7^)
echo     }
echo   }^);
echo.
echo   setTimeout(^(^) =^> {
echo     mainWindow.loadURL('http://localhost:5000'^);
echo     mainWindow.show(^);
echo   }, 2000^);
echo }
echo.
echo app.whenReady(^).then(createWindow^);
echo.
echo app.on('window-all-closed', ^(^) =^> {
echo   if (serverProcess^) serverProcess.kill(^);
echo   app.quit(^);
echo }^);
) > "%INSTALLER_DIR%build\electron-main.js"

echo.
echo ========================================
echo Windows Installer Package Created!
echo ========================================
echo.
echo Location: %INSTALLER_DIR%build\
echo.
echo To install:
echo 1. Run install-windows.bat as Administrator
echo 2. Or manually copy the build folder contents
echo.
echo Press any key to exit...
pause >nul

cd /d "%INSTALLER_DIR%"