#!/usr/bin/env node

/**
 * NO VITE CONFIG DEPLOYMENT SCRIPT
 * Completely removes vite.config.ts and uses package.json build script
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting deployment without vite.config.ts...');

let viteConfigBackup = null;
let packageJsonBackup = null;

try {
  // Clean previous build
  console.log('Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Backup and remove problematic vite.config.ts
  console.log('Removing problematic vite.config.ts...');
  if (fs.existsSync('vite.config.ts')) {
    viteConfigBackup = fs.readFileSync('vite.config.ts', 'utf8');
    fs.unlinkSync('vite.config.ts');
  }

  // Backup original package.json
  console.log('Backing up package.json...');
  if (fs.existsSync('package.json')) {
    packageJsonBackup = fs.readFileSync('package.json', 'utf8');
    const packageJson = JSON.parse(packageJsonBackup);
    
    // Add build script that uses inline vite config
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts['build:clean'] = 'vite build --config /dev/null --root client --outDir ../dist/public --emptyOutDir';
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  }

  // Create inline vite config as a separate file
  console.log('Creating inline vite config...');
  const inlineViteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve("client/src"),
      "@shared": resolve("shared"),
      "@assets": resolve("attached_assets"),
    },
  },
  root: "client",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});`;

  fs.writeFileSync('vite.inline.config.js', inlineViteConfig);

  // Build client using inline config
  console.log('Building client with inline config...');
  execSync('npx vite build --config vite.inline.config.js --mode production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

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
2. Set environment variables
3. npm start

## Build Details
- Built without problematic vite.config.ts
- Clean CommonJS server bundle
- Optimized React frontend
- No ESM/CommonJS conflicts

Environment Variables:
- DATABASE_URL (required)
- SESSION_SECRET (required)
- ANTHROPIC_API_KEY (optional)
- SENDGRID_API_KEY (optional)
- STRIPE_SECRET_KEY (optional)
`;

  fs.writeFileSync('dist/README.md', readme);

  // Clean up temporary files
  console.log('Cleaning up temporary files...');
  if (fs.existsSync('vite.inline.config.js')) {
    fs.unlinkSync('vite.inline.config.js');
  }

  // Restore original files
  console.log('Restoring original files...');
  if (packageJsonBackup) {
    fs.writeFileSync('package.json', packageJsonBackup);
  }
  if (viteConfigBackup) {
    fs.writeFileSync('vite.config.ts', viteConfigBackup);
  }

  // Test the build
  console.log('Testing production build...');
  const testResult = execSync('cd dist && timeout 3s node index.js 2>&1 || echo "Test complete"', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });

  const hasESMErrors = testResult.includes('ERR_REQUIRE_ESM') || 
                      testResult.includes('@replit') || 
                      testResult.includes('ES module');

  if (hasESMErrors) {
    console.log('Build test failed:', testResult);
    throw new Error('Build still has ESM conflicts');
  }

  // Success output
  const serverStats = fs.statSync('dist/index.js');
  const publicFiles = fs.readdirSync('dist/public');
  
  console.log('');
  console.log('NO VITE CONFIG DEPLOYMENT COMPLETED!');
  console.log('');
  console.log('Build output:');
  console.log(`  - Server: ${(serverStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  - Client: ${publicFiles.length} files`);
  console.log('');
  console.log('Issues resolved:');
  console.log('  - Removed problematic vite.config.ts');
  console.log('  - Used inline vite configuration');
  console.log('  - No @replit plugin dependencies');
  console.log('  - No ESM/CommonJS conflicts');
  console.log('  - Original files restored');
  console.log('');
  console.log('READY FOR DEPLOYMENT!');
  console.log('Deploy the dist/ directory to your platform');

} catch (error) {
  console.error('Build failed:', error.message);
  
  // Restore original files on failure
  if (packageJsonBackup) {
    fs.writeFileSync('package.json', packageJsonBackup);
  }
  if (viteConfigBackup) {
    fs.writeFileSync('vite.config.ts', viteConfigBackup);
  }
  
  // Clean up temporary files
  if (fs.existsSync('vite.inline.config.js')) {
    fs.unlinkSync('vite.inline.config.js');
  }
  
  console.log('Original files restored after failure');
  process.exit(1);
}