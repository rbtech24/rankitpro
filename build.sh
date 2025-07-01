#!/bin/bash

# Production build script for Render.com deployment
set -e

echo "🔨 Starting production build with custom configuration..."

# Create dist directory if it doesn't exist
mkdir -p dist

# Set Node.js to ignore optional dependencies that might cause platform issues
export npm_config_optional=false
export npm_config_ignore_optional=true

# Build client first using Vite (with fallback CSS processing)
echo "📦 Building client application..."
npx vite build client --mode production

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
  --format=esm \
  --target=node18 \
  --log-level=info \
  --minify=false

echo "✅ Production build completed successfully!"
echo "📊 Client assets: $(ls -la dist/assets/ | wc -l) files"
echo "🖥️  Server bundle: $(ls -lh dist/index.js)"
echo ""
echo "📁 Final build structure:"
ls -la dist/