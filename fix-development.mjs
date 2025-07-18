#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔧 Fixing development environment ES module issues...');

let viteConfigBackup = null;

try {
  // Step 1: Backup current vite.config.ts
  if (fs.existsSync('vite.config.ts')) {
    console.log('📦 Backing up current vite.config.ts...');
    viteConfigBackup = fs.readFileSync('vite.config.ts', 'utf8');
  }

  // Step 2: Create a fixed vite.config.ts that handles ES module imports properly
  console.log('🔧 Creating fixed vite.config.ts...');
  const fixedViteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async () => {
  // Dynamically import the runtime error overlay plugin to handle ES module compatibility
  let runtimeErrorPlugin = null;
  
  try {
    const { default: runtimeErrorOverlay } = await import("@replit/vite-plugin-runtime-error-modal");
    runtimeErrorPlugin = runtimeErrorOverlay();
  } catch (error) {
    console.warn("Runtime error overlay plugin not available, proceeding without it");
  }

  return {
    plugins: [
      react(),
      ...(runtimeErrorPlugin ? [runtimeErrorPlugin] : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      hmr: {
        port: 5173
      }
    }
  };
});`;

  // Step 3: Write the fixed config
  fs.writeFileSync('vite.config.ts', fixedViteConfig);
  
  console.log('✅ Fixed vite.config.ts created successfully');
  console.log('🚀 Development environment should now work properly');
  console.log('📝 Original vite.config.ts has been backed up as vite.config.ts.backup');
  
  // Step 4: Create backup file
  if (viteConfigBackup) {
    fs.writeFileSync('vite.config.ts.backup', viteConfigBackup);
  }
  
} catch (error) {
  console.error('❌ Failed to fix development environment:', error.message);
  
  // Restore original vite.config.ts on failure
  if (viteConfigBackup) {
    console.log('🔄 Restoring original vite.config.ts...');
    fs.writeFileSync('vite.config.ts', viteConfigBackup);
  }
  
  process.exit(1);
}