// Override system environment variables first
process.env.VITE_STRIPE_PUBLIC_KEY = "pk_live_51Q1IJKABx6OzSP6kA2eNndSD5luY9WJPP6HSuQ9QFZOFGIlTQaT0YeHAQCIuTlHXEZ0eV04wBl3WdjBtCf4gXi2W00jdezk2mo";

import express, { type Request, Response, NextFunction } from "express";
// Dynamic import of routes to avoid circular dependencies
import { storage } from "./storage";
import bcrypt from "bcrypt";
import emailService from "./services/resend-email-service";
import { validateEnvironment, getFeatureFlags } from "./env-validation";
import path from "path";
import { createServer, IncomingMessage, ServerResponse } from "http";
import rateLimit from "express-rate-limit";
import { advancedRateLimit } from "./middleware/advanced-rate-limiting";
import helmet from "helmet";
import MemoryOptimizer from "./services/memory-optimizer";
import { errorMonitor, logError } from "./error-monitor";

import { logger } from './services/logger';
// Conditional imports for Vite (development only)
let setupVite: any, serveStatic: any, log: any;

async function initializeViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const viteModule = await import("./custom-vite");
    setupVite = viteModule.setupVite;
    serveStatic = viteModule.serveStatic;
    log = viteModule.log;
  } else {
    // Production static serving
    setupVite = () => Promise.resolve();
    serveStatic = (app: express.Application) => {
      app.use(express.static(path.join(__dirname, 'public')));
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
      });
    };
    log = console.log;
  }
}

// Global error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error("Unhandled Promise Rejection", reason instanceof Error ? reason : new Error(String(reason)));
  logError('Unhandled Promise Rejection', 'error');
});

process.on('uncaughtException', (error) => {
  logger.error("Uncaught Exception", error);
  logError('Uncaught Exception', 'error');
  process.exit(1);
});

const app = express();

// Trust proxy for production deployments (required for rate limiting)
// Configure trust proxy properly for production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy (Render)
} else {
  app.set('trust proxy', false);
}

// Security middleware - helmet for security headers
if (process.env.NODE_ENV === 'production') {
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
          "wss:",
          "ws:"
        ],
        frameSrc: [
          "'self'",
          "https://js.stripe.com",
          "https://hooks.stripe.com"
        ]
      }
    },
    crossOriginResourcePolicy: false,
    // Allow payment iframe embedding
    crossOriginEmbedderPolicy: false
  }));
}
// Skip helmet entirely in development to avoid CSP conflicts with Vite

// Rate limiting with proper proxy configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Disable X-Forwarded-For validation in development to prevent ValidationError
  validate: process.env.NODE_ENV === 'production' ? undefined : {
    xForwardedForHeader: false,
    trustProxy: false
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});

app.use('/api/', limiter);

// Completely disable CSP and security headers in development 
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    // Disable all security headers for development
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('Content-Security-Policy-Report-Only');
    res.removeHeader('X-Content-Type-Options');
    res.removeHeader('X-Frame-Options');
    res.removeHeader('X-XSS-Protection');
    res.removeHeader('Strict-Transport-Security');
    res.removeHeader('X-Permitted-Cross-Domain-Policies');
    res.removeHeader('Referrer-Policy');
    // Allow geolocation, camera, and payment for mobile field app and Stripe
    res.setHeader('Permissions-Policy', 'camera=*, microphone=(), geolocation=*, payment=*');

    // Explicitly set to allow everything
    res.set('Content-Security-Policy', 'script-src * \'unsafe-inline\' \'unsafe-eval\' data: blob:; object-src * data: blob:; style-src * \'unsafe-inline\' data: blob:; img-src * data: blob:; connect-src * ws: wss: data: blob:; font-src * data: blob:; frame-src * data: blob:; media-src * data: blob:; default-src * \'unsafe-inline\' \'unsafe-eval\' data: blob:;');
  }
  next();
});

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

// Trust proxy for production deployment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Session configuration
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

app.use(session({
  store: new SessionStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || 'dev-session-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 4 * 60 * 60 * 1000, // 4 hours
    sameSite: 'lax'
  },
  name: 'rankitpro_session',
  proxy: process.env.NODE_ENV === 'production'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'public', 'uploads')));

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
      let logLine = `${req.method} ${path} - ${res.statusCode} - ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` - Response: ${JSON.stringify(capturedJsonResponse).substring(0, 50)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      if (typeof log === 'function') {
        log(logLine);
      } else {
        console.log(logLine);
      }
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
    logger.info(`Found ${users.length} users in database`);
    const existingSuperAdmin = users.find(user => user.role === "super_admin");
    logger.info("Checking for existing super admin account");

    if (!existingSuperAdmin) {
      logger.info('Creating new secure super admin account...');
      // Use environment variables if provided, otherwise generate secure credentials
      const adminPassword = process.env.SUPER_ADMIN_PASSWORD || generateSecurePassword();
      const adminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@rankitpro.com";
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
      logger.info(`Email: ${adminEmail}`);
      logger.info(`Password: ${adminPassword}`);
      log("=====================================");
      log("SAVE THESE CREDENTIALS IMMEDIATELY");
      log("They will not be displayed again!");
      log("=====================================");
    }
  } catch (error) {
    logger.error("Super admin setup failed", error as Error);
  }
}

