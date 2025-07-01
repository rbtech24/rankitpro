#!/bin/bash

# Production build script for Render.com deployment
set -e

echo "🔨 Starting production build..."

# Build client first
echo "📦 Building client application..."
npm run build:client

# Build server with custom configuration
echo "🚀 Building server application..."
node build-server.js

echo "✅ Build completed successfully!"
echo "📊 Client build: dist/assets/"
echo "🖥️  Server build: dist/index.js"

# List build outputs
ls -la dist/