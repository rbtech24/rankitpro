#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting Rank It Pro server...');

// Check if dist/server.js exists
const serverPath = path.join(__dirname, 'dist', 'server.js');
const fs = require('fs');

if (fs.existsSync(serverPath)) {
  console.log('✅ Found dist/server.js - starting production server');
  
  // Start the server in the dist directory
  const serverProcess = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'dist'),
    stdio: 'inherit'
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
  console.log('❌ dist/server.js not found - running emergency build');
  
  // Run the deploy script to create the server
  const deployProcess = spawn('node', ['deploy-working.js'], {
    stdio: 'inherit'
  });
  
  deployProcess.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Emergency build completed - starting server');
      
      // Now start the server
      const serverProcess = spawn('node', ['server.js'], {
        cwd: path.join(__dirname, 'dist'),
        stdio: 'inherit'
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
      console.error('❌ Emergency build failed');
      process.exit(1);
    }
  });
}