#!/bin/bash
set -e

echo "🔨 Starting direct deployment build..."

# Step 1: Build client using vite directly
echo "📦 Building client application..."
npx vite build client

# Step 2: Create dist directory and copy client files
echo "📁 Copying client files to dist..."
mkdir -p dist
cp -r client/dist/* dist/

# Step 3: Build server with all external dependencies excluded
echo "🚀 Building server with external exclusions..."
npx esbuild server/index.ts \
  --platform=node \
  --outfile=dist/server.js \
  --bundle \
  --external:@babel/preset-typescript/package.json \
  --external:@babel/preset-typescript \
  --external:@babel/core \
  --external:lightningcss \
  --external:../pkg \
  --external:@swc/core \
  --external:esbuild \
  --external:typescript \
  --external:*.node \
  --external:pg-native \
  --external:bcrypt \
  --format=esm

# Step 4: Create index.js wrapper
echo "📄 Creating index.js wrapper..."
echo 'import("./server.js");' > dist/index.js

echo "✅ Direct deployment build completed successfully!"