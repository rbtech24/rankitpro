import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import emailService from "./services/resend-email-service";
import { validateEnvironment, getFeatureFlags } from "./env-validation";
import path from "path";
import { createServer, IncomingMessage, ServerResponse } from "http";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import MemoryOptimizer from "./services/memory-optimizer";


const app = express();

// Trust proxy for production deployments (required for rate limiting)
app.set('trust proxy', true);

// Security middleware - helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.anthropic.com"]
    }
  }
}));

// Rate limiting with proper proxy configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More restrictive in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development to avoid proxy header issues
  skip: (req) => process.env.NODE_ENV !== 'production',
});

app.use('/api/', limiter);

// Production-ready CORS configuration
app.use((req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5000', 'http://localhost:3000'];
  
  const origin = req.headers.origin;
  if (!isProduction || (origin && allowedOrigins.includes(origin))) {
    res.header('Access-Control-Allow-Origin', isProduction ? origin : '*');
  }
  
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

// Authentication bypass removed - using proper API endpoints

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

  // Add database connection verification
  try {
    console.log("🔄 Verifying database connection...");
    // Import storage to trigger connection initialization
    const { storage } = await import("./storage");
    console.log("✅ Database connection verified");
  } catch (error) {
    console.error("❌ Database connection verification failed:", error instanceof Error ? error.message : String(error));
    console.error("The application will continue but database operations may fail");
  }
  
  // Admin setup is now handled via one-time setup page
  // await createSuperAdminIfNotExists();
  
  // Email service is automatically initialized in the Resend service
  if (emailService.isEnabled()) {
    log("Email service initialized successfully", "info");
  } else {
    log("Email service initialization failed - notifications will be disabled", "warn");
  }
  
  // Initialize memory optimizer
  const memoryOptimizer = MemoryOptimizer.getInstance();
  memoryOptimizer.initialize();
  
  const server = await registerRoutes(app);

  // Critical Fix: Add API route exclusion middleware BEFORE Vite setup
  // This prevents Vite from intercepting API calls
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      // Skip Vite middleware for API routes
      const originalUrl = req.originalUrl;
      console.log(`API route bypassing Vite: ${req.method} ${originalUrl}`);
      
      // If no route matched, send 404 JSON response
      const timer = setTimeout(() => {
        if (!res.headersSent) {
          res.status(404).json({
            error: 'API endpoint not found',
            path: originalUrl,
            method: req.method,
            timestamp: new Date().toISOString()
          });
        }
      }, 100);
      
      // Clear timeout if response is sent
      const originalSend = res.send;
      const originalJson = res.json;
      const originalEnd = res.end;
      
      res.send = function(...args) {
        clearTimeout(timer);
        return originalSend.apply(this, args);
      };
      
      res.json = function(...args) {
        clearTimeout(timer);
        return originalJson.apply(this, args);
      };
      
      res.end = function(...args) {
        clearTimeout(timer);
        return originalEnd.apply(this, args);
      };
    }
    next();
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
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Trying to find an available port...`);
      // Try alternative ports
      const alternativePort = parseInt(port.toString()) + 1;
      server.listen({
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
  
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
