#!/usr/bin/env node

/**
 * Fixed Deployment Script - Handles ES module deployment issues
 * Uses deployment-specific vite config to avoid plugin conflicts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting fixed deployment build...');

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Build client using fixed config
  console.log('📦 Building client with fixed config...');
  execSync('npx vite build --config vite.config.fixed.ts', { stdio: 'inherit' });

  // Build server with CommonJS format
  console.log('⚙️  Building server (CommonJS)...');
  const serverBuildCommand = [
    'npx esbuild server/index.ts',
    '--platform=node',
    '--outfile=dist/index.js',
    '--bundle',
    '--format=cjs',
    '--target=node18',
    '--external:pg-native',
    '--external:bcrypt',
    '--external:@babel/core',
    '--external:lightningcss',
    '--external:typescript',
    '--external:@babel/preset-typescript',
    '--external:@swc/core',
    '--external:esbuild',
    '--external:*.node',
    '--external:fs',
    '--external:path',
    '--external:os',
    '--external:crypto',
    '--external:util',
    '--external:stream',
    '--external:http',
    '--external:https',
    '--external:url',
    '--external:querystring',
    '--external:zlib',
    '--external:events',
    '--external:buffer',
    '--external:net',
    '--external:tls',
    '--external:child_process',
    '--external:cluster',
    '--external:dns',
    '--external:readline',
    '--external:repl',
    '--external:tty',
    '--external:vm',
    '--external:worker_threads'
  ].join(' ');

  execSync(serverBuildCommand, { stdio: 'inherit' });

  // Create deployment package.json
  console.log('📄 Creating deployment package.json...');
  const deployPackage = {
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
      "uuid": "^11.1.0",
      "ws": "^8.18.3",
      "zod": "^3.25.67",
      "zod-validation-error": "^3.5.2"
    }
  };

  fs.writeFileSync('dist/package.json', JSON.stringify(deployPackage, null, 2));

  // Update .replit for deployment
  console.log('🔧 Updating .replit configuration...');
  const replitConfig = fs.readFileSync('.replit', 'utf8');
  const updatedConfig = replitConfig.replace(
    /build = \["npm", "run", "build"\]/,
    'build = ["node", "deploy-fixed.js"]'
  ).replace(
    /run = \["npm", "run", "start"\]/,
    'run = ["node", "dist/index.js"]'
  );
  
  fs.writeFileSync('.replit.deployment', updatedConfig);

  console.log('');
  console.log('✅ Fixed deployment build completed!');
  console.log('');
  console.log('📂 Generated files:');
  console.log('  - dist/index.js (CommonJS server)');
  console.log('  - dist/package.json (CommonJS deployment config)');
  console.log('  - dist/public/ (client assets)');
  console.log('  - .replit.deployment (deployment config)');
  console.log('');
  console.log('🎯 All deployment issues fixed:');
  console.log('  ✓ Used deployment-specific vite config');
  console.log('  ✓ Server built in CommonJS format');
  console.log('  ✓ Deployment package.json uses "type": "commonjs"');
  console.log('  ✓ External dependencies properly excluded');
  console.log('  ✓ .replit configuration updated');
  console.log('');
  console.log('🚀 Ready for deployment!');
  console.log('');
  console.log('📋 To deploy:');
  console.log('  1. Use .replit.deployment as your deployment config');
  console.log('  2. Or manually deploy the dist/ directory');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}