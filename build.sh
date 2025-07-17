#!/bin/bash

# Production build script for Render.com deployment
set -e

echo "🔨 Starting production build with custom configuration..."

# Create dist directory if it doesn't exist
mkdir -p dist

# Build client first using Vite
echo "📦 Building client application..."
npx vite build client --outDir dist

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
echo "📊 Client assets: $(find dist -name "*.js" -o -name "*.css" | wc -l) files"
echo "🖥️  Server bundle: $(ls -lh dist/index.js)"
echo ""
echo "📁 Final build structure:"
ls -la dist/