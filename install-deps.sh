#!/bin/bash

# Custom dependency installation script for Render.com
# Completely removes problematic lightningcss dependencies

set -e

echo "🔧 Preparing dependency installation for Render.com..."

# Create a temporary package.json without lightningcss dependencies
echo "📝 Creating temporary package.json without problematic dependencies..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Remove all lightningcss related dependencies
delete pkg.dependencies['lightningcss'];
delete pkg.dependencies['lightningcss-linux-x64-gnu'];
delete pkg.dependencies['lightningcss-linux-x64-musl'];
delete pkg.devDependencies?.['lightningcss'];
delete pkg.optionalDependencies?.['lightningcss'];

// Only remove lightningcss specifically - keep other build tools  
const lightningCssOnly = ['lightningcss', 'lightningcss-linux-x64-gnu', 'lightningcss-linux-x64-musl'];
lightningCssOnly.forEach(dep => {
  delete pkg.dependencies[dep];
  delete pkg.devDependencies?.[dep];
  delete pkg.optionalDependencies?.[dep];
});

fs.writeFileSync('package.production.json', JSON.stringify(pkg, null, 2));
"

# Backup original and use the cleaned version
echo "💾 Backing up original package.json..."
cp package.json package.json.backup
cp package.production.json package.json

# Remove existing node_modules and package-lock
echo "🧹 Cleaning existing installation..."
rm -rf node_modules package-lock.json

# Install dependencies
echo "📦 Installing cleaned dependencies..."
npm install \
  --no-optional \
  --legacy-peer-deps \
  --no-audit \
  --loglevel=warn

echo "✅ Dependencies installed successfully without platform conflicts"