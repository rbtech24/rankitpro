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

const app = express();

// Trust proxy for production deployments (required for rate limiting)
// Configure trust proxy properly for production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy (Render)
} else {
  app.set('trust proxy', false);
}

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
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // trustProxy handled separately above
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});

app.use(limiter);

// Helper function to generate secure password
function generateSecurePassword(): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

async function createSuperAdminIfNotExists() {
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'bill@mrsprinklerrepair.com';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || generateSecurePassword();

    const existingUser = await storage.getUserByEmail(superAdminEmail);
    if (!existingUser) {
      console.log('Creating super admin user...');
      const hashedPassword = await bcrypt.hash(superAdminPassword, 12);
      await storage.createUser({
        email: superAdminEmail,
        username: superAdminEmail,
        password: hashedPassword,
        role: 'super_admin'
      });
      console.log('Super admin created successfully');
      if (!process.env.SUPER_ADMIN_PASSWORD) {
        console.log(`Generated super admin password: ${superAdminPassword}`);
      }
    }
  } catch (error) {
    console.error('Error creating super admin:', error);
  }
}

// Initialize the memory optimizer
const memoryOptimizer = new MemoryOptimizer();

// Graceful shutdown handling
function setupGracefulShutdown() {
  const cleanup = () => {
    console.log('Cleaning up resources...');
    memoryOptimizer.cleanup();
    process.exit(0);
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

// Global error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Error handler middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Global error handler:', err);
  
  // Clear any problematic timers
  if (global.gc) {
    const clearTimerAndCall = (originalFn: Function, thisArg: any, args: any[]) => {
      try {
        return originalFn.apply(thisArg, args);
      } catch (e) {
        console.error('Timer-related error caught and cleared:', e);
        return undefined;
      }
    };
    
    // Wrap problematic timer functions
    ['setTimeout', 'setInterval', 'setImmediate'].forEach(fnName => {
      const original = (global as any)[fnName];
      (global as any)[fnName] = (...args: any[]) => clearTimerAndCall(original, global, args);
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Simple static file serving for development
function serveStaticFallback(app: express.Express) {
  const staticPath = path.resolve(process.cwd(), 'dist', 'public');
  try {
    if (require('fs').existsSync(staticPath)) {
      app.use(express.static(staticPath));
      console.log('Serving static files from:', staticPath);
    } else {
      console.log('Static files not available, serving API only');
    }
  } catch (error) {
    console.log('Static file serving disabled:', error.message);
  }
}

// Main server startup
(async () => {
  try {
    console.log('Starting Rank It Pro server...');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    
    // Validate environment
    validateEnvironment();
    const featureFlags = getFeatureFlags();
    console.log('Feature flags:', featureFlags);

    // Initialize database connection and create super admin
    await createSuperAdminIfNotExists();

    // Register all API routes
    const httpServer = await registerRoutes(app);

    // Try to setup Vite development server, fallback to static serving
    let viteSetupSuccess = false;
    
    if (process.env.NODE_ENV !== 'production') {
      try {
        // Dynamically import vite setup to avoid the config issue
        const { setupVite } = await import('./vite');
        await setupVite(app, httpServer);
        viteSetupSuccess = true;
        console.log('Vite development server setup successful');
      } catch (error) {
        console.warn('Vite setup failed, falling back to static serving:', error.message);
        serveStaticFallback(app);
      }
    } else {
      serveStaticFallback(app);
    }

    // Start the server
    const PORT = parseInt(process.env.PORT || '3000');
    
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Vite: ${viteSetupSuccess ? 'enabled' : 'disabled (fallback mode)'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });

    // Setup graceful shutdown
    setupGracefulShutdown();

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();