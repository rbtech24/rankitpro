#!/bin/bash
set -e

echo "🔨 Starting direct deployment build..."

# Step 1: Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist
mkdir -p dist

# Step 2: Build client using vite directly
echo "📦 Building client application..."
npx vite build client --mode production

# Step 3: Copy client files to dist
echo "📁 Copying client files to dist..."
cp -r client/dist/* dist/

# Step 4: Build server with comprehensive external exclusions
echo "🚀 Building server with comprehensive external exclusions..."
npx esbuild server/index.ts \
  --platform=node \
  --outfile=dist/server.js \
  --bundle \
  --format=esm \
  --target=node18 \
  --external:@babel/preset-typescript/package.json \
  --external:@babel/preset-typescript \
  --external:@babel/core \
  --external:lightningcss \
  --external:lightningcss-linux-x64-gnu \
  --external:lightningcss-linux-x64-musl \
  --external:../pkg \
  --external:@swc/core \
  --external:esbuild \
  --external:typescript \
  --external:tsx \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-runtime-error-modal \
  --external:tailwindcss \
  --external:autoprefixer \
  --external:postcss \
  --external:*.node \
  --external:pg-native \
  --external:bcrypt \
  --external:fsevents \
  --external:node-gyp \
  --external:node-addon-api

# Step 5: Create multiple server entry points for compatibility
echo "📄 Creating server entry points..."
echo 'import("./server.js");' > dist/index.js
echo 'import("./server.js");' > dist/index.cjs

# Step 6: Create package.json for dist directory
echo "📦 Creating package.json for dist..."
cat > dist/package.json << EOF
{
  "type": "module",
  "main": "index.js",
  "engines": {
    "node": ">=18"
  }
}
EOF

echo "✅ Direct deployment build completed successfully!"
echo "📊 Build artifacts created:"
echo "  - Static files: index.html, CSS, JS"
echo "  - Server bundle: server.js"
echo "  - Entry points: index.js, index.cjs"
echo "  - Package configuration: package.json"