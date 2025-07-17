#!/usr/bin/env node

// Test script to verify the build works correctly
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 Testing deployment build...');

// Test 1: Check if all required files exist
const requiredFiles = [
  'dist/index.html',
  'dist/server.js',
  'dist/index.js',
  'dist/index.cjs',
  'dist/package.json'
];

console.log('📁 Checking required files...');
const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
if (missingFiles.length > 0) {
  console.error('❌ Missing files:', missingFiles);
  process.exit(1);
}
console.log('✅ All required files present');

// Test 2: Test server startup
console.log('🚀 Testing server startup...');
const serverProcess = spawn('node', ['dist/index.js'], {
  stdio: 'pipe',
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: 'production', PORT: '3001' }
});

let serverOutput = '';
serverProcess.stdout.on('data', (data) => {
  serverOutput += data.toString();
});

serverProcess.stderr.on('data', (data) => {
  serverOutput += data.toString();
});

// Give the server 10 seconds to start
setTimeout(() => {
  serverProcess.kill('SIGTERM');
  
  if (serverOutput.includes('Error') || serverOutput.includes('Failed')) {
    console.error('❌ Server startup failed:');
    console.error(serverOutput);
    process.exit(1);
  }
  
  console.log('✅ Server started successfully');
  console.log('📊 Server output:');
  console.log(serverOutput);
  
  console.log('🎉 Build test completed successfully!');
  console.log('✅ Build is ready for deployment');
}, 10000);

// Handle process termination
process.on('SIGINT', () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});