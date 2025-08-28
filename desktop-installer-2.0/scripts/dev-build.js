#!/usr/bin/env node

/**
 * WSM OE Manager - Desktop Installer 2.0 Development Build
 * Quick development build for testing installer components
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class DevBuilder {
  constructor() {
    this.projectRoot = path.join(__dirname, '..', '..');
    this.installerRoot = path.join(__dirname, '..');
    this.buildDir = path.join(this.installerRoot, 'build');
    this.version = '2.0.0-dev';
  }

  async init() {
    console.log('🔧 WSM OE Manager - Development Build');
    console.log('=====================================');
    console.log('');
    console.log('This is a lightweight build for testing installer components.');
    console.log('For production builds, use: npm run build-installer');
    console.log('');
  }

  async quickBuild() {
    console.log('⚡ Quick build process...');
    
    // Create minimal directory structure
    await fs.mkdir(path.join(this.buildDir, 'app'), { recursive: true });
    await fs.mkdir(path.join(this.buildDir, 'src'), { recursive: true });
    await fs.mkdir(path.join(this.buildDir, 'resources'), { recursive: true });
    
    // Create minimal package.json
    const devPackage = {
      name: 'wsm-oe-manager-dev',
      version: this.version,
      description: 'WSM OE Manager - Development Build',
      main: 'src/electron-main.js',
      scripts: {
        start: 'electron .'
      },
      devDependencies: {
        electron: '^28.0.0'
      }
    };
    
    await fs.writeFile(
      path.join(this.buildDir, 'package.json'),
      JSON.stringify(devPackage, null, 2)
    );
    
    // Create minimal Electron main file
    const electronMain = `
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL('http://localhost:5000');
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
`;
    
    await fs.writeFile(
      path.join(this.buildDir, 'src', 'electron-main.js'),
      electronMain
    );
    
    // Create development info file
    const devInfo = `
WSM OE Manager - Development Build v${this.version}

This is a development build for testing installer components.

Build Date: ${new Date().toISOString()}
Build Directory: ${this.buildDir}

To test:
1. cd ${this.buildDir}
2. npm install
3. npm start

For production builds:
- Use the main build script: npm run build-installer
- Test with: npm run test-installer
`;
    
    await fs.writeFile(
      path.join(this.buildDir, 'DEV-BUILD-INFO.txt'),
      devInfo
    );
    
    console.log('✅ Development build created');
    console.log(`📁 Build directory: ${this.buildDir}`);
    console.log('');
    console.log('To test this development build:');
    console.log(`   cd ${this.buildDir}`);
    console.log('   npm install');
    console.log('   npm start');
    console.log('');
  }

  async build() {
    try {
      await this.init();
      await this.quickBuild();
    } catch (error) {
      console.error('❌ Development build failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the development builder
if (require.main === module) {
  const builder = new DevBuilder();
  builder.build();
}

module.exports = DevBuilder;