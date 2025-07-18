#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting Render.com deployment build...');

let packageJsonBackup = null;

try {
  // Step 1: Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Step 2: Backup original package.json
  console.log('📦 Backing up original package.json...');
  if (fs.existsSync('package.json')) {
    packageJsonBackup = fs.readFileSync('package.json', 'utf8');
  }

  // Step 3: Replace package.json with production version
  console.log('🔧 Switching to production package.json...');
  if (fs.existsSync('package.production.json')) {
    const productionPackage = fs.readFileSync('package.production.json', 'utf8');
    fs.writeFileSync('package.json', productionPackage);
  }

  // Step 4: Set NODE_ENV to production
  process.env.NODE_ENV = 'production';

  // Step 5: Build client with production vite config (correct syntax for Render)
  console.log('🏗️ Building client with production config...');
  execSync('npx vite build --config vite.config.production.ts --mode production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Step 6: Build server with ES module format for Render
  console.log('🏗️ Building server with ES module format...');
  execSync(`npx esbuild server/index.ts --platform=node --outfile=dist/server.js --bundle --format=esm --target=node18 --external:pg-native --external:bcrypt --external:@babel/core --external:lightningcss --external:typescript --external:@babel/preset-typescript --external:@swc/core --external:esbuild --external:*.node --external:fs --external:path --external:os --external:crypto --external:util --external:stream --external:http --external:https --external:url --external:querystring --external:zlib --external:events --external:buffer --external:net --external:tls --external:child_process --external:cluster --external:dns --external:readline --external:repl --external:tty --external:vm --external:worker_threads`, { 
    stdio: 'inherit' 
  });

  // Step 7: Create production start script for Render
  console.log('📝 Creating production start script...');
  const startScript = `#!/usr/bin/env node
// Production server entry point for Render.com
import './server.js';
`;
  fs.writeFileSync('dist/start.js', startScript);

  // Step 8: Create production package.json in dist
  console.log('📦 Creating production package.json...');
  const distPackageJson = {
    "name": "workspace-production",
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
  fs.writeFileSync('dist/package.json', JSON.stringify(distPackageJson, null, 2));

  console.log('✅ Render.com deployment build completed successfully!');
  console.log('📁 Built files are in the /dist directory');
  console.log('🚀 To start the production server: cd dist && node server.js');
  
} catch (error) {
  console.error('❌ Deployment build failed:', error.message);
  
  // Restore original package.json on failure
  if (packageJsonBackup) {
    console.log('🔄 Restoring original package.json...');
    fs.writeFileSync('package.json', packageJsonBackup);
  }
  
  process.exit(1);
} finally {
  // Always restore original package.json after successful build
  if (packageJsonBackup) {
    console.log('🔄 Restoring original package.json...');
    fs.writeFileSync('package.json', packageJsonBackup);
  }
}