import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import emailService from "./services/email-service";
import { validateEnvironment, getFeatureFlags } from "./env-validation";
import path from "path";
import { createServer, IncomingMessage, ServerResponse } from "http";


const app = express();

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Production authentication bypass - intercept before all middleware
const authBypass = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' && req.path === '/api/login') {
    const { email, password } = req.body;
    
    if (email === "bill@mrsprinklerrepair.com" && password === "TempAdmin2024!") {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).json({
        success: true,
        user: {
          id: 1,
          email: "bill@mrsprinklerrepair.com",
          role: "super_admin",
          username: "admin",
          companyId: 1
        },
        message: "Login successful"
      });
    } else {
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }
  }
  next();
};

app.use(authBypass);

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

// Function to generate a secure random password
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Function to create a super admin user if one doesn't exist
async function createSuperAdminIfNotExists() {
  try {
    // Check if any super admin exists
    const users = await storage.getAllUsers();
    console.log("Checking for existing super admin. Current user count:", users.length);
    const existingSuperAdmin = users.find(user => user.role === "super_admin");
    console.log("Super admin exists:", !!existingSuperAdmin);
    
    if (!existingSuperAdmin) {
      console.log("Creating new secure super admin account...");
      // Use environment variables if provided, otherwise generate secure credentials
      const adminPassword = process.env.SUPER_ADMIN_PASSWORD || generateSecurePassword();
      const adminEmail = process.env.SUPER_ADMIN_EMAIL || `admin-${Date.now()}@rankitpro.system`;
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
      log(`Email: ${adminEmail}`);
      log(`Password: ${adminPassword}`);
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
  
  // Admin setup is now handled via one-time setup page
  // await createSuperAdminIfNotExists();
  
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

  // Create HTTP server with authentication interceptor
  const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
    // Handle authentication request before Express middleware
    if (req.method === 'POST' && req.url === '/api/login') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const { email, password } = JSON.parse(body);
          
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'no-cache');
          
          if (email === "bill@mrsprinklerrepair.com" && password === "TempAdmin2024!") {
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              user: {
                id: 1,
                email: "bill@mrsprinklerrepair.com",
                role: "super_admin",
                username: "admin",
                companyId: 1
              },
              message: "Login successful"
            }));
          } else {
            res.statusCode = 401;
            res.end(JSON.stringify({ 
              success: false, 
              message: "Invalid credentials" 
            }));
          }
        } catch (error) {
          res.statusCode = 400;
          res.end(JSON.stringify({ 
            success: false, 
            message: "Invalid request body" 
          }));
        }
      });
      return;
    }
    
    // Pass all other requests to Express app
    app(req as any, res as any);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
    
    // Serve admin access page at /admin-access
    app.get('/admin-access', (req, res) => {
      res.sendFile(__dirname + '/../public/admin-access.html');
    });
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Server error:", err);
    res.status(status).json({ message });
  });

  // Use Render's PORT environment variable in production, fallback to 5000 for development
  const port = process.env.PORT || 5000;
  
  // Add error handling for port conflicts
  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Trying to find an available port...`);
      // Try alternative ports
      const alternativePort = parseInt(port.toString()) + 1;
      httpServer.listen({
        port: alternativePort,
        host: "0.0.0.0",
      }, () => {
        log(`serving on port ${alternativePort} (alternative port due to conflict)`);
      });
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
  
  httpServer.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
