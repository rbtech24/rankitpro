#!/usr/bin/env node

/**
 * Production build script for Rank It Pro
 * This script builds the application for deployment on Render.com
 * avoiding all Vite plugin conflicts and dependency issues
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function buildProduction() {
  console.log('🔨 Building Rank It Pro for production deployment...');
  
  try {
    // Clean previous builds
    console.log('🧹 Cleaning previous builds...');
    if (fs.existsSync('./dist')) {
      fs.rmSync('./dist', { recursive: true, force: true });
    }
    fs.mkdirSync('./dist', { recursive: true });
    
    // Build client first
    console.log('📦 Building client application...');
    await execAsync('npx vite build --mode production');
    console.log('✅ Client build completed');
    
    // Build server with esbuild, excluding problematic dependencies
    console.log('🚀 Building server application...');
    await execAsync(`npx esbuild server/minimal-production.ts \
      --bundle \
      --outfile=dist/server.cjs \
      --platform=node \
      --format=cjs \
      --target=node18 \
      --define:process.env.NODE_ENV='"production"' \
      --external:bcrypt \
      --external:pg-native \
      --external:'*.node'`);
    console.log('✅ Server build completed');
    
    // Copy client assets
    console.log('📁 Copying client assets...');
    if (fs.existsSync('./client/dist')) {
      fs.cpSync('./client/dist', './dist', { recursive: true });
      console.log('✅ Client assets copied');
    } else {
      throw new Error('Client build directory not found');
    }
    
    // Create index.js wrapper
    console.log('🔧 Creating production entry point...');
    const indexJs = `
// Production entry point for Rank It Pro
// This wrapper ensures proper CommonJS compatibility
const path = require('path');

// Set global __dirname for compatibility
global.__dirname = __dirname;

// Load the compiled server
require('./server.cjs');
`;
    
    fs.writeFileSync('./dist/index.cjs', indexJs.trim());
    console.log('✅ Production entry point created');
    
    // Build verification
    console.log('🔍 Verifying build...');
    const stats = {
      server: fs.statSync('./dist/server.cjs').size,
      client: fs.existsSync('./dist/index.html') ? 'Ready' : 'Missing',
      assets: fs.readdirSync('./dist').filter(f => f.endsWith('.css') || f.endsWith('.js')).length
    };
    
    console.log('📊 Build completed successfully!');
    console.log(`  - Server: ${(stats.server / 1024 / 1024).toFixed(1)}MB`);
    console.log(`  - Client: ${stats.client}`);
    console.log(`  - Assets: ${stats.assets} files`);
    console.log('🚀 Ready for deployment!');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildProduction();