#!/usr/bin/env node

// RENDER.COM BUILD SCRIPT - Works with any build command
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 RENDER.COM BUILD SCRIPT - Universal compatibility...');

try {
  // Clean up
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  // Create dist directories
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('dist/public', { recursive: true });

  // Build client
  console.log('🏗️ Building client...');
  execSync('npx vite build --outDir dist/public', { stdio: 'inherit' });

  // Build server
  console.log('🏗️ Building server...');
  execSync('npx esbuild server/index.ts --platform=node --outfile=dist/server.js --bundle --format=cjs --target=node18 --external:pg-native --external:bcrypt --external:@babel/core --external:lightningcss --external:typescript --external:@swc/core --external:esbuild --external:*.node', { stdio: 'inherit' });

  // Copy server.js to all possible locations
  execSync('cp dist/server.js server.js', { stdio: 'inherit' });
  execSync('cp dist/server.js index.js', { stdio: 'inherit' });

  // Create package.json
  const packageJson = {
    "name": "rankitpro",
    "version": "1.0.0",
    "main": "server.js",
    "scripts": { "start": "node server.js" },
    "engines": { "node": ">=18.0.0" }
  };
  fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

  console.log('✅ BUILD COMPLETE!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}