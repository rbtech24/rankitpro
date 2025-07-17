#!/bin/bash
set -e

echo "🔧 Starting production build with dependency fixes..."

# Step 1: Clean install to fix rollup native dependency issues
echo "📦 Installing dependencies with rollup fix..."
rm -rf package-lock.json node_modules
npm install --ignore-optional --no-optional

# Step 2: Install rollup native dependency explicitly
echo "🔧 Installing rollup native dependency..."
npm install @rollup/rollup-linux-x64-gnu --save-dev --ignore-optional

# Step 3: Build client using existing pre-built files
echo "📁 Using pre-built client files..."
mkdir -p dist
cp -r client/dist/* dist/

# Step 4: Build server with comprehensive external exclusions
echo "🚀 Building server bundle..."
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
  --external:@rollup/rollup-linux-x64-gnu \
  --format=esm

# Step 5: Create index.js wrapper
echo "📄 Creating index.js wrapper..."
echo 'import("./server.js");' > dist/index.js

echo "✅ Production build completed successfully!"