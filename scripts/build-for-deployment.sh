#!/bin/bash

echo "🚀 Building for deployment with CommonJS compatibility..."
echo ""

# Clean the dist directory
echo "🧹 Cleaning dist directory..."
if [ -d "dist" ]; then
    rm -rf dist
fi

# Build client with production settings
echo "📦 Building client for production..."
npx vite build

# Build server with CommonJS format and comprehensive externals
echo "🔧 Building server with CommonJS format..."
echo "   - Converting ESM to CommonJS"
echo "   - Externalizing Node.js built-in modules"
echo "   - Handling all dependencies properly"

npx esbuild server/index.ts \
    --platform=node \
    --outfile=dist/index.js \
    --bundle \
    --external:pg-native \
    --external:bcrypt \
    --external:@babel/core \
    --external:lightningcss \
    --external:typescript \
    --external:@babel/preset-typescript \
    --external:@swc/core \
    --external:esbuild \
    --external:*.node \
    --external:path \
    --external:fs \
    --external:http \
    --external:https \
    --external:url \
    --external:stream \
    --external:util \
    --external:crypto \
    --external:os \
    --external:querystring \
    --external:zlib \
    --external:buffer \
    --external:events \
    --external:child_process \
    --external:cluster \
    --external:dgram \
    --external:dns \
    --external:net \
    --external:tls \
    --external:readline \
    --external:repl \
    --external:vm \
    --external:worker_threads \
    --external:vite \
    --external:@vitejs/plugin-react \
    --external:@replit/vite-plugin-runtime-error-modal \
    --format=cjs \
    --target=node18

# Create CommonJS compatibility wrapper
echo "🔄 Creating CommonJS compatibility layer..."
cat > dist/server-start.cjs << 'EOF'
// CommonJS compatibility layer for deployment
const path = require('path');
const { fileURLToPath } = require('url');

// Polyfill import.meta for CommonJS
global.import = global.import || {};
global.import.meta = global.import.meta || {};
global.import.meta.url = 'file://' + __filename;
global.import.meta.dirname = __dirname;

// Polyfill __dirname and __filename for compatibility
global.__dirname = __dirname;
global.__filename = __filename;

// Helper function for import.meta.url compatibility
global.fileURLToPath = (url) => {
  if (typeof url === 'string' && url.startsWith('file://')) {
    return url.slice(7);
  }
  return url;
};

// Helper function for path.dirname compatibility
global.fileURLToPathDirname = (p) => {
  return path.dirname(fileURLToPath(p));
};

// Now require the main server file
console.log('Starting server with CommonJS compatibility fixes...');
require('./index.js');
EOF

# Create deployment package.json (CommonJS format)
echo "📄 Creating deployment package.json..."
cat > dist/package.json << 'EOF'
{
  "name": "workspace-production",
  "version": "1.0.0",
  "type": "commonjs",
  "main": "server-start.cjs",
  "scripts": {
    "start": "node server-start.cjs"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

echo ""
echo "✅ Deployment build completed successfully!"
echo ""
echo "📂 Generated files:"
echo "  - dist/index.js (server - CommonJS format)"
echo "  - dist/server-start.cjs (CommonJS compatibility layer)"
echo "  - dist/package.json (deployment config with type: \"commonjs\")"
echo "  - dist/public/ (client assets)"
echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "💡 Deployment fixes applied:"
echo "   ✓ Changed server build format from ESM to CommonJS"
echo "   ✓ Externalized all Node.js built-in modules"
echo "   ✓ Created deployment-specific package.json with \"type\": \"commonjs\""
echo "   ✓ Added CommonJS compatibility layer for import.meta usage"
echo ""
echo "📋 Next steps:"
echo "   1. Install dependencies: cd dist && npm install"
echo "   2. Start the server: npm start"