#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting deployment build process...');

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Build client
  console.log('📦 Building client (frontend)...');
  execSync('npx vite build', { stdio: 'inherit' });

  // Build server with CommonJS format to avoid ES module issues
  console.log('⚙️  Building server (backend)...');
  const serverBuildCommand = `esbuild server/index.ts --platform=node --outfile=dist/index.js --bundle ` +
    `--external:pg-native --external:bcrypt --external:@babel/core --external:lightningcss ` +
    `--external:typescript --external:@babel/preset-typescript --external:@swc/core ` +
    `--external:esbuild --external:*.node ` +
    `--external:fs --external:path --external:os --external:crypto --external:util ` +
    `--external:stream --external:http --external:https --external:url --external:querystring ` +
    `--external:zlib --external:events --external:buffer --external:net --external:tls ` +
    `--external:child_process --external:cluster --external:dns --external:readline ` +
    `--external:repl --external:tty --external:vm --external:worker_threads ` +
    `--format=cjs --target=node18`;

  execSync(serverBuildCommand, { stdio: 'inherit' });

  // Create deployment-specific package.json for CommonJS
  console.log('📄 Creating deployment package.json...');
  const deploymentPackageJson = {
    "name": "workspace-production",
    "version": "1.0.0",
    "type": "commonjs",
    "main": "index.js",
    "scripts": {
      "start": "node index.js"
    },
    "engines": {
      "node": ">=18.0.0"
    }
  };

  fs.writeFileSync(
    path.join(__dirname, 'dist', 'package.json'),
    JSON.stringify(deploymentPackageJson, null, 2)
  );

  console.log('✅ Deployment build completed successfully!');
  console.log('');
  console.log('📋 Build output:');
  console.log('  - Client: dist/public/');
  console.log('  - Server: dist/index.js');
  console.log('  - Config: dist/package.json');
  console.log('');
  console.log('🚀 Ready for deployment!');
  console.log('   Run: cd dist && npm start');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}