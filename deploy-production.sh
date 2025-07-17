#!/bin/bash

# Production Deployment Build Script
# Fixes all path alias resolution issues and CSS loading problems

echo "🚀 Starting production deployment build..."

# Set environment variables for build process
export REPLIT_KEEP_PACKAGE_DEV_DEPENDENCIES=1
export NODE_ENV=production

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Create necessary directories
mkdir -p dist/public

# Build client with proper path resolution (from root directory)
echo "📦 Building client application..."
npx vite build

# Check if client build was successful
if [ $? -eq 0 ]; then
    echo "✅ Client build successful"
    echo "📊 Client assets generated:"
    ls -la dist/public/
else
    echo "❌ Client build failed"
    exit 1
fi

# Build server with comprehensive external dependencies
echo "🔧 Building server application..."
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
    --target=node18 \
    --log-level=info

# Check if server build was successful
if [ $? -eq 0 ]; then
    echo "✅ Server build successful"
    echo "🖥️  Server bundle: $(ls -lh dist/index.js)"
else
    echo "❌ Server build failed"
    exit 1
fi

echo "🎉 Production deployment build completed successfully!"
echo ""
echo "📁 Final build structure:"
ls -la dist/
echo ""
echo "✅ Ready for deployment!"