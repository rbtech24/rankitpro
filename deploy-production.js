#!/usr/bin/env node

/**
 * Complete Production Deployment Script
 * Fixes all ES module deployment issues:
 * 1. Removes "type": "module" from deployment package.json
 * 2. Changes server build format from ESM to CommonJS
 * 3. Creates deployment-specific package.json in dist folder
 * 4. Adds external dependencies to prevent bundling conflicts
 * 5. Updates run command to use CommonJS-compatible entry point
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting production deployment build process...');
console.log('');

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  console.log('✅ Previous build cleaned');

  // Build client (frontend)
  console.log('');
  console.log('📦 Building client (frontend)...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Client build completed');

  // Build server (backend) with CommonJS format
  console.log('');
  console.log('⚙️  Building server (backend) with CommonJS format...');
  
  const serverBuildCommand = [
    'npx esbuild server/index.ts',
    '--platform=node',
    '--outfile=dist/index.js',
    '--bundle',
    '--format=cjs',
    '--target=node18',
    '--external:pg-native',
    '--external:bcrypt',
    '--external:@babel/core',
    '--external:lightningcss',
    '--external:typescript',
    '--external:@babel/preset-typescript',
    '--external:@swc/core',
    '--external:esbuild',
    '--external:*.node',
    '--external:fs',
    '--external:path',
    '--external:os',
    '--external:crypto',
    '--external:util',
    '--external:stream',
    '--external:http',
    '--external:https',
    '--external:url',
    '--external:querystring',
    '--external:zlib',
    '--external:events',
    '--external:buffer',
    '--external:net',
    '--external:tls',
    '--external:child_process',
    '--external:cluster',
    '--external:dns',
    '--external:readline',
    '--external:repl',
    '--external:tty',
    '--external:vm',
    '--external:worker_threads'
  ].join(' ');

  execSync(serverBuildCommand, { stdio: 'inherit' });
  console.log('✅ Server build completed (CommonJS format)');

  // Create deployment-specific package.json (CommonJS)
  console.log('');
  console.log('📄 Creating deployment-specific package.json...');
  
  const deploymentPackageJson = {
    "name": "workspace-production",
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
      "@hookform/resolvers": "^5.1.1",
      "@neondatabase/serverless": "^1.0.1",
      "@sendgrid/mail": "^8.1.5",
      "@tanstack/react-query": "^5.81.5",
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
      "openai": "^5.8.2",
      "pg": "^8.16.3",
      "resend": "^4.6.0",
      "stripe": "^18.3.0",
      "uuid": "^11.1.0",
      "ws": "^8.18.3",
      "zod": "^3.25.67",
      "zod-validation-error": "^3.5.2"
    }
  };

  fs.writeFileSync(
    path.join('dist', 'package.json'),
    JSON.stringify(deploymentPackageJson, null, 2)
  );
  console.log('✅ Deployment package.json created (type: "commonjs")');

  // Create CommonJS compatibility wrapper
  console.log('');
  console.log('🔧 Creating CommonJS compatibility wrapper...');
  
  const compatibilityWrapper = `/**
 * CommonJS Compatibility Wrapper for Production Deployment
 * Ensures all imports work correctly in CommonJS environment
 */

const path = require('path');
const fs = require('fs');

// Set up CommonJS-compatible __dirname and __filename
global.__dirname = __dirname;
global.__filename = __filename;

// Load main application
require('./index.js');
`;

  fs.writeFileSync(path.join('dist', 'start.js'), compatibilityWrapper);
  console.log('✅ CommonJS compatibility wrapper created');

  // Update .replit configuration for deployment
  console.log('');
  console.log('🔄 Updating .replit configuration...');
  
  const replitConfig = fs.readFileSync('.replit', 'utf8');
  const updatedConfig = replitConfig.replace(
    /run = \["npm", "run", "start"\]/,
    'run = ["node", "dist/start.js"]'
  );
  
  fs.writeFileSync('.replit.deploy', updatedConfig);
  console.log('✅ Deployment configuration updated');

  // Verify build output
  console.log('');
  console.log('🔍 Verifying build output...');
  
  const distStats = fs.statSync('dist/index.js');
  const clientStats = fs.statSync('dist/public/index.html');
  
  console.log(`✅ Server bundle: ${(distStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`✅ Client files: ${fs.readdirSync('dist/public').length} files`);

  console.log('');
  console.log('🎉 ===== DEPLOYMENT BUILD COMPLETED SUCCESSFULLY! =====');
  console.log('');
  console.log('📂 Generated files:');
  console.log('   - dist/index.js (server - CommonJS format)');
  console.log('   - dist/start.js (CommonJS compatibility wrapper)');
  console.log('   - dist/package.json (deployment config with "type": "commonjs")');
  console.log('   - dist/public/ (client assets)');
  console.log('   - .replit.deploy (deployment configuration)');
  console.log('');
  console.log('✅ All suggested fixes applied:');
  console.log('   ✓ Removed "type": "module" from deployment package.json');
  console.log('   ✓ Changed server build format from ESM to CommonJS');
  console.log('   ✓ Created deployment-specific package.json in dist folder');
  console.log('   ✓ Added external dependencies to prevent bundling conflicts');
  console.log('   ✓ Updated run command to use CommonJS-compatible entry point');
  console.log('');
  console.log('🚀 READY FOR DEPLOYMENT!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Deploy the dist/ directory to your hosting provider');
  console.log('   2. Run: cd dist && npm install');
  console.log('   3. Start: npm start');
  console.log('');
  console.log('💡 For Replit deployment:');
  console.log('   - Use .replit.deploy as your deployment configuration');
  console.log('   - Or manually set run command to: node dist/start.js');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}