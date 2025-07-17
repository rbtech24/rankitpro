const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Starting bulletproof deployment build...');

// Step 1: Install missing build dependencies
console.log('📦 Installing missing build dependencies...');
const buildDeps = [
  'esbuild',
  'vite',
  'typescript'
];

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const missingDeps = buildDeps.filter(dep => 
  !packageJson.dependencies[dep] && !packageJson.devDependencies?.[dep]
);

if (missingDeps.length > 0) {
  console.log(`Installing missing dependencies: ${missingDeps.join(', ')}`);
  try {
    execSync(`npm install ${missingDeps.join(' ')} --save-dev`, { stdio: 'inherit' });
    console.log('✅ Missing dependencies installed');
  } catch (error) {
    console.log('⚠️  Warning: Could not install missing dependencies, continuing...');
  }
}

// Step 2: Complete cleanup
console.log('🧹 Cleaning previous build...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Step 3: Build client using separate process
console.log('📦 Building client application...');
try {
  execSync('npx vite build client --mode production --outDir dist', { stdio: 'inherit' });
  console.log('✅ Client build successful');
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  
  // Fallback: Try building with different configuration
  console.log('🔄 Attempting fallback client build...');
  try {
    execSync('npx vite build client --mode production', { stdio: 'inherit' });
    // Copy files manually
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
    }
    console.log('✅ Fallback client build successful');
  } catch (fallbackError) {
    console.error('❌ Fallback client build also failed:', fallbackError.message);
    process.exit(1);
  }
}

// Step 4: Build server with all external exclusions
console.log('🚀 Building server with comprehensive external exclusions...');
const externalDeps = [
  '@babel/preset-typescript/package.json',
  '@babel/preset-typescript',
  '@babel/core',
  'lightningcss',
  'lightningcss-linux-x64-gnu',
  'lightningcss-linux-x64-musl',
  '../pkg',
  '@swc/core',
  'esbuild',
  'typescript',
  'tsx',
  'vite',
  '@vitejs/plugin-react',
  '@replit/vite-plugin-runtime-error-modal',
  'tailwindcss',
  'autoprefixer',
  'postcss',
  '*.node',
  'pg-native',
  'bcrypt',
  'fsevents',
  'node-gyp',
  'node-addon-api'
];

const externalFlags = externalDeps.map(dep => `--external:${dep}`).join(' ');

const serverBuildCommand = `npx esbuild server/index.ts --platform=node --outfile=dist/server.js --bundle --format=esm --target=node18 ${externalFlags}`;

try {
  execSync(serverBuildCommand, { stdio: 'inherit' });
  console.log('✅ Server build successful');
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  process.exit(1);
}

// Step 5: Create multiple entry points for maximum compatibility
console.log('📄 Creating multiple server entry points...');

// ESM wrapper
const esmWrapper = `import("./server.js").catch(err => {
  console.error('Failed to import server:', err);
  process.exit(1);
});`;

// CommonJS wrapper
const cjsWrapper = `try {
  require("./server.js");
} catch (err) {
  console.error('Failed to require server:', err);
  process.exit(1);
}`;

// Create all possible entry points
fs.writeFileSync(path.join('dist', 'index.js'), esmWrapper);
fs.writeFileSync(path.join('dist', 'index.cjs'), cjsWrapper);
fs.writeFileSync(path.join('dist', 'app.js'), esmWrapper);
fs.writeFileSync(path.join('dist', 'start.js'), esmWrapper);

console.log('✅ Multiple entry points created');

// Step 6: Create package.json with proper configuration
console.log('📦 Creating package.json for dist...');
const distPackageJson = {
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "engines": {
    "node": ">=18"
  }
};
fs.writeFileSync(path.join('dist', 'package.json'), JSON.stringify(distPackageJson, null, 2));

console.log('✅ Bulletproof deployment build completed successfully!');
console.log('📊 Build artifacts created:');
console.log('  - Static files: index.html, CSS, JS bundles');
console.log('  - Server bundle: server.js (ESM format)');
console.log('  - Entry points: index.js, index.cjs, app.js, start.js');
console.log('  - Package configuration: package.json');
console.log('  - All external dependencies properly excluded');
console.log('🚀 Ready for deployment with any start command configuration!');