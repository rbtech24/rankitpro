#!/usr/bin/env node

import { build } from 'esbuild';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

const externals = [
  'pg-native',
  'bcrypt',
  '@babel/preset-typescript/package.json',
  '../pkg',
  'lightningcss',
  'esbuild',
  'vite',
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
];

try {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    outfile: 'dist/index.js',
    platform: 'node',
    format: 'esm',
    external: externals,
    minify: false,
    sourcemap: false,
    target: 'node18',
  });
  
  console.log('✓ Server build completed successfully');
} catch (error) {
  console.error('❌ Server build failed:', error);
  process.exit(1);
}