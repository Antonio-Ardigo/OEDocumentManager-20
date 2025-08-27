#!/usr/bin/env node

// Simple script to build desktop app from project root
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Building WSM OE Manager Desktop App...\n');

try {
  const installerDir = path.join(__dirname, 'desktop-installer');
  
  console.log('📁 Changing to installer directory...');
  process.chdir(installerDir);
  
  console.log('🔧 Running desktop build script...');
  execSync('node electron-build.js', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}