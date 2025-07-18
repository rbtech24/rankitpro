#!/bin/bash

echo "🚀 Manual Deployment Build Process"
echo "=================================="

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build client
echo "📦 Building client..."
npx vite build

# Build server with proper externals to avoid ES module issues
echo "⚙️  Building server..."
npx esbuild server/production.ts \
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
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-runtime-error-modal \
  --format=cjs \
  --target=node18

# Create deployment package.json
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

echo "✅ Build completed successfully!"
echo ""
echo "📋 Next steps for deployment:"
echo "1. Copy the entire 'dist' folder to your deployment environment"
echo "2. Install dependencies: cd dist && npm install"
echo "3. Start the application: npm start"
echo ""
echo "🔧 Files created:"
echo "  - dist/public/     (client assets)"
echo "  - dist/index.js    (server bundle)"
echo "  - dist/package.json (deployment config)"