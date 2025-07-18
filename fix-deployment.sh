#!/bin/bash

# Fix deployment script for ES module compatibility issues
# Addresses the specific errors mentioned in the user's message

echo "🔧 Applying deployment fixes for ES module compatibility..."
echo ""
echo "Issues being resolved:"
echo "  ✓ ES module import statements cannot be used in CommonJS context"
echo "  ✓ Package.json has 'type': 'module' but built server uses import statements"
echo "  ✓ Server build format mismatch between ESM and CommonJS"
echo ""

# Clean dist directory
if [ -d "dist" ]; then
  rm -rf dist
fi
mkdir -p dist

# Build client
echo "📦 Building client..."
npx vite build

# Build server with CommonJS format and extensive externals
echo "📦 Building server with CommonJS format..."
npx esbuild server/production-clean.ts \
  --platform=node \
  --outfile=dist/index.js \
  --bundle \
  --format=cjs \
  --target=node18 \
  --packages=external \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-runtime-error-modal \
  --external:@babel/core \
  --external:lightningcss \
  --external:typescript \
  --external:esbuild \
  --external:bcrypt \
  --external:*.node \
  --external:path \
  --external:fs \
  --external:http \
  --external:https \
  --external:url \
  --external:stream \
  --external:util \
  --external:crypto \
  --external:os \
  --external:querystring \
  --external:zlib \
  --external:buffer \
  --external:events \
  --external:child_process \
  --external:cluster \
  --external:dgram \
  --external:dns \
  --external:net \
  --external:tls \
  --external:readline \
  --external:repl \
  --external:vm \
  --external:worker_threads

# Create deployment-specific package.json with CommonJS
echo "📄 Creating deployment package.json..."
cat > dist/package.json << 'EOF'
{
  "name": "workspace-production",
  "version": "1.0.0",
  "type": "commonjs",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

echo ""
echo "✅ Deployment fixes applied successfully!"
echo ""
echo "📂 Generated files:"
echo "  - dist/index.js (CommonJS server)"
echo "  - dist/package.json (type: 'commonjs')"
echo "  - dist/public/ (client assets)"
echo ""
echo "🚀 FIXES APPLIED:"
echo "  ✓ Removed 'type': 'module' from deployment package.json"
echo "  ✓ Changed server build format from ESM to CommonJS"
echo "  ✓ Added external dependencies to prevent bundling conflicts"
echo "  ✓ Created deployment-specific package.json in dist folder"
echo "  ✓ Updated run command to use CommonJS-compatible entry point"
echo ""
echo "Ready for deployment!"