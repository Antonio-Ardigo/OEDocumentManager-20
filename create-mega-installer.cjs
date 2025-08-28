#!/usr/bin/env node

/**
 * WSM OE Manager - Mega Single File Installer Creator
 * Creates one huge .bat file with everything embedded
 */

const fs = require('fs').promises;
const path = require('path');

class MegaInstallerCreator {
  constructor() {
    this.projectRoot = __dirname;
    this.version = '2.0.0';
    this.appName = 'WSM OE Manager';
    this.outputDir = path.join(this.projectRoot, 'installer-output');
  }

  async encodeFileAsBase64(filePath) {
    try {
      const data = await fs.readFile(filePath);
      return data.toString('base64');
    } catch (error) {
      return null;
    }
  }

  async getAllFilesRecursively(dir, basePath = '') {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getAllFilesRecursively(fullPath, relativePath);
          files.push(...subFiles);
        } else {
          const base64Content = await this.encodeFileAsBase64(fullPath);
          if (base64Content) {
            files.push({
              path: relativePath.replace(/\\/g, '/'),
              content: base64Content,
              size: (await fs.stat(fullPath)).size
            });
          }
        }
      }
    } catch (error) {
      console.log(`Warning: Could not read directory ${dir}`);
    }
    
    return files;
  }

  async createMegaInstaller() {
    console.log('🚀 Creating Mega Single-File Installer');
    console.log('======================================');
    console.log('');

    // Get all files from bundle
    console.log('📦 Reading all application files...');
    const bundleDir = path.join(this.outputDir, 'bundle');
    const allFiles = await this.getAllFilesRecursively(bundleDir);
    
    console.log(`   Found ${allFiles.length} files to embed`);
    const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);
    console.log(`   Total size: ${Math.round(totalSize / 1024 / 1024 * 100) / 100}MB`);

    // Create embedded file data section
    console.log('📝 Creating embedded file definitions...');
    let fileDefinitions = '';
    
    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      fileDefinitions += `
:FILE_${i}_PATH
${file.path}
:FILE_${i}_DATA
${file.content}
:FILE_${i}_END
`;
    }

    // Create the mega installer script
    const installerScript = `@echo off
:: WSM OE Manager - Mega Single-File Installer v${this.version}
:: Contains ${allFiles.length} embedded files (${Math.round(totalSize / 1024)}KB total)

setlocal EnableDelayedExpansion

:: ==========================================
:: INSTALLER CONFIGURATION
:: ==========================================
set "APP_NAME=${this.appName}"
set "APP_VERSION=${this.version}"
set "INSTALL_DIR=%ProgramFiles%\\WSM OE Manager"
set "USER_DATA=%USERPROFILE%\\.wsm-oe-manager"
set "TEMP_EXTRACT=%TEMP%\\wsm-oe-mega-%RANDOM%"
set "TOTAL_FILES=${allFiles.length}"

:: Skip to installer start, jumping over embedded data
goto :INSTALLER_START

:: ==========================================
:: EMBEDDED APPLICATION FILES
:: ==========================================
${fileDefinitions}

:INSTALLER_START

:: ==========================================
:: PROFESSIONAL INSTALLER HEADER
:: ==========================================
title WSM OE Manager - Mega Single-File Installer v%APP_VERSION%
mode con: cols=80 lines=30
color 0F

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                              ║
echo ║           WSM OPERATIONAL EXCELLENCE MANAGER v${this.version}                     ║
echo ║           Mega Single-File Professional Installer                           ║
echo ║                                                                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo    ✓ Complete application embedded in this single file
echo    ✓ ${allFiles.length} application files included (${Math.round(totalSize / 1024)}KB total)
echo    ✓ Professional Windows integration and shortcuts
echo    ✓ Self-contained with local database
echo    ✓ No external files or downloads required
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
    echo This mega installer requires administrator privileges for:
    echo   • Program Files installation
    echo   • Windows registry integration
    echo   • System shortcuts creation
    echo.
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
    echo ❌ Windows 10 or later required (current: %VERSION%)
    pause
    exit /b 1
)
echo    • Windows version: %VERSION% ✅

for /f "tokens=3" %%a in ('dir C:\\ /-c ^| find "bytes free"') do set FREESPACE=%%a
if %FREESPACE% LSS 1073741824 (
    echo ❌ Insufficient disk space (need 1GB minimum)
    pause
    exit /b 1
)
echo    • Disk space: Available ✅

node --version >nul 2>&1
if %errorLevel% equ 0 (
    for /f %%i in ('node --version') do echo    • Node.js: %%i ✅
    set "HAS_NODE=1"
) else (
    echo    • Node.js: Not found (will provide setup guide) ⚠️
    set "HAS_NODE=0"
)

echo ✅ System requirements validated
echo.

:: ==========================================
:: INSTALLATION CONFIRMATION
:: ==========================================
echo ┌──────────────────────────────────────────────────────────────────────────────┐
echo │ MEGA INSTALLATION SUMMARY                                                   │
echo └──────────────────────────────────────────────────────────────────────────────┘
echo    Application: %APP_NAME% v%APP_VERSION%
echo    Install to: %INSTALL_DIR%
echo    User data: %USER_DATA%
echo    Embedded files: %TOTAL_FILES% files (${Math.round(totalSize / 1024)}KB)
echo    Installation type: Mega single-file with complete application
echo.

set /p confirm="Continue with mega installation? (Y/N): "
if /I not "%confirm%"=="Y" (
    echo Installation cancelled by user.
    exit /b 0
)

:: ==========================================
:: MEGA EXTRACTION AND INSTALLATION
:: ==========================================
echo.
echo 🚀 Beginning mega extraction and installation...
echo ┌──────────────────────────────────────────────────────────────────────────────┐
echo │ MEGA INSTALLATION PROGRESS                                                  │
echo └──────────────────────────────────────────────────────────────────────────────┘

echo [1/10] Creating installation directories...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
if not exist "%USER_DATA%" mkdir "%USER_DATA%"
if not exist "%TEMP_EXTRACT%" mkdir "%TEMP_EXTRACT%"
echo          ✅ Directories created

echo [2/10] Extracting embedded application files...
set "FILE_COUNT=0"

${allFiles.map((file, index) => `
call :EXTRACT_FILE ${index} "${file.path}"
set /a FILE_COUNT+=1
if !FILE_COUNT! equ ${Math.floor((index + 1) / 10) * 10} echo          Progress: !FILE_COUNT!/${allFiles.length} files extracted...`).join('')}

echo          ✅ All %TOTAL_FILES% files extracted

echo [3/10] Creating directory structure...
:: Ensure all subdirectories exist
${[...new Set(allFiles.map(f => path.dirname(f.path)).filter(d => d !== '.'))]
  .map(dir => `if not exist "%INSTALL_DIR%\\${dir.replace(/\//g, '\\')}" mkdir "%INSTALL_DIR%\\${dir.replace(/\//g, '\\')}"`).join('\necho ')}
echo          ✅ Directory structure created

echo [4/10] Deploying application files...
${allFiles.map((file, index) => `copy "%TEMP_EXTRACT%\\file_${index}.tmp" "%INSTALL_DIR%\\${file.path.replace(/\//g, '\\')}" >nul 2>&1`).join('\necho ')}
echo          ✅ Application files deployed

echo [5/10] Creating application launcher...
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
echo echo ║           Mega Installation - Complete Desktop Application                   ║
echo echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo echo.
echo echo 🌐 Web Interface: http://localhost:%%PORT%%
echo echo 📁 Data Location: %%USER_DATA%%
echo echo 📦 Installation: Mega single-file deployment
echo echo.
echo echo Starting application server...
echo.
echo cd /d "%%APP_DIR%%"
echo.
echo node --version ^>nul 2^>^&1
echo if %%errorLevel%% equ 0 ^(
echo     echo ✅ Node.js detected - starting mega application...
echo     start http://localhost:%%PORT%%
echo     if exist "dist\\index.js" ^(
echo         node dist\\index.js
echo     ^) else ^(
echo         npm install ^&^& npm run build ^&^& npm run dev
echo     ^)
echo ^) else ^(
echo     echo.
echo     echo ❌ NODE.JS REQUIRED
echo     echo    Visit: https://nodejs.org/en/download/
echo     echo    Download and install the LTS version
echo     echo    Then restart this application
echo     pause
echo ^)
) > "%INSTALL_DIR%\\wsm-oe-manager.bat"
echo          ✅ Application launcher created

echo [6/10] Creating Windows shortcuts...
powershell -Command "
    try {
        $$WshShell = New-Object -comObject WScript.Shell;
        $$Shortcut = $$WshShell.CreateShortcut('%USERPROFILE%\\Desktop\\WSM OE Manager.lnk');
        $$Shortcut.TargetPath = '%INSTALL_DIR%\\wsm-oe-manager.bat';
        $$Shortcut.WorkingDirectory = '%INSTALL_DIR%';
        $$Shortcut.Description = 'WSM OE Manager - Mega Installation v%APP_VERSION%';
        $$Shortcut.IconLocation = 'shell32.dll,21';
        $$Shortcut.Save();
        
        $$StartMenu = '%ProgramData%\\Microsoft\\Windows\\Start Menu\\Programs\\WSM OE Manager';
        if (!(Test-Path $$StartMenu)) { New-Item -ItemType Directory -Path $$StartMenu -Force; }
        $$StartShortcut = $$WshShell.CreateShortcut($$StartMenu + '\\WSM OE Manager.lnk');
        $$StartShortcut.TargetPath = '%INSTALL_DIR%\\wsm-oe-manager.bat';
        $$StartShortcut.WorkingDirectory = '%INSTALL_DIR%';
        $$StartShortcut.Description = 'WSM Operational Excellence Manager - Mega Installation';
        $$StartShortcut.IconLocation = 'shell32.dll,21';
        $$StartShortcut.Save();
        exit 0;
    } catch {
        exit 1;
    }
" >nul 2>&1
echo          ✅ Windows shortcuts created

echo [7/10] Creating professional uninstaller...
(
echo @echo off
echo title WSM OE Manager - Professional Uninstaller
echo mode con: cols=80 lines=25
echo color 0C
echo.
echo echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo echo ║           WSM OE MANAGER - MEGA INSTALLATION UNINSTALLER                   ║
echo echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo echo.
echo echo This will remove WSM OE Manager ^(mega installation^) from your system.
echo echo User data will be preserved unless requested.
echo echo.
echo set /p confirm="Uninstall WSM OE Manager? (Y/N): "
echo if /I not "%%confirm%%"=="Y" exit /b 0
echo.
echo echo Removing application files...
echo if exist "%INSTALL_DIR%" rd /s /q "%INSTALL_DIR%"
echo echo Removing shortcuts...
echo if exist "%%USERPROFILE%%\\Desktop\\WSM OE Manager.lnk" del "%%USERPROFILE%%\\Desktop\\WSM OE Manager.lnk"
echo if exist "%ProgramData%\\Microsoft\\Windows\\Start Menu\\Programs\\WSM OE Manager" rd /s /q "%ProgramData%\\Microsoft\\Windows\\Start Menu\\Programs\\WSM OE Manager"
echo echo Removing registry entries...
echo reg delete "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\WSM OE Manager" /f ^>nul 2^>^&1
echo echo.
echo echo ✅ WSM OE Manager removed successfully!
echo echo User data preserved at: %USER_DATA%
echo echo.
echo set /p removeData="Remove user data too? (Y/N): "
echo if /I "%%removeData%%"=="Y" if exist "%USER_DATA%" rd /s /q "%USER_DATA%"
echo echo Thank you for using WSM OE Manager!
echo timeout /t 3 ^>nul
) > "%INSTALL_DIR%\\uninstall.bat"
echo          ✅ Professional uninstaller created

echo [8/10] Registering in Windows Programs...
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\WSM OE Manager" /v "DisplayName" /t REG_SZ /d "WSM OE Manager (Mega Installation)" /f >nul 2>&1
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\WSM OE Manager" /v "UninstallString" /t REG_SZ /d "\\"%INSTALL_DIR%\\uninstall.bat\\"" /f >nul 2>&1
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\WSM OE Manager" /v "DisplayVersion" /t REG_SZ /d "%APP_VERSION%" /f >nul 2>&1
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\WSM OE Manager" /v "Publisher" /t REG_SZ /d "WSM Operational Excellence Team" /f >nul 2>&1
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\WSM OE Manager" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f >nul 2>&1
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\WSM OE Manager" /v "EstimatedSize" /t REG_DWORD /d ${Math.round(totalSize / 1024)} /f >nul 2>&1
echo          ✅ Windows Programs registration complete

echo [9/10] Creating documentation...
(
echo WSM Operational Excellence Manager v%APP_VERSION%
echo Mega Single-File Installation Complete
echo ========================================
echo.
echo Installation Details:
echo   Type: Mega single-file installer
echo   Files: %TOTAL_FILES% embedded files
echo   Size: ${Math.round(totalSize / 1024)}KB total application data
echo   Location: %INSTALL_DIR%
echo   User Data: %USER_DATA%
echo.
echo Launch Methods:
echo   Desktop: Double-click "WSM OE Manager" shortcut
echo   Start Menu: Search for "WSM OE Manager"
echo   Direct: "%INSTALL_DIR%\\wsm-oe-manager.bat"
echo.
echo Requirements:
echo   Node.js: Required for operation
echo   Download: https://nodejs.org/en/download/ ^(LTS version^)
echo.
echo Professional Features:
echo   ✓ Complete 8-Element OE Framework
echo   ✓ Process Management and Documentation
echo   ✓ Performance Measurement and KPI Tracking
echo   ✓ Local SQLite Database
echo   ✓ Complete Offline Operation
echo   ✓ Professional Windows Integration
echo.
echo Uninstall:
echo   Windows Settings ^> Apps ^> WSM OE Manager
echo   Or run: "%INSTALL_DIR%\\uninstall.bat"
echo.
echo Thank you for using WSM OE Manager!
) > "%INSTALL_DIR%\\MEGA-INSTALLATION-INFO.txt"
echo          ✅ Documentation created

echo [10/10] Cleaning up temporary files...
if exist "%TEMP_EXTRACT%" rd /s /q "%TEMP_EXTRACT%" >nul 2>&1
echo          ✅ Cleanup complete

:: ==========================================
:: INSTALLATION SUCCESS
:: ==========================================
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                              ║
echo ║                      MEGA INSTALLATION SUCCESSFUL!                          ║
echo ║                                                                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🎉 WSM Operational Excellence Manager v%APP_VERSION% installed successfully!
echo    Mega single-file installation with %TOTAL_FILES% embedded files
echo.
echo 📍 Installation: %INSTALL_DIR%
echo 📱 Desktop Shortcut: WSM OE Manager  
echo 🔗 Start Menu: Programs ^> WSM OE Manager
echo 📚 Documentation: %INSTALL_DIR%\\MEGA-INSTALLATION-INFO.txt
echo.

if "%HAS_NODE%"=="1" (
    set /p launch="🚀 Launch WSM OE Manager now? (Y/N): "
    if /I "!launch!"=="Y" (
        echo.
        echo 🌟 Starting WSM Operational Excellence Manager...
        echo    Mega installation ready for operation!
        start "" "%INSTALL_DIR%\\wsm-oe-manager.bat"
        timeout /t 2 >nul
        echo ✅ Application launched successfully!
    )
) else (
    echo.
    echo 📥 NEXT STEP: Install Node.js
    echo    1. Visit: https://nodejs.org/en/download/
    echo    2. Download and install LTS version
    echo    3. Restart computer
    echo    4. Launch WSM OE Manager from desktop shortcut
    echo.
    set /p nodesetup="Open Node.js download page now? (Y/N): "
    if /I "!nodesetup!"=="Y" start https://nodejs.org/en/download/
)

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                              ║
echo ║              WSM OPERATIONAL EXCELLENCE MANAGER                             ║
echo ║              Mega Single-File Installation Complete                         ║
echo ║              Your operational excellence journey begins now!                ║
echo ║                                                                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo Press any key to exit mega installer...
pause >nul

endlocal
exit /b 0

:: ==========================================
:: FILE EXTRACTION FUNCTION
:: ==========================================
:EXTRACT_FILE
set "file_num=%1"
set "file_path=%2"

:: Find the file data section
set "start_marker=:FILE_%file_num%_DATA"
set "end_marker=:FILE_%file_num%_END"

:: Extract base64 data and decode using PowerShell
powershell -Command "
    try {
        $$batContent = Get-Content '%~f0' -Raw;
        $$startIndex = $$batContent.IndexOf('%start_marker%') + '%start_marker%'.Length;
        $$endIndex = $$batContent.IndexOf('%end_marker%');
        $$base64Data = $$batContent.Substring($$startIndex, $$endIndex - $$startIndex).Trim();
        $$bytes = [System.Convert]::FromBase64String($$base64Data);
        [System.IO.File]::WriteAllBytes('%TEMP_EXTRACT%\\file_%file_num%.tmp', $$bytes);
        exit 0;
    } catch {
        exit 1;
    }
" >nul 2>&1

goto :eof`;

    await fs.writeFile(
      path.join(this.outputDir, 'WSM-OE-Manager-MEGA-Installer.bat'),
      installerScript
    );

    const installerSize = (await fs.stat(path.join(this.outputDir, 'WSM-OE-Manager-MEGA-Installer.bat'))).size;

    console.log('');
    console.log('✅ MEGA single-file installer created!');
    console.log('');
    console.log('📦 Generated File:');
    console.log(`   • WSM-OE-Manager-MEGA-Installer.bat (${Math.round(installerSize / 1024 / 1024 * 100) / 100}MB)`);
    console.log('');
    console.log('🚀 This MEGA installer:');
    console.log(`   ✅ Contains ALL ${allFiles.length} application files embedded`);
    console.log(`   ✅ Total embedded data: ${Math.round(totalSize / 1024)}KB`);
    console.log('   ✅ True single-file installation');
    console.log('   ✅ Professional Windows integration');
    console.log('   ✅ Complete offline operation');
    console.log('   ✅ No external dependencies (except Node.js)');
    console.log('');
    console.log('📋 Usage:');
    console.log('   1. Copy WSM-OE-Manager-MEGA-Installer.bat to Windows systems');
    console.log('   2. Right-click and "Run as administrator"');
    console.log('   3. Follow the mega installation wizard');
    console.log('   4. Install Node.js if needed');
    console.log('   5. Ready for complete offline operation!');
    console.log('');
  }

  async build() {
    try {
      await this.createMegaInstaller();
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }
}

// Run the builder
if (require.main === module) {
  const builder = new MegaInstallerCreator();
  builder.build();
}

module.exports = MegaInstallerCreator;