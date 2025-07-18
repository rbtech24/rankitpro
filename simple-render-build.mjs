#!/usr/bin/env node

// Simple build script for Render.com that handles the current build command structure
import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Simple Render.com build starting...');

try {
  // Since Render is using the old build command, we need to work with it
  // The old command structure: npx vite build client --outDir dist
  // We need to modify it to work correctly

  // Clean up
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Create dist directory
  fs.mkdirSync('dist', { recursive: true });

  // Build using the correct vite command structure
  console.log('🏗️ Building client with correct command...');
  execSync('npx vite build --config vite.config.production.ts', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}