(async () => {
  // Validate environment variables before starting
  try {
    const env = validateEnvironment();
    const features = getFeatureFlags();

    logger.info('🚀 Starting Rank It Pro SaaS Platform');
    const enabledFeatures = Object.entries(features).filter(([_, enabled]) => enabled).map(([name]) => name).join(", ") || "none";
    logger.info(`Features enabled: ${enabledFeatures}`);
  } catch (error) {
    logger.error("Environment validation failed", error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }

  // Add database connection verification with improved retry logic
  let dbConnected = false;
  let retryCount = 0;
  const maxRetries = 5;

  while (!dbConnected && retryCount < maxRetries) {
    try {
      logger.info(`Database connection attempt ${retryCount + 1}/${maxRetries}`);

      // Import storage to trigger connection initialization
      const { storage } = await import("./storage");

      // Test the connection with a simple query
      const users = await storage.getAllUsers();
      logger.info("✅ Database connection test successful");
      dbConnected = true;
    } catch (error) {
      retryCount++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Database connection attempt ${retryCount}/${maxRetries} failed`, error instanceof Error ? error : new Error(errorMessage));

      // Check if it's a connection-related error
      const isConnectionError = errorMessage.includes('connect') || 
                              errorMessage.includes('timeout') ||
                              errorMessage.includes('SSL') ||
                              errorMessage.includes('ENOTFOUND') ||
                              errorMessage.includes('ECONNREFUSED');

      if (retryCount < maxRetries && isConnectionError) {
        const delay = Math.min(retryCount * 3000, 15000); // 3s, 6s, 9s, 12s, 15s
        logger.info(`🔄 Connection error detected. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if (retryCount >= maxRetries) {
        logger.error('❌ Database connection failed after all retries.');
        logger.error('💡 This might be due to:');
        logger.error('   - Network connectivity issues');
        logger.error('   - Incorrect DATABASE_URL configuration');
        logger.error('   - Database server being unavailable');
        logger.error('   - SSL configuration problems');
        logger.error('\n🚨 Application will start but database operations will fail!');
        break;
      } else {
        // Non-connection error, don't retry
        logger.error("Database connection failed with non-connection error", error instanceof Error ? error : new Error(errorMessage));
        break;
      }
    }
  }

  // Admin setup is now handled via one-time setup page
  // await createSuperAdminIfNotExists();

  // Initialize Vite or static serving
  await initializeViteOrStatic();

  // Email service is automatically initialized in the Resend service
  if (emailService.isEnabled()) {
    log("Email service initialized successfully", "info");
  } else {
    log("Email service initialization failed - notifications will be disabled", "warn");
  }

  // Initialize memory optimizer
  const memoryOptimizer = MemoryOptimizer.getInstance();
  memoryOptimizer.initialize();

  // Serve static uploaded files with proper headers
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
    setHeaders: (res, path) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }));

  // Initialize error monitoring system
  errorMonitor.setupRoutes(app);
  logError('Application startup initiated', 'info');

  // Import and register routes
  const registerRoutes = (await import("./routes")).default;
  registerRoutes(app);

  // API route handling - let routes handle their own responses
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      logger.info(`API request received: ${req.method} ${req.originalUrl}`);
    }
    next();
  });

  // Create server before setting up Vite
  const server = createServer(app);

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

  // Use enhanced error monitoring middleware
  app.use(errorMonitor.middleware());

  // Use Render's PORT environment variable in production, fallback to 5000 for development
  const port = process.env.PORT || 5000;

  // Add error handling for port conflicts
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${port} is already in use`, err, { port: Number(port) });
      // Try alternative ports
      const alternativePort = parseInt(port.toString()) + 1;
      server.listen({
        port: alternativePort,
        host: "0.0.0.0",
      }, () => {
    logger.info("Server started on alternative port", { port: alternativePort });
      });
    } else {
      logger.error("Unhandled error occurred");
      process.exit(1);
    }
  });

  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    logger.info("🚀 Server is running", { port, host: "0.0.0.0" });
    logger.info("📱 Ready to accept connections");
  });
})();