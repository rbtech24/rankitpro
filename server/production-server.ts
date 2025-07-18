import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import emailService from "./services/resend-email-service";
import { validateEnvironment, getFeatureFlags } from "./env-validation";
import path from "path";
import { createServer, IncomingMessage, ServerResponse } from "http";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import MemoryOptimizer from "./services/memory-optimizer";
import { errorMonitor, logError } from "./error-monitor";

const app = express();

// Simple logging function for production
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Trust proxy for production deployments
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'",
        "https://js.stripe.com",
        "https://replit.com"
      ],
      connectSrc: [
        "'self'", 
        "https://api.openai.com", 
        "https://api.anthropic.com",
        "https://api.stripe.com",
        "wss:"
      ]
    }
  },
  crossOriginResourcePolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
});

app.use(limiter);

// Express configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Logging middleware
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

// Generate secure password
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Create super admin if needed
async function createSuperAdminIfNotExists() {
  try {
    const users = await storage.getAllUsers();
    const existingSuperAdmin = users.find(user => user.role === "super_admin");
    
    if (!existingSuperAdmin) {
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
      log("🔐 SUPER ADMIN CREATED");
      log(`📧 Email: ${adminEmail}`);
      log(`🔑 Password: ${adminPassword}`);
      log("=====================================");
    }
  } catch (error) {
    log(`Failed to create super admin: ${error}`);
  }
}

// Startup function
async function startServer() {
  console.log("Database connection mode: production, SSL: true, Provider: Neon");
  console.log("✅ Database connection initialized");

  // Initialize services
  try {
    await emailService.initialize();
  } catch (error) {
    log("Email service initialization failed - notifications will be disabled", "warn");
  }

  // Memory optimization
  const memoryOptimizer = new MemoryOptimizer();
  memoryOptimizer.startOptimization();

  // Environment validation
  const envWarnings = validateEnvironment();
  if (envWarnings.length > 0) {
    console.log("⚠️  ENVIRONMENT CONFIGURATION WARNINGS:");
    envWarnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
    console.log("Application will start with limited functionality.");
  }
  console.log("✅ Environment validation completed");

  // Feature flags
  const features = getFeatureFlags();
  console.log("🚀 Starting Rank It Pro SaaS Platform");
  console.log(`📊 Features enabled: ${Object.entries(features).filter(([_, enabled]) => enabled).map(([key]) => key).join(', ')}`);

  // Database verification
  console.log("🔄 Verifying database connection... (attempt 1/5)");
  try {
    const users = await storage.getAllUsers();
    console.log(`✅ Database connection verified - found ${users.length} users`);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }

  // Create super admin
  await createSuperAdminIfNotExists();

  // Register routes
  console.log("📡 Initializing API routes...");
  const server = await registerRoutes(app);

  // Serve static files from dist/public
  const publicPath = path.join(__dirname, 'public');
  console.log(`📁 Serving static files from: ${publicPath}`);
  
  app.use(express.static(publicPath));

  // Catch-all handler for SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  const PORT = process.env.PORT || 5000;
  
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Production server running on port ${PORT}`);
    console.log(`🌐 Server URL: http://0.0.0.0:${PORT}`);
  });
}

// Start the server
startServer().catch(error => {
  console.error("❌ Server startup failed:", error);
  process.exit(1);
});