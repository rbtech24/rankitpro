#!/usr/bin/env node

// EMERGENCY FIX - Replace the broken build command with working one
const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚨 EMERGENCY FIX - Replacing broken vite.config.ts');

// Create a working vite.config.ts
const workingConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: "client",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});`;

// Backup current config
if (fs.existsSync('vite.config.ts')) {
  fs.writeFileSync('vite.config.ts.backup', fs.readFileSync('vite.config.ts'));
}

// Write working config
fs.writeFileSync('vite.config.ts', workingConfig);

console.log('✅ Fixed vite.config.ts - now running build...');

// Run the build
try {
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ BUILD SUCCESS!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}