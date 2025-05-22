import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import emailService from "./services/email-service";
import { createTestAccounts } from "./scripts/create-test-accounts";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Function to create a super admin user if one doesn't exist
async function createSuperAdminIfNotExists() {
  try {
    // Check if a super admin already exists
    const existingUser = await storage.getUserByEmail("superadmin@example.com");
    
    if (!existingUser) {
      // Create a super admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);
      
      await storage.createUser({
        username: "superadmin",
        email: "superadmin@example.com",
        password: hashedPassword,
        role: "super_admin",
        companyId: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null
      });
      
      log("Created default super admin account");
      log("Username: superadmin");
      log("Password: admin123");
    }
  } catch (error) {
    console.error("Error creating super admin user:", error);
  }
}

(async () => {
  // Create default super admin user if needed
  await createSuperAdminIfNotExists();
  
  // Create test accounts (company admin, technician)
  await createTestAccounts();
  
  // Initialize email service
  if (process.env.SENDGRID_API_KEY) {
    const emailInitialized = emailService.initialize();
    if (emailInitialized) {
      log("Email service initialized successfully", "info");
    } else {
      log("Email service initialization failed - notifications will be disabled", "warn");
    }
  } else {
    log("SENDGRID_API_KEY not found - email notifications will be disabled", "warn");
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
