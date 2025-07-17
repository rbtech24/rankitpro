#!/bin/bash

# Deployment Verification Script
# This script verifies all deployment fixes are working correctly

echo "🔍 Verifying deployment configuration..."

# Check if required files exist
echo "📋 Checking required files..."
if [ ! -f "deploy-build.sh" ]; then
    echo "❌ deploy-build.sh not found"
    exit 1
fi

if [ ! -f "vite.config.ts" ]; then
    echo "❌ vite.config.ts not found"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    exit 1
fi

echo "✅ All required files found"

# Check if build script is executable
if [ ! -x "deploy-build.sh" ]; then
    echo "❌ deploy-build.sh is not executable"
    exit 1
fi

echo "✅ Build script is executable"

# Test the build process
echo "🔧 Testing build process..."
rm -rf dist

if ./deploy-build.sh > build.log 2>&1; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed - check build.log for details"
    exit 1
fi

# Verify build outputs
echo "📦 Verifying build outputs..."
if [ ! -d "dist" ]; then
    echo "❌ dist directory not created"
    exit 1
fi

if [ ! -d "dist/public" ]; then
    echo "❌ dist/public directory not created"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo "❌ dist/index.js not created"
    exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
    echo "❌ dist/public/index.html not created"
    exit 1
fi

echo "✅ All build outputs verified"

# Check for critical path alias imports
echo "🔍 Checking for path alias resolution..."
if grep -r "@/components/ui/button" dist/public/ > /dev/null 2>&1; then
    echo "❌ Unresolved path aliases found in build output"
    exit 1
fi

echo "✅ Path aliases resolved correctly"

# Check build file sizes
CLIENT_SIZE=$(du -sh dist/public | cut -f1)
SERVER_SIZE=$(du -sh dist/index.js | cut -f1)

echo "📊 Build Statistics:"
echo "  Client bundle: $CLIENT_SIZE"
echo "  Server bundle: $SERVER_SIZE"

# Clean up
rm -f build.log

echo "🎉 Deployment verification completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Use './deploy-build.sh' as your build command"
echo "2. Use 'node dist/index.js' as your start command"
echo "3. Ensure REPLIT_KEEP_PACKAGE_DEV_DEPENDENCIES=1 is set"
echo "4. Deploy to your platform of choice"