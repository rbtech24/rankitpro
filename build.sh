#!/bin/bash

echo "🚀 Starting Render.com build process..."

# Clean up
rm -rf dist
rm -rf node_modules

# Install dependencies
npm install

# Run our deployment script
node render-deploy.mjs

echo "✅ Build completed successfully!"
echo "📁 Files ready in dist/ directory"
echo "🚀 Starting with: cd dist && node server.js"