#!/usr/bin/env node

const { build } = require('esbuild');
const path = require('path');

async function buildServer() {
  try {
    const result = await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      outfile: 'dist/index.js',
      format: 'esm',
      external: [
        'pg-native',
        'bcrypt',
        '@babel/preset-typescript/package.json',
        '@babel/preset-typescript',
        'lightningcss',
        '../pkg',
        '@swc/core',
        'esbuild'
      ],
      minify: false,
      sourcemap: false,
      logLevel: 'info'
    });

    console.log('✅ Server build completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Server build failed:', error);
    process.exit(1);
  }
}

buildServer();