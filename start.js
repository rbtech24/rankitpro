#!/usr/bin/env node

// Universal server starter - finds server.js anywhere
const fs = require('fs');
const path = require('path');

const possiblePaths = [
  './server.js',
  './dist/server.js',
  './index.js',
  path.join(__dirname, 'server.js'),
  path.join(__dirname, 'dist/server.js')
];

for (const serverPath of possiblePaths) {
  if (fs.existsSync(serverPath)) {
    console.log('🚀 Starting server from:', serverPath);
    require(serverPath);
    break;
  }
}

console.error('❌ No server.js found in any expected location');
process.exit(1);