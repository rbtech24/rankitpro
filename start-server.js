#!/usr/bin/env node

// Simple startup script to bypass Vite configuration issues
const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Start the server directly with updated import flag
const serverProcess = spawn('node', [
  '--import', 'tsx/esm',
  path.join(__dirname, 'server/index.ts')
], {
  stdio: 'inherit',
  env: process.env
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Server process exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  serverProcess.kill('SIGTERM');
  process.exit(0);
});