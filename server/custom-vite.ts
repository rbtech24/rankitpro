import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";


import { logger } from './services/logger';
// Get __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  logger.info("Syntax processed");
}

export async function setupVite(app: Express, server: Server) {
  // Ensure Stripe key is available for Vite
  process.env.VITE_STRIPE_PUBLIC_KEY = "pk_live_51Q1IJKABx6OzSP6kA2eNndSD5luY9WJPP6HSuQ9QFZOFGIlTQaT0YeHAQCIuTlHXEZ0eV04wBl3WdjBtCf4gXi2W00jdezk2mo";
  
  // Custom Vite configuration that handles dirname properly
  const viteConfig = {
    plugins: [
      // Disable React plugin completely and use esbuild for JSX transformation
    ],
    define: {
      'import.meta.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify(process.env.VITE_STRIPE_PUBLIC_KEY)
    },
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react',
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "..", "client", "src"),
        "@shared": path.resolve(__dirname, "..", "shared"),
        "@assets": path.resolve(__dirname, "..", "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "..", "client"),
    build: {
      outDir: path.resolve(__dirname, "..", "dist/public"),
      emptyOutDir: true,
    },

  };

  const serverOptions = {
    middlewareMode: true,
    hmr: { 
      server: server,
      port: 5000,
      host: "0.0.0.0",
    },
    host: "0.0.0.0",
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: {
      ...serverOptions,
      allowedHosts: true,
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  
  // Handle SPA routing - serve index.html for non-API routes
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip API routes, uploads, static assets, and Vite internals
    if (url.startsWith('/api/') || 
        url.startsWith('/uploads/') || 
        url.includes('.') ||
        url.startsWith('/@') ||
        url.startsWith('/__vite')) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");

      // Always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      console.error('Vite SPA fallback error:', e);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Static files directory not found: ${distPath}`,
    );
  }

  app.use(express.static(distPath));

  // Enhanced SPA fallback for production - serve index.html for client-side routes
  app.use("*", (req, res, next) => {
    // Skip API routes, uploads, static assets, and known backend routes
    if (req.path.startsWith('/api/') || 
        req.path.startsWith('/uploads/') || 
        req.path.includes('.') ||
        req.path.startsWith('/@') ||
        req.path.startsWith('/__vite')) {
      return next();
    }
    
    // Log SPA fallback for debugging
    console.log(`SPA fallback serving index.html for: ${req.path}`);
    
    // Serve index.html for all client-side routes
    res.sendFile(path.resolve(distPath, "index.html"), (err) => {
      if (err) {
        console.error('Error serving SPA fallback:', err);
        next(err);
      }
    });
  });
}