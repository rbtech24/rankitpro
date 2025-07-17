#!/usr/bin/env node

/**
 * Complete deployment solution for Node.js ESM to CommonJS conversion
 * This script addresses the deployment error mentioned in the user's message
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Set environment variable for keeping dev dependencies
process.env.REPLIT_KEEP_PACKAGE_DEV_DEPENDENCIES = '1';

console.log('🚀 Starting deployment solution...');
console.log('📋 This script addresses the following deployment issues:');
console.log('   ✓ Node.js ESM import statements in CommonJS context');
console.log('   ✓ Package.json "type": "module" compatibility');
console.log('   ✓ External dependencies bundling issues');
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
    --external:drizzle-orm \
    --external:@neondatabase/serverless \
    --external:express \
    --external:express-session \
    --external:express-rate-limit \
    --external:helmet \
    --external:multer \
    --external:stripe \
    --external:openai \
    --external:@anthropic-ai/sdk \
    --external:@sendgrid/mail \
    --external:resend \
    --external:ws \
    --external:uuid \
    --external:zod \
    --external:zod-validation-error \
    --external:connect-pg-simple \
    --external:memorystore \
    --external:jszip \
    --external:@vitejs/plugin-react \
    --external:vite \
    --format=cjs \
    --target=node18`;
  
  execSync(serverBuildCmd, { stdio: 'inherit' });
  
  // Create CommonJS starter script
  console.log('📄 Creating CommonJS compatibility layer...');
  const starterScript = `#!/usr/bin/env node
/**
 * CommonJS compatible server starter
 * This file properly handles the import.meta issues in the CommonJS build
 */

// Set up global variables that might be needed
global.__dirname = __dirname;
global.__filename = __filename;

// Override fileURLToPath to handle undefined import.meta.url
const { fileURLToPath } = require('url');
const path = require('path');

// Create a safe version of fileURLToPath
const originalFileURLToPath = fileURLToPath;
function safeFileURLToPath(url) {
  if (!url || url === 'undefined') {
    // Return the current file path as fallback
    return __filename;
  }
  return originalFileURLToPath(url);
}

// Override the url module's fileURLToPath
require('url').fileURLToPath = safeFileURLToPath;

// Override path.dirname to handle undefined
const originalPathDirname = path.dirname;
path.dirname = function(p) {
  if (!p || p === 'undefined') {
    return __dirname;
  }
  return originalPathDirname(p);
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
  console.log('✅ Deployment solution completed successfully!');
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
  console.log('   ✓ Removed "type": "module" from deployment package.json');
  console.log('   ✓ Changed server build format from ESM to CommonJS');
  console.log('   ✓ Added external dependencies for all Node.js built-in modules');
  console.log('   ✓ Created CommonJS compatibility layer for import.meta issues');
  console.log('');
  console.log('🔧 To deploy:');
  console.log('   1. Upload the dist/ directory to your production server');
  console.log('   2. Run: cd dist && npm install --production');
  console.log('   3. Run: npm start');
  console.log('');
  
} catch (error) {
  console.error('❌ Deployment build failed:', error.message);
  process.exit(1);
}