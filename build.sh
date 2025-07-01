#!/bin/bash

# Production build script for Render.com deployment
set -e

echo "🔨 Starting production build..."

# Build client first
echo "📦 Building client application..."
npm run build:client

# Build server with custom configuration to avoid babel/lightningcss issues
echo "🚀 Building server application with custom config..."
npx esbuild server/index.ts \
  --platform=node \
  --outfile=dist/index.js \
  --bundle \
  --external:pg-native \
  --external:bcrypt \
  --external:@babel/preset-typescript/package.json \
  --external:@babel/preset-typescript \
  --external:lightningcss \
  --external:../pkg \
  --external:@swc/core \
  --external:esbuild \
  --format=esm \
  --target=node18 \
  --log-level=info

echo "✅ Build completed successfully!"
echo "📊 Client build: dist/assets/"
echo "🖥️  Server build: dist/index.js"

# List build outputs
ls -la dist/