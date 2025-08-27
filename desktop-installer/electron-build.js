#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building WSM OE Manager Desktop Application...\n');

// Set up paths - installer is in desktop-installer/ subdirectory
const projectRoot = path.join(__dirname, '..');
const installerDir = __dirname;
const buildDir = path.join(installerDir, 'build');

try {
  // Step 1: Build the web application
  console.log('📦 Building web application...');
  process.chdir(projectRoot);
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Create desktop-specific package.json
  console.log('📋 Preparing desktop package configuration...');
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  
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

  // Create build directory
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  
  // Copy web app dist files to build directory
  const webDistDir = path.join(projectRoot, 'dist');
  if (fs.existsSync(webDistDir)) {
    execSync(`cp -r "${webDistDir}"/* "${buildDir}/"`, { stdio: 'inherit' });
  }
  
  // Write desktop package.json to build folder
  fs.writeFileSync(
    path.join(buildDir, 'package.json'), 
    JSON.stringify(desktopPackage, null, 2)
  );

  // Step 3: Copy Electron files to build directory
  console.log('📄 Copying Electron configuration files...');
  
  const filesToCopy = [
    'electron-main.js',
    'electron-preload.js', 
    'electron-builder.yml'
  ];

  filesToCopy.forEach(file => {
    const sourceFile = path.join(installerDir, file);
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, path.join(buildDir, file));
      console.log(`   ✓ Copied ${file}`);
    }
  });

  // Copy assets if they exist
  const assetsDir = path.join(installerDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    const targetAssetsDir = path.join(buildDir, 'assets');
    if (!fs.existsSync(targetAssetsDir)) {
      fs.mkdirSync(targetAssetsDir, { recursive: true });
    }
    
    const assetFiles = fs.readdirSync(assetsDir);
    assetFiles.forEach(file => {
      fs.copyFileSync(
        path.join(assetsDir, file),
        path.join(targetAssetsDir, file)
      );
    });
    console.log('   ✓ Copied assets directory');
  }

  // Step 4: Build Electron application
  console.log('🔧 Building Electron application packages...');
  
  process.chdir(buildDir);
  
  // Install production dependencies in build folder
  execSync('npm install --production', { stdio: 'inherit' });
  
  // Build for current platform
  execSync('npx electron-builder --publish=never', { stdio: 'inherit' });

  console.log('\n✅ Desktop application build completed!');
  console.log('\n📁 Installation files can be found in:');
  console.log(`   ${path.join(buildDir, 'dist-electron')}/`);
  
  console.log('\n🎉 Your WSM OE Manager desktop app is ready to install!');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}