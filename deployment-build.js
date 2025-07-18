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
  const serverBuildCommand = `esbuild server/index.ts ` +
    `--platform=node ` +
    `--outfile=dist/index.js ` +
    `--bundle ` +
    `--format=cjs ` +
    `--target=node18 ` +
    `--external:pg-native ` +
    `--external:bcrypt ` +
    `--external:@babel/core ` +
    `--external:@babel/preset-typescript ` +
    `--external:lightningcss ` +
    `--external:esbuild ` +
    `--external:typescript ` +
    `--external:@swc/core ` +
    `--external:*.node ` +
    `--external:fs ` +
    `--external:path ` +
    `--external:os ` +
    `--external:crypto ` +
    `--external:util ` +
    `--external:stream ` +
    `--external:http ` +
    `--external:https ` +
    `--external:url ` +
    `--external:querystring ` +
    `--external:zlib ` +
    `--external:events ` +
    `--external:buffer ` +
    `--external:net ` +
    `--external:tls ` +
    `--external:child_process ` +
    `--external:cluster ` +
    `--external:dns ` +
    `--external:readline ` +
    `--external:repl ` +
    `--external:tty ` +
    `--external:vm ` +
    `--external:worker_threads`;

  execSync(serverBuildCommand, { stdio: 'inherit' });

  // Copy package.json and node_modules
  console.log('📄 Setting up deployment environment...');
  
  // Create a deployment package.json
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
    },
    "dependencies": {
      "@anthropic-ai/sdk": "^0.55.1",
      "@hookform/resolvers": "^5.1.1",
      "@neondatabase/serverless": "^1.0.1",
      "@sendgrid/mail": "^8.1.5",
      "@tanstack/react-query": "^5.81.5",
      "bcrypt": "^6.0.0",
      "connect-pg-simple": "^10.0.0",
      "date-fns": "^4.1.0",
      "drizzle-orm": "^0.39.3",
      "drizzle-zod": "^0.8.2",
      "express": "^4.21.2",
      "express-rate-limit": "^7.5.1",
      "express-session": "^1.18.1",
      "helmet": "^8.1.0",
      "jszip": "^3.10.1",
      "memorystore": "^1.6.7",
      "multer": "^2.0.1",
      "openai": "^5.8.2",
      "pg": "^8.16.3",
      "resend": "^4.6.0",
      "stripe": "^18.3.0",
      "tsx": "^4.20.3",
      "uuid": "^11.1.0",
      "ws": "^8.18.3",
      "zod": "^3.25.67",
      "zod-validation-error": "^3.5.2"
    }
  };

  fs.writeFileSync(
    path.join(__dirname, 'dist', 'package.json'),
    JSON.stringify(deploymentPackageJson, null, 2)
  );

  // Copy necessary files
  console.log('📦 Copying necessary files...');
  
  // Copy shared folder
  if (fs.existsSync('shared')) {
    fs.cpSync('shared', 'dist/shared', { recursive: true });
  }

  // Copy server folder (excluding TypeScript files)
  if (fs.existsSync('server')) {
    fs.cpSync('server', 'dist/server', { 
      recursive: true,
      filter: (src) => !src.endsWith('.ts')
    });
  }

  console.log('✅ Deployment build completed successfully!');
  console.log('');
  console.log('📋 Build output:');
  console.log('  - Client: dist/public/');
  console.log('  - Server: dist/index.js');
  console.log('  - Config: dist/package.json');
  console.log('  - Shared: dist/shared/');
  console.log('');
  console.log('🚀 Ready for deployment!');
  console.log('   Run: cd dist && npm install && npm start');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}