#!/usr/bin/env node

import { build } from 'esbuild';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Production build should exclude all development dependencies and problematic modules
const productionExternals = [
  // Core externals that should never be bundled
  'pg-native',
  'bcrypt',
  'esbuild',
  
  // Vite and build tools (development only)
  'vite',
  '@vitejs/plugin-react',
  '@replit/vite-plugin-runtime-error-modal',
  
  // Problematic bundling dependencies
  '@babel/preset-typescript/package.json',
  '@babel/preset-typescript',
  '@babel/core',
  '../pkg',
  'lightningcss',
  'lightningcss-linux-x64-gnu',
  'lightningcss-linux-x64-musl',
  'fsevents',
  'node-gyp',
  'node-addon-api',
  '@swc/core',
  '*.node',
  
  // TypeScript and development tools
  'typescript',
  'tsx',
  '@types/*',
  
  // All package.json dependencies (they should be installed on target)
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
];

// Define which modules should be allowed to be bundled (internal code only)
const allowedModules = [
  './server/**',
  './shared/**',
  './client/**',
];

try {
  await build({
    entryPoints: ['server/production-index.ts'],
    bundle: true,
    outfile: 'dist/index.cjs',
    platform: 'node',
    format: 'cjs', // Use CommonJS format to avoid dynamic import issues
    external: productionExternals,
    minify: false,
    sourcemap: false,
    target: 'node18',
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    banner: {
      js: '// Production build - excludes development dependencies'
    },
    // Handle CommonJS and ESM compatibility
    mainFields: ['main', 'module'],
    conditions: ['node'],
  });
  
  console.log('✓ Server build completed successfully');
  console.log('✓ Production externals properly excluded');
} catch (error) {
  console.error('❌ Server build failed:', error);
  process.exit(1);
}