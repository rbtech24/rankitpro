import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { WebSocketServer } from 'ws';
import fs from "fs";
import { registerRoutes } from "./routes.js";

// Get __dirname equivalent for ESM/CJS compatibility
let __filename: string;
let __dirname: string;

try {
  // ESM environment
  __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (error) {
  // CJS environment - use Node.js globals
  __filename = (globalThis as any).__filename || __filename;
  __dirname = (globalThis as any).__dirname || __dirname;
}

async function startServer() {
  const app = express();

  // Setup static file serving for production
  const publicPath = path.resolve(__dirname, "public");
  console.log("🔍 Looking for static files in:", publicPath);

  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
    console.log("✅ Static files middleware set up successfully");
  } else {
    console.error("❌ Public directory not found:", publicPath);
  }

  // Register all routes using the existing routes setup
  const server = await registerRoutes(app);

  // Serve React app for all other routes
  app.get("*", (req, res) => {
    const indexPath = path.join(publicPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Application not found. Please ensure the client is built.");
    }
  });

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Production server started on port ${PORT}`);
  });
}

// Start the server
startServer().catch(console.error);