# WSM OE Manager - Professional Desktop Installer 2.0

## Complete Standalone Installation Package

This package contains a professional, self-installing desktop application for the WSM Operational Excellence Manager. The installer is designed to work completely offline with all application files bundled.

## Package Contents

### 🎯 **Professional Bundled Installer**
- **File**: `WSM-OE-Manager-Professional-Bundled-Installer.bat`
- **Type**: Complete standalone installer with all application files
- **Size**: Includes full application bundle (~50MB)
- **Features**: Professional UI, system validation, Windows integration

### 📦 **Application Bundle**
- **Directory**: `bundle/`
- **Contents**: Complete application source code and assets
- **Includes**: React frontend, Node.js backend, database schemas, configurations

### 🔧 **Standard Installer** (Alternative)
- **File**: `WSM-OE-Manager-Professional-Installer.bat`
- **Type**: Lightweight installer that downloads files during installation
- **Size**: Smaller package (~5MB)
- **Features**: Professional UI with on-demand component installation

## Installation Instructions

### Recommended: Bundled Installer

1. **Copy the entire `installer-output` directory** to the target Windows system
2. **Right-click** on `WSM-OE-Manager-Professional-Bundled-Installer.bat`
3. **Select "Run as administrator"**
4. **Follow the installation wizard**:
   - System requirements validation
   - Installation confirmation
   - Automatic file deployment
   - Windows integration setup
5. **Install Node.js** if prompted (one-time requirement)
6. **Launch application** from desktop shortcut

### Quick Installation Steps
```
1. Copy installer-output/ folder to Windows PC
2. Right-click WSM-OE-Manager-Professional-Bundled-Installer.bat
3. "Run as administrator" 
4. Follow wizard prompts
5. Install Node.js if needed
6. Launch from desktop shortcut!
```

## System Requirements

- **Operating System**: Windows 10 or later
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 2GB available disk space
- **Runtime**: Node.js (LTS version) - installer provides setup guidance
- **Privileges**: Administrator access required for installation

## Professional Features

### ✅ **Complete Installation Package**
- All application files bundled and included
- No internet connection required after Node.js setup
- Professional Windows system integration
- Desktop shortcuts and Start Menu entries
- Windows Programs and Features registration

### ✅ **Operational Excellence Features**
- Complete 8-Element OE Framework implementation
- Advanced process management and documentation
- Performance measurement and KPI tracking
- Interactive mind mapping and visualization
- Comprehensive risk management tools
- Balanced scorecard implementation
- Professional PDF export capabilities
- Local SQLite database for offline operation

### ✅ **Enterprise-Ready**
- Professional installation and uninstall process
- Complete Windows integration
- Registry entries for system management
- Comprehensive logging and error handling
- User data preservation during uninstall
- Quick launch capabilities

## Technical Specifications

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express framework
- **Database**: SQLite (local storage)
- **Web Interface**: http://localhost:5000
- **Data Format**: JSON with SQL database
- **Platform**: Windows 10/11 compatible
- **Security**: Local data storage only
- **Network**: No internet required after installation

## Post-Installation

### Launching the Application
- **Desktop Shortcut**: Double-click "WSM OE Manager"
- **Start Menu**: Search for "WSM OE Manager"
- **Quick Launch**: Windows + R, type `wsm-oe-manager.bat`
- **Direct**: Program Files\\WSM OE Manager\\wsm-oe-manager.bat

### First-Time Setup
1. Application will automatically detect Node.js
2. If Node.js is missing, setup helper will guide installation
3. Application will initialize local database on first run
4. Web interface opens automatically at http://localhost:5000
5. Ready for complete offline operation!

### Data Storage Locations
- **Application**: `C:\Program Files\WSM OE Manager\`
- **User Data**: `%USERPROFILE%\.wsm-oe-manager\`
- **Database**: `%USERPROFILE%\.wsm-oe-manager\database\`

## Uninstallation

### Professional Uninstall Methods
1. **Windows Settings**: Apps & Features > WSM OE Manager
2. **Control Panel**: Programs > WSM OE Manager  
3. **Direct**: Run uninstall.bat from installation directory
4. **User Data**: Preserved unless specifically requested to remove

## Troubleshooting

### Node.js Issues
- Run "Setup Node.js" from Start Menu for installation guide
- Download from: https://nodejs.org/en/download/ (LTS version)
- Restart computer after Node.js installation

### Application Issues
- Check Windows Event Viewer > Application Logs
- Review installation logs in installation directory
- Verify user data directory permissions
- Contact support with log files if needed

## Distribution Guide

### For IT Departments
1. Copy the complete `installer-output/` directory to network share
2. Distribute to end users with installation instructions
3. Ensure users have administrator privileges for installation
4. Provide Node.js installation guidance as needed
5. Monitor installation logs for enterprise deployment

### Package Integrity
- **Bundle Hash**: Generated during build process
- **File Count**: All essential application files included
- **Size**: Complete package approximately 50MB
- **Dependencies**: Only Node.js runtime required externally

## Support and Maintenance

### Logs and Diagnostics
- **Installation Logs**: Created during installation process
- **Application Logs**: Available in installation directory
- **User Data Logs**: Stored in user data directory
- **Windows Event Logs**: Application events logged to Windows

### Updates and Maintenance
- **Version Check**: Built into application startup
- **Database Backup**: Automatic backup before updates
- **Settings Preservation**: User preferences maintained
- **Clean Uninstall**: Complete removal with data preservation option

---

## Professional Desktop Application

**WSM Operational Excellence Manager v2.0** - Complete standalone desktop application for comprehensive operational excellence management. Professional Windows installation with complete offline capability.

**Enterprise Ready** • **Windows Integrated** • **Completely Offline** • **Professional Support**

Thank you for choosing WSM OE Manager Professional Desktop Edition!