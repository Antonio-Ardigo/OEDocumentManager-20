# WSM OE Manager - Desktop Installer 2.0 Installation Guide

**Complete guide for building and deploying the professional Windows installer**

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and **npm 9+**
- **Windows 10/11** for building Windows installers
- **Administrator privileges** for testing installation

### Build the Installer
```bash
# Navigate to the installer directory
cd desktop-installer-2.0

# Install dependencies
npm install

# Build the professional installer
npm run build-installer
```

### Install on Target System
1. Locate the `.exe` file in `dist/` directory
2. Right-click and "Run as Administrator"
3. Follow the installation wizard
4. Launch from Desktop shortcut or Start Menu

## 📋 Detailed Build Process

### Step 1: Prepare Your Environment

1. **Check Node.js Version**
   ```bash
   node --version  # Should be 18.0.0 or higher
   npm --version   # Should be 9.0.0 or higher
   ```

2. **Navigate to Installer Directory**
   ```bash
   cd desktop-installer-2.0
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

### Step 2: Customize the Installation (Optional)

1. **Edit Configuration**
   ```bash
   # Edit installer settings
   notepad src/installer-config.json
   ```

2. **Add Custom Icons** (Optional)
   - Place icon files in `assets/` directory
   - See `assets/create-icons.md` for specifications

3. **Customize Installation Paths** (Optional)
   - Edit `scripts/windows-installer.ps1`
   - Modify default installation directory

### Step 3: Build the Installer

1. **Run Full Build**
   ```bash
   npm run build-installer
   ```
   
   This process will:
   - ✅ Build the web application
   - ✅ Create Electron desktop app bundle
   - ✅ Copy all necessary server files
   - ✅ Generate Windows installer (.exe)
   - ✅ Create portable version guide
   - ✅ Generate file checksums

2. **Monitor Build Process**
   The build process shows real-time progress:
   ```
   🚀 WSM OE Manager - Desktop Installer 2.0 Builder
   ================================================
   
   📁 Creating build directories...
   ✅ Directories created
   🧹 Cleaning build directory...
   ✅ Build directory cleaned
   🌐 Building web application...
   ✅ Web application built and copied
   📦 Creating application bundle...
   ✅ Application bundle configuration created
   ```

### Step 4: Test the Build

1. **Run Tests**
   ```bash
   npm run test-installer
   ```

2. **Check Generated Files**
   ```bash
   # List files in dist directory
   dir dist
   
   # Should show:
   # WSM-OE-Manager-Setup-v2.0.exe
   # PORTABLE-VERSION-GUIDE.md
   # checksums.txt
   ```

### Step 5: Deploy to Target Systems

1. **Copy Installer**
   - Copy the `.exe` file from `dist/` directory
   - Transfer to target Windows machines

2. **Install on Target System**
   - Right-click installer and "Run as Administrator"
   - Follow installation wizard
   - Application will be ready for offline use

## 🛠️ Development and Testing

### Development Build
For quick testing during development:
```bash
npm run dev
```

This creates a lightweight development build for testing installer components.

### Testing Scenarios

1. **Test Installation**
   ```bash
   # Build installer
   npm run build-installer
   
   # Test installation on clean Windows VM
   # Verify all shortcuts are created
   # Test application launches correctly
   ```

2. **Test Uninstallation**
   - Use Windows "Add or Remove Programs"
   - Or run `uninstall.bat` from installation directory
   - Verify clean removal

3. **Test Portable Mode**
   ```bash
   # Use PowerShell installer in portable mode
   PowerShell -ExecutionPolicy Bypass -File scripts/windows-installer.ps1 -PortableMode
   ```

## 📁 Output Files Explained

### In `dist/` Directory

1. **WSM-OE-Manager-Setup-v2.0.exe**
   - Main Windows installer
   - Self-contained with all dependencies
   - Creates professional installation experience

2. **PORTABLE-VERSION-GUIDE.md**
   - Instructions for creating portable version
   - Useful for USB drive deployments

3. **checksums.txt**
   - File integrity verification
   - Contains file sizes and modification dates

## 🎯 Installation Features

### What Gets Installed

1. **Application Files**
   - Complete WSM OE Manager web application
   - Electron runtime for desktop integration
   - Local SQLite database setup
   - All necessary dependencies

2. **System Integration**
   - Desktop shortcut: "WSM OE Manager"
   - Start Menu entry: "WSM OE Manager"
   - Windows Programs and Features registration
   - Automatic uninstaller

3. **User Data Setup**
   - User directory: `%USERPROFILE%\.wsm-oe-manager-v2`
   - Local database: `wsm-oe.db`
   - Application settings and preferences

### Installation Locations

- **Program Files**: `C:\Program Files\WSM OE Manager`
- **User Data**: `C:\Users\[username]\.wsm-oe-manager-v2`
- **Desktop Shortcut**: `C:\Users\[username]\Desktop\WSM OE Manager.lnk`
- **Start Menu**: `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\WSM OE Manager`

## 🔧 Troubleshooting

### Common Build Issues

1. **"npm install" fails**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rmdir /s node_modules
   npm install
   ```

2. **"electron-builder" fails**
   ```bash
   # Install electron-builder globally
   npm install -g electron-builder
   
   # Rebuild native modules
   npm run rebuild
   ```

3. **"Permission denied" errors**
   ```bash
   # Run Command Prompt as Administrator
   # Ensure no antivirus is blocking the build
   ```

### Common Installation Issues

1. **"Administrator privileges required"**
   - Right-click installer and select "Run as Administrator"
   - Or use portable mode installation

2. **Application won't start**
   - Check Windows Event Viewer for errors
   - Verify all dependencies are installed
   - Try running from installation directory manually

3. **Database initialization fails**
   - Check user data directory permissions
   - Ensure SQLite dependencies are present
   - Try deleting user data directory and reinstalling

## 📞 Support and Documentation

### Getting Help
- **Installation Issues**: Check Windows Event Viewer
- **Application Issues**: Check application logs in user data directory
- **Build Issues**: Review npm build logs

### File Locations for Support
- **Installation Log**: Windows Event Viewer > Application Logs
- **Application Logs**: `%USERPROFILE%\.wsm-oe-manager-v2\logs`
- **Database**: `%USERPROFILE%\.wsm-oe-manager-v2\wsm-oe.db`

### Advanced Configuration
- **Custom Install Paths**: Edit `scripts/windows-installer.ps1`
- **Registry Settings**: Modify registry entries in installer script
- **Database Settings**: Edit database configuration in Electron main process

## 🎉 Success!

After following this guide, you should have:
- ✅ A professional Windows installer (.exe)
- ✅ Complete offline desktop application
- ✅ Proper Windows system integration
- ✅ Automatic uninstaller
- ✅ User data management
- ✅ Ready for distribution to end users

Your WSM Operational Excellence Manager is now packaged as a professional, self-installing desktop application that works completely offline with full functionality!