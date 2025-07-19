#!/bin/bash

echo "🧪 Testing production build process..."

# Test TypeScript compilation without starting server
echo "Testing server TypeScript compilation..."
npx tsc --noEmit --project tsconfig.json

# Test client build
echo "Testing client build..."
npm run build:client

# Test server build with esbuild
echo "Testing server build..."
npx esbuild server/index.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=cjs \
  --outfile=dist/server.js \
  --external:pg-native \
  --external:lightningcss \
  --external:@babel/core \
  --external:typescript \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-runtime-error-modal \
  --define:process.env.NODE_ENV='"production"' \
  --minify

if [ $? -eq 0 ]; then
  echo "✅ Production build test successful!"
  ls -la dist/
else 
  echo "❌ Production build test failed"
fi