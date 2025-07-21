#!/usr/bin/env node
import { spawn } from 'child_process';

// Use the tsx command directly with environment variables to help with ESM resolution
const server = spawn('tsx', ['--experimental-loader', 'tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--loader=tsx/esm',
    TSX_EXPERIMENTAL_LOADER: '1'
  }
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});