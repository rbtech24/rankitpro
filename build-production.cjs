#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build...');

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Build client
console.log('📦 Building client...');
execSync('npx vite build', { stdio: 'inherit' });

// Build server with proper CommonJS format and externals
console.log('📦 Building server...');
const serverBuildCommand = `npx esbuild server/production.ts --platform=node --outfile=dist/index.js --bundle --format=cjs --target=node18 --external:pg-native --external:bcrypt --external:@babel/core --external:lightningcss --external:typescript --external:@babel/preset-typescript --external:@swc/core --external:esbuild --external:*.node --external:fs --external:path --external:url --external:util --external:crypto --external:http --external:https --external:os --external:stream --external:zlib --external:querystring --external:events --external:buffer --external:net --external:tls --external:cluster --external:child_process --external:worker_threads --external:perf_hooks --external:readline --external:dgram --external:dns --external:vm --external:v8 --external:inspector --external:async_hooks --external:timers --external:console --external:process --external:string_decoder --external:assert --external:constants --external:module --external:repl --external:tty --external:domain --external:punycode --external:vite --external:@vitejs/plugin-react --external:@replit/vite-plugin-runtime-error-modal --external:tailwindcss --external:autoprefixer`;

execSync(serverBuildCommand, { stdio: 'inherit' });

// Create deployment package.json
console.log('📄 Creating deployment package.json...');
const deploymentPackage = {
  "name": "workspace-production",
  "version": "1.0.0",
  "type": "commonjs",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(deploymentPackage, null, 2));

console.log('✅ Production build completed successfully!');
console.log('');
console.log('📂 Generated files:');
console.log('  - dist/index.js (CommonJS server)');
console.log('  - dist/package.json (type: "commonjs")');
console.log('  - dist/public/ (client assets)');
console.log('');
console.log('🚀 Ready for deployment!');
console.log('');
console.log('Deployment fixes applied:');
console.log('✓ Changed server build format from ESM to CommonJS');
console.log('✓ Externalized all Node.js built-in modules');
console.log('✓ Created deployment-specific package.json with "type": "commonjs"');
console.log('✓ Server will run as CommonJS module');