#!/usr/bin/env node

// RENDER.COM DEPLOYMENT SCRIPT - No dependency issues
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 RENDER.COM DEPLOYMENT - Starting...');

try {
  // Clean build directory
  console.log('🧹 Cleaning build directory...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  // Create directories
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('dist/public', { recursive: true });

  // Build client
  console.log('🏗️ Building client...');
  execSync('npx vite build --outDir dist/public', { stdio: 'inherit' });

  // Build server
  console.log('🏗️ Building server...');
  execSync('npx esbuild server/index.ts --platform=node --outfile=dist/server.js --bundle --format=cjs --target=node18 --external:pg-native --external:bcrypt --external:@babel/core --external:lightningcss --external:typescript --external:@swc/core --external:esbuild --external:*.node', { stdio: 'inherit' });

  // Copy server to multiple locations
  console.log('📁 Copying server files...');
  fs.copyFileSync('dist/server.js', 'server.js');
  fs.copyFileSync('dist/server.js', 'index.js');

  // Create package.json in dist
  const packageJson = {
    "name": "rankitpro",
    "version": "1.0.0",
    "main": "server.js",
    "scripts": { "start": "node server.js" },
    "engines": { "node": ">=18.0.0" }
  };
  fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

  console.log('✅ BUILD COMPLETE!');
  console.log('📊 Files created:');
  console.log('  - dist/server.js');
  console.log('  - server.js');
  console.log('  - index.js');
  console.log('  - dist/package.json');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}