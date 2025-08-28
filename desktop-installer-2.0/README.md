# WSM OE Manager - Desktop Installer 2.0

**Best-in-class Windows desktop installer for WSM Operational Excellence Manager**

## 🚀 Features

### ✨ Professional Installation Experience
- **Modern Windows UI** - Native Windows 10/11 installer experience
- **Self-Installing** - One-click installation with automatic setup
- **System Integration** - Full Windows integration with proper shortcuts and registry entries
- **Resource Management** - All resources organized in separate directories

### 🛡️ Enhanced Compatibility
- **Windows 10/11 Optimized** - Designed for modern Windows environments
- **Administrator Detection** - Automatic privilege escalation when needed
- **Dependency Management** - Automatic handling of all required components
- **Error Recovery** - Intelligent error handling and recovery mechanisms

### 📦 Self-Contained Application
- **Complete Offline Operation** - No internet required after installation
- **Bundled Resources** - All assets, dependencies, and libraries included
- **Local Database** - SQLite database for offline data storage
- **Portable Option** - Can be configured for portable installation

## 🏗️ Directory Structure

```
desktop-installer-2.0/
├── src/                    # Core installer source files
├── assets/                 # Icons, images, and visual resources
├── build/                  # Temporary build output
├── dist/                   # Final installer packages
├── scripts/                # Build and utility scripts
├── resources/              # Application resources and dependencies
└── README.md              # This file
```

## 🔨 Quick Build

From the project root directory:

```bash
cd desktop-installer-2.0
npm run build-installer
```

This creates a professional Windows installer in the `dist/` directory.

## 📋 Installation Process

1. **Run Installer** - Double-click the generated `.exe` file
2. **Automatic Setup** - Installer handles all configuration
3. **System Integration** - Creates shortcuts and registry entries
4. **Ready to Use** - Application launches automatically after installation

## 🎯 Target Environments

- **Windows 10** (version 1903 and later)
- **Windows 11** (all versions)
- **64-bit Architecture** (x64)
- **32-bit Support** (x86) - Optional build target

## 📄 Output Files

After building, you'll find in `dist/`:
- `WSM-OE-Manager-Setup-v2.0.exe` - Main installer
- `WSM-OE-Manager-Portable-v2.0.zip` - Portable version
- `checksums.txt` - File verification checksums

## 🔧 Advanced Configuration

Edit `src/installer-config.json` to customize:
- Installation directories
- Registry entries
- Shortcut creation
- System integration options

## 📞 Support

This installer creates a fully self-contained desktop application that works offline with complete operational excellence functionality.