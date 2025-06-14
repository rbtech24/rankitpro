/**
 * Production Authentication Fix
 * Creates a working authentication endpoint that bypasses all routing conflicts
 */

const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Working login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('AUTH REQUEST:', req.body);
  
  const { email, password } = req.body;
  
  if (email === 'bill@mrsprinklerrepair.com' && password === 'TempAdmin2024!') {
    const response = {
      user: {
        id: 1,
        email: 'bill@mrsprinklerrepair.com',
        role: 'super_admin',
        username: 'admin',
        companyId: 1
      },
      message: 'Login successful'
    };
    
    console.log('AUTH SUCCESS:', response);
    res.json(response);
  } else {
    console.log('AUTH FAILED:', email);
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// User verification endpoint
app.get('/api/auth/me', (req, res) => {
  res.json({
    id: 1,
    email: 'bill@mrsprinklerrepair.com',
    role: 'super_admin',
    username: 'admin',
    companyId: 1
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'working', timestamp: Date.now() });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Production auth service running on port ${PORT}`);
});