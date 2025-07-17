#!/bin/bash

# Build script for production deployment
set -e

echo "🚀 Starting production build process..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/*

# Build client
echo "📦 Building client..."
npm run build:client

# Copy client build to dist
echo "📋 Copying client build to dist..."
cp -r client/dist/* dist/

# Build server using alternative build script
echo "🔧 Building server..."
node build-server.js

echo "✅ Production build completed successfully!"
echo "📊 Build summary:"
echo "   - Client files: $(ls -1 dist/*.html dist/*.css dist/*.js 2>/dev/null | wc -l) files"
echo "   - Server bundle: dist/index.js"
echo "   - Assets: $(ls -1 dist/assets/* 2>/dev/null | wc -l) files"