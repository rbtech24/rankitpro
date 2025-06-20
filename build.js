#!/usr/bin/env node

// Production build script for Render.com deployment
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

console.log('🚀 Starting production build for Render.com...');

try {
  // Ensure dist directory exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }

  // Build client-side application
  console.log('📦 Building client application...');
  execSync('npm run build:client', { stdio: 'inherit' });

  // Compile TypeScript server code
  console.log('🔧 Compiling server code...');
  execSync('npx tsc --project tsconfig.server.json', { stdio: 'inherit' });

  console.log('✅ Production build completed successfully!');
  console.log('📁 Build output available in dist/ directory');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}