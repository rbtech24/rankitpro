#!/usr/bin/env node

// Kill any existing server on port 5000
const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Try to kill existing process on port 5000
  execSync('fuser -k 5000/tcp', { stdio: 'ignore' });
  console.log('✅ Cleared port 5000');
} catch (error) {
  // Port was already free
}

// Start the development server
console.log('🚀 Starting Rank It Pro Development Server...');

// Use the server/index.js file if it exists, otherwise use simple-server.js
const serverFile = fs.existsSync('./server/index.js') ? './server/index.js' : './simple-server.js';
console.log(`📡 Using server file: ${serverFile}`);

// Start the server
require(serverFile);