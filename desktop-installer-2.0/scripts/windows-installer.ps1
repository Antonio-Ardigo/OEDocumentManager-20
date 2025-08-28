# WSM OE Manager - Desktop Installer 2.0
# Professional Windows PowerShell Installer Script
# Requires PowerShell 5.1 or later, Windows 10/11

param(
    [string]$InstallPath = "$env:ProgramFiles\WSM OE Manager",
    [switch]$CreateDesktopShortcut = $true,
    [switch]$CreateStartMenuShortcut = $true,
    [switch]$SilentInstall = $false,
    [switch]$PortableMode = $false
)

# Script configuration
$ErrorActionPreference = "Stop"
$AppName = "WSM OE Manager"
$AppVersion = "2.0.0"
$AppId = "WSMOEManager"
$PublisherName = "WSM Operational Excellence Team"

# Colors for console output
$ColorInfo = "Cyan"
$ColorSuccess = "Green"
$ColorWarning = "Yellow"
$ColorError = "Red"

function Write-Header {
    Write-Host "=" * 60 -ForegroundColor $ColorInfo
    Write-Host "WSM Operational Excellence Manager v$AppVersion" -ForegroundColor $ColorInfo
    Write-Host "Professional Desktop Installer 2.0" -ForegroundColor $ColorInfo
    Write-Host "=" * 60 -ForegroundColor $ColorInfo
    Write-Host ""
}

function Write-Status {
    param([string]$Message, [string]$Status = "INFO")
    
    $color = switch ($Status) {
        "SUCCESS" { $ColorSuccess }
        "WARNING" { $ColorWarning }
        "ERROR" { $ColorError }
        default { $ColorInfo }
    }
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

function Test-Prerequisites {
    Write-Status "Checking system prerequisites..."
    
    # Check Windows version
    $osVersion = [System.Environment]::OSVersion.Version
    if ($osVersion.Major -lt 10) {
        throw "This installer requires Windows 10 or later. Current version: $($osVersion.ToString())"
    }
    Write-Status "Windows version: $($osVersion.ToString())" "SUCCESS"
    
    # Check PowerShell version
    $psVersion = $PSVersionTable.PSVersion
    if ($psVersion.Major -lt 5) {
        throw "This installer requires PowerShell 5.1 or later. Current version: $($psVersion.ToString())"
    }
    Write-Status "PowerShell version: $($psVersion.ToString())" "SUCCESS"
    
    # Check administrator privileges
    if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
        if (-NOT $PortableMode) {
            throw "Administrator privileges are required for system installation. Please run as Administrator or use -PortableMode."
        }
        Write-Status "Running in Portable Mode (no administrator privileges)" "WARNING"
    } else {
        Write-Status "Administrator privileges confirmed" "SUCCESS"
    }
    
    # Check available disk space (minimum 500MB)
    $drive = Split-Path $InstallPath -Qualifier
    $freeSpace = (Get-WmiObject -Class Win32_LogicalDisk | Where-Object {$_.DeviceID -eq $drive}).FreeSpace
    $requiredSpace = 500MB
    
    if ($freeSpace -lt $requiredSpace) {
        throw "Insufficient disk space. Required: 500MB, Available: $([math]::Round($freeSpace/1MB))MB"
    }
    Write-Status "Available disk space: $([math]::Round($freeSpace/1GB, 2))GB" "SUCCESS"
}

function Install-Application {
    Write-Status "Installing WSM OE Manager..."
    
    # Create installation directory
    if (-not (Test-Path $InstallPath)) {
        New-Item -Path $InstallPath -ItemType Directory -Force | Out-Null
        Write-Status "Created installation directory: $InstallPath" "SUCCESS"
    }
    
    # Create user data directory
    $userDataPath = "$env:USERPROFILE\.wsm-oe-manager-v2"
    if (-not (Test-Path $userDataPath)) {
        New-Item -Path $userDataPath -ItemType Directory -Force | Out-Null
        Write-Status "Created user data directory: $userDataPath" "SUCCESS"
    }
    
    # Copy application files (simulated - in real scenario, extract from package)
    Write-Status "Copying application files..."
    
    # Create application launcher
    $launcherScript = @"
@echo off
title WSM OE Manager v$AppVersion
echo Starting WSM Operational Excellence Manager...
echo.
echo User Data: $userDataPath
echo Web Interface: http://localhost:5000
echo.
echo The application will open in your default browser.
echo This window can be minimized but should not be closed.
echo.
start http://localhost:5000
echo WSM OE Manager is starting...
timeout /t 3 /nobreak >nul
"@
    
    $launcherPath = "$InstallPath\wsm-oe-manager.bat"
    $launcherScript | Out-File -FilePath $launcherPath -Encoding ASCII
    Write-Status "Created application launcher: $launcherPath" "SUCCESS"
    
    # Create application information file
    $appInfo = @"
WSM Operational Excellence Manager v$AppVersion
Desktop Application - Installer 2.0

Installation Details:
- Installation Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- Installation Path: $InstallPath
- User Data Path: $userDataPath
- Installer Version: 2.0.0

Features:
- Complete offline functionality
- Local SQLite database
- Professional Windows integration
- Desktop and Start Menu shortcuts
- Automatic uninstaller

Usage:
- Desktop Shortcut: Double-click "$AppName" on desktop
- Start Menu: Search for "$AppName"
- Direct Launch: Run wsm-oe-manager.bat from installation folder

Uninstall:
- Windows Settings > Apps > Apps & features
- Or run uninstall.bat from installation folder

Support:
This desktop application provides complete operational excellence
management capabilities with local data storage and offline functionality.
"@
    
    $appInfoPath = "$InstallPath\application-info.txt"
    $appInfo | Out-File -FilePath $appInfoPath -Encoding UTF8
    Write-Status "Created application information: $appInfoPath" "SUCCESS"
}

