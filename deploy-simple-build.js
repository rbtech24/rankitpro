#!/usr/bin/env node

/**
 * SIMPLE DEPLOYMENT BUILD
 * Minimal build without problematic defines
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Creating simple deployment build...');

try {
  // Clean previous build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist', { recursive: true });

  // Build client with esbuild
  console.log('Building client...');
  execSync('npx esbuild client/src/main.tsx --bundle --outfile=dist/public/assets/index.js --format=esm --target=es2020 --minify --jsx=automatic', { 
    stdio: 'inherit' 
  });

  // Build CSS
  console.log('Building CSS...');
  execSync('npx tailwindcss -i ./client/src/index.css -o ./dist/public/assets/index.css --minify', { 
    stdio: 'inherit' 
  });

  // Create HTML
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rank It Pro</title>
  <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
</html>`;

  fs.writeFileSync('dist/public/index.html', indexHtml);

  // Copy static files
  if (fs.existsSync('uploads')) {
    fs.cpSync('uploads', 'dist/uploads', { recursive: true });
  }

  // Build server with minimal externals
  console.log('Building server...');
  const serverCmd = [
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
    '--external:*.node'
  ].join(' ');

  execSync(serverCmd, { stdio: 'inherit' });

  // Create production package.json
  const pkg = {
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

  fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, 2));

  // Test the build
  console.log('Testing build...');
  const test = execSync('cd dist && timeout 3s node index.js 2>&1 || echo "Test done"', { 
    encoding: 'utf8', 
    stdio: 'pipe' 
  });

  if (test.includes('TypeError') || test.includes('Invalid URL') || test.includes('ERR_REQUIRE_ESM')) {
    console.log('Test failed:', test);
    throw new Error('Build test failed');
  }

  const serverSize = fs.statSync('dist/index.js').size;
  const clientSize = fs.statSync('dist/public/assets/index.js').size;

  console.log('');
  console.log('✅ SIMPLE BUILD COMPLETE');
  console.log(`Server: ${(serverSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Client: ${(clientSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('');
  console.log('Deploy the dist/ directory');

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}