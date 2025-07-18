import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(async ({ mode }) => {
  const plugins = [react()];
  
  // Only add runtime error overlay in development mode
  if (mode === 'development') {
    try {
      const runtimeErrorOverlay = await import('@replit/vite-plugin-runtime-error-modal');
      plugins.push(runtimeErrorOverlay.default());
    } catch (error) {
      console.warn('Runtime error overlay plugin not available, continuing without it');
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
  };
});