import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./production-routes";
import { serveStatic, log } from "./production-vite";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import emailService from "./services/resend-email-service";
import { validateEnvironment, getFeatureFlags } from "./env-validation";
import { v4 as uuidv4 } from "uuid";
import { createServer } from "http";
import path from "path";
import { WebSocketServer } from "ws";
// Memory optimizer disabled in production build

// Start the server
(async () => {
  // Validate environment variables before starting
  try {
    const env = validateEnvironment();
    const features = getFeatureFlags();
    
    console.log("🚀 Starting Rank It Pro SaaS Platform");
    console.log(`📊 Features enabled: ${Object.entries(features).filter(([_, enabled]) => enabled).map(([name]) => name).join(', ') || 'none'}`);
  } catch (error) {
    console.error("❌ Environment validation failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const app = express();

  // Database connection verification
  console.log("🔄 Verifying database connection... (attempt 1/5)");
  try {
    const users = await storage.getAllUsers();
    console.log(`✅ Database connection verified - found ${users.length} users`);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }

  // Initialize email service
  try {
    await emailService.initialize();
  } catch (error) {
    console.warn("Email service initialization failed - notifications will be disabled");
  }

  // Memory optimization service disabled in production build
  console.log("🧹 Memory optimization service disabled in production build");

  // Register routes and get the server
  const server = await registerRoutes(app);

  // Static serving for production
  serveStatic(app);

  // Port configuration
  const port = process.env.PORT || 5000;
  
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})().catch((error) => {
  console.error("💥 Server startup failed:", error);
  process.exit(1);
});