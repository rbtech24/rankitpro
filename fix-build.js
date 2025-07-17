#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

try {
  console.log('Starting fixed build process...');
  
  // Run client build from root directory (which works)
  console.log('Building client...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Run server build
  console.log('Building server...');
  execSync('npm run build:server', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}