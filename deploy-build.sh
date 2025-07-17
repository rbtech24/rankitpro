#!/bin/bash

# Deployment Build Script
# This script fixes the path alias resolution issues during build

echo "🚀 Starting deployment build process..."

# Set environment variables for build process
export REPLIT_KEEP_PACKAGE_DEV_DEPENDENCIES=1
export NODE_ENV=production

# Build client with proper path resolution
echo "📦 Building client..."
npx vite build

# Check if client build was successful
if [ $? -eq 0 ]; then
    echo "✅ Client build successful"
else
    echo "❌ Client build failed"
    exit 1
fi

# Build server with external dependencies
echo "🔧 Building server..."
npx esbuild server/index.ts \
    --platform=node \
    --outfile=dist/index.js \
    --bundle \
    --external:pg-native \
    --external:bcrypt \
    --external:@babel/core \
    --external:lightningcss \
    --external:typescript \
    --format=esm

# Check if server build was successful
if [ $? -eq 0 ]; then
    echo "✅ Server build successful"
else
    echo "❌ Server build failed"
    exit 1
fi

echo "🎉 Deployment build completed successfully!"
echo "📊 Build artifacts:"
echo "   - Client: dist/public/"
echo "   - Server: dist/index.js"