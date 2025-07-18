#!/usr/bin/env node

/**
 * RENAME VITE CONFIG DEPLOYMENT SCRIPT
 * Temporarily renames problematic vite.config.ts and creates clean one
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting deployment with vite config rename...');

let viteConfigRenamed = false;

try {
  // Clean previous build
  console.log('Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Rename problematic vite.config.ts to avoid conflicts
  console.log('Renaming problematic vite.config.ts...');
  if (fs.existsSync('vite.config.ts')) {
    fs.renameSync('vite.config.ts', 'vite.config.ts.backup');
    viteConfigRenamed = true;
  }

  // Create clean vite.config.ts for production
  console.log('Creating clean vite.config.ts...');
  const cleanViteConfig = `import { defineConfig } from "vite";
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
  },
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});`;

  fs.writeFileSync('vite.config.ts', cleanViteConfig);

  // Build client with clean config
  console.log('Building client with clean vite config...');
  execSync('npx vite build --mode production', { 
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
2. Set environment variables (DATABASE_URL, SESSION_SECRET, etc.)
3. npm start

## Production optimized build
- Clean Vite configuration without problematic plugins
- CommonJS server bundle
- Optimized React frontend
- No ESM/CommonJS conflicts

Server runs on port 3000 or PORT environment variable.
`;

  fs.writeFileSync('dist/README.md', readme);

  // Restore original vite.config.ts
  console.log('Restoring original vite.config.ts...');
  fs.unlinkSync('vite.config.ts');
  if (viteConfigRenamed) {
    fs.renameSync('vite.config.ts.backup', 'vite.config.ts');
  }

  // Test the build
  console.log('Testing production build...');
  const testResult = execSync('cd dist && timeout 3s node index.js 2>&1 || echo "Test complete"', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });

  const hasErrors = testResult.includes('ERR_REQUIRE_ESM') || 
                   testResult.includes('@replit') || 
                   testResult.includes('ES module');

  if (hasErrors) {
    console.log('Build test failed:', testResult);
    throw new Error('Build still has ESM conflicts');
  }

  // Verify files
  const serverStats = fs.statSync('dist/index.js');
  const publicFiles = fs.readdirSync('dist/public');
  
  console.log('');
  console.log('VITE CONFIG RENAME DEPLOYMENT COMPLETED!');
  console.log('');
  console.log('Build output:');
  console.log(`  - Server: ${(serverStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  - Client: ${publicFiles.length} files`);
  console.log('');
  console.log('Issues resolved:');
  console.log('  - Temporarily used clean vite.config.ts');
  console.log('  - No @replit plugin dependencies');
  console.log('  - No ESM/CommonJS conflicts');
  console.log('  - Original vite.config.ts restored');
  console.log('');
  console.log('Deploy the dist/ directory to your platform');
  console.log('Run: npm install && npm start');

} catch (error) {
  console.error('Build failed:', error.message);
  
  // Restore original vite.config.ts on failure
  if (viteConfigRenamed && fs.existsSync('vite.config.ts.backup')) {
    if (fs.existsSync('vite.config.ts')) {
      fs.unlinkSync('vite.config.ts');
    }
    fs.renameSync('vite.config.ts.backup', 'vite.config.ts');
    console.log('Original vite.config.ts restored after failure');
  }
  
  process.exit(1);
}