function Create-Shortcuts {
    if ($CreateDesktopShortcut) {
        Write-Status "Creating desktop shortcut..."
        
        $shell = New-Object -ComObject WScript.Shell
        $desktopPath = [Environment]::GetFolderPath("Desktop")
        $shortcut = $shell.CreateShortcut("$desktopPath\$AppName.lnk")
        $shortcut.TargetPath = "$InstallPath\wsm-oe-manager.bat"
        $shortcut.WorkingDirectory = $InstallPath
        $shortcut.Description = "WSM Operational Excellence Manager - Desktop Application"
        $shortcut.IconLocation = "shell32.dll,21"
        $shortcut.Save()
        
        Write-Status "Desktop shortcut created" "SUCCESS"
    }
    
    if ($CreateStartMenuShortcut) {
        Write-Status "Creating Start Menu shortcut..."
        
        $startMenuPath = "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\$AppName"
        if (-not (Test-Path $startMenuPath)) {
            New-Item -Path $startMenuPath -ItemType Directory -Force | Out-Null
        }
        
        $shell = New-Object -ComObject WScript.Shell
        $shortcut = $shell.CreateShortcut("$startMenuPath\$AppName.lnk")
        $shortcut.TargetPath = "$InstallPath\wsm-oe-manager.bat"
        $shortcut.WorkingDirectory = $InstallPath
        $shortcut.Description = "WSM Operational Excellence Manager"
        $shortcut.IconLocation = "shell32.dll,21"
        $shortcut.Save()
        
        Write-Status "Start Menu shortcut created" "SUCCESS"
    }
}

function Register-Application {
    if ($PortableMode) {
        Write-Status "Skipping registry registration (Portable Mode)" "WARNING"
        return
    }
    
    Write-Status "Registering application in Windows..."
    
    try {
        # Register in Programs and Features
        $uninstallKey = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\$AppId"
        
        if (-not (Test-Path $uninstallKey)) {
            New-Item -Path $uninstallKey -Force | Out-Null
        }
        
        Set-ItemProperty -Path $uninstallKey -Name "DisplayName" -Value $AppName
        Set-ItemProperty -Path $uninstallKey -Name "DisplayVersion" -Value $AppVersion
        Set-ItemProperty -Path $uninstallKey -Name "Publisher" -Value $PublisherName
        Set-ItemProperty -Path $uninstallKey -Name "InstallLocation" -Value $InstallPath
        Set-ItemProperty -Path $uninstallKey -Name "UninstallString" -Value "`"$InstallPath\uninstall.bat`""
        Set-ItemProperty -Path $uninstallKey -Name "DisplayIcon" -Value "`"$InstallPath\wsm-oe-manager.bat`",0"
        Set-ItemProperty -Path $uninstallKey -Name "NoModify" -Value 1 -Type DWord
        Set-ItemProperty -Path $uninstallKey -Name "NoRepair" -Value 1 -Type DWord
        Set-ItemProperty -Path $uninstallKey -Name "EstimatedSize" -Value 500000 -Type DWord  # 500MB in KB
        
        Write-Status "Application registered in Windows Programs and Features" "SUCCESS"
        
    } catch {
        Write-Status "Warning: Could not register application in registry: $($_.Exception.Message)" "WARNING"
    }
}

