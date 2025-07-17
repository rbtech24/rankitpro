#!/bin/bash

# Deployment Build Script
# This script handles the build process for deployment with proper path resolution

echo "🚀 Starting deployment build process..."

# Set environment variables for production
export NODE_ENV=production
export REPLIT_KEEP_PACKAGE_DEV_DEPENDENCIES=1

# Clean any existing build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf dist

# Build client with correct path resolution
echo "📦 Building client application..."
npx vite build

if [ $? -ne 0 ]; then
  echo "❌ Client build failed"
  exit 1
fi

# Build server
echo "🔧 Building server application..."
npx esbuild server/index.ts --platform=node --outfile=dist/index.js --bundle --external:pg-native --external:bcrypt --external:@babel/core --external:lightningcss --external:typescript --format=esm

if [ $? -ne 0 ]; then
  echo "❌ Server build failed"
  exit 1
fi

echo "✅ Build completed successfully!"
echo "📂 Client build output: dist/public/"
echo "📂 Server build output: dist/index.js"