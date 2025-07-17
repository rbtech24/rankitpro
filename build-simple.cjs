const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Simple build for Rank It Pro...');

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Build client with Vite
console.log('📦 Building client...');
execSync('npx vite build --mode production', { stdio: 'inherit' });

// Copy client files to dist
console.log('📁 Copying client files...');
const clientFiles = ['index.html', 'manifest.json', 'sw.js'];
clientFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('dist', file));
  }
});

// Copy assets
if (fs.existsSync('assets')) {
  fs.cpSync('assets', 'dist/assets', { recursive: true });
}

// Copy the simple deployment server
console.log('🚀 Setting up deployment server...');
fs.copyFileSync('deploy-simple.cjs', 'dist/index.cjs');

console.log('✅ Simple build complete!');
console.log('📊 Files created:');
console.log('  - dist/index.js (deployment server)');
console.log('  - dist/index.html (app)');
console.log('  - dist/assets/ (static files)');
console.log('🚀 Ready for deployment with: node dist/index.cjs');