#!/bin/bash
set -e

echo "🔧 Starting production build with dependency fixes..."

# Step 1: Clean install to fix rollup native dependency issues
echo "📦 Installing dependencies with rollup fix..."
rm -rf package-lock.json node_modules
npm install --ignore-optional --no-optional

# Step 2: Install missing dependencies explicitly
echo "🔧 Installing missing dependencies..."
npm install @rollup/rollup-linux-x64-gnu @babel/preset-typescript lightningcss --save-dev --ignore-optional

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
  --external:@babel/runtime \
  --external:lightningcss \
  --external:lightningcss-linux-x64-gnu \
  --external:lightningcss-linux-x64-musl \
  --external:lightningcss-darwin-x64 \
  --external:lightningcss-win32-x64-msvc \
  --external:../pkg \
  --external:@swc/core \
  --external:@swc/helpers \
  --external:esbuild \
  --external:typescript \
  --external:tsx \
  --external:*.node \
  --external:pg-native \
  --external:bcrypt \
  --external:@rollup/rollup-linux-x64-gnu \
  --external:@rollup/rollup-darwin-x64 \
  --external:@rollup/rollup-win32-x64-msvc \
  --external:rollup \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-runtime-error-modal \
  --external:fsevents \
  --external:node-gyp \
  --external:node-addon-api \
  --format=esm \
  --target=node18 \
  --minify \
  --tree-shaking \
  --define:process.env.NODE_ENV='"production"' \
  --define:__DEV__=false

# Step 5: Create index.js wrapper
echo "📄 Creating index.js wrapper..."
echo 'import("./server.js");' > dist/index.js

echo "✅ Production build completed successfully!"