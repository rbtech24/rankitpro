#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Set the environment variable for keeping dev dependencies
process.env.REPLIT_KEEP_PACKAGE_DEV_DEPENDENCIES = '1';

try {
  console.log('🚀 Starting deployment with ESM fixes...');
  
  // Clean the dist directory
  console.log('🧹 Cleaning dist directory...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  // Build client
  console.log('📦 Building client...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Build server with CommonJS format and all Node.js externals
  console.log('🔧 Building server with CommonJS format...');
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
  
  // Copy the CommonJS starter to dist
  console.log('📄 Copying CommonJS starter to dist...');
  fs.copyFileSync('server-start.cjs', 'dist/server-start.cjs');
  
  // Create a proper package.json for the dist directory
  console.log('📄 Creating package.json for dist...');
  const distPackageJson = {
    "name": "workspace-dist",
    "version": "1.0.0",
    "type": "commonjs",
    "main": "server-start.cjs",
    "scripts": {
      "start": "node server-start.cjs"
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(distPackageJson, null, 2));
  
  console.log('✅ Deployment build completed successfully!');
  console.log('📂 Generated files:');
  console.log('  - dist/index.js (server - CommonJS format)');
  console.log('  - dist/public/ (client assets)');
  console.log('  - dist/package.json (deployment config)');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}