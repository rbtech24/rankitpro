import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Safe Vite configuration without top-level await
const safeViteConfig = {
  plugins: [
    {
      name: 'react',
      config() {
        return {
          esbuild: {
            jsx: 'automatic' as 'automatic',
          },
        };
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "client", "src"),
      "@shared": path.resolve(process.cwd(), "shared"),
      "@assets": path.resolve(process.cwd(), "attached_assets"),
    },
  },
  root: path.resolve(process.cwd(), "client"),
  build: {
    outDir: path.resolve(process.cwd(), "dist/public"),
    emptyOutDir: true,
  },
};

export async function setupVite(app: Express, server: Server) {
  try {
    log("Setting up Vite development server with safe configuration", "vite-safe");
    
    const serverOptions = {
      middlewareMode: true,
      hmr: { server },
      host: '0.0.0.0',
      allowedHosts: 'all',
    };

    const vite = await createViteServer({
      ...safeViteConfig,
      configFile: false,
      customLogger: {
        ...viteLogger,
        error: (msg, options) => {
          viteLogger.error(msg, options);
          // Don't exit on error in safe mode
        },
      },
      server: serverOptions,
      appType: "custom",
    });

    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;

      try {
        const clientTemplate = path.resolve(process.cwd(), "client", "index.html");

        // Always reload the index.html file from disk
        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`,
        );
        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
    
    log("Vite development server initialized successfully", "vite-safe");
    return vite;
  } catch (error) {
    log(`Vite setup failed: ${error instanceof Error ? error.message : String(error)}`, "vite-safe");
    log("Falling back to static file serving", "vite-safe");
    
    // Fallback to static serving
    const clientPath = path.resolve(process.cwd(), "client");
    app.use(express.static(clientPath));
    
    const nodeModulesPath = path.resolve(process.cwd(), "node_modules");
    app.use("/node_modules", express.static(nodeModulesPath));
    
    log("Static file serving enabled as fallback", "fallback");
    return null;
  }
}

export function serveStatic(app: Express) {
  const staticPath = path.resolve(process.cwd(), "dist/public");
  
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
    log(`Serving static files from ${staticPath}`);
  } else {
    // Development fallback
    const devStaticPath = path.resolve(process.cwd(), "client");
    app.use(express.static(devStaticPath));
    log(`Serving development files from ${devStaticPath}`);
  }

  // Serve uploaded files
  const uploadsPath = path.resolve(process.cwd(), "server/public/uploads");
  if (fs.existsSync(uploadsPath)) {
    app.use("/uploads", express.static(uploadsPath));
    log(`Serving uploads from ${uploadsPath}`);
  }

  // Serve additional static assets
  const publicPath = path.resolve(process.cwd(), "public");
  if (fs.existsSync(publicPath)) {
    app.use("/public", express.static(publicPath));
    log(`Serving public assets from ${publicPath}`);
  }

  // SPA fallback - serve index.html for unmatched routes
  app.get("*", (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/") || req.path.startsWith("/public/")) {
      return next();
    }

    const indexPath = path.resolve(staticPath, "index.html");
    const devIndexPath = path.resolve(process.cwd(), "client/index.html");
    
    const finalIndexPath = fs.existsSync(indexPath) ? indexPath : devIndexPath;
    
    if (fs.existsSync(finalIndexPath)) {
      res.sendFile(finalIndexPath);
    } else {
      res.status(404).send("Application not found");
    }
  });
}