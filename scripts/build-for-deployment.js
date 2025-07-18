#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building for deployment with CommonJS compatibility...');
console.log('');

try {
  // Clean the dist directory
  console.log('🧹 Cleaning dist directory...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  // Build client with production settings
  console.log('📦 Building client for production...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Build server with CommonJS format and comprehensive externals
  console.log('🔧 Building server with CommonJS format...');
  console.log('   - Converting ESM to CommonJS');
  console.log('   - Externalizing Node.js built-in modules');
  console.log('   - Handling all dependencies properly');
  
  const serverBuildCmd = `npx esbuild server/index.ts --platform=node --outfile=dist/index.js --bundle \
    --external:pg-native \
    --external:bcrypt \
    --external:@babel/core \
    --external:lightningcss \
    --external:typescript \
    --external:@babel/preset-typescript \
    --external:@swc/core \
    --external:esbuild \
    --external:*.node \
    --external:path \
    --external:fs \
    --external:http \
    --external:https \
    --external:url \
    --external:stream \
    --external:util \
    --external:crypto \
    --external:os \
    --external:querystring \
    --external:zlib \
    --external:buffer \
    --external:events \
    --external:child_process \
    --external:cluster \
    --external:dgram \
    --external:dns \
    --external:net \
    --external:tls \
    --external:readline \
    --external:repl \
    --external:vm \
    --external:worker_threads \
    --external:vite \
    --external:@vitejs/plugin-react \
    --external:@replit/vite-plugin-runtime-error-modal \
    --format=cjs \
    --target=node18`;
  
  execSync(serverBuildCmd, { stdio: 'inherit' });
  
  // Create CommonJS compatibility wrapper
  console.log('🔄 Creating CommonJS compatibility layer...');
  const starterScript = `// CommonJS compatibility layer for deployment
const path = require('path');
const { fileURLToPath } = require('url');

// Polyfill import.meta for CommonJS
global.import = global.import || {};
global.import.meta = global.import.meta || {};
global.import.meta.url = 'file://' + __filename;
global.import.meta.dirname = __dirname;

// Polyfill __dirname and __filename for compatibility
global.__dirname = __dirname;
global.__filename = __filename;

// Helper function for import.meta.url compatibility
global.fileURLToPath = (url) => {
  if (typeof url === 'string' && url.startsWith('file://')) {
    return url.slice(7);
  }
  return url;
};

// Helper function for path.dirname compatibility
global.fileURLToPathDirname = (p) => {
  return path.dirname(fileURLToPath(p));
};

// Now require the main server file
console.log('Starting server with CommonJS compatibility fixes...');
require('./index.js');
`;
  
  fs.writeFileSync('dist/server-start.cjs', starterScript);
  
  // Create deployment package.json (CommonJS format)
  console.log('📄 Creating deployment package.json...');
  const distPackageJson = {
    "name": "workspace-production",
    "version": "1.0.0",
    "type": "commonjs",
    "main": "server-start.cjs",
    "scripts": {
      "start": "node server-start.cjs"
    },
    "engines": {
      "node": ">=18.0.0"
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(distPackageJson, null, 2));
  
  console.log('');
  console.log('✅ Deployment build completed successfully!');
  console.log('');
  console.log('📂 Generated files:');
  console.log('  - dist/index.js (server - CommonJS format)');
  console.log('  - dist/server-start.cjs (CommonJS compatibility layer)');
  console.log('  - dist/package.json (deployment config with type: "commonjs")');
  console.log('  - dist/public/ (client assets)');
  console.log('');
  console.log('🚀 Ready for deployment!');
  console.log('');
  console.log('💡 Deployment fixes applied:');
  console.log('   ✓ Changed server build format from ESM to CommonJS');
  console.log('   ✓ Externalized all Node.js built-in modules');
  console.log('   ✓ Created deployment-specific package.json with "type": "commonjs"');
  console.log('   ✓ Added CommonJS compatibility layer for import.meta usage');
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Install dependencies: cd dist && npm install');
  console.log('   2. Start the server: npm start');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}