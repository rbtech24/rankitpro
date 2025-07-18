#!/usr/bin/env node

// This is a tsx replacement that runs our working server
// It's designed to be executable and replace the missing tsx command

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 TSX replacement: Starting Rank It Pro server...');

// Kill any existing server process
try {
  const { execSync } = require('child_process');
  execSync('pkill -f "node.*server" || true', { stdio: 'ignore' });
} catch (error) {
  // Ignore errors
}

// Determine which server file to use
let serverFile = './server/index.js';
if (!fs.existsSync(serverFile)) {
  serverFile = './simple-server.js';
}

if (!fs.existsSync(serverFile)) {
  console.error('❌ No server file found');
  process.exit(1);
}

console.log(`📡 Using server: ${serverFile}`);

// Start the server
const server = spawn('node', [serverFile], {
  stdio: 'inherit',
  env: { ...process.env, PORT: process.env.PORT || 5000 }
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📛 Shutting down...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n📛 Shutting down...');
  server.kill('SIGTERM');
});