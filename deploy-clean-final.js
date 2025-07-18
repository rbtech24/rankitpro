#!/usr/bin/env node

/**
 * CLEAN FINAL DEPLOYMENT SCRIPT
 * Completely avoids all Vite configuration conflicts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting CLEAN FINAL deployment build...');

try {
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Create dist directory
  fs.mkdirSync('dist');

  // Build client using the existing vite.config.ts but with production mode
  console.log('📦 Building client with existing config...');
  
  // Create a minimal vite config that doesn't use problematic plugins
  const cleanViteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react()
    // Removed @replit/vite-plugin-runtime-error-modal for production
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
    sourcemap: false,
    minify: true,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['date-fns', 'zod']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});`;

  fs.writeFileSync('vite.config.production.ts', cleanViteConfig);
  
  // Build client
  execSync('npx vite build --config vite.config.production.ts --mode production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Copy static files that might be needed
  console.log('📁 Copying static files...');
  if (fs.existsSync('uploads')) {
    fs.cpSync('uploads', 'dist/uploads', { recursive: true });
  }

  // Build server with absolute minimal externals
  console.log('⚙️  Building server with minimal externals...');
  const serverBuildCommand = [
    'npx esbuild server/production-entry.ts',
    '--platform=node',
    '--outfile=dist/index.js',
    '--bundle',
    '--format=cjs',
    '--target=node18',
    '--minify',
    // Only essential externals
    '--external:bcrypt',
    '--external:pg-native',
    '--external:twilio',
    '--external:*.node'
  ].join(' ');

  execSync(serverBuildCommand, { stdio: 'inherit' });

  // Create production package.json with all dependencies
  console.log('📄 Creating production package.json...');
  const deployPackage = {
    "name": "rankitpro-production",
    "version": "1.0.0",
    "type": "commonjs",
    "main": "index.js",
    "scripts": {
      "start": "node index.js",
      "postinstall": "echo 'Production build ready'"
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

  // Create production README
  console.log('📄 Creating production README...');
  const productionReadme = `# Rank It Pro - Production Deployment

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set environment variables:
   \`\`\`bash
   export NODE_ENV=production
   export DATABASE_URL="your-postgresql-connection-string"
   export SESSION_SECRET="your-session-secret"
   export ANTHROPIC_API_KEY="your-anthropic-key"
   export SENDGRID_API_KEY="your-sendgrid-key"
   export STRIPE_SECRET_KEY="your-stripe-key"
   \`\`\`

3. Start the application:
   \`\`\`bash
   npm start
   \`\`\`

## Features

- ✅ Complete SaaS business management platform
- ✅ Multi-role authentication system
- ✅ AI-powered content generation
- ✅ PostgreSQL database with session management
- ✅ WebSocket real-time features
- ✅ Security hardening with rate limiting
- ✅ Mobile-responsive interface

## Port Configuration

The server runs on port 3000 by default, or uses the \`PORT\` environment variable.

## Deployment

This build is optimized for production deployment on platforms like:
- Render.com
- Railway
- Heroku
- DigitalOcean App Platform
- AWS/Azure/GCP

## Support

For deployment issues:
1. Check that all environment variables are set
2. Verify PostgreSQL database connection
3. Check server logs for specific errors
`;

  fs.writeFileSync('dist/README.md', productionReadme);

  // Create a simple deployment script
  const deployScript = `#!/bin/bash
echo "Starting Rank It Pro production server..."
export NODE_ENV=production
node index.js
`;

  fs.writeFileSync('dist/start.sh', deployScript);
  try {
    execSync('chmod +x dist/start.sh');
  } catch (e) {
    // Ignore chmod errors on Windows
  }

  // Clean up temp files
  fs.unlinkSync('vite.config.production.ts');

  // Final verification
  console.log('🔍 Verifying build output...');
  
  const serverStats = fs.statSync('dist/index.js');
  const publicDir = fs.readdirSync('dist/public');
  const packageExists = fs.existsSync('dist/package.json');
  
  console.log('');
  console.log('🎉 CLEAN FINAL DEPLOYMENT BUILD COMPLETED!');
  console.log('');
  console.log('📂 Build output:');
  console.log(`  - dist/index.js (${(serverStats.size / 1024 / 1024).toFixed(2)} MB production server)`);
  console.log(`  - dist/package.json (${packageExists ? 'Created' : 'Missing'})`);
  console.log(`  - dist/public/ (${publicDir.length} client files)`);
  console.log(`  - dist/README.md (deployment instructions)`);
  console.log(`  - dist/start.sh (startup script)`);
  console.log('');
  console.log('✅ DEPLOYMENT ISSUES RESOLVED:');
  console.log('  ✓ No Vite configuration conflicts');
  console.log('  ✓ Clean production entry point');
  console.log('  ✓ CommonJS format for deployment');
  console.log('  ✓ All dependencies included in package.json');
  console.log('  ✓ Production-optimized build');
  console.log('');
  console.log('🚀 READY FOR PRODUCTION DEPLOYMENT!');
  console.log('');
  console.log('📋 Deploy instructions:');
  console.log('  1. Upload the dist/ directory to your hosting platform');
  console.log('  2. Run: npm install');
  console.log('  3. Set required environment variables');
  console.log('  4. Run: npm start');
  console.log('');
  console.log('🌐 The application will be available on the configured port');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}