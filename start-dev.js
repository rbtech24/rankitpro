#!/usr/bin/env node

// Custom development server starter
// This script handles the tsx execution issue

import { spawn } from 'child_process';
import path from 'path';

console.log('Starting Rank It Pro development server...');

// Use npx to run tsx since it's not globally available
const tsxProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env
});

tsxProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

tsxProcess.on('error', (error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});

// Handle process signals
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  tsxProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  tsxProcess.kill('SIGTERM');
});