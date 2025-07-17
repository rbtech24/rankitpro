const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Production Build - Forcing Clean Deployment...');

// Complete cleanup
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Build client
console.log('📦 Building client...');
try {
  execSync('npx vite build --mode production', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Move all files from dist/public to dist root
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
  fs.rmSync(publicDir, { recursive: true, force: true });
}

// Create production server that works with ANY start command
const productionServer = `const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 10000;

console.log('🚀 Rank It Pro Production Server Starting...');

// Serve static files
app.use(express.static(__dirname));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('App not found');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(\`✅ Server running on port \${port}\`);
});`;

// Create package.json in dist to force CommonJS mode
const distPackageJson = {
  "type": "commonjs",
  "main": "index.js",
  "engines": {
    "node": ">=18"
  }
};
fs.writeFileSync(path.join('dist', 'package.json'), JSON.stringify(distPackageJson, null, 2));

// Create ALL possible server files to handle any start command
fs.writeFileSync(path.join('dist', 'index.js'), productionServer);
fs.writeFileSync(path.join('dist', 'index.cjs'), productionServer);
fs.writeFileSync(path.join('dist', 'server.js'), productionServer);
fs.writeFileSync(path.join('dist', 'server.cjs'), productionServer);

console.log('✅ Production build complete!');
console.log('📊 Created multiple server entry points:');
console.log('  - index.js, index.cjs, server.js, server.cjs');
console.log('  - All point to the same minimal production server');
console.log('  - Added package.json to force CommonJS mode');
console.log('🚀 Will work with any start command configuration!');