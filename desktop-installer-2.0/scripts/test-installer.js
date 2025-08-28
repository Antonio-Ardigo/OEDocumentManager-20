#!/usr/bin/env node

/**
 * WSM OE Manager - Desktop Installer 2.0 Test Script
 * Tests the generated installer in various scenarios
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class InstallerTester {
  constructor() {
    this.installerRoot = path.join(__dirname, '..');
    this.distDir = path.join(this.installerRoot, 'dist');
    this.testResults = [];
  }

  async runTests() {
    console.log('🧪 WSM OE Manager - Installer 2.0 Test Suite');
    console.log('============================================');
    console.log('');

    try {
      await this.testDirectoryStructure();
      await this.testConfigurationFiles();
      await this.testInstallerFiles();
      await this.testBuildOutputs();
      await this.showTestResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async testDirectoryStructure() {
    console.log('📁 Testing directory structure...');
    
    const requiredDirs = [
      'src',
      'assets', 
      'build',
      'dist',
      'scripts',
      'resources'
    ];

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.installerRoot, dir);
      try {
        await fs.access(dirPath);
        this.addTestResult('PASS', `Directory exists: ${dir}`);
      } catch (error) {
        this.addTestResult('FAIL', `Directory missing: ${dir}`);
      }
    }
  }

  async testConfigurationFiles() {
    console.log('⚙️  Testing configuration files...');
    
    const requiredFiles = [
      'package.json',
      'README.md',
      'src/installer-config.json',
      'scripts/build-installer.js',
      'scripts/windows-installer.ps1'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.installerRoot, file);
      try {
        const stats = await fs.stat(filePath);
        if (stats.size > 0) {
          this.addTestResult('PASS', `Configuration file: ${file}`);
        } else {
          this.addTestResult('FAIL', `Empty file: ${file}`);
        }
      } catch (error) {
        this.addTestResult('FAIL', `Missing file: ${file}`);
      }
    }
  }

  async testInstallerFiles() {
    console.log('📦 Testing installer components...');
    
    try {
      // Test package.json validity
      const packagePath = path.join(this.installerRoot, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);
      
      if (packageJson.name && packageJson.version && packageJson.scripts) {
        this.addTestResult('PASS', 'Package.json is valid');
      } else {
        this.addTestResult('FAIL', 'Package.json missing required fields');
      }

      // Test installer config
      const configPath = path.join(this.installerRoot, 'src', 'installer-config.json');
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      if (config.application && config.installation && config.windows) {
        this.addTestResult('PASS', 'Installer configuration is valid');
      } else {
        this.addTestResult('FAIL', 'Installer configuration missing sections');
      }

    } catch (error) {
      this.addTestResult('FAIL', `Configuration validation failed: ${error.message}`);
    }
  }

  async testBuildOutputs() {
    console.log('🏗️  Testing build outputs...');
    
    try {
      const distFiles = await fs.readdir(this.distDir);
      
      if (distFiles.length > 0) {
        this.addTestResult('PASS', `Build outputs present: ${distFiles.length} files`);
        
        // Check for expected file types
        const hasExecutable = distFiles.some(file => file.endsWith('.exe'));
        const hasChecksum = distFiles.some(file => file.includes('checksum'));
        
        if (hasExecutable) {
          this.addTestResult('PASS', 'Windows executable (.exe) found');
        } else {
          this.addTestResult('INFO', 'No Windows executable found (not built yet)');
        }
        
        if (hasChecksum) {
          this.addTestResult('PASS', 'Checksum file found');
        } else {
          this.addTestResult('INFO', 'No checksum file found (not built yet)');
        }
        
      } else {
        this.addTestResult('INFO', 'No build outputs (run build-installer.js first)');
      }
      
    } catch (error) {
      this.addTestResult('INFO', 'Dist directory not yet created (run build first)');
    }
  }

  addTestResult(status, message) {
    this.testResults.push({ status, message });
    
    const icon = {
      'PASS': '✅',
      'FAIL': '❌', 
      'INFO': 'ℹ️',
      'WARN': '⚠️'
    }[status] || '•';
    
    console.log(`   ${icon} ${message}`);
  }

  async showTestResults() {
    console.log('');
    console.log('📊 Test Results Summary');
    console.log('======================');
    
    const summary = this.testResults.reduce((acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      return acc;
    }, {});

    Object.entries(summary).forEach(([status, count]) => {
      const icon = {
        'PASS': '✅',
        'FAIL': '❌',
        'INFO': 'ℹ️', 
        'WARN': '⚠️'
      }[status];
      console.log(`${icon} ${status}: ${count}`);
    });

    console.log('');
    
    if (summary.FAIL > 0) {
      console.log('❌ Some tests failed. Please fix the issues before building.');
      console.log('');
      return false;
    } else {
      console.log('✅ All tests passed! Installer is ready for building.');
      console.log('');
      console.log('Next steps:');
      console.log('  1. Run: npm run build-installer');
      console.log('  2. Test the generated installer');
      console.log('  3. Distribute to target systems');
      console.log('');
      return true;
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new InstallerTester();
  tester.runTests();
}

module.exports = InstallerTester;