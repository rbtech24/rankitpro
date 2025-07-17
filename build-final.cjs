const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Final build for Rank It Pro deployment...');

// Clean everything
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Build client
console.log('📦 Building client application...');
try {
  execSync('npx vite build --mode production', { stdio: 'inherit' });
  console.log('✅ Client build successful');
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
}

// Copy client files to dist root (not dist/public)
console.log('📁 Copying client assets...');
const clientFiles = ['index.html', 'manifest.json', 'sw.js'];
clientFiles.forEach(file => {
  const srcPath = path.join('dist', 'public', file);
  const destPath = path.join('dist', file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`  ✓ Copied ${file}`);
  }
});

// Copy assets directory
const assetsDir = path.join('dist', 'public', 'assets');
if (fs.existsSync(assetsDir)) {
  fs.cpSync(assetsDir, path.join('dist', 'assets'), { recursive: true });
  console.log('  ✓ Copied assets/');
}

// Remove public directory to avoid confusion
fs.rmSync(path.join('dist', 'public'), { recursive: true, force: true });

// Create ultra-minimal server
console.log('🚀 Creating deployment server...');
const serverCode = `const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 10000;

// Serve static files
app.use(express.static(__dirname));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('App not found');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(\`🚀 Rank It Pro serving on port \${port}\`);
});`;

fs.writeFileSync(path.join('dist', 'index.cjs'), serverCode);

console.log('✅ Final build complete!');
console.log('📊 Deployment files:');
console.log('  - dist/index.cjs (server)');
console.log('  - dist/index.html (app)');
console.log('  - dist/assets/ (static files)');
console.log('🚀 Ready for deployment with: node dist/index.cjs');