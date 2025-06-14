/**
 * Production Deployment Fix Script
 * Deploys updated routing fix to Render.com
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Applying production routing fix...');

// Create a custom production server entry point
const productionServer = `
import express, { type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import { validateEnvironment, getFeatureFlags } from "./env-validation";
import { storage, initializeDatabase } from "./storage";
import { registerRoutes } from "./routes";
import { initializeScheduler } from "./services/scheduler";
import { log } from "./vite";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function createSuperAdminIfNotExists() {
  try {
    const users = await storage.getAllUsers();
    const hasSuperAdmin = users.some(user => user.role === "super_admin");
    console.log(\`Checking for existing super admin. Current user count: \${users.length}\`);
    console.log("Super admin exists:", hasSuperAdmin);
    
    if (!hasSuperAdmin) {
      console.log("Creating new secure super admin account...");
      const adminPassword = process.env.SUPER_ADMIN_PASSWORD || generateSecurePassword();
      const adminEmail = process.env.SUPER_ADMIN_EMAIL || \`admin-\${Date.now()}@rankitpro.system\`;
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await storage.createUser({
        username: "system_admin",
        email: adminEmail,
        password: hashedPassword,
        role: "super_admin",
        companyId: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null
      });
      
      log("=====================================");
      log("SYSTEM ADMIN ACCOUNT CREATED");
      log("=====================================");
      log(\`Email: \${adminEmail}\`);
      log(\`Password: \${adminPassword}\`);
      log("=====================================");
      log("SAVE THESE CREDENTIALS IMMEDIATELY");
      log("They will not be displayed again!");
      log("=====================================");
    }
  } catch (error) {
    console.error("Error creating super admin user:", error);
  }
}

(async () => {
  try {
    const env = validateEnvironment();
    const features = getFeatureFlags();
    
    console.log("🚀 Starting Rank It Pro SaaS Platform (Production)");
    console.log(\`📊 Features enabled: \${Object.entries(features).filter(([_, enabled]) => enabled).map(([name]) => name).join(', ') || 'none'}\`);
  } catch (error) {
    console.error("❌ Environment validation failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  try {
    await initializeDatabase();
    await createSuperAdminIfNotExists();
  } catch (error) {
    console.error("Database initialization error:", error);
  }

  const app = express();
  app.set("trust proxy", 1);
  
  // Register API routes FIRST (critical for production)
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Serve static files ONLY after API routes are registered
  const distPath = path.resolve(__dirname, "public");
  app.use(express.static(distPath));
  
  // SPA fallback - only for non-API routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next(); // Let API routes handle themselves
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  const port = process.env.PORT || 5000;
  
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(\`Production server running on port \${port}\`);
  });
})();
`;

// Write the production server file
fs.writeFileSync('dist/production-server.js', productionServer);

console.log('✅ Production routing fix applied');
console.log('📦 Ready for deployment to Render.com');

