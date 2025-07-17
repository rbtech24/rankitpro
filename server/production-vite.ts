import express, { type Express } from "express";
import path from "path";
import fs from "fs";

// Get __dirname equivalent for CJS compatibility
const __dirname = process.cwd();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  // In production, files are in the same directory as the server
  const distPath = path.resolve(__dirname);

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// Production version - no Vite setup
export async function setupVite(_app: Express, _server: any) {
  console.warn("setupVite called in production mode - using static serving instead");
  return;
}