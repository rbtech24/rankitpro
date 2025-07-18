import express from 'express';
import path from 'path';
import session from 'express-session';
import MemoryStore from 'memorystore';
import helmet from 'helmet';
import { db } from './db';
import { isAuthenticated } from './middleware/auth';
import { users, companies, blogPosts, reviewRequests, apiCredentials, technicians, checkIns, companyLocations } from '@shared/schema';
import { eq, and, desc, asc, count } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Session configuration
const MemoryStoreSession = MemoryStore(session);
app.use(session({
  store: new MemoryStoreSession({
    checkPeriod: 86400000, // 24 hours
  }),
  secret: process.env.SESSION_SECRET || 'default-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Basic auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await db.select().from(users).where(eq(users.email, email)).then(rows => rows[0]);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session
    req.session.userId = user.id;
    
    // Get user with company info
    const userWithCompany = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      companyId: users.companyId,
      companyName: companies.name,
      companySlug: companies.slug,
    })
    .from(users)
    .leftJoin(companies, eq(users.companyId, companies.id))
    .where(eq(users.id, user.id))
    .then(rows => rows[0]);

    res.json({
      user: userWithCompany,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

app.get('/api/auth/me', isAuthenticated, async (req, res) => {
  try {
    const userWithCompany = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      companyId: users.companyId,
      companyName: companies.name,
      companySlug: companies.slug,
    })
    .from(users)
    .leftJoin(companies, eq(users.companyId, companies.id))
    .where(eq(users.id, req.session.userId!))
    .then(rows => rows[0]);

    res.json({ user: userWithCompany });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Basic dashboard routes
app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    // Get user's company
    const user = await db.select().from(users).where(eq(users.id, userId)).then(rows => rows[0]);
    if (!user?.companyId) {
      return res.status(400).json({ message: 'User not associated with a company' });
    }

    // Get basic stats
    const reviewCount = await db.select({ count: count() }).from(reviewRequests).where(eq(reviewRequests.companyId, user.companyId)).then(rows => rows[0].count);
    const blogPostCount = await db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.companyId, user.companyId)).then(rows => rows[0].count);
    const technicianCount = await db.select({ count: count() }).from(technicians).where(eq(technicians.companyId, user.companyId)).then(rows => rows[0].count);

    res.json({
      stats: {
        reviews: reviewCount,
        blogPosts: blogPostCount,
        technicians: technicianCount,
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Basic reviews route
app.get('/api/reviews', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    // Get user's company
    const user = await db.select().from(users).where(eq(users.id, userId)).then(rows => rows[0]);
    if (!user?.companyId) {
      return res.status(400).json({ message: 'User not associated with a company' });
    }

    // Get review requests
    const reviewsList = await db.select()
      .from(reviewRequests)
      .where(eq(reviewRequests.companyId, user.companyId))
      .orderBy(desc(reviewRequests.sentAt))
      .limit(50);

    res.json({ reviews: reviewsList });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

async function startServer() {
  try {
    console.log("✅ Database connection ready");

    // Serve static files from public directory
    const publicPath = path.join(process.cwd(), 'dist', 'public');
    app.use(express.static(publicPath));

    // Serve index.html for all other routes (SPA)
    app.get('*', (req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });

    const port = process.env.PORT || 5000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Production server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start production server:', error);
    process.exit(1);
  }
}

startServer();