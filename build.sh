#!/bin/bash
set -e

echo "🔨 Starting production build..."

# Ensure dist directory exists
mkdir -p dist

# Copy pre-built client files
echo "📦 Copying client application..."
cp -r client/dist/* dist/

# Build server with external dependencies
echo "🚀 Building server application..."
npx esbuild server/index.ts --platform=node --outfile=dist/server.js --bundle \
  --external:pg-native \
  --external:bcrypt \
  --external:@babel/preset-typescript/package.json \
  --external:@babel/preset-typescript \
  --external:@babel/core \
  --external:lightningcss \
  --external:../pkg \
  --external:@swc/core \
  --external:esbuild \
  --external:typescript \
  --external:*.node \
  --format=esm \
  --target=node18 \
  --minify=false

# Create production wrapper
echo "import('./server.js').catch(err => { console.error('Failed to start server:', err); process.exit(1); });" > dist/index.js

# Verify build outputs
if [ ! -f "dist/index.html" ]; then
  echo "❌ Client build verification failed: index.html not found"
  exit 1
fi

if [ ! -f "dist/server.js" ]; then
  echo "❌ Server build verification failed: server.js not found"
  exit 1
fi

echo "✅ Production build completed successfully!"