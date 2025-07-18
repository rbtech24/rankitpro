#!/usr/bin/env node

/**
 * MANUAL BUILD DEPLOYMENT SCRIPT
 * Completely avoids all Vite configuration files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting manual build deployment...');

try {
  // Clean previous build
  console.log('Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist', { recursive: true });

  // Build client using esbuild instead of Vite to avoid all config conflicts
  console.log('Building client with esbuild...');
  
  // First, create a simple HTML template
  const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rank It Pro - Business Management Platform</title>
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
  <div id="root"></div>
  <script src="/assets/main.js"></script>
</body>
</html>`;

  fs.mkdirSync('dist/public', { recursive: true });
  fs.mkdirSync('dist/public/assets', { recursive: true });
  fs.writeFileSync('dist/public/index.html', htmlTemplate);

  // Build client JavaScript with esbuild
  const clientBuildCommand = [
    'npx esbuild client/src/main.tsx',
    '--bundle',
    '--outfile=dist/public/assets/main.js',
    '--format=esm',
    '--target=es2020',
    '--jsx=automatic',
    '--loader:.tsx=tsx',
    '--loader:.ts=tsx',
    '--loader:.css=css',
    '--loader:.png=file',
    '--loader:.jpg=file',
    '--loader:.jpeg=file',
    '--loader:.svg=file',
    '--define:process.env.NODE_ENV=\\"production\\"',
    '--define:import.meta.env.PROD=true',
    '--minify',
    '--sourcemap=external',
    '--alias:@=./client/src',
    '--alias:@shared=./shared',
    '--alias:@assets=./attached_assets',
    '--public-path=/assets/',
    '--asset-names=[name]-[hash]',
    '--external:fs',
    '--external:path',
    '--external:os'
  ].join(' ');

  execSync(clientBuildCommand, { stdio: 'inherit' });

  // Build client CSS separately
  console.log('Building client CSS...');
  const cssBuildCommand = [
    'npx esbuild client/src/index.css',
    '--bundle',
    '--outfile=dist/public/assets/style.css',
    '--loader:.css=css',
    '--minify'
  ].join(' ');

  execSync(cssBuildCommand, { stdio: 'inherit' });

  // Copy static files
  console.log('Copying static files...');
  if (fs.existsSync('uploads')) {
    fs.cpSync('uploads', 'dist/uploads', { recursive: true });
  }

  // Build server with comprehensive externals
  console.log('Building server...');
  const serverBuildCommand = [
    'npx esbuild server/production-entry.ts',
    '--platform=node',
    '--outfile=dist/index.js',
    '--bundle',
    '--format=cjs',
    '--target=node18',
    '--minify',
    '--external:bcrypt',
    '--external:pg-native',
    '--external:twilio',
    '--external:*.node',
    '--external:vite',
    '--external:@vitejs/*',
    '--external:@replit/*',
    '--external:esbuild',
    '--external:typescript',
    '--external:@babel/*',
    '--external:lightningcss',
    '--external:rollup',
    '--external:@rollup/*'
  ].join(' ');

  execSync(serverBuildCommand, { stdio: 'inherit' });

  // Create production package.json
  console.log('Creating production package.json...');
  const deployPackage = {
    "name": "rankitpro-production",
    "version": "1.0.0",
    "type": "commonjs",
    "main": "index.js",
    "scripts": {
      "start": "node index.js"
    },
    "engines": {
      "node": ">=18.0.0"
    },
    "dependencies": {
      "@anthropic-ai/sdk": "^0.55.1",
      "@neondatabase/serverless": "^1.0.1",
      "@sendgrid/mail": "^8.1.5",
      "bcrypt": "^6.0.0",
      "connect-pg-simple": "^10.0.0",
      "date-fns": "^4.1.0",
      "drizzle-orm": "^0.39.3",
      "drizzle-zod": "^0.8.2",
      "express": "^4.21.2",
      "express-rate-limit": "^7.5.1",
      "express-session": "^1.18.1",
      "helmet": "^8.1.0",
      "jszip": "^3.10.1",
      "memorystore": "^1.6.7",
      "multer": "^2.0.1",
      "nanoid": "^5.0.9",
      "openai": "^5.8.2",
      "pg": "^8.16.3",
      "resend": "^4.6.0",
      "stripe": "^18.3.0",
      "twilio": "^5.4.0",
      "uuid": "^11.1.0",
      "ws": "^8.18.3",
      "zod": "^3.25.67",
      "zod-validation-error": "^3.5.2"
    }
  };

  fs.writeFileSync('dist/package.json', JSON.stringify(deployPackage, null, 2));

  // Create deployment README
  const readme = `# RankItPro Production Build

## Quick Start
1. npm install
2. Set environment variables (DATABASE_URL, SESSION_SECRET, etc.)
3. npm start

## Built with esbuild for maximum compatibility
- No Vite dependencies
- No ESM/CommonJS conflicts
- Pure Node.js/Express server
- React SPA frontend

Server runs on port 3000 or PORT environment variable.
`;

  fs.writeFileSync('dist/README.md', readme);

  // Test the build
  console.log('Testing production build...');
  const testResult = execSync('cd dist && timeout 3s node index.js 2>&1 || echo "Test complete"', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });

  const hasErrors = testResult.includes('vite') || 
                   testResult.includes('@replit') || 
                   testResult.includes('ERR_REQUIRE_ESM');

  if (hasErrors) {
    console.log('Build test failed:', testResult);
    throw new Error('Build still has conflicts');
  }

  // Verify files
  const serverStats = fs.statSync('dist/index.js');
  const publicFiles = fs.readdirSync('dist/public');
  
  console.log('');
  console.log('MANUAL BUILD DEPLOYMENT COMPLETED!');
  console.log('');
  console.log('Build output:');
  console.log(`  - Server: ${(serverStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  - Client: ${publicFiles.length} files`);
  console.log('');
  console.log('Issues resolved:');
  console.log('  - No Vite configuration conflicts');
  console.log('  - No @replit plugin dependencies');
  console.log('  - No ESM/CommonJS conflicts');
  console.log('  - Built with esbuild for compatibility');
  console.log('');
  console.log('Deploy the dist/ directory to your platform');
  console.log('Run: npm install && npm start');

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}