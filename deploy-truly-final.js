#!/usr/bin/env node

// ULTIMATE RENDER.COM DEPLOYMENT SCRIPT - Handles all directory issues
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ULTIMATE DEPLOYMENT SCRIPT - Handling all edge cases...');

try {
  // Clean up
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  // Create dist directories
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('dist/public', { recursive: true });

  // Build client with the CORRECT command
  console.log('🏗️ Building client...');
  execSync('npx vite build --outDir dist/public --mode production', { stdio: 'inherit' });

  // Build server with extra safety
  console.log('🏗️ Building server...');
  execSync('npx esbuild server/index.ts --platform=node --outfile=dist/server.js --bundle --format=cjs --target=node18 --external:pg-native --external:bcrypt --external:@babel/core --external:lightningcss --external:typescript --external:@swc/core --external:esbuild --external:*.node', { stdio: 'inherit' });
  
  // Also copy server.js to root for different path scenarios
  execSync('cp dist/server.js server.js', { stdio: 'inherit' });

  // Create package.json in dist
  const packageJson = {
    "name": "rankitpro",
    "version": "1.0.0",
    "main": "server.js",
    "scripts": { 
      "start": "node server.js",
      "dev": "node server.js"
    },
    "engines": { "node": ">=18.0.0" }
  };
  fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

  // Create a startup script that handles different environments
  const startScript = `#!/usr/bin/env node

// Startup script that handles different working directories
const path = require('path');
const fs = require('fs');

// Find the correct server.js file
const possiblePaths = [
  './server.js',
  './dist/server.js',
  path.join(__dirname, 'server.js'),
  path.join(__dirname, 'dist/server.js')
];

for (const serverPath of possiblePaths) {
  if (fs.existsSync(serverPath)) {
    console.log('Starting server from:', serverPath);
    require(serverPath);
    break;
  }
}
`;

  fs.writeFileSync('dist/start.js', startScript);
  fs.chmodSync('dist/start.js', '755');

  // Also create a simple index.js that just requires server.js
  fs.writeFileSync('dist/index.js', 'require("./server.js");');

  // Verify files exist
  console.log('📁 Verifying build output...');
  const files = fs.readdirSync('dist');
  console.log('Files in dist:', files);
  
  if (fs.existsSync('dist/server.js')) {
    console.log('✅ server.js exists and is', fs.statSync('dist/server.js').size, 'bytes');
  } else {
    console.error('❌ server.js NOT FOUND!');
    process.exit(1);
  }

  console.log('✅ BUILD COMPLETE! All files ready!');
  console.log('🚀 Server can be started with: node dist/server.js');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}