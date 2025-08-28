# WSM OE Manager - Desktop Installer 2.0 Deployment Guide

**Enterprise deployment guide for distributing the desktop application**

## 🎯 Deployment Overview

Desktop Installer 2.0 creates a professional, enterprise-ready Windows application that can be deployed across organizations with various installation methods.

## 📦 Distribution Methods

### 1. Direct Download
**Best for**: Individual users, small organizations

- Host the `.exe` file on your website or file server
- Users download and run the installer directly
- Provide installation instructions and system requirements

### 2. Network Share Deployment
**Best for**: Corporate environments with shared network drives

```batch
# Deploy to network share
copy "WSM-OE-Manager-Setup-v2.0.exe" "\\server\share\Software\WSM\"

# Users can run from network location
\\server\share\Software\WSM\WSM-OE-Manager-Setup-v2.0.exe
```

### 3. Group Policy Deployment
**Best for**: Large Windows domains with Active Directory

1. **Create MSI Package** (if needed)
   ```bash
   # Convert EXE to MSI using packaging tools
   # Or use electron-builder MSI target
   ```

2. **Deploy via Group Policy**
   - Computer Configuration > Software Settings > Software Installation
   - Add new package and select installation method

### 4. System Center Configuration Manager (SCCM)
**Best for**: Enterprise environments with SCCM

1. **Create Application Package**
   - Import the installer executable
   - Configure detection methods
   - Set installation behavior

2. **Deploy to Collections**
   - Target specific computer groups
   - Schedule installation windows
   - Monitor deployment status

### 5. PowerShell Remote Installation
**Best for**: IT administrators managing multiple systems

```powershell
# Remote installation script
$computers = @("PC001", "PC002", "PC003")
$installerPath = "\\server\share\WSM-OE-Manager-Setup-v2.0.exe"

foreach ($computer in $computers) {
    Invoke-Command -ComputerName $computer -ScriptBlock {
        param($path)
        Start-Process $path -ArgumentList "/S" -Wait
    } -ArgumentList $installerPath
}
```

## 🛡️ Security Considerations

### Code Signing (Recommended)
For enterprise deployment, consider code signing the installer:

1. **Obtain Code Signing Certificate**
   - Purchase from trusted CA (DigiCert, Sectigo, etc.)
   - Or use internal enterprise certificate

2. **Sign the Installer**
   ```bash
   # Sign with Microsoft SignTool
   signtool sign /f certificate.pfx /p password /t http://timestamp.digicert.com WSM-OE-Manager-Setup-v2.0.exe
   ```

3. **Benefits of Code Signing**
   - Removes Windows SmartScreen warnings
   - Establishes publisher identity
   - Enables trusted installation

### Antivirus Compatibility
- Test with common enterprise antivirus solutions
- Request whitelisting if false positives occur
- Provide file hashes for verification

### Network Security
- Consider firewall rules for application communication
- Document any network requirements
- Test in isolated network environments

## 📋 System Requirements

### Minimum Requirements
- **Operating System**: Windows 10 version 1903 or later
- **Architecture**: 64-bit (x64) or 32-bit (x86)
- **RAM**: 4 GB minimum, 8 GB recommended
- **Storage**: 1 GB available disk space
- **Privileges**: Administrator rights for installation

### Recommended Environment
- **Operating System**: Windows 11 latest version
- **Architecture**: 64-bit (x64)
- **RAM**: 8 GB or more
- **Storage**: 2 GB available disk space
- **Network**: Not required (offline capable)

## 🔧 Silent Installation

### Command Line Options
```batch
# Silent installation (no UI)
WSM-OE-Manager-Setup-v2.0.exe /S

# Silent with custom install directory
WSM-OE-Manager-Setup-v2.0.exe /S /D="C:\CustomPath\WSM OE Manager"

# Check exit codes
echo Exit code: %ERRORLEVEL%
```

### PowerShell Silent Install
```powershell
# Silent installation with error handling
$installer = "WSM-OE-Manager-Setup-v2.0.exe"
$process = Start-Process $installer -ArgumentList "/S" -Wait -PassThru

if ($process.ExitCode -eq 0) {
    Write-Host "Installation successful" -ForegroundColor Green
} else {
    Write-Host "Installation failed with exit code: $($process.ExitCode)" -ForegroundColor Red
}
```

