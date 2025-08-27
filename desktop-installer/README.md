# WSM OE Manager - Desktop Installer

This directory contains all the files needed to build and distribute the desktop version of WSM OE Manager.

## Quick Build

From the project root directory, run:
```bash
cd desktop-installer
node electron-build.js
```

This will:
1. Build the web application 
2. Create desktop app package
3. Generate installers for your platform

## Output Location

After building, find your installer files in:
```
desktop-installer/build/dist-electron/
```

## Installer Files Created

- **Windows**: `WSM OE Manager Setup 1.0.0.exe`
- **macOS**: `WSM OE Manager-1.0.0.dmg` 
- **Linux**: `WSM OE Manager-1.0.0.AppImage`

## Directory Structure

```
desktop-installer/
├── electron-main.js        # Main Electron process
├── electron-preload.js     # Security preload script  
├── electron-builder.yml    # Build configuration
├── electron-build.js       # Build script
├── assets/                 # App icons and resources
├── build/                  # Generated during build (temporary)
└── DESKTOP-APP-GUIDE.md    # User documentation
```