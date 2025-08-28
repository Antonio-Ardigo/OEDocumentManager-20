#!/usr/bin/env node

/**
 * WSM OE Manager - Self-Extracting Installer Creator
 * Creates a single executable that contains all application files
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class SelfExtractingInstallerCreator {
  constructor() {
    this.projectRoot = __dirname;
    this.version = '2.0.0';
    this.appName = 'WSM OE Manager';
    this.outputDir = path.join(this.projectRoot, 'installer-output');
  }

  async createSelfExtractingInstaller() {
    console.log('🚀 Creating Self-Extracting Installer');
    console.log('====================================');
    console.log('');

    // Create base64 encoded version of all files
    console.log('📦 Encoding application bundle...');
    
    const bundleData = await this.createBase64Bundle();
    
    // Create the self-extracting installer
    const installerScript = `@echo off
:: WSM OE Manager - Self-Extracting Installer v${this.version}
:: Single file contains complete application

setlocal EnableDelayedExpansion

:: ==========================================
:: INSTALLER CONFIGURATION
:: ==========================================
set "APP_NAME=WSM OE Manager"
set "APP_VERSION=${this.version}"
set "INSTALL_DIR=%ProgramFiles%\\WSM OE Manager"
set "USER_DATA=%USERPROFILE%\\.wsm-oe-manager"
set "TEMP_EXTRACT=%TEMP%\\wsm-oe-installer-%RANDOM%"

:: ==========================================
:: EMBEDDED APPLICATION DATA
:: ==========================================
:: The following section contains the complete application
:: encoded as base64 data for self-extraction

goto :INSTALLER_START

:EMBEDDED_DATA
${bundleData}
:END_EMBEDDED_DATA

:INSTALLER_START

:: ==========================================
:: PROFESSIONAL INSTALLER HEADER
:: ==========================================
title WSM OE Manager - Self-Extracting Installer v%APP_VERSION%
mode con: cols=80 lines=30
color 0F

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                              ║
echo ║           WSM OPERATIONAL EXCELLENCE MANAGER v${this.version}                     ║
echo ║           Self-Extracting Professional Desktop Installer                    ║
echo ║                                                                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo    ✓ Complete application embedded in this single file
echo    ✓ All operational excellence features included
echo    ✓ Professional Windows integration
echo    ✓ Self-contained with local database
echo    ✓ No external files required
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
    echo This installer requires administrator privileges for system integration.
    echo Right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo ✅ Administrator privileges confirmed
echo.

:: ==========================================
:: SYSTEM REQUIREMENTS
:: ==========================================
echo 🔍 Validating system requirements...

for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
if "%VERSION%" LSS "10.0" (
    echo ❌ Windows 10 or later required
    pause
    exit /b 1
)

node --version >nul 2>&1
if %errorLevel% equ 0 (
    for /f %%i in ('node --version') do echo    • Node.js: %%i detected
    set "HAS_NODE=1"
) else (
    echo    • Node.js: Not found - setup helper will be provided
    set "HAS_NODE=0"
)

echo ✅ System validated
echo.

:: ==========================================
:: EXTRACTION AND INSTALLATION
:: ==========================================
echo 🚀 Self-extracting and installing application...

:: Create temporary extraction directory
if not exist "%TEMP_EXTRACT%" mkdir "%TEMP_EXTRACT%"

echo [1/8] Extracting embedded application files...
:: Extract the embedded data using PowerShell base64 decoding
powershell -Command "
    try {
        $$batContent = Get-Content '%~f0' -Raw;
        $$startMarker = ':EMBEDDED_DATA';
        $$endMarker = ':END_EMBEDDED_DATA';
        $$startIndex = $$batContent.IndexOf($$startMarker) + $$startMarker.Length;
        $$endIndex = $$batContent.IndexOf($$endMarker);
        $$base64Data = $$batContent.Substring($$startIndex, $$endIndex - $$startIndex).Trim();
        $$bytes = [System.Convert]::FromBase64String($$base64Data);
        [System.IO.File]::WriteAllBytes('%TEMP_EXTRACT%\\bundle.zip', $$bytes);
        exit 0;
    } catch {
        Write-Host 'Extraction failed:' $$_.Exception.Message;
        exit 1;
    }
" >nul 2>&1

if %errorLevel% neq 0 (
    echo ❌ Failed to extract application files
    pause
    exit /b 1
)

echo         ✅ Application files extracted

echo [2/8] Decompressing application bundle...
powershell -Command "
    try {
        Add-Type -AssemblyName System.IO.Compression.FileSystem;
        [System.IO.Compression.ZipFile]::ExtractToDirectory('%TEMP_EXTRACT%\\bundle.zip', '%TEMP_EXTRACT%\\extracted');
        exit 0;
    } catch {
        Write-Host 'Decompression failed:' $$_.Exception.Message;
        exit 1;
    }
" >nul 2>&1

if %errorLevel% neq 0 (
    echo ❌ Failed to decompress application bundle
    pause
    exit /b 1
)

echo         ✅ Application bundle decompressed

echo [3/8] Creating installation directories...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
if not exist "%USER_DATA%" mkdir "%USER_DATA%"
echo         ✅ Installation directories created

echo [4/8] Deploying application files...
xcopy /E /I /H /Y "%TEMP_EXTRACT%\\extracted\\*" "%INSTALL_DIR%\\" >nul 2>&1
echo         ✅ Application files deployed

echo [5/8] Creating application launcher...
(
echo @echo off
echo title WSM Operational Excellence Manager v%APP_VERSION%
echo mode con: cols=100 lines=25
echo color 0B
echo.
echo set "USER_DATA=%%USERPROFILE%%\\.wsm-oe-manager"
echo set "PORT=5000"
echo set "APP_DIR=%%~dp0"
echo set "NODE_ENV=production"
echo.
echo if not exist "%%USER_DATA%%" mkdir "%%USER_DATA%%"
echo.
echo echo.
echo echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo echo ║           WSM OPERATIONAL EXCELLENCE MANAGER v%APP_VERSION%                     ║
echo echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo echo.
echo echo 🌐 Web Interface: http://localhost:%%PORT%%
echo echo 📁 Data Location: %%USER_DATA%%
echo echo.
echo echo Starting application server...
echo.
echo cd /d "%%APP_DIR%%"
echo.
echo node --version ^>nul 2^>^&1
echo if %%errorLevel%% equ 0 ^(
echo     echo ✅ Node.js detected - starting application...
echo     start http://localhost:%%PORT%%
echo     npm run dev
echo ^) else ^(
echo     echo ❌ Node.js required. Visit: https://nodejs.org/
echo     pause
echo ^)
) > "%INSTALL_DIR%\\wsm-oe-manager.bat"
echo         ✅ Application launcher created

echo [6/8] Creating Windows shortcuts...
powershell -Command "
    try {
        $$WshShell = New-Object -comObject WScript.Shell;
        $$Shortcut = $$WshShell.CreateShortcut('%USERPROFILE%\\Desktop\\WSM OE Manager.lnk');
        $$Shortcut.TargetPath = '%INSTALL_DIR%\\wsm-oe-manager.bat';
        $$Shortcut.WorkingDirectory = '%INSTALL_DIR%';
        $$Shortcut.Description = 'WSM Operational Excellence Manager v%APP_VERSION%';
        $$Shortcut.IconLocation = 'shell32.dll,21';
        $$Shortcut.Save();
        
        $$StartMenu = '%ProgramData%\\Microsoft\\Windows\\Start Menu\\Programs\\WSM OE Manager';
        if (!(Test-Path $$StartMenu)) { New-Item -ItemType Directory -Path $$StartMenu -Force; }
        $$StartShortcut = $$WshShell.CreateShortcut($$StartMenu + '\\WSM OE Manager.lnk');
        $$StartShortcut.TargetPath = '%INSTALL_DIR%\\wsm-oe-manager.bat';
        $$StartShortcut.WorkingDirectory = '%INSTALL_DIR%';
        $$StartShortcut.Description = 'WSM Operational Excellence Manager';
        $$StartShortcut.IconLocation = 'shell32.dll,21';
        $$StartShortcut.Save();
        exit 0;
    } catch {
        exit 1;
    }
" >nul 2>&1
echo         ✅ Windows shortcuts created

echo [7/8] Registering in Windows Programs...
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\WSM OE Manager" /v "DisplayName" /t REG_SZ /d "WSM OE Manager" /f >nul 2>&1
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\WSM OE Manager" /v "DisplayVersion" /t REG_SZ /d "%APP_VERSION%" /f >nul 2>&1
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\WSM OE Manager" /v "Publisher" /t REG_SZ /d "WSM Operational Excellence Team" /f >nul 2>&1
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\WSM OE Manager" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f >nul 2>&1
echo         ✅ Windows Programs registration complete

echo [8/8] Cleaning up temporary files...
if exist "%TEMP_EXTRACT%" rd /s /q "%TEMP_EXTRACT%" >nul 2>&1
echo         ✅ Cleanup complete

:: ==========================================
:: INSTALLATION SUCCESS
:: ==========================================
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                              ║
echo ║                    SELF-EXTRACTING INSTALLATION COMPLETE!                   ║
echo ║                                                                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🎉 WSM Operational Excellence Manager v%APP_VERSION% installed successfully!
echo.
echo 📍 Installation: %INSTALL_DIR%
echo 📱 Desktop Shortcut: WSM OE Manager
echo 🔗 Start Menu: Programs ^> WSM OE Manager
echo.

if "%HAS_NODE%"=="1" (
    set /p launch="🚀 Launch application now? (Y/N): "
    if /I "!launch!"=="Y" (
        echo Starting WSM OE Manager...
        start "" "%INSTALL_DIR%\\wsm-oe-manager.bat"
    )
) else (
    echo 📥 NEXT STEP: Install Node.js from https://nodejs.org/
    echo    Then launch WSM OE Manager from desktop shortcut
)

echo.
echo Thank you for installing WSM Operational Excellence Manager!
pause

endlocal
exit /b 0`;

    // Write the self-extracting installer
    await fs.writeFile(
      path.join(this.outputDir, 'WSM-OE-Manager-Self-Extracting-Installer.bat'),
      installerScript
    );

    console.log('');
    console.log('✅ Self-extracting installer created!');
    console.log('');
    console.log('📦 Generated File:');
    console.log(`   • WSM-OE-Manager-Self-Extracting-Installer.bat`);
    console.log('');
    console.log('🚀 This installer:');
    console.log('   ✅ Contains complete application in a single file');
    console.log('   ✅ Self-extracts and installs automatically');
    console.log('   ✅ Professional Windows integration');
    console.log('   ✅ No external dependencies except Node.js');
    console.log('   ✅ Complete offline operation');
    console.log('');
  }

  async createBase64Bundle() {
    console.log('   Creating ZIP bundle of all application files...');
    
    const bundleZip = path.join(this.outputDir, 'temp-bundle.zip');
    
    // Use PowerShell compression (works on all Windows systems)
    console.log('   Using PowerShell compression...');
    const bundlePath = path.join(this.outputDir, 'bundle').replace(/\\/g, '\\\\');
    const zipPath = bundleZip.replace(/\\/g, '\\\\');
    
    execSync(`powershell -Command "Compress-Archive -Path '${bundlePath}\\*' -DestinationPath '${zipPath}' -Force"`, { stdio: 'ignore' });
    
    console.log('   Encoding bundle as base64...');
    
    // Read the ZIP file and convert to base64
    const zipData = await fs.readFile(bundleZip);
    const base64Data = zipData.toString('base64');
    
    // Clean up temp file
    await fs.unlink(bundleZip);
    
    console.log(`   ✅ Bundle encoded (${Math.round(base64Data.length / 1024)}KB base64)`);
    
    return base64Data;
  }

  async build() {
    try {
      await this.createSelfExtractingInstaller();
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the builder
if (require.main === module) {
  const builder = new SelfExtractingInstallerCreator();
  builder.build();
}

module.exports = SelfExtractingInstallerCreator;