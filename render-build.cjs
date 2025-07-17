#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Starting Render.com production build...');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Build client - copy pre-built files
console.log('📦 Building client application...');
try {
  execSync('cp -r client/dist/* dist/', { stdio: 'inherit' });
  console.log('✅ Client build completed successfully');
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
}

// Build server
console.log('🚀 Building server application...');
try {
  execSync(`npx esbuild server/index.ts --platform=node --outfile=dist/server.js --bundle --external:pg-native --external:bcrypt --external:@babel/preset-typescript/package.json --external:@babel/preset-typescript --external:@babel/core --external:lightningcss --external:../pkg --external:@swc/core --external:esbuild --external:typescript --external:*.node --format=esm --target=node18 --minify=false`, { stdio: 'inherit' });
  console.log('✅ Server build completed successfully');
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  process.exit(1);
}

// Create production wrapper
const wrapperContent = `import('./server.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});`;

fs.writeFileSync(path.join('dist', 'index.js'), wrapperContent);

// Verify build outputs
const indexHtml = path.join('dist', 'index.html');
const indexJs = path.join('dist', 'index.js');
const serverJs = path.join('dist', 'server.js');

if (!fs.existsSync(indexHtml)) {
  console.error('❌ Client build verification failed: index.html not found');
  process.exit(1);
}

if (!fs.existsSync(indexJs)) {
  console.error('❌ Server build verification failed: index.js not found');
  process.exit(1);
}

if (!fs.existsSync(serverJs)) {
  console.error('❌ Server build verification failed: server.js not found');
  process.exit(1);
}

console.log('✅ Build verification completed successfully');
console.log('🎉 Render.com production build completed!');

// Show build summary
try {
  const serverStats = fs.statSync(serverJs);
  const sizeInMB = (serverStats.size / (1024 * 1024)).toFixed(1);
  console.log(`📊 Server bundle size: ${sizeInMB}MB`);
  
  const assetsDir = path.join('dist', 'assets');
  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    console.log(`📦 Client assets: ${assetFiles.length} files`);
  }
} catch (error) {
  console.log('📊 Build summary unavailable');
}