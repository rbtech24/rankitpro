# Deployment Guide

## ES Module/CommonJS Compatibility Fix

This project had deployment issues due to ES module/CommonJS compatibility problems with the `@replit/vite-plugin-runtime-error-modal` plugin. The following solution has been implemented:

### Problem
- The original `vite.config.ts` imported `@replit/vite-plugin-runtime-error-modal` as CommonJS
- Build command `npm run build:client` failed due to ES module/CommonJS conflicts
- Server build needed ES module format support

### Solution Implemented

1. **Created Production Vite Config** (`vite.config.production.ts`)
   - Removes problematic runtime error overlay plugin for production builds
   - Configures optimized production settings
   - Uses ES module format consistently

2. **Created Production Package Config** (`package.production.json`)
   - Includes `"type": "module"` for ES module support
   - Updated build scripts to use ES module format
   - Maintains all dependencies from original package.json

3. **Created Deployment Script** (`deploy-fixed.mjs`)
   - Automatically handles package.json swapping
   - Builds client using production vite config
   - Builds server with ES module format
   - Restores original package.json after build

### Usage

#### For Deployment:
```bash
node deploy-fixed.mjs
```

#### For Manual Build:
```bash
# Build client only
npx vite build --config vite.config.production.ts --mode production

# Build server only
npx esbuild server/index.ts --platform=node --outfile=dist/index.js --bundle --format=esm --target=node18 [externals...]

# Build both (using production package.json)
node build-production.mjs
```

### Key Changes Made

1. **vite.config.production.ts**: Production-optimized Vite configuration without problematic plugins
2. **package.production.json**: ES module enabled package.json for builds
3. **deploy-fixed.mjs**: Automated deployment script that handles configuration swapping
4. **build-production.mjs**: Alternative build script for production

### Development vs Production

- **Development**: Uses original `vite.config.ts` with runtime error overlay
- **Production**: Uses `vite.config.production.ts` without problematic plugins
- **Package.json**: Automatically swapped during build, restored after completion

### Build Output

The deployment creates:
- `dist/public/`: Built client files (HTML, CSS, JS)
- `dist/index.js`: Built server bundle (ES module format)
- `dist/start.js`: Production start script

### Starting Production Server

```bash
node dist/index.js
```

### Troubleshooting

1. **Build fails**: Check that all dependencies are installed
2. **ES module errors**: Ensure Node.js version supports ES modules (v14+)
3. **Missing files**: Run `node deploy-fixed.mjs` to rebuild everything
4. **Package.json issues**: Script automatically backs up and restores package.json

This solution maintains development functionality while ensuring production builds work correctly.