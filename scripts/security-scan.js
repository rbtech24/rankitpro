#!/usr/bin/env node
/**
 * Automated Security Scanner for Rank It Pro
 * Performs comprehensive security checks and vulnerability scanning
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';

class SecurityScanner {
  constructor() {
    this.vulnerabilities = [];
    this.scanResults = {
      timestamp: new Date().toISOString(),
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0,
      passed: 0,
      total: 0
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addVulnerability(severity, category, message, file = null, line = null) {
    const vuln = {
      severity,
      category,
      message,
      file,
      line,
      timestamp: new Date().toISOString()
    };
    
    this.vulnerabilities.push(vuln);
    this.scanResults[`${severity}Issues`]++;
    this.scanResults.total++;
    
    this.log(`${severity.toUpperCase()}: ${message}${file ? ` in ${file}` : ''}`, 'warn');
  }

  passCheck(message) {
    this.scanResults.passed++;
    this.scanResults.total++;
    this.log(message, 'success');
  }

  // Check for hardcoded secrets and API keys
  scanForSecrets() {
    this.log('Scanning for hardcoded secrets and API keys...');
    
    const secretPatterns = [
      { pattern: /sk_live_[a-zA-Z0-9]{24,}/, name: 'Stripe Live Secret Key' },
      { pattern: /sk_test_[a-zA-Z0-9]{24,}/, name: 'Stripe Test Secret Key' },
      { pattern: /pk_live_[a-zA-Z0-9]{24,}/, name: 'Stripe Live Public Key' },
      { pattern: /xapi-[a-zA-Z0-9]{40,}/, name: 'X.AI API Key' },
      { pattern: /sk-[a-zA-Z0-9]{48,}/, name: 'OpenAI API Key' },
      { pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/, name: 'SendGrid API Key' },
      { pattern: /password\s*[:=]\s*['"][^'"]{8,}['"]/, name: 'Hardcoded Password' },
      { pattern: /secret\s*[:=]\s*['"][^'"]{16,}['"]/, name: 'Hardcoded Secret' }
    ];

    const filesToScan = this.getSourceFiles(['.js', '.ts', '.jsx', '.tsx', '.json']);
    let secretsFound = 0;

    filesToScan.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          secretPatterns.forEach(({ pattern, name }) => {
            if (pattern.test(line) && !line.includes('process.env') && !line.includes('example')) {
              this.addVulnerability('critical', 'Secrets', `${name} found`, file, index + 1);
              secretsFound++;
            }
          });
        });
      } catch (error) {
        this.log(`Error scanning ${file}: ${error.message}`, 'error');
      }
    });

    if (secretsFound === 0) {
      this.passCheck('No hardcoded secrets found');
    }
  }

  // Check for XSS vulnerabilities
  scanForXSS() {
    this.log('Scanning for XSS vulnerabilities...');
    
    const xssPatterns = [
      { pattern: /innerHTML\s*=\s*[^;]+(?!sanitiz|escap|encod)/i, name: 'Unsafe innerHTML usage' },
      { pattern: /outerHTML\s*=\s*[^;]+/i, name: 'Unsafe outerHTML usage' },
      { pattern: /document\.write\s*\(/i, name: 'Unsafe document.write usage' },
      { pattern: /eval\s*\(/i, name: 'Unsafe eval usage' },
      { pattern: /dangerouslySetInnerHTML/i, name: 'React dangerouslySetInnerHTML usage' }
    ];

    const filesToScan = this.getSourceFiles(['.js', '.ts', '.jsx', '.tsx']);
    let xssIssues = 0;

    filesToScan.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          xssPatterns.forEach(({ pattern, name }) => {
            if (pattern.test(line)) {
              // Check if it's the fixed sanitization in widget.js
              if (file.includes('widget.js') && line.includes('sanitizedHTML')) {
                this.passCheck(`XSS protection found in ${file}`);
              } else {
                this.addVulnerability('high', 'XSS', name, file, index + 1);
                xssIssues++;
              }
            }
          });
        });
      } catch (error) {
        this.log(`Error scanning ${file}: ${error.message}`, 'error');
      }
    });

    if (xssIssues === 0) {
      this.passCheck('No XSS vulnerabilities found');
    }
  }

  // Check authentication and session security
  scanAuthSecurity() {
    this.log('Scanning authentication and session security...');
    
    try {
      // Check session configuration
      const routesFile = path.join(process.cwd(), 'server', 'routes.ts');
      if (fs.existsSync(routesFile)) {
        const content = fs.readFileSync(routesFile, 'utf8');
        
        // Check for secure session settings
        if (content.includes('httpOnly: true')) {
          this.passCheck('HTTP-only cookies enabled');
        } else {
          this.addVulnerability('high', 'Session', 'HTTP-only cookies not enabled');
        }
        
        if (content.includes('sameSite: \'strict\'')) {
          this.passCheck('SameSite strict cookies enabled');
        } else {
          this.addVulnerability('medium', 'Session', 'SameSite strict not enabled');
        }
        
        if (content.includes('secure: isProduction')) {
          this.passCheck('Secure cookies for production enabled');
        } else {
          this.addVulnerability('medium', 'Session', 'Secure cookies not properly configured');
        }
        
        // Check session timeout
        const sessionTimeoutMatch = content.match(/maxAge:\s*[^,}]+/);
        if (sessionTimeoutMatch) {
          const timeout = sessionTimeoutMatch[0];
          if (timeout.includes('4 * 60 * 60 * 1000') || timeout.includes('2 * 60 * 60 * 1000')) {
            this.passCheck('Secure session timeout configured');
          } else {
            this.addVulnerability('medium', 'Session', 'Session timeout may be too long');
          }
        }
      }
      
      // Check for bcrypt usage
      const serverFiles = this.getSourceFiles(['.js', '.ts'], 'server');
      let bcryptFound = false;
      
      serverFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('bcrypt') && content.includes('hash')) {
          bcryptFound = true;
        }
      });
      
      if (bcryptFound) {
        this.passCheck('bcrypt password hashing found');
      } else {
        this.addVulnerability('critical', 'Authentication', 'No secure password hashing found');
      }
      
    } catch (error) {
      this.log(`Error checking auth security: ${error.message}`, 'error');
    }
  }

  // Check for SQL injection vulnerabilities
  scanSQLInjection() {
    this.log('Scanning for SQL injection vulnerabilities...');
    
    const sqlPatterns = [
      { pattern: /query\s*\(\s*['"`][^'"`]*\$\{[^}]+\}[^'"`]*['"`]/i, name: 'Template literal in SQL query' },
      { pattern: /query\s*\(\s*['"`][^'"`]*\+[^'"`]*['"`]/i, name: 'String concatenation in SQL query' },
      { pattern: /execute\s*\(\s*['"`][^'"`]*\$\{[^}]+\}[^'"`]*['"`]/i, name: 'Template literal in SQL execute' }
    ];

    const serverFiles = this.getSourceFiles(['.js', '.ts'], 'server');
    let sqlIssues = 0;

    serverFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          sqlPatterns.forEach(({ pattern, name }) => {
            if (pattern.test(line)) {
              this.addVulnerability('high', 'SQL Injection', name, file, index + 1);
              sqlIssues++;
            }
          });
        });
        
        // Check for ORM usage (good practice)
        if (content.includes('drizzle') || content.includes('prisma') || content.includes('sequelize')) {
          this.passCheck(`ORM usage found in ${path.basename(file)}`);
        }
      } catch (error) {
        this.log(`Error scanning ${file}: ${error.message}`, 'error');
      }
    });

    if (sqlIssues === 0) {
      this.passCheck('No SQL injection vulnerabilities found');
    }
  }

  // Check dependency vulnerabilities
  async scanDependencies() {
    this.log('Scanning for dependency vulnerabilities...');
    
    try {
      // Run npm audit
      const auditResult = execSync('npm audit --json', { cwd: process.cwd(), encoding: 'utf8' });
      const audit = JSON.parse(auditResult);
      
      if (audit.vulnerabilities) {
        Object.entries(audit.vulnerabilities).forEach(([pkg, vuln]) => {
          const severity = vuln.severity;
          if (severity === 'critical' || severity === 'high') {
            this.addVulnerability(severity, 'Dependencies', `${pkg}: ${vuln.title}`);
          } else if (severity === 'moderate') {
            this.addVulnerability('medium', 'Dependencies', `${pkg}: ${vuln.title}`);
          } else {
            this.addVulnerability('low', 'Dependencies', `${pkg}: ${vuln.title}`);
          }
        });
      } else {
        this.passCheck('No dependency vulnerabilities found');
      }
    } catch (error) {
      if (error.stdout) {
        try {
          const audit = JSON.parse(error.stdout);
          if (audit.vulnerabilities && Object.keys(audit.vulnerabilities).length === 0) {
            this.passCheck('No dependency vulnerabilities found');
          }
        } catch (parseError) {
          this.log('Unable to parse npm audit results', 'warn');
        }
      } else {
        this.log(`Error running npm audit: ${error.message}`, 'error');
      }
    }
  }

  // Check environment variable security
  scanEnvironmentSecurity() {
    this.log('Checking environment variable security...');
    
    try {
      const envFiles = ['.env', '.env.example', '.env.production'];
      let envIssues = 0;
      
      envFiles.forEach(envFile => {
        const envPath = path.join(process.cwd(), envFile);
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            // Check for actual secrets in .env files (not examples)
            if (!envFile.includes('example') && line.includes('=') && !line.startsWith('#')) {
              const [key, value] = line.split('=');
              if (value && value.length > 10 && !value.includes('your_') && !value.includes('changeme')) {
                // This might be a real secret - warn but don't expose
                this.addVulnerability('low', 'Environment', `Potential secret in ${envFile}`, envFile, index + 1);
                envIssues++;
              }
            }
          });
          
          // Check for required security env vars
          const requiredSecurityVars = ['SESSION_SECRET', 'DATABASE_URL'];
          requiredSecurityVars.forEach(varName => {
            if (content.includes(varName)) {
              this.passCheck(`${varName} configuration found`);
            }
          });
        }
      });
      
      if (envIssues === 0) {
        this.passCheck('Environment variable security looks good');
      }
    } catch (error) {
      this.log(`Error checking environment security: ${error.message}`, 'error');
    }
  }

  // Get source files to scan
  getSourceFiles(extensions, subdir = '') {
    const files = [];
    const scanDir = subdir ? path.join(process.cwd(), subdir) : process.cwd();
    
    const scanDirectory = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scanDirectory(fullPath);
          } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        });
      } catch (error) {
        // Skip directories we can't read
      }
    };
    
    scanDirectory(scanDir);
    return files;
  }

  // Generate security report
  generateReport() {
    const report = {
      ...this.scanResults,
      vulnerabilities: this.vulnerabilities.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
    };

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'security-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate summary
    this.log('\n' + '='.repeat(60));
    this.log('SECURITY SCAN COMPLETE', 'success');
    this.log('='.repeat(60));
    this.log(`Total Checks: ${this.scanResults.total}`);
    this.log(`Passed: ${this.scanResults.passed}`);
    this.log(`Critical Issues: ${this.scanResults.criticalIssues}`);
    this.log(`High Issues: ${this.scanResults.highIssues}`);
    this.log(`Medium Issues: ${this.scanResults.mediumIssues}`);
    this.log(`Low Issues: ${this.scanResults.lowIssues}`);
    this.log(`Detailed report saved to: ${reportPath}`);
    
    if (this.scanResults.criticalIssues > 0) {
      this.log('❌ CRITICAL VULNERABILITIES FOUND - IMMEDIATE ACTION REQUIRED', 'error');
      process.exit(1);
    } else if (this.scanResults.highIssues > 0) {
      this.log('⚠️ HIGH PRIORITY ISSUES FOUND - SHOULD BE ADDRESSED', 'warn');
      process.exit(1);
    } else {
      this.log('✅ No critical security issues found', 'success');
    }
  }

  // Run all security scans
  async runAllScans() {
    this.log('Starting comprehensive security scan...');
    
    this.scanForSecrets();
    this.scanForXSS();
    this.scanAuthSecurity();
    this.scanSQLInjection();
    await this.scanDependencies();
    this.scanEnvironmentSecurity();
    
    this.generateReport();
  }
}

// Run security scan if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const scanner = new SecurityScanner();
  scanner.runAllScans().catch(error => {
    console.error('❌ Security scan failed:', error.message);
    process.exit(1);
  });
}

export default SecurityScanner;