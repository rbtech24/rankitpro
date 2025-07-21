#!/bin/bash
set -e

echo "Starting Rank It Pro production build..."

# Install dependencies
echo "Installing dependencies..."
npm install --omit=optional

# Build frontend
echo "Building frontend..."
npm run build:client

# Ensure dist directory exists
mkdir -p dist

# Build server with comprehensive externals
echo "Building server..."
npx esbuild server/index.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=cjs \
  --outfile=dist/server.js \
  --external:typescript \
  --external:@babel/core \
  --external:lightningcss \
  --external:lightningcss-linux-x64-gnu \
  --external:lightningcss-linux-x64-musl \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-runtime-error-modal \
  --external:'*.node' \
  --minify || {
    echo "esbuild failed, using tsx for production..."
    echo '#!/usr/bin/env node' > dist/server.js
    echo 'require("tsx/cli/run")(process.argv.slice(2), "./server/index.ts");' >> dist/server.js
    chmod +x dist/server.js
  }

# Copy package files
echo "Copying package configuration..."
cp package.json dist/package.json
cp package-lock.json dist/package-lock.json

echo "Build completed successfully!"
echo "Files created: $(ls -la dist/)"