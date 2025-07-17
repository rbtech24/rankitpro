#!/usr/bin/env node

// Production start script that ensures correct file is used
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting Rank It Pro production server...');

// Check if the correct production file exists
const prodFile = path.join(__dirname, 'dist', 'index.cjs');
if (!fs.existsSync(prodFile)) {
  console.error('❌ Production file not found at:', prodFile);
  process.exit(1);
}

console.log('✅ Production file found:', prodFile);

// Start the production server
try {
  execSync('node dist/index.cjs', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to start production server:', error.message);
  process.exit(1);
}