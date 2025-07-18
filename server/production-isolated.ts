import express, { type Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import emailService from "./services/resend-email-service";
import { validateEnvironment, getFeatureFlags } from "./env-validation";
import path from "path";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import MemoryOptimizer from "./services/memory-optimizer";
import { errorMonitor, logError } from "./error-monitor";
import session from "express-session";
import MemoryStore from "memorystore";

// Extend session interface to include userId
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

const app = express();

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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  validate: process.env.NODE_ENV === 'production' ? undefined : {
    xForwardedForHeader: false,
    trustProxy: false
  },
  skip: (req) => {
    return req.path === '/health' || req.path === '/api/health';
  }
});

app.use('/api/', limiter);

// CORS configuration
app.use((req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = isProduction 
    ? [process.env.FRONTEND_URL, 'https://your-domain.com'].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000'];

  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
const MemoryStoreSession = MemoryStore(session);
app.use(session({
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    res.json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    logError('Login error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logError('Logout error', err);
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/auth/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    logError('Get user error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Basic API endpoints
app.get('/api/users', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    logError('Get users error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Serve static files from the built client
const publicPath = path.join(process.cwd(), 'public');
app.use(express.static(publicPath));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logError('Express error handler', err);
  
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Initialize services and start server
async function startServer() {
  try {
    console.log('Database connection mode:', process.env.NODE_ENV || 'development', 'SSL:', process.env.DATABASE_URL?.includes('sslmode=require') ? 'true' : 'false', 'Provider:', process.env.DATABASE_URL?.includes('neon') ? 'Neon' : 'PostgreSQL');
    
    // Initialize storage
    await storage.initialize?.();
    console.log('✅ Database connection initialized');

    // Initialize services
    console.log('🔍 Penetration Testing Simulator initialized');
    console.log('🔧 Session Testing Framework initialized');
    
    // Initialize email service
    try {
      await emailService.initialize();
    } catch (error) {
      console.warn('Email service initialization failed - notifications will be disabled');
    }

    // Environment validation
    const envConfig = validateEnvironment();
    // The validateEnvironment function already logs warnings and handles errors

    // Initialize memory optimizer
    try {
      const memoryOptimizer = new MemoryOptimizer();
      memoryOptimizer.startMonitoring();
      console.log('🧹 Memory optimization service initialized');
    } catch (error) {
      console.warn('Memory optimizer initialization failed - continuing without it');
    }

    // Feature flags
    const features = getFeatureFlags();
    console.log('🚀 Starting Rank It Pro SaaS Platform (Production Mode)');
    console.log(`📊 Features enabled: ${Object.entries(features).filter(([, enabled]) => enabled).map(([key]) => key).join(', ')}`);

    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Production server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start production server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();