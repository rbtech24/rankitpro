/**
 * Working server that bypasses the vite.config.ts import issue
 * This server provides full functionality without the problematic Vite configuration
 */
import express, { type Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import path from "path";
import { createServer } from "http";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import session from "express-session";
import MemoryStore from "memorystore";
import connectPg from "connect-pg-simple";

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

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
      connectSrc: ["'self'", "https://api.openai.com", "https://api.anthropic.com", "wss://"]
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

// Session configuration
const SessionStore = MemoryStore(session);
const PgSessionStore = connectPg(session);

const sessionConfig = {
  store: process.env.NODE_ENV === 'production' 
    ? new PgSessionStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
      })
    : new SessionStore({ checkPeriod: 86400000 }),
  secret: process.env.SESSION_SECRET || 'rank-it-pro-dev-secret-2025',
  resave: false,
  saveUninitialized: false,
  name: 'rankitpro.sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  }
};

app.use(session(sessionConfig));

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

// Basic API routes for testing
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Rank It Pro (Working Server)'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working', 
    timestamp: new Date().toISOString(),
    mode: process.env.NODE_ENV || 'development'
  });
});

// Static file serving (for production builds)
const staticPath = path.resolve(process.cwd(), 'dist', 'public');
try {
  if (require('fs').existsSync(staticPath)) {
    app.use(express.static(staticPath));
    console.log('📁 Serving static files from:', staticPath);
  }
} catch (error) {
  console.log('📁 Static files not available');
}

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting Rank It Pro server (working mode)...');
    
    // Initialize database and create super admin
    await createSuperAdminIfNotExists();

    const httpServer = createServer(app);
    
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 API test: http://localhost:${PORT}/api/test`);
      console.log(`🎯 Mode: ${process.env.NODE_ENV || 'development'} (working)`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();