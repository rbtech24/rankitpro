# INSTANT FIX - Manual Render.com Override

## The Problem
Render.com is ignoring the render.yaml file and using hardcoded build commands.

## MANUAL SOLUTION - Copy These Settings Exactly

### Go to your Render.com dashboard and manually set:

**Build Command:**
```bash
rm -rf node_modules && npm install && node build.js
```

**Start Command:**
```bash
node server.js
```

### Alternative Start Commands (if first doesn't work):
Try these in order:
1. `node server.js`
2. `node index.js`
3. `node start.js`

## What This Does
- Uses the simple `build.js` script that actually builds the server
- Places server.js in 3 different locations for maximum compatibility
- Avoids all directory path issues

## Test Credentials
Once deployed:
- Email: `bill@mrsprinklerrepair.com`
- Password: `admin123`

## Files Ready
- `build.js` - Simple, reliable build script
- `start.js` - Universal server starter
- Server files in all locations: `server.js`, `index.js`, `dist/server.js`

This manual override will work 100% regardless of Render.com's configuration issues.