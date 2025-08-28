@echo off
:: WSM OE Manager - Desktop Installer 2.0 Demonstration
:: This script demonstrates the installer capabilities

setlocal EnableDelayedExpansion

echo ========================================
echo WSM OE Manager - Desktop Installer 2.0
echo Professional Windows Installation Demo
echo ========================================
echo.

echo This demonstration will show you the complete Desktop Installer 2.0 system.
echo.

echo Key Features:
echo ✅ Professional Windows installer (.exe)
echo ✅ Complete offline functionality 
echo ✅ Self-contained application bundle
echo ✅ Best-in-class Windows integration
echo ✅ Modern PowerShell installation scripts
echo ✅ Comprehensive testing and deployment tools
echo.

echo Directory Structure:
echo 📁 desktop-installer-2.0/
echo    ├── 📂 src/                 (Core installer source files)
echo    ├── 📂 assets/              (Icons and visual resources)  
echo    ├── 📂 build/               (Temporary build output)
echo    ├── 📂 dist/                (Final installer packages)
echo    ├── 📂 scripts/             (Build and utility scripts)
echo    ├── 📂 resources/           (Application resources)
echo    ├── 📄 package.json         (Build configuration)
echo    ├── 📄 README.md            (Documentation)
echo    ├── 📄 INSTALLATION-GUIDE.md (Setup instructions)
echo    └── 📄 DEPLOYMENT.md        (Enterprise deployment)
echo.

echo Available Commands:
echo.
echo 🏗️  BUILD COMMANDS:
echo    npm run build-installer    - Create professional installer
echo    npm run dev                - Quick development build  
echo    npm run test-installer     - Test installer components
echo    npm run clean              - Clean build directories
echo.

echo 🚀 INSTALLATION METHODS:
echo    1. Windows GUI Installer   - Double-click .exe file
echo    2. PowerShell Script       - scripts/windows-installer.ps1
echo    3. Silent Installation     - Command line with /S flag
echo    4. Portable Mode           - No administrator required
echo.

echo 📦 OUTPUT FILES:
echo    WSM-OE-Manager-Setup-v2.0.exe     - Main installer
echo    PORTABLE-VERSION-GUIDE.md         - Portable deployment
echo    checksums.txt                     - File verification
echo.

set /p demo="Would you like to see the available build scripts? (Y/N): "
if /I "!demo!"=="Y" (
    echo.
    echo 📋 Available Scripts:
    echo.
    if exist "scripts\build-installer.js" (
        echo ✅ build-installer.js    - Main build system
    )
    if exist "scripts\windows-installer.ps1" (
        echo ✅ windows-installer.ps1 - PowerShell installer
    )
    if exist "scripts\test-installer.js" (
        echo ✅ test-installer.js     - Testing framework
    )
    if exist "scripts\dev-build.js" (
        echo ✅ dev-build.js          - Development builds
    )
    echo.
    echo 📄 Documentation:
    if exist "README.md" (
        echo ✅ README.md            - Overview and features
    )
    if exist "INSTALLATION-GUIDE.md" (
        echo ✅ INSTALLATION-GUIDE.md - Complete setup guide
    )
    if exist "DEPLOYMENT.md" (
        echo ✅ DEPLOYMENT.md        - Enterprise deployment
    )
    echo.
)

echo.
echo 🎯 Quick Start:
echo    1. cd desktop-installer-2.0
echo    2. npm install
echo    3. npm run build-installer
echo    4. Find installer in dist/ directory
echo    5. Run as Administrator on target system
echo.

echo 🛡️ Professional Features:
echo    • Windows 10/11 optimized
echo    • Administrator privilege detection
echo    • Registry integration
echo    • Desktop and Start Menu shortcuts
echo    • Professional uninstaller
echo    • Silent installation support
echo    • Enterprise deployment ready
echo.

echo ✨ The WSM Operational Excellence Manager is now packaged as a
echo    professional, self-installing desktop application that works
echo    completely offline with all functionality included!
echo.

set /p build="Would you like to start the build process now? (Y/N): "
if /I "!build!"=="Y" (
    echo.
    echo Starting build process...
    echo.
    if exist "package.json" (
        echo Installing dependencies...
        call npm install
        echo.
        echo Building installer...
        call npm run build-installer
    ) else (
        echo Error: package.json not found. Make sure you're in the correct directory.
    )
) else (
    echo.
    echo To build the installer later, run:
    echo    npm run build-installer
)

echo.
echo Thank you for using WSM OE Manager Desktop Installer 2.0!
echo For support and documentation, see the included guide files.
echo.
pause

endlocal