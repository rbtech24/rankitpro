import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import fs from "fs";
import { storage } from "./storage.js";
import session from "express-session";
import bcrypt from "bcrypt";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { db } from "./db.js";
import { isAuthenticated, isCompanyAdmin, isSuperAdmin } from "./middleware/auth.js";
import { WebSocketServer } from 'ws';

// Get __dirname equivalent for ESM/CJS compatibility
let __filename: string;
let __dirname: string;

try {
  __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (error) {
  __filename = (globalThis as any).__filename || __filename;
  __dirname = (globalThis as any).__dirname || __dirname;
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: ["'self'"]
      }
    }
  }));

  // Trust proxy for production deployments
  app.set('trust proxy', 1);

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api/', limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Session setup
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Basic API routes for authentication
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.session.userId = user.id;
      res.json({ 
        message: 'Login successful',
        user: { id: user.id, email: user.email, role: user.role }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  app.get('/api/auth/me', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      res.json({ user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Setup static file serving for production
  const publicPath = path.resolve(__dirname, "public");
  console.log("🔍 Looking for static files in:", publicPath);

  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
    console.log("✅ Static files middleware set up successfully");
  } else {
    console.error("❌ Public directory not found:", publicPath);
  }

  // WebSocket setup for real-time features
  const wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Echo message back for testing
        ws.send(JSON.stringify({ type: 'echo', data }));
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  // Serve React app for all other routes
  app.get("*", (req, res) => {
    const indexPath = path.join(publicPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Application not found. Please ensure the client is built.");
    }
  });

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Production server started on port ${PORT}`);
  });
}

// Start the server
startServer().catch(console.error);