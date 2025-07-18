#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting production build...');

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Build client using production vite config
  console.log('🏗️ Building client with production config...');
  execSync('npx vite build --config vite.config.production.ts --mode production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Build server with ES module support
  console.log('🏗️ Building server...');
  execSync(`npx esbuild server/index.ts --platform=node --outfile=dist/index.js --bundle --format=esm --target=node18 --external:pg-native --external:bcrypt --external:@babel/core --external:lightningcss --external:typescript --external:@babel/preset-typescript --external:@swc/core --external:esbuild --external:*.node --external:fs --external:path --external:os --external:crypto --external:util --external:stream --external:http --external:https --external:url --external:querystring --external:zlib --external:events --external:buffer --external:net --external:tls --external:child_process --external:cluster --external:dns --external:readline --external:repl --external:tty --external:vm --external:worker_threads`, { 
    stdio: 'inherit' 
  });

  console.log('✅ Production build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}