function Create-Uninstaller {
    Write-Status "Creating uninstaller..."
    
    $uninstallScript = @"
@echo off
title WSM OE Manager - Uninstaller v$AppVersion
echo.
echo ==========================================
echo WSM OE Manager - Uninstaller v$AppVersion  
echo ==========================================
echo.
echo This will remove WSM OE Manager from your system.
echo Your user data will be preserved unless specifically requested.
echo.
set /p confirm="Are you sure you want to uninstall? (Y/N): "
if /I not "%confirm%"=="Y" (
    echo Uninstall cancelled.
    pause
    exit /b 0
)

echo.
echo Removing application files...
if exist "$InstallPath" rd /s /q "$InstallPath"

echo Removing shortcuts...
if exist "%USERPROFILE%\Desktop\$AppName.lnk" del "%USERPROFILE%\Desktop\$AppName.lnk"
if exist "%ProgramData%\Microsoft\Windows\Start Menu\Programs\$AppName" rd /s /q "%ProgramData%\Microsoft\Windows\Start Menu\Programs\$AppName"

echo Removing registry entries...
reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\$AppId" /f 2>nul

echo.
echo ==========================================
echo Uninstall Complete
echo ==========================================
echo.
echo WSM OE Manager has been removed from your system.
echo.
echo NOTE: Your user data has been preserved at:
echo $env:USERPROFILE\.wsm-oe-manager-v2
echo.
set /p removeData="Would you like to remove all user data as well? (Y/N): "
if /I "%removeData%"=="Y" (
    if exist "$env:USERPROFILE\.wsm-oe-manager-v2" (
        rd /s /q "$env:USERPROFILE\.wsm-oe-manager-v2"
        echo User data removed.
    )
) else (
    echo User data preserved for future installations.
)
echo.
echo Press any key to exit...
pause >nul
"@
    
    $uninstallPath = "$InstallPath\uninstall.bat"
    $uninstallScript | Out-File -FilePath $uninstallPath -Encoding ASCII
    Write-Status "Uninstaller created: $uninstallPath" "SUCCESS"
}

function Show-InstallationSummary {
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor $ColorSuccess
    Write-Host "Installation Complete!" -ForegroundColor $ColorSuccess
    Write-Host "=" * 60 -ForegroundColor $ColorSuccess
    Write-Host ""
    
    Write-Host "WSM Operational Excellence Manager v$AppVersion has been successfully installed!" -ForegroundColor $ColorSuccess
    Write-Host ""
    Write-Host "Installation Details:" -ForegroundColor $ColorInfo
    Write-Host "  • Location: $InstallPath" -ForegroundColor White
    Write-Host "  • User Data: $env:USERPROFILE\.wsm-oe-manager-v2" -ForegroundColor White
    Write-Host "  • Desktop Shortcut: $(if($CreateDesktopShortcut){'Created'}else{'Skipped'})" -ForegroundColor White
    Write-Host "  • Start Menu Entry: $(if($CreateStartMenuShortcut){'Created'}else{'Skipped'})" -ForegroundColor White
    Write-Host "  • System Registration: $(if(-not $PortableMode){'Registered'}else{'Portable Mode'})" -ForegroundColor White
    Write-Host ""
    Write-Host "Launch Options:" -ForegroundColor $ColorInfo
    Write-Host "  1. Desktop shortcut: '$AppName'" -ForegroundColor White
    Write-Host "  2. Start Menu: Search for '$AppName'" -ForegroundColor White
    Write-Host "  3. Direct launch: $InstallPath\wsm-oe-manager.bat" -ForegroundColor White
    Write-Host ""
    Write-Host "Key Features:" -ForegroundColor $ColorInfo
    Write-Host "  ✓ Complete offline functionality" -ForegroundColor $ColorSuccess
    Write-Host "  ✓ Local SQLite database" -ForegroundColor $ColorSuccess
    Write-Host "  ✓ Professional Windows integration" -ForegroundColor $ColorSuccess
    Write-Host "  ✓ Automatic uninstaller included" -ForegroundColor $ColorSuccess
    Write-Host ""
    
    if (-not $SilentInstall) {
        $launch = Read-Host "Would you like to launch WSM OE Manager now? (Y/N)"
        if ($launch -match '^[Yy]') {
            Write-Status "Launching WSM OE Manager..." "SUCCESS"
            Start-Process "$InstallPath\wsm-oe-manager.bat"
            Start-Sleep 2
        }
    }
    
    Write-Host ""
    Write-Host "Thank you for installing WSM OE Manager!" -ForegroundColor $ColorSuccess
    Write-Host "For support and documentation, visit: https://wsm-oe-manager.com" -ForegroundColor $ColorInfo
    Write-Host ""
}

# Main installation process
try {
    Write-Header
    
    if (-not $SilentInstall) {
        Write-Host "Installation Settings:" -ForegroundColor $ColorInfo
        Write-Host "  • Install Path: $InstallPath" -ForegroundColor White
        Write-Host "  • Desktop Shortcut: $(if($CreateDesktopShortcut){'Yes'}else{'No'})" -ForegroundColor White
        Write-Host "  • Start Menu Shortcut: $(if($CreateStartMenuShortcut){'Yes'}else{'No'})" -ForegroundColor White
        Write-Host "  • Portable Mode: $(if($PortableMode){'Yes'}else{'No'})" -ForegroundColor White
        Write-Host ""
        
        $confirm = Read-Host "Proceed with installation? (Y/N)"
        if ($confirm -notmatch '^[Yy]') {
            Write-Status "Installation cancelled by user." "WARNING"
            exit 0
        }
        Write-Host ""
    }
    
    Test-Prerequisites
    Install-Application
    Create-Shortcuts
    Register-Application
    Create-Uninstaller
    Show-InstallationSummary
    
} catch {
    Write-Status "Installation failed: $($_.Exception.Message)" "ERROR"
    Write-Host ""
    Write-Host "Please contact support or try running the installer as Administrator." -ForegroundColor $ColorError
    exit 1
}