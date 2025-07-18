#!/usr/bin/env node

// Simple dev runner that bypasses tsx dependency issues
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Rank It Pro Development Server...');

// Kill any existing processes on the port first
const killExisting = spawn('bash', ['-c', 'pkill -f "node.*server" || true'], {
  stdio: 'inherit'
});

killExisting.on('exit', () => {
  // Wait a moment for cleanup
  setTimeout(() => {
    console.log('📦 Starting server with Node.js (bypassing tsx)...');
    
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
  }, 1000);
});