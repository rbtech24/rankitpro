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
  plugins: [],
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
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  try {
    const vite = await createViteServer({
      ...safeViteConfig,
      server: serverOptions,
    });

    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);

    log("Vite dev server setup complete");
    return vite;
  } catch (error) {
    log(`Vite setup failed: ${error.message}`, "vite-error");
    
    // Fallback to static file serving
    const staticPath = path.resolve(process.cwd(), "client");
    app.use(express.static(staticPath));
    log("Fallback to static file serving enabled", "fallback");
    
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