#!/bin/bash

# Production build script for Render.com deployment
set -e

echo "🔨 Starting production build with custom configuration..."

# Create dist directory if it doesn't exist
mkdir -p dist

# Install platform-specific dependencies for Render.com
echo "🔧 Installing platform-specific dependencies..."
npm install @rollup/rollup-linux-x64-gnu --save-dev || true

# Build client first using Vite with explicit config and environment
echo "📦 Building client application..."
NODE_ENV=production npx vite build client --config vite.config.production.ts --mode production

# Build server with comprehensive external dependencies to avoid babel/lightningcss issues
echo "🚀 Building server application with enhanced exclusions..."
npx esbuild server/index.ts \
  --platform=node \
  --outfile=dist/index.js \
  --bundle \
  --external:pg-native \
  --external:bcrypt \
  --external:@babel/preset-typescript/package.json \
  --external:@babel/preset-typescript \
  --external:@babel/core \
  --external:lightningcss \
  --external:../pkg \
  --external:@swc/core \
  --external:esbuild \
  --external:typescript \
  --external:*.node \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-runtime-error-modal \
  --external:./custom-vite \
  --external:./vite \
  --external:vite.config.ts \
  --external:vite.config.production.ts \
  --format=cjs \
  --target=node18 \
  --log-level=info \
  --minify=false \
  --define:process.env.NODE_ENV='"production"'

echo "✅ Production build completed successfully!"
echo "📊 Client assets: $(ls -la dist/assets/ | wc -l) files"
echo "🖥️  Server bundle: $(ls -lh dist/index.js)"
echo ""
echo "📁 Final build structure:"
ls -la dist/