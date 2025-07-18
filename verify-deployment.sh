#!/bin/bash

# Deployment Verification Script
# This script verifies that the deployment build process works correctly

echo "🔍 Verifying deployment build process..."

# Clean previous build artifacts
echo "🧹 Cleaning previous build artifacts..."
rm -rf dist/

# Set environment variables
export REPLIT_KEEP_PACKAGE_DEV_DEPENDENCIES=1
export NODE_ENV=production

# Run the deployment build script
echo "🚀 Running deployment build script..."
./deploy-build.sh

# Verify build artifacts exist
echo "📊 Verifying build artifacts..."

if [ -f "dist/index.js" ]; then
    echo "✅ Server build successful: dist/index.js exists"
    echo "   Size: $(du -h dist/index.js | cut -f1)"
else
    echo "❌ Server build failed: dist/index.js missing"
    exit 1
fi

if [ -d "dist/public" ]; then
    echo "✅ Client build successful: dist/public/ exists"
    echo "   Files:"
    ls -la dist/public/
else
    echo "❌ Client build failed: dist/public/ missing"
    exit 1
fi

# Check for required files
if [ -f "dist/public/index.html" ]; then
    echo "✅ Client HTML exists"
else
    echo "❌ Client HTML missing"
    exit 1
fi

if [ -f "dist/public/assets/index-"*.js ]; then
    echo "✅ Client JS bundle exists"
else
    echo "❌ Client JS bundle missing"
    exit 1
fi

if [ -f "dist/public/assets/index-"*.css ]; then
    echo "✅ Client CSS bundle exists"
else
    echo "❌ Client CSS bundle missing"
    exit 1
fi

echo "🎉 Deployment verification successful!"
echo "📈 Build Summary:"
echo "   - Server: $(du -h dist/index.js | cut -f1)"
echo "   - Client: $(du -sh dist/public/ | cut -f1)"
echo "   - Total: $(du -sh dist/ | cut -f1)"
echo ""
echo "🚀 Ready for deployment!"
echo "   Use: node dist/index.js"