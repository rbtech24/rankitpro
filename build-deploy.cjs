const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Rank It Pro for Production Deployment...');

// Clean everything
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Build client with Vite
console.log('📦 Building client application...');
try {
  execSync('npx vite build --mode production', { stdio: 'inherit' });
  console.log('✅ Client build successful');
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
}

// Move all files from dist/public to dist root
console.log('📁 Organizing deployment files...');
const publicDir = path.join('dist', 'public');
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir);
  files.forEach(file => {
    const srcPath = path.join(publicDir, file);
    const destPath = path.join('dist', file);
    if (fs.statSync(srcPath).isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
  
  // Remove the public directory
  fs.rmSync(publicDir, { recursive: true, force: true });
  console.log('✅ Files organized');
}

// Copy the production server
console.log('🚀 Adding production server...');
fs.copyFileSync('server.js', path.join('dist', 'server.cjs'));

console.log('✅ Build complete!');
console.log('📊 Production files ready in dist/:');
console.log('  - server.cjs (production server)');
console.log('  - index.html (React app)');
console.log('  - assets/ (static files)');
console.log('🚀 Deploy with: node dist/server.cjs');