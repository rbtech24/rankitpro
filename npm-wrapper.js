#!/usr/bin/env node

// NPM wrapper script to bypass tsx dependency issues
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Rank It Pro (bypassing tsx dependency issues)...');

// Check if we're running the dev script
const args = process.argv.slice(2);
if (args.includes('dev') || args.includes('run') && args.includes('dev')) {
  console.log('📦 Running development server with Node.js...');
  
  // Run the server using Node.js directly
  const serverProcess = spawn('node', [path.join(__dirname, 'server', 'index.js')], {
    stdio: 'inherit',
    env: { ...process.env, PORT: process.env.PORT || 5000 }
  });
  
  serverProcess.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
  });
  
  serverProcess.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
  });
} else {
  // For other commands, just run npm normally
  const npmProcess = spawn('npm', args, {
    stdio: 'inherit'
  });
  
  npmProcess.on('exit', (code) => {
    process.exit(code);
  });
}