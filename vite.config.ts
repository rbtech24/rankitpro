import { defineConfig } from "vite";
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
});