### Batch Deployment Script
```batch
@echo off
echo WSM OE Manager - Batch Deployment Script
echo =========================================

set INSTALLER=WSM-OE-Manager-Setup-v2.0.exe
set INSTALL_LOG=installation.log

echo Starting installation...
echo Installation started at %date% %time% >> %INSTALL_LOG%

%INSTALLER% /S
set EXIT_CODE=%ERRORLEVEL%

if %EXIT_CODE%==0 (
    echo Installation completed successfully >> %INSTALL_LOG%
    echo SUCCESS: WSM OE Manager installed successfully
) else (
    echo Installation failed with exit code %EXIT_CODE% >> %INSTALL_LOG%
    echo ERROR: Installation failed
)

echo Installation finished at %date% %time% >> %INSTALL_LOG%
pause
```

## 📊 Deployment Verification

### Post-Installation Checks
1. **Registry Verification**
   ```powershell
   # Check if application is registered
   Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*" | 
   Where-Object {$_.DisplayName -like "*WSM OE Manager*"}
   ```

2. **File System Verification**
   ```powershell
   # Check installation directory
   Test-Path "C:\Program Files\WSM OE Manager"
   
   # Check user data directory
   Test-Path "$env:USERPROFILE\.wsm-oe-manager-v2"
   ```

3. **Shortcut Verification**
   ```powershell
   # Check desktop shortcut
   Test-Path "$env:USERPROFILE\Desktop\WSM OE Manager.lnk"
   
   # Check start menu
   Test-Path "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\WSM OE Manager"
   ```

### Health Check Script
```powershell
# WSM OE Manager Installation Health Check
Write-Host "WSM OE Manager - Installation Health Check" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$checks = @()

# Check installation
if (Test-Path "C:\Program Files\WSM OE Manager") {
    $checks += "✅ Application installed"
} else {
    $checks += "❌ Application not found"
}

# Check registry
$regEntry = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*" | 
            Where-Object {$_.DisplayName -like "*WSM OE Manager*"}
if ($regEntry) {
    $checks += "✅ Registry entry found"
} else {
    $checks += "❌ Registry entry missing"
}

# Check shortcuts
if (Test-Path "$env:USERPROFILE\Desktop\WSM OE Manager.lnk") {
    $checks += "✅ Desktop shortcut created"
} else {
    $checks += "⚠️ Desktop shortcut missing"
}

# Display results
$checks | ForEach-Object { Write-Host $_ }
```

## 🔄 Updates and Maintenance

### Application Updates
The desktop application can be updated by:
1. Installing newer version over existing installation
2. Uninstalling old version and installing new version
3. Using automatic update mechanism (if implemented)

### User Data Preservation
- User data in `%USERPROFILE%\.wsm-oe-manager-v2` is preserved during updates
- Database files are automatically backed up before major updates
- Settings and preferences carry over between versions

### Uninstallation
```batch
# Via Programs and Features
appwiz.cpl

# Via command line (if uninstaller supports it)
"C:\Program Files\WSM OE Manager\uninstall.bat"

# PowerShell uninstallation
$app = Get-WmiObject -Class Win32_Product | Where-Object {$_.Name -like "*WSM OE Manager*"}
$app.Uninstall()
```

## 📈 Monitoring and Analytics

### Installation Success Tracking
```powershell
# Create deployment report
$computers = Get-ADComputer -Filter * | Select-Object -ExpandProperty Name
$report = @()

foreach ($computer in $computers) {
    if (Test-Connection $computer -Count 1 -Quiet) {
        $installed = Invoke-Command -ComputerName $computer -ScriptBlock {
            Test-Path "C:\Program Files\WSM OE Manager"
        } -ErrorAction SilentlyContinue
        
        $report += [PSCustomObject]@{
            Computer = $computer
            Installed = $installed
            Status = if($installed) {"Success"} else {"Not Installed"}
        }
    }
}

$report | Export-Csv "WSM-Deployment-Report.csv" -NoTypeInformation
```

### Usage Analytics
The application can be configured to collect anonymous usage statistics:
- Installation success/failure rates
- Application launch frequency
- Feature usage patterns
- Performance metrics

## 🎉 Best Practices

### Pre-Deployment
1. **Test in Lab Environment** - Verify on clean Windows installations
2. **Pilot Deployment** - Deploy to small group first
3. **Documentation** - Prepare user guides and IT procedures
4. **Support Planning** - Train support staff on common issues

### During Deployment
1. **Phased Rollout** - Deploy in waves to manage support load
2. **Monitoring** - Track installation success rates
3. **Communication** - Keep users informed of installation schedules
4. **Feedback Collection** - Gather user feedback and issues

### Post-Deployment
1. **Health Monitoring** - Regular checks of application status
2. **User Training** - Provide training on new features
3. **Support Documentation** - Maintain troubleshooting guides
4. **Update Planning** - Plan for future application updates

This deployment guide ensures your WSM Operational Excellence Manager desktop application can be successfully distributed across enterprise environments with professional installation experiences.