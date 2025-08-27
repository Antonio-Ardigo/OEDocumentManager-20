#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building WSM OE Manager Desktop Application...\n');

try {
  // Step 1: Build the web application
  console.log('📦 Building web application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Create desktop-specific package.json
  console.log('📋 Preparing desktop package configuration...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Create a simplified package.json for Electron
  const desktopPackage = {
    name: 'wsm-oe-manager',
    version: packageJson.version || '1.0.0',
    description: 'WSM Operational Excellence Manager - Desktop Application',
    main: 'electron-main.js',
    author: 'WSM Operational Excellence Team',
    license: 'MIT',
    scripts: {
      start: 'electron .',
      postinstall: 'electron-builder install-app-deps'
    },
    dependencies: {
      // Only include runtime dependencies needed for Electron
      'better-sqlite3': packageJson.dependencies['better-sqlite3'],
      'express': packageJson.dependencies['express'],
      'express-session': packageJson.dependencies['express-session'],
      'drizzle-orm': packageJson.dependencies['drizzle-orm'],
    },
    devDependencies: {
      'electron': packageJson.dependencies['electron'],
      'electron-builder': packageJson.dependencies['electron-builder']
    }
  };

  // Write desktop package.json to dist folder
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
  
  fs.writeFileSync(
    path.join('dist', 'package.json'), 
    JSON.stringify(desktopPackage, null, 2)
  );

  // Step 3: Copy Electron files to dist
  console.log('📄 Copying Electron configuration files...');
  
  const filesToCopy = [
    'electron-main.js',
    'electron-preload.js', 
    'electron-builder.yml'
  ];

  filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join('dist', file));
      console.log(`   ✓ Copied ${file}`);
    }
  });

  // Copy assets if they exist
  if (fs.existsSync('assets')) {
    const assetsDir = path.join('dist', 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    const assetFiles = fs.readdirSync('assets');
    assetFiles.forEach(file => {
      fs.copyFileSync(
        path.join('assets', file),
        path.join(assetsDir, file)
      );
    });
    console.log('   ✓ Copied assets directory');
  }

  // Step 4: Build Electron application
  console.log('🔧 Building Electron application packages...');
  
  process.chdir('dist');
  
  // Install production dependencies in dist folder
  execSync('npm install --production', { stdio: 'inherit' });
  
  // Build for current platform
  execSync('npx electron-builder --publish=never', { stdio: 'inherit' });

  console.log('\n✅ Desktop application build completed!');
  console.log('\n📁 Installation files can be found in:');
  console.log('   dist/dist-electron/');
  
  console.log('\n🎉 Your WSM OE Manager desktop app is ready to install!');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}