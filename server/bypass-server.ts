/**
 * Bypass server to work around Vite configuration issues
 * This provides a temporary solution while the main server config is fixed
 */
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import path from "path";
import { createServer } from "http";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for production deployments
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

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session middleware (simplified for bypass)
app.use((req: any, res, next) => {
  req.session = { userId: null };
  req.user = null;
  next();
});

// Create super admin function
async function createSuperAdminIfNotExists() {
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'bill@mrsprinklerrepair.com';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin2025!';

    const existingUser = await storage.getUserByEmail(superAdminEmail);
    if (!existingUser) {
      console.log('🔧 Creating super admin user...');
      const hashedPassword = await bcrypt.hash(superAdminPassword, 12);
      await storage.createUser({
        email: superAdminEmail,
        username: superAdminEmail,
        password: hashedPassword,
        role: 'super_admin'
      });
      console.log('✅ Super admin created successfully');
    }
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  }
}

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Rank It Pro (Bypass Mode)'
  });
});

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting Rank It Pro server (bypass mode)...');
    
    // Initialize database and create super admin
    await createSuperAdminIfNotExists();
    
    // Register API routes
    const httpServer = await registerRoutes(app);
    
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 API endpoints available`);
      console.log(`🎯 Mode: ${process.env.NODE_ENV || 'development'} (bypass)`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();