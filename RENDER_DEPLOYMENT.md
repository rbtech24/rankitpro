# Render.com Deployment Guide

## Overview
This guide provides the complete solution for deploying the Rank It Pro application to Render.com, resolving all ES module/CommonJS compatibility issues.

## Pre-deployment Fixes Applied

### 1. Fixed "use client" Directive Issue
- **Problem**: `"use client"` directive in `client/src/components/ui/tooltip.tsx` was causing build errors
- **Solution**: Removed the directive as it's not needed in Vite builds

### 2. ES Module Configuration
- **Problem**: Vite build command was incorrectly structured for Render.com
- **Solution**: Created proper build sequence with correct flags and configurations

### 3. Path Resolution
- **Problem**: `@/components/ui/button` imports were failing during build
- **Solution**: Fixed with proper Vite configuration and build process

## Deployment Files Created

### 1. `render-deploy.mjs` - Automated Deployment Script
- Handles complete build process for Render.com
- Temporarily switches to ES module configuration
- Creates optimized production build
- Restores development configuration

### 2. `vite.config.production.ts` - Production Vite Configuration
- Removes problematic development plugins
- Optimizes build for production
- Handles ES module compatibility

### 3. `package.production.json` - Production Package Configuration
- Includes `"type": "module"` for ES module support
- Optimized dependencies and scripts

## Render.com Build Configuration

### Build Command
```bash
rm -rf node_modules && npm install && node render-deploy.mjs
```

### Start Command
```bash
cd dist && node server.js
```

### Environment Variables
Set these in your Render.com dashboard:
- `NODE_ENV=production`
- `DATABASE_URL=your_postgresql_url`
- Any other required API keys

## Build Process

### What happens during deployment:
1. **Clean**: Remove previous build artifacts
2. **Backup**: Save original package.json
3. **Switch**: Use production package.json with ES modules
4. **Build Client**: Use production Vite config without problematic plugins
5. **Build Server**: Create ES module server bundle
6. **Package**: Create production-ready dist directory
7. **Restore**: Return to development configuration

### Build Output
- `dist/public/`: Client application (HTML, CSS, JS)
- `dist/server.js`: Server bundle (ES module format)
- `dist/package.json`: Production package configuration
- `dist/start.js`: Production start script

## Deployment Steps

### 1. Prepare Repository
```bash
# Run deployment build locally to test
node render-deploy.mjs

# Verify build works
cd dist && node server.js
```

### 2. Render.com Configuration
- **Service Type**: Web Service
- **Repository**: Your GitHub repository
- **Branch**: main
- **Build Command**: `rm -rf node_modules && npm install && node render-deploy.mjs`
- **Start Command**: `cd dist && node server.js`
- **Node Version**: 18 or higher

### 3. Environment Configuration
Set required environment variables in Render.com dashboard:
- Database connection strings
- API keys for external services
- Any application-specific configuration

## Troubleshooting

### Common Issues

#### 1. Build Fails with ES Module Errors
- **Cause**: Incorrect package.json configuration
- **Solution**: Ensure `render-deploy.mjs` is being used as build command

#### 2. Server Won't Start
- **Cause**: Missing environment variables or incorrect start command
- **Solution**: Verify all required environment variables are set

#### 3. Client Assets Not Found
- **Cause**: Incorrect build output directory
- **Solution**: Ensure build creates `dist/public/` directory structure

### Debug Commands
```bash
# Test build locally
node render-deploy.mjs

# Test server locally
cd dist && DATABASE_URL=your_local_db node server.js

# Check build output
ls -la dist/
ls -la dist/public/
```

## Production Verification

### After successful deployment:
1. **Health Check**: Verify server responds to requests
2. **Database**: Confirm database connection works
3. **Assets**: Check that CSS/JS files load correctly
4. **Features**: Test core application functionality

### Success Indicators
- ✅ Build completes without ES module errors
- ✅ Server starts successfully
- ✅ Client application loads and functions
- ✅ Database connections work
- ✅ No runtime errors in logs

## Files Summary

### New Files Created:
- `render-deploy.mjs` - Main deployment script
- `vite.config.production.ts` - Production build configuration
- `package.production.json` - Production package setup
- `RENDER_DEPLOYMENT.md` - This documentation

### Modified Files:
- `client/src/components/ui/tooltip.tsx` - Removed "use client" directive
- `replit.md` - Updated with deployment solution

## Status: ✅ Production Ready
All ES module compatibility issues resolved. The application is ready for deployment to Render.com.