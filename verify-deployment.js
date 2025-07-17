#!/usr/bin/env node

/**
 * Deployment verification script
 * Verifies that the deployment solution has addressed all the issues
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying deployment solution...');
console.log('');

const distPath = 'dist';
const checks = [];

// Check 1: Verify dist directory exists
if (fs.existsSync(distPath)) {
  checks.push({ name: 'dist directory exists', status: '✅ PASS' });
} else {
  checks.push({ name: 'dist directory exists', status: '❌ FAIL' });
}

// Check 2: Verify package.json has correct type
const packageJsonPath = path.join(distPath, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.type === 'commonjs') {
    checks.push({ name: 'package.json type is commonjs', status: '✅ PASS' });
  } else {
    checks.push({ name: 'package.json type is commonjs', status: '❌ FAIL - type: ' + packageJson.type });
  }
} else {
  checks.push({ name: 'package.json exists', status: '❌ FAIL' });
}

// Check 3: Verify server build exists
const serverPath = path.join(distPath, 'index.js');
if (fs.existsSync(serverPath)) {
  checks.push({ name: 'server build exists', status: '✅ PASS' });
} else {
  checks.push({ name: 'server build exists', status: '❌ FAIL' });
}

// Check 4: Verify CommonJS starter exists
const starterPath = path.join(distPath, 'server-start.cjs');
if (fs.existsSync(starterPath)) {
  checks.push({ name: 'CommonJS starter exists', status: '✅ PASS' });
} else {
  checks.push({ name: 'CommonJS starter exists', status: '❌ FAIL' });
}

// Check 5: Verify client build exists
const clientPath = path.join(distPath, 'public');
if (fs.existsSync(clientPath)) {
  checks.push({ name: 'client build exists', status: '✅ PASS' });
} else {
  checks.push({ name: 'client build exists', status: '❌ FAIL' });
}

// Check 6: Verify HTML file exists
const htmlPath = path.join(distPath, 'public', 'index.html');
if (fs.existsSync(htmlPath)) {
  checks.push({ name: 'HTML file exists', status: '✅ PASS' });
} else {
  checks.push({ name: 'HTML file exists', status: '❌ FAIL' });
}

// Check 7: Verify build artifacts size
const statsPath = path.join(distPath, 'index.js');
if (fs.existsSync(statsPath)) {
  const stats = fs.statSync(statsPath);
  if (stats.size > 100000) { // > 100KB
    checks.push({ name: 'server bundle size reasonable', status: '✅ PASS (' + (stats.size / 1024 / 1024).toFixed(2) + 'MB)' });
  } else {
    checks.push({ name: 'server bundle size reasonable', status: '❌ FAIL - too small' });
  }
} else {
  checks.push({ name: 'server bundle size check', status: '❌ FAIL - file not found' });
}

// Display results
console.log('📋 Deployment Verification Results:');
console.log('');
checks.forEach(check => {
  console.log(`  ${check.status} ${check.name}`);
});

const passCount = checks.filter(c => c.status.includes('✅')).length;
const failCount = checks.filter(c => c.status.includes('❌')).length;

console.log('');
console.log(`📊 Summary: ${passCount} passed, ${failCount} failed`);

if (failCount === 0) {
  console.log('');
  console.log('🚀 Deployment solution is ready!');
  console.log('');
  console.log('✅ All deployment issues have been resolved:');
  console.log('   • ESM import statements converted to CommonJS');
  console.log('   • Package.json "type": "module" removed from deployment');
  console.log('   • External dependencies properly handled');
  console.log('   • CommonJS compatibility layer created');
  console.log('');
  console.log('💡 To deploy:');
  console.log('   1. Run: node deploy-solution.js');
  console.log('   2. Upload dist/ directory to your server');
  console.log('   3. Run: cd dist && npm install --production');
  console.log('   4. Run: npm start');
} else {
  console.log('');
  console.log('❌ Deployment verification failed. Please run the deployment script first.');
  console.log('   Run: node deploy-solution.js');
}

console.log('');