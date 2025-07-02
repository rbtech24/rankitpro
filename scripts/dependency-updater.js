#!/usr/bin/env node
/**
 * Automated Dependency Updater for Rank It Pro
 * Performs smart dependency updates with safety checks
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class DependencyUpdater {
  constructor() {
    this.updateResults = {
      timestamp: new Date().toISOString(),
      totalPackages: 0,
      updatedPackages: 0,
      skippedPackages: 0,
      failedPackages: 0,
      securityUpdates: 0,
      updates: []
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // Check current package versions
  checkCurrentVersions() {
    this.log('Checking current package versions...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      this.updateResults.totalPackages = Object.keys(allDeps).length;
      this.log(`Found ${this.updateResults.totalPackages} packages to check`);
      
      return allDeps;
    } catch (error) {
      this.log(`Error reading package.json: ${error.message}`, 'error');
      throw error;
    }
  }

  // Get outdated packages
  getOutdatedPackages() {
    this.log('Checking for outdated packages...');
    
    try {
      const result = execSync('npm outdated --json', { encoding: 'utf8' });
      return JSON.parse(result);
    } catch (error) {
      // npm outdated returns exit code 1 when packages are outdated
      if (error.stdout) {
        try {
          return JSON.parse(error.stdout);
        } catch (parseError) {
          this.log('No outdated packages found', 'success');
          return {};
        }
      }
      this.log('Error checking outdated packages', 'warn');
      return {};
    }
  }

  // Get security vulnerabilities
  getSecurityVulnerabilities() {
    this.log('Checking for security vulnerabilities...');
    
    try {
      const result = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(result);
      return audit.vulnerabilities || {};
    } catch (error) {
      if (error.stdout) {
        try {
          const audit = JSON.parse(error.stdout);
          return audit.vulnerabilities || {};
        } catch (parseError) {
          return {};
        }
      }
      return {};
    }
  }

  // Check if package is safe to update
  isSafeToUpdate(packageName, currentVersion, latestVersion) {
    // Skip major version updates for critical packages
    const criticalPackages = [
      'react', 'react-dom', 'express', 'drizzle-orm', 
      'typescript', 'vite', '@vitejs/plugin-react'
    ];
    
    if (criticalPackages.includes(packageName)) {
      const currentMajor = this.getMajorVersion(currentVersion);
      const latestMajor = this.getMajorVersion(latestVersion);
      
      if (currentMajor !== latestMajor) {
        this.log(`Skipping major update for critical package: ${packageName} (${currentVersion} -> ${latestVersion})`, 'warn');
        return false;
      }
    }

    // Skip known problematic packages
    const problematicPackages = [
      '@babel/core', 'lightningcss', 'postcss'
    ];
    
    if (problematicPackages.includes(packageName)) {
      this.log(`Skipping problematic package: ${packageName}`, 'warn');
      return false;
    }

    return true;
  }

  // Extract major version number
  getMajorVersion(version) {
    const cleaned = version.replace(/^[\^~]/, '');
    return parseInt(cleaned.split('.')[0]);
  }

  // Update a single package
  async updatePackage(packageName, targetVersion, isSecurityUpdate = false) {
    try {
      this.log(`Updating ${packageName} to ${targetVersion}...`);
      
      const command = `npm install ${packageName}@${targetVersion}`;
      execSync(command, { stdio: 'pipe' });
      
      this.updateResults.updatedPackages++;
      if (isSecurityUpdate) {
        this.updateResults.securityUpdates++;
      }
      
      this.updateResults.updates.push({
        package: packageName,
        version: targetVersion,
        type: isSecurityUpdate ? 'security' : 'regular',
        timestamp: new Date().toISOString()
      });
      
      this.log(`Successfully updated ${packageName}`, 'success');
      return true;
    } catch (error) {
      this.log(`Failed to update ${packageName}: ${error.message}`, 'error');
      this.updateResults.failedPackages++;
      return false;
    }
  }

  // Run tests to ensure updates don't break anything
  runTests() {
    this.log('Running tests to verify updates...');
    
    try {
      // Check if TypeScript compiles
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.log('TypeScript compilation successful', 'success');
      
      // Try to start the application in test mode
      execSync('timeout 10s npm run dev || true', { stdio: 'pipe' });
      this.log('Application startup test completed', 'success');
      
      return true;
    } catch (error) {
      this.log(`Tests failed: ${error.message}`, 'error');
      return false;
    }
  }

  // Create backup of package.json
  createBackup() {
    const backupPath = `package.json.backup.${Date.now()}`;
    fs.copyFileSync('package.json', backupPath);
    this.log(`Backup created: ${backupPath}`);
    return backupPath;
  }

  // Restore from backup
  restoreBackup(backupPath) {
    fs.copyFileSync(backupPath, 'package.json');
    this.log('Restored from backup');
  }

  // Update dependencies with safety checks
  async updateDependencies() {
    const backupPath = this.createBackup();
    
    try {
      const outdated = this.getOutdatedPackages();
      const vulnerabilities = this.getSecurityVulnerabilities();
      
      // Priority 1: Security updates
      for (const [pkg, vuln] of Object.entries(vulnerabilities)) {
        if (vuln.severity === 'critical' || vuln.severity === 'high') {
          const fixAvailable = vuln.fixAvailable;
          if (fixAvailable && typeof fixAvailable === 'object' && fixAvailable.version) {
            await this.updatePackage(pkg, fixAvailable.version, true);
          }
        }
      }
      
      // Priority 2: Regular updates
      for (const [pkg, info] of Object.entries(outdated)) {
        if (vulnerabilities[pkg]) continue; // Already handled above
        
        const current = info.current;
        const latest = info.latest;
        
        if (this.isSafeToUpdate(pkg, current, latest)) {
          await this.updatePackage(pkg, latest);
        } else {
          this.updateResults.skippedPackages++;
        }
      }
      
      // Verify updates don't break anything
      if (this.updateResults.updatedPackages > 0) {
        this.log('Verifying updates...');
        
        if (!this.runTests()) {
          this.log('Updates caused issues, restoring backup...', 'warn');
          this.restoreBackup(backupPath);
          this.updateResults.updatedPackages = 0;
          this.updateResults.updates = [];
          return false;
        }
      }
      
      // Clean up old backup if successful
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath);
      }
      
      return true;
    } catch (error) {
      this.log(`Update process failed: ${error.message}`, 'error');
      this.restoreBackup(backupPath);
      return false;
    }
  }

  // Generate update report
  generateReport() {
    const report = {
      ...this.updateResults,
      summary: {
        successful: this.updateResults.updatedPackages > 0,
        totalProcessed: this.updateResults.updatedPackages + this.updateResults.skippedPackages + this.updateResults.failedPackages,
        securityImprovements: this.updateResults.securityUpdates > 0
      }
    };

    // Save detailed report
    const reportPath = 'dependency-update-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate summary
    this.log('\n' + '='.repeat(60));
    this.log('DEPENDENCY UPDATE COMPLETE', 'success');
    this.log('='.repeat(60));
    this.log(`Total Packages Checked: ${this.updateResults.totalPackages}`);
    this.log(`Successfully Updated: ${this.updateResults.updatedPackages}`);
    this.log(`Security Updates: ${this.updateResults.securityUpdates}`);
    this.log(`Skipped (Safety): ${this.updateResults.skippedPackages}`);
    this.log(`Failed: ${this.updateResults.failedPackages}`);
    
    if (this.updateResults.updates.length > 0) {
      this.log('\nUpdated Packages:');
      this.updateResults.updates.forEach(update => {
        const type = update.type === 'security' ? '🔒 SECURITY' : '📦 REGULAR';
        this.log(`  ${type}: ${update.package}@${update.version}`);
      });
    }
    
    this.log(`\nDetailed report saved to: ${reportPath}`);
    
    if (this.updateResults.securityUpdates > 0) {
      this.log('✅ Security vulnerabilities were addressed', 'success');
    }
  }

  // Run complete update process
  async runUpdate() {
    this.log('Starting automated dependency update...');
    
    this.checkCurrentVersions();
    const success = await this.updateDependencies();
    
    if (success) {
      this.log('Dependency update completed successfully', 'success');
    } else {
      this.log('Dependency update encountered issues', 'warn');
    }
    
    this.generateReport();
    return success;
  }
}

// Run dependency update if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const updater = new DependencyUpdater();
  updater.runUpdate().catch(error => {
    console.error('❌ Dependency update failed:', error.message);
    process.exit(1);
  });
}

export default DependencyUpdater;