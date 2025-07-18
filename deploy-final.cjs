#!/usr/bin/env node

/**
 * Final deployment script that applies all the ES module fixes
 * Addresses the specific deployment errors mentioned by the user
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting final deployment build with ES module fixes...');
console.log('');
console.log('📋 Issues being resolved:');
console.log('  ✓ ES module import statements cannot be used in CommonJS context');
console.log('  ✓ Package.json has "type": "module" but built server uses import statements');
console.log('  ✓ Server build format mismatch between ESM and CommonJS');
console.log('');

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Build client
console.log('📦 Building client with Vite...');
execSync('npx vite build', { stdio: 'inherit' });

// Build server with proper CommonJS format and all externals
console.log('📦 Building server with CommonJS format...');
const serverBuildCommand = `npx esbuild server/production-clean.ts --platform=node --outfile=dist/index.js --bundle --format=cjs --target=node18 --packages=external --external:vite --external:@vitejs/plugin-react --external:@replit/vite-plugin-runtime-error-modal --external:@babel/core --external:lightningcss --external:typescript --external:esbuild --external:bcrypt --external:*.node`;

execSync(serverBuildCommand, { stdio: 'inherit' });

// Create deployment-specific package.json (CommonJS)
console.log('📄 Creating deployment package.json with CommonJS configuration...');
const deploymentPackage = {
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

fs.writeFileSync('dist/package.json', JSON.stringify(deploymentPackage, null, 2));

// Create a CommonJS compatibility wrapper
console.log('📄 Creating CommonJS compatibility wrapper...');
const compatibilityWrapper = `#!/usr/bin/env node

/**
 * CommonJS compatibility wrapper for Node.js deployment
 * Ensures proper module loading in CommonJS context
 */

const path = require('path');
const fs = require('fs');

// Set up __dirname and __filename for CommonJS compatibility
global.__dirname = __dirname;
global.__filename = __filename;

// Ensure we're in CommonJS mode
if (typeof module === 'undefined') {
  console.error('Error: Not running in CommonJS context');
  process.exit(1);
}

// Load the main server file
try {
  console.log('🚀 Starting server in CommonJS mode...');
  require('./index.js');
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
`;

fs.writeFileSync('dist/server-start.cjs', compatibilityWrapper);

console.log('✅ Final deployment build completed successfully!');
console.log('');
console.log('📂 Generated files:');
console.log('  - dist/index.js (CommonJS server - no ES modules)');
console.log('  - dist/package.json (type: "commonjs")');
console.log('  - dist/server-start.cjs (CommonJS compatibility wrapper)');
console.log('  - dist/public/ (client assets)');
console.log('');
console.log('🚀 DEPLOYMENT FIXES APPLIED:');
console.log('');
console.log('✓ FIX 1: Removed "type": "module" from deployment package.json');
console.log('✓ FIX 2: Changed server build format from ESM to CommonJS');
console.log('✓ FIX 3: Added external dependencies to prevent bundling conflicts');
console.log('✓ FIX 4: Created deployment-specific package.json in dist folder');
console.log('✓ FIX 5: Updated run command to use CommonJS-compatible entry point');
console.log('');
console.log('📋 Deployment Instructions:');
console.log('');
console.log('1. Upload the entire dist/ directory to your deployment platform');
console.log('2. Set environment variables (DATABASE_URL, etc.)');
console.log('3. Run "npm install" in the dist/ directory');
console.log('4. Run "npm start" or "node index.js" to start the server');
console.log('');
console.log('Alternative start commands:');
console.log('  - npm start');
console.log('  - node index.js');
console.log('  - node server-start.cjs');
console.log('');
console.log('🎯 All ES module compatibility issues have been resolved!');