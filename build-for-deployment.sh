#!/bin/bash

echo "🚀 Starting deployment build process..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build client
echo "📦 Building client (frontend)..."
npx vite build

# Build server with CommonJS format to avoid ES module issues
echo "⚙️  Building server (backend)..."
esbuild server/index.ts \
  --platform=node \
  --outfile=dist/index.js \
  --bundle \
  --external:pg-native \
  --external:bcrypt \
  --external:@babel/core \
  --external:lightningcss \
  --external:typescript \
  --external:@babel/preset-typescript \
  --external:@swc/core \
  --external:esbuild \
  --external:*.node \
  --external:node_modules/* \
  --external:fs \
  --external:path \
  --external:os \
  --external:crypto \
  --external:util \
  --external:stream \
  --external:http \
  --external:https \
  --external:url \
  --external:querystring \
  --external:zlib \
  --external:events \
  --external:buffer \
  --external:net \
  --external:tls \
  --external:child_process \
  --external:cluster \
  --external:dns \
  --external:readline \
  --external:repl \
  --external:tty \
  --external:vm \
  --external:worker_threads \
  --format=cjs \
  --target=node18

# Create deployment-specific package.json for CommonJS
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

# Copy node_modules to dist for external dependencies
echo "📦 Copying node_modules..."
cp -r node_modules dist/

echo "✅ Deployment build completed successfully!"
echo ""
echo "📋 Build output:"
echo "  - Client: dist/public/"
echo "  - Server: dist/index.js"
echo "  - Config: dist/package.json"
echo ""
echo "🚀 Ready for deployment!"
echo "   Run: cd dist && npm start"