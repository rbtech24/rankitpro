#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building production deployment with fixed CommonJS compatibility...');
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
  
  // Build server with production-server.ts (no Vite dependencies)
  console.log('🔧 Building production server with CommonJS format...');
  console.log('   - Using production-server.ts (no Vite dependencies)');
  console.log('   - Converting ESM to CommonJS');
  console.log('   - Externalizing all Node.js built-in modules');
  
  const serverBuildCmd = `npx esbuild server/production-server.ts --platform=node --outfile=dist/index.js --bundle \
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
  
  // Create deployment package.json (CommonJS format)
  console.log('📄 Creating deployment package.json...');
  const distPackageJson = {
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
      "express": "^4.21.2",
      "express-rate-limit": "^7.5.1",
      "express-session": "^1.18.1",
      "helmet": "^8.1.0",
      "bcrypt": "^6.0.0",
      "pg": "^8.16.3",
      "drizzle-orm": "^0.39.3",
      "zod": "^3.25.67",
      "zod-validation-error": "^3.5.2",
      "date-fns": "^4.1.0",
      "uuid": "^11.1.0",
      "ws": "^8.18.3",
      "stripe": "^18.3.0",
      "openai": "^5.8.2",
      "@anthropic-ai/sdk": "^0.55.1",
      "resend": "^4.6.0",
      "@sendgrid/mail": "^8.1.5",
      "multer": "^2.0.1",
      "jszip": "^3.10.1",
      "memorystore": "^1.6.7",
      "connect-pg-simple": "^10.0.0",
      "@neondatabase/serverless": "^1.0.1"
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(distPackageJson, null, 2));
  
  console.log('');
  console.log('✅ Production deployment build completed successfully!');
  console.log('');
  console.log('📂 Generated files:');
  console.log('  - dist/index.js (production server - CommonJS format)');
  console.log('  - dist/package.json (deployment config with dependencies)');
  console.log('  - dist/public/ (client assets)');
  console.log('');
  console.log('🚀 Ready for deployment!');
  console.log('');
  console.log('💡 Deployment fixes applied:');
  console.log('   ✓ Used production-server.ts (no Vite dependencies)');
  console.log('   ✓ Changed server build format from ESM to CommonJS');
  console.log('   ✓ Externalized all Node.js built-in modules');
  console.log('   ✓ Created deployment-specific package.json with "type": "commonjs"');
  console.log('   ✓ Included all required dependencies in package.json');
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Install dependencies: cd dist && npm install');
  console.log('   2. Start the server: npm start');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}