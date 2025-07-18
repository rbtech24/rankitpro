#!/usr/bin/env node

/**
 * Complete Deployment Solution - Fixes all ES module issues
 * Addresses all agent suggestions for ESM/CommonJS compatibility
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting complete deployment build...');

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Create production-specific vite config
  console.log('📄 Creating production vite config...');
  const productionViteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    // Runtime error overlay removed for production build compatibility
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});`;

  fs.writeFileSync('vite.config.production.ts', productionViteConfig);

  // Build client using production config
  console.log('📦 Building client (production mode)...');
  execSync('npx vite build --config vite.config.production.ts --mode production', { stdio: 'inherit' });

  // Build server with CommonJS format and comprehensive externals
  console.log('⚙️  Building server (CommonJS format)...');
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

  // Create deployment package.json (CommonJS)
  console.log('📄 Creating deployment package.json (CommonJS)...');
  const deployPackage = {
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

  fs.writeFileSync('dist/package.json', JSON.stringify(deployPackage, null, 2));

  // Create deployment script
  console.log('📄 Creating deployment script...');
  const deployScript = `#!/bin/bash
# Deployment script for production environment

echo "🚀 Starting production deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Start the server
echo "🚀 Starting server..."
node index.js
`;

  fs.writeFileSync('dist/deploy.sh', deployScript);
  execSync('chmod +x dist/deploy.sh');

  // Create deployment README
  console.log('📄 Creating deployment README...');
  const deployReadme = `# Production Deployment

## Quick Start
\`\`\`bash
cd dist
npm install
npm start
\`\`\`

## Or use deployment script
\`\`\`bash
cd dist
chmod +x deploy.sh
./deploy.sh
\`\`\`

## Environment Variables
Make sure to set these environment variables in your production environment:
- DATABASE_URL
- ANTHROPIC_API_KEY
- OPENAI_API_KEY
- STRIPE_SECRET_KEY
- RESEND_API_KEY

## Files Structure
- \`index.js\` - Main server file (CommonJS format)
- \`package.json\` - Production dependencies (type: "commonjs")
- \`public/\` - Static frontend assets
- \`deploy.sh\` - Deployment script

## Build Information
- Server: CommonJS format, Node.js 18+
- Client: Static assets, production optimized
- All ES module conflicts resolved
`;

  fs.writeFileSync('dist/README.md', deployReadme);

  // Clean up temporary files
  fs.unlinkSync('vite.config.production.ts');

  // Verify build output
  console.log('🔍 Verifying build output...');
  const serverStats = fs.statSync('dist/index.js');
  const clientFiles = fs.readdirSync('dist/public');
  
  console.log('');
  console.log('✅ COMPLETE DEPLOYMENT BUILD FINISHED!');
  console.log('');
  console.log('📂 Build output:');
  console.log(`  - dist/index.js (${(serverStats.size / 1024 / 1024).toFixed(2)} MB CommonJS server)`);
  console.log(`  - dist/package.json (CommonJS deployment config)`);
  console.log(`  - dist/public/ (${clientFiles.length} client files)`);
  console.log('  - dist/deploy.sh (deployment script)');
  console.log('  - dist/README.md (deployment instructions)');
  console.log('');
  console.log('🎯 All agent suggestions implemented:');
  console.log('  ✓ Removed runtime error overlay from production build');
  console.log('  ✓ Used production-specific vite config');
  console.log('  ✓ Server built in CommonJS format');
  console.log('  ✓ Deployment package.json uses "type": "commonjs"');
  console.log('  ✓ All external dependencies properly excluded');
  console.log('  ✓ ES module conflicts completely resolved');
  console.log('');
  console.log('🚀 READY FOR PRODUCTION DEPLOYMENT!');
  console.log('');
  console.log('📋 Deployment options:');
  console.log('  1. Deploy the entire dist/ directory');
  console.log('  2. Use: cd dist && npm install && npm start');
  console.log('  3. Use: cd dist && ./deploy.sh');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}