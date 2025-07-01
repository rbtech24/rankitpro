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
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
} else {
  app.set('trust proxy', false);
}

// Security middleware
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health' || req.path === '/api/health';
  }
});

app.use(limiter);

// Static file serving (minimal version without Vite)
const staticPaths = [
  path.resolve(process.cwd(), "client"),
  path.resolve(process.cwd(), "public"),
  path.resolve(process.cwd(), "dist/public")
];

// Serve static files from multiple locations
staticPaths.forEach(staticPath => {
  try {
    app.use(express.static(staticPath));
    console.log(`Serving static files from: ${staticPath}`);
  } catch (error) {
    console.log(`Could not serve from ${staticPath}`);
  }
});

// Serve uploaded files
const uploadsPath = path.resolve(process.cwd(), "server/public/uploads");
app.use("/uploads", express.static(uploadsPath));

function generateSecurePassword(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), byte =>
    byte.toString(36).padStart(2, '0')
  ).join('').slice(0, 24);
}

async function createSuperAdminIfNotExists() {
  try {
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || generateSecurePassword();
    
    const existingAdmin = await storage.getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      const superAdmin = await storage.createUser({
        email: adminEmail,
        password: hashedPassword,
        role: 'super_admin',
        firstName: 'Super',
        lastName: 'Admin'
      });
      
      console.log('✅ Super admin created successfully');
      console.log(`📧 Email: ${adminEmail}`);
      if (!process.env.SUPER_ADMIN_PASSWORD) {
        console.log(`🔐 Password: ${adminPassword}`);
        console.log('⚠️  Please save this password - it will not be shown again!');
      }
    }
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  }
}

async function startServer() {
  try {
    console.log('🚀 Starting Rank It Pro server...');
    
    // Validate environment
    const env = validateEnvironment();
    const features = getFeatureFlags();
    
    console.log('🔧 Environment validated');
    console.log('✨ Features:', Object.entries(features).filter(([, enabled]) => enabled).map(([name]) => name).join(', '));
    
    // Initialize memory optimizer
    const memoryOptimizer = new MemoryOptimizer();
    memoryOptimizer.startMonitoring();
    
    // Create super admin if needed
    await createSuperAdminIfNotExists();
    
    // Register all routes
    const server = await registerRoutes(app);
    
    // SPA fallback for unmatched routes
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/") || req.path.startsWith("/public/")) {
        return next();
      }
      
      const indexPaths = [
        path.resolve(process.cwd(), "dist/public/index.html"),
        path.resolve(process.cwd(), "client/index.html")
      ];
      
      for (const indexPath of indexPaths) {
        try {
          if (require('fs').existsSync(indexPath)) {
            return res.sendFile(indexPath);
          }
        } catch (error) {
          // Continue to next path
        }
      }
      
      res.status(404).send("Application not found");
    });
    
    const PORT = parseInt(process.env.PORT || "5000");
    
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🌟 Server running on http://0.0.0.0:${PORT}`);
      console.log(`📱 Access from network: http://localhost:${PORT}`);
      console.log('💫 Application ready!');
    });
    
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();