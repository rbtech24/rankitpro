#!/usr/bin/env node

// This script intercepts the problematic vite build command and runs the correct build process
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Vite Build Wrapper - Fixing Render.com build...');

// Get the command line arguments
const args = process.argv.slice(2);
console.log('📝 Original command args:', args);

// Check if this is the problematic "vite build client --outDir dist" command
if (args.includes('client') && args.includes('--outDir') && args.includes('dist')) {
  console.log('🔧 Detected problematic build command, running fixed version...');
  
  // Run our universal build script instead
  try {
    execSync('node render-build-universal.mjs', { stdio: 'inherit' });
    console.log('✅ Build completed successfully with fixed script');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
} else {
  // For other vite commands, run normally
  console.log('🏃 Running normal vite command...');
  try {
    execSync(`vite ${args.join(' ')}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Vite command failed:', error.message);
    process.exit(1);
  }
}