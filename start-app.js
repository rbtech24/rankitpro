#!/usr/bin/env node
const { spawn } = require('child_process');

console.log('🚀 Starting Rank It Pro application...');

// Start the simple server
const server = spawn('node', ['simple-server.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.kill('SIGTERM');
});