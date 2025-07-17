#!/usr/bin/env node

// This script runs before the default npm build and sets up the correct build environment

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Pre-build setup starting...');

// Create a backup of the original package.json
if (!fs.existsSync('package.json.original')) {
  execSync('cp package.json package.json.original');
}

// Read the current package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Override the build scripts to use our custom build process
packageJson.scripts = {
  ...packageJson.scripts,
  "build": "./build.sh",
  "build:client": "echo 'Using custom build process'",
  "build:server": "echo 'Using custom build process'"
};

// Write the modified package.json
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

console.log('✅ Pre-build setup complete - build scripts redirected to build.sh');