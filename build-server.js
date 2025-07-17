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
  
  // Problematic bundling dependencies that cause deployment failures
  '@babel/preset-typescript/package.json',
  '@babel/preset-typescript',
  '@babel/core',
  '@babel/runtime',
  '../pkg',
  'lightningcss',
  'lightningcss-linux-x64-gnu',
  'lightningcss-linux-x64-musl',
  'lightningcss-darwin-x64',
  'lightningcss-win32-x64-msvc',
  'fsevents',
  'node-gyp',
  'node-addon-api',
  '@swc/core',
  '@swc/helpers',
  '*.node',
  
  // Rollup and build tool externals
  '@rollup/rollup-linux-x64-gnu',
  '@rollup/rollup-darwin-x64',
  '@rollup/rollup-win32-x64-msvc',
  'rollup',
  
  // TypeScript and development tools
  'typescript',
  'tsx',
  '@types/*',
  
  // Runtime dependencies that should be available in production
  'react',
  'react-dom',
  '@tanstack/react-query',
  'express',
  'pg',
  'drizzle-orm',
  '@neondatabase/serverless',
  'bcrypt',
  'express-session',
  'zod',
  'stripe',
  'openai',
  '@anthropic-ai/sdk',
  'resend',
  '@sendgrid/mail',
  'ws',
  'helmet',
  'express-rate-limit',
  'connect-pg-simple',
  'memorystore',
  'uuid',
  'multer',
  'jszip',
  'date-fns'
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
    minify: true,
    sourcemap: false,
    target: 'node18',
    splitting: false, // Disable code splitting for server builds
    treeShaking: true,
    define: {
      'process.env.NODE_ENV': '"production"',
      '__DEV__': 'false'
    },
    banner: {
      js: '// Production build - excludes development dependencies and problematic bundling modules'
    },
    // Handle CommonJS and ESM compatibility
    mainFields: ['main', 'module'],
    conditions: ['node'],
    // Resolve configuration to handle module resolution
    resolveExtensions: ['.ts', '.js', '.json'],
    // Loader configuration for different file types
    loader: {
      '.ts': 'ts',
      '.js': 'js',
      '.json': 'json'
    },
    // Ignore problematic dependencies during bundling
    plugins: [{
      name: 'ignore-problematic-deps',
      setup(build) {
        // Ignore problematic Babel and CSS dependencies
        build.onResolve({ filter: /@babel\/preset-typescript/ }, () => ({ path: 'external', external: true }));
        build.onResolve({ filter: /lightningcss/ }, () => ({ path: 'external', external: true }));
        build.onResolve({ filter: /\.node$/ }, () => ({ path: 'external', external: true }));
        build.onResolve({ filter: /^@rollup/ }, () => ({ path: 'external', external: true }));
      }
    }]
  });
  
  console.log('✓ Server build completed successfully');
  console.log('✓ Production externals properly excluded');
} catch (error) {
  console.error('❌ Server build failed:', error);
  process.exit(1);
}