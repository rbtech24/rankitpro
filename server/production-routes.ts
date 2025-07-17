import type { Express } from "express";
import { storage } from "./storage";
import { createServer } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { insertUserSchema } from "@shared/schema";
import { isAuthenticated } from "./middleware/auth";
import express from "express";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express) {
  // Configure session middleware
  const isProduction = process.env.NODE_ENV === 'production';
  const sessionStore = isProduction ? 
    new (connectPg(session))({
      conString: process.env.DATABASE_URL,
      tableName: 'session',
      createTableIfMissing: false
    }) : 
    new SessionStore({});

  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: isProduction ? 2 * 60 * 60 * 1000 : 4 * 60 * 60 * 1000
    }
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Basic health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Authentication endpoints
  app.get('/api/auth/me', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

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

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.session.userId = user.id;
      res.json({ 
        message: 'Login successful', 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
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

  // Create HTTP server
  const server = createServer(app);
  
  return server;
}