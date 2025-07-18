#!/usr/bin/env node

// Universal build script that handles all Render.com deployment scenarios
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Universal Render.com build starting...');

let packageJsonBackup = null;

try {
  // Step 1: Clean previous build
  console.log('🧹 Cleaning build directory...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('dist/public', { recursive: true });

  // Step 2: Handle package.json for ES modules
  console.log('📦 Configuring ES modules...');
  if (fs.existsSync('package.json')) {
    packageJsonBackup = fs.readFileSync('package.json', 'utf8');
    
    // Create temporary ES module package.json
    const currentPackage = JSON.parse(packageJsonBackup);
    currentPackage.type = 'module';
    fs.writeFileSync('package.json', JSON.stringify(currentPackage, null, 2));
  }

  // Step 3: Build client using production config
  console.log('🏗️ Building client application...');
  const clientBuildCommand = 'npx vite build --config vite.config.production.ts --mode production';
  execSync(clientBuildCommand, { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Step 4: Build server
  console.log('🏗️ Building server application...');
  const serverBuildCommand = `npx esbuild server/index.ts --platform=node --outfile=dist/server.js --bundle --format=esm --target=node18 --external:pg-native --external:bcrypt --external:@babel/core --external:lightningcss --external:typescript --external:@babel/preset-typescript --external:@swc/core --external:esbuild --external:*.node --external:fs --external:path --external:os --external:crypto --external:util --external:stream --external:http --external:https --external:url --external:querystring --external:zlib --external:events --external:buffer --external:net --external:tls --external:child_process --external:cluster --external:dns --external:readline --external:repl --external:tty --external:vm --external:worker_threads`;
  
  execSync(serverBuildCommand, { stdio: 'inherit' });

  // Step 5: Create production package.json in dist
  console.log('📦 Creating production package.json...');
  const productionPackage = {
    "name": "rankitpro-production",
    "version": "1.0.0",
    "type": "module",
    "main": "server.js",
    "scripts": {
      "start": "node server.js"
    },
    "engines": {
      "node": ">=18.0.0"
    }
  };
  fs.writeFileSync('dist/package.json', JSON.stringify(productionPackage, null, 2));

  // Step 6: Verify build output
  console.log('🔍 Verifying build output...');
  const distContents = fs.readdirSync('dist');
  const publicContents = fs.readdirSync('dist/public');
  
  console.log('📁 Dist contents:', distContents);
  console.log('📁 Public contents:', publicContents.slice(0, 5), '...');

  console.log('✅ Universal build completed successfully!');
  console.log('🚀 Ready to start with: cd dist && node server.js');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
} finally {
  // Always restore original package.json
  if (packageJsonBackup) {
    console.log('🔄 Restoring original package.json...');
    fs.writeFileSync('package.json', packageJsonBackup);
  }
}