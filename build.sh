#!/bin/bash

echo "🔨 Building Rank It Pro for production..."

# Clean previous builds
rm -rf dist/
mkdir -p dist

# Build client first
echo "📦 Building client application..."
npx vite build --mode production

# Check if client build succeeded
if [ $? -ne 0 ]; then
  echo "❌ Client build failed"
  exit 1
fi

# Build server with esbuild directly, excluding all problematic dependencies
echo "🚀 Building server application..."
npx esbuild server/production-index.ts \
  --bundle \
  --outfile=dist/index.cjs \
  --platform=node \
  --format=cjs \
  --target=node18 \
  --minify=false \
  --sourcemap \
  --define:process.env.NODE_ENV='"production"' \
  --external:@babel/core \
  --external:@babel/preset-typescript \
  --external:babel-loader \
  --external:lightningcss \
  --external:lightningcss-linux-x64-gnu \
  --external:lightningcss-linux-x64-musl \
  --external:typescript \
  --external:tsx \
  --external:esbuild \
  --external:vite \
  --external:webpack \
  --external:rollup \
  --external:postcss \
  --external:tailwindcss \
  --external:autoprefixer \
  --external:fsevents \
  --external:bufferutil \
  --external:utf-8-validate \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-runtime-error-modal \
  --external:./vite.config.ts \
  --external:./server/vite.ts \
  --external:node-gyp \
  --external:node-addon-api \
  --external:react \
  --external:react-dom \
  --external:react-router-dom \
  --external:lucide-react \
  --external:pg-native \
  --external:bcrypt \
  --external:'*.node'

# Check if server build succeeded
if [ $? -ne 0 ]; then
  echo "❌ Server build failed"
  exit 1
fi

# Copy client assets to the correct location
if [ -d "client/dist" ]; then
  cp -r client/dist/* dist/
  echo "✅ Client assets copied to dist/"
else
  echo "❌ Client build directory not found"
  exit 1
fi

# Create index.js entry point
cat > dist/index.js << 'EOF'
const { fileURLToPath } = require('url');
const path = require('path');

// Set __dirname for CommonJS compatibility
global.__dirname = __dirname;

// Load the compiled server
require('./index.cjs');
EOF

echo "✅ Production build completed successfully!"
echo "📊 Build summary:"
echo "  - Client: $(du -h dist/index.html 2>/dev/null || echo 'N/A')"
echo "  - Server: $(du -h dist/index.cjs | cut -f1)"
echo "  - Total: $(du -sh dist/ | cut -f1)"
echo ""
echo "🚀 Ready for deployment!"