const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Starting comprehensive deployment build with all fixes...');

// Step 1: Complete cleanup
console.log('🧹 Cleaning previous build...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Step 2: Build client with separate script to avoid conflicts
console.log('📦 Building client application...');
try {
  execSync('npx vite build client --mode production', { stdio: 'inherit' });
  console.log('✅ Client build successful');
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
}

// Step 3: Copy client files to dist
console.log('📁 Copying client files to dist...');
if (fs.existsSync('client/dist')) {
  const files = fs.readdirSync('client/dist');
  files.forEach(file => {
    const srcPath = path.join('client/dist', file);
    const destPath = path.join('dist', file);
    if (fs.statSync(srcPath).isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
  console.log('✅ Client files copied successfully');
} else {
  console.error('❌ Client dist directory not found');
  process.exit(1);
}

// Step 4: Build server with comprehensive external exclusions
console.log('🚀 Building server with comprehensive external exclusions...');
const serverBuildCommand = `npx esbuild server/index.ts --platform=node --outfile=dist/server.js --bundle --format=esm --target=node18 --external:@babel/preset-typescript/package.json --external:@babel/preset-typescript --external:@babel/core --external:lightningcss --external:lightningcss-linux-x64-gnu --external:lightningcss-linux-x64-musl --external:../pkg --external:@swc/core --external:esbuild --external:typescript --external:tsx --external:vite --external:@vitejs/plugin-react --external:@replit/vite-plugin-runtime-error-modal --external:tailwindcss --external:autoprefixer --external:postcss --external:*.node --external:pg-native --external:bcrypt --external:fsevents --external:node-gyp --external:node-addon-api`;

try {
  execSync(serverBuildCommand, { stdio: 'inherit' });
  console.log('✅ Server build successful');
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  process.exit(1);
}

// Step 5: Create index.js wrapper for ESM compatibility
console.log('📄 Creating index.js wrapper...');
const indexWrapper = 'import("./server.js");';
fs.writeFileSync(path.join('dist', 'index.js'), indexWrapper);
console.log('✅ Index.js wrapper created');

// Step 6: Create index.cjs wrapper for CommonJS compatibility
console.log('📄 Creating index.cjs wrapper...');
const indexCjsWrapper = 'require("./server.js");';
fs.writeFileSync(path.join('dist', 'index.cjs'), indexCjsWrapper);
console.log('✅ Index.cjs wrapper created');

// Step 7: Create package.json in dist directory
console.log('📦 Creating package.json for dist...');
const distPackageJson = {
  "type": "module",
  "main": "index.js",
  "engines": {
    "node": ">=18"
  }
};
fs.writeFileSync(path.join('dist', 'package.json'), JSON.stringify(distPackageJson, null, 2));
console.log('✅ Package.json created');

// Step 8: Install missing build dependencies (if needed)
console.log('🔧 Checking build dependencies...');
const requiredDeps = ['esbuild', 'vite'];
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

for (const dep of requiredDeps) {
  if (!packageJson.dependencies[dep] && !packageJson.devDependencies?.[dep]) {
    console.log(`⚠️  Missing dependency: ${dep}`);
  }
}

console.log('✅ Comprehensive deployment build completed successfully!');
console.log('📊 Build artifacts created:');
console.log('  - Static files: index.html, CSS, JS bundles');
console.log('  - Server bundle: server.js (ESM format)');
console.log('  - Entry points: index.js (ESM), index.cjs (CommonJS)');
console.log('  - Package configuration: package.json');
console.log('  - All problematic dependencies externalized');
console.log('🚀 Ready for deployment with any start command!');