#!/bin/bash

# Deploy Build Script for Rank It Pro
# This script works around the build issues by running the correct build commands

echo "🚀 Starting deployment build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/public/*
rm -rf dist/index.js

# Build client from root directory (this works correctly)
echo "📦 Building client application..."
if npx vite build; then
    echo "✅ Client build completed successfully"
else
    echo "❌ Client build failed"
    exit 1
fi

# Build server with additional externals to fix babel issues
echo "🔧 Building server application..."
if npx esbuild server/index.ts --platform=node --outfile=dist/index.js --bundle --external:pg-native --external:bcrypt --external:@babel/preset-typescript --external:lightningcss --format=esm; then
    echo "✅ Server build completed successfully"
else
    echo "❌ Server build failed"
    exit 1
fi

# Verify build outputs
echo "🔍 Verifying build outputs..."
if [ -f "dist/public/index.html" ] && [ -f "dist/index.js" ]; then
    echo "✅ Build verification successful"
    echo "📊 Build summary:"
    echo "   - Client: $(find dist/public -name '*.js' -o -name '*.css' | wc -l) files"
    echo "   - Server: dist/index.js created"
    echo "   - Total size: $(du -sh dist/ | cut -f1)"
else
    echo "❌ Build verification failed"
    exit 1
fi

echo "🎉 Deployment build completed successfully!"