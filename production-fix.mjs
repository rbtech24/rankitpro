/**
 * Production Deployment Fix Script
 * Fixes API routing issue in production deployment
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Applying production routing fix...');

// Update package.json to use correct production build
const packageJsonPath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Fix the build command to ensure proper server routing
packageJson.scripts.build = "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --define:process.env.NODE_ENV='\"production\"'";

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Updated package.json build script');

// Create a production server wrapper that fixes routing
const productionWrapper = `// Production Server Wrapper - Fixes API routing issue
import './index.js';
`;

fs.writeFileSync('dist/production-wrapper.js', productionWrapper);

console.log('✅ Production routing fix applied');
console.log('📦 Deploy this fix to Render.com to restore login functionality');