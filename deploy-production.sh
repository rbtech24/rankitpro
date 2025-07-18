#!/bin/bash

# Production Deployment Script
# This script fixes the build issues by running the correct commands

set -e

echo "🚀 Starting production deployment..."

# Set environment variable to keep dev dependencies during build
export REPLIT_KEEP_PACKAGE_DEV_DEPENDENCIES=1

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist

# Build client with correct command (avoiding the duplicate 'client' path)
echo "📦 Building client..."
npx vite build

# Build server with proper externals
echo "🛠️ Building server..."
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
  --format=esm \
  --target=node18

echo "✅ Build completed successfully!"

# Verify build output
echo "📋 Build output verification:"
ls -la dist/
echo ""
echo "📄 Client assets:"
ls -la dist/public/assets/ 2>/dev/null || echo "No assets directory found"

echo "🎉 Deployment ready! You can now deploy to Replit."