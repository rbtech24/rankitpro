#!/bin/bash

# Production build script for Render.com deployment
set -e

echo "🔨 Starting production build with custom configuration..."

# Create dist directory if it doesn't exist
mkdir -p dist

# Install platform-specific dependencies for Render.com
echo "🔧 Installing platform-specific dependencies..."
npm install @rollup/rollup-linux-x64-gnu --save-dev || true

# Create stub vite.config BEFORE building to prevent bundling issues
echo "Creating vite.config stub for production..."

# Create temporary backup of original vite.config.ts
mv vite.config.ts vite.config.original.ts

# Create production-safe CommonJS vite.config.ts (will be treated as CommonJS due to .ts extension)
cat > vite.config.ts << 'EOF'
// Production stub for vite.config - CommonJS format
module.exports = {
  plugins: [],
  resolve: { alias: {} },
  root: process.cwd(),
  build: { outDir: 'public' }
};
module.exports.default = module.exports;
EOF

# Build client first using Vite with explicit config and environment
echo "📦 Building client application..."
NODE_ENV=production npx vite build client --config vite.config.production.ts --mode production

# Build server with comprehensive external dependencies to avoid babel/lightningcss issues
echo "🚀 Building server application with enhanced exclusions..."

# Create a temporary production index.ts that handles the Vite import issue
echo "Creating production-safe server entry point..."
sed 's|const viteModule = await import("./custom-vite");|throw new Error("Vite not available in production");|g' server/index.ts > server/index.production.ts

npx esbuild server/index.production.ts \
  --platform=node \
  --outfile=dist/server.js \
  --bundle \
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
  --external:vite \
  --external:@vitejs/* \
  --external:@replit/* \
  --external:rollup \
  --external:./custom-vite* \
  --external:./vite* \
  --external:../vite.config* \
  --external:vite.config* \
  --external:server/vite.ts \
  --format=cjs \
  --target=node18 \
  --log-level=info \
  --minify=false \
  --define:process.env.NODE_ENV='"production"'

# Clean up temporary files
rm -f server/index.production.ts

# Keep the stub vite.config.ts for production - do NOT restore original
# The original is backed up as vite.config.original.ts and can be restored manually if needed
echo "Production stub vite.config.ts will remain in place for deployment"

echo "✅ Production build completed successfully!"
echo "📊 Client assets: $(ls -la dist/assets/ | wc -l) files"
echo "🖥️  Server bundle: $(ls -lh dist/server.js)"

# Create production package.json with CommonJS type
echo "Creating production package.json..."
cat > dist/package.json << 'EOF'
{
  "name": "rankitpro-production",
  "version": "1.0.0",
  "main": "server.js",
  "type": "commonjs",
  "scripts": {
    "start": "node server.js"
  }
}
EOF

# Temporarily modify package.json to support CommonJS vite.config.js
echo "Temporarily setting package.json to CommonJS mode for production..."
cp package.json package.json.backup
sed 's/"type": "module"/"type": "commonjs"/g' package.json > package.json.tmp && mv package.json.tmp package.json

# Create CommonJS vite.config.js in main directory for production
echo "Creating CommonJS vite.config.js for production..."
cat > vite.config.js << 'EOF'
// Production stub for vite.config - CommonJS format
module.exports = {
  plugins: [],
  resolve: { alias: {} },
  root: process.cwd(),
  build: { outDir: 'public' }
};
module.exports.default = module.exports;
EOF

# Note: package.json.backup contains the original and can be restored after deployment

# Create index.js that points to server.js for compatibility
echo "module.exports = require('./server.js');" > dist/index.js


echo ""
echo "📁 Final build structure:"
ls -la dist/