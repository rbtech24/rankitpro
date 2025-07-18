#!/usr/bin/env node

// FINAL RENDER.COM BUILD SCRIPT - This will work regardless of the command used
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 FINAL BUILD SCRIPT - Ending 7 hours of deployment issues...');

try {
  // Clean up
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  // Create dist directories
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('dist/public', { recursive: true });

  // Build client with the CORRECT command
  console.log('🏗️ Building client...');
  execSync('npx vite build --outDir dist/public --mode production', { stdio: 'inherit' });

  // Build server
  console.log('🏗️ Building server...');
  execSync('npx esbuild server/index.ts --platform=node --outfile=dist/server.js --bundle --format=cjs --target=node18 --external:pg-native --external:bcrypt --external:@babel/core --external:lightningcss --external:typescript --external:@swc/core --external:esbuild --external:*.node', { stdio: 'inherit' });

  // Create package.json
  const packageJson = {
    "name": "rankitpro",
    "version": "1.0.0",
    "main": "server.js",
    "scripts": { "start": "node server.js" },
    "engines": { "node": ">=18.0.0" }
  };
  fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

  console.log('✅ BUILD COMPLETE! Finally!');
  console.log('🚀 Use: cd dist && node server.js');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}