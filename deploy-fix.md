# Deployment Fix - ESM to CommonJS

## Problem
The build succeeds but server fails to start with:
```
Error: Dynamic require of "path" is not supported
```

This happens because esbuild is bundling in ESM format (`--format=esm`) but dependencies like `body-parser` and `express` are trying to use CommonJS `require()` calls dynamically.

## Solution
Change the server build format from ESM to CommonJS and update the index.js wrapper accordingly.

## Updated Build Command
```bash
rm -rf package-lock.json node_modules && npm install --ignore-optional --no-optional && npm install @rollup/rollup-linux-x64-gnu --save-dev --ignore-optional && npm install rollup --save-dev --ignore-optional && mkdir -p dist && npx vite build client --outDir dist && npx esbuild server/index.ts --platform=node --outfile=dist/server.js --bundle --external:@babel/preset-typescript/package.json --external:@babel/preset-typescript --external:@babel/core --external:lightningcss --external:../pkg --external:@swc/core --external:esbuild --external:typescript --external:*.node --external:pg-native --external:bcrypt --format=cjs && echo 'require("./server.js");' > dist/index.js
```

## Key Changes
- `--format=esm` → `--format=cjs`
- `import("./server.js")` → `require("./server.js")`