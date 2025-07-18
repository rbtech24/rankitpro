import express from 'express';

import { logger } from './services/logger';
const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ success: true });
});

// Simple login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'bill@mrsprinklerrepair.com' && password === 'TempAdmin2024!') {
    res.json({
      user: {
        id: 1,
        email: 'bill@mrsprinklerrepair.com',
        role: 'super_admin',
        username: 'admin'
      },
      message: 'Login successful'
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Current user endpoint
app.get('/me', (req, res) => {
  res.json({
    id: 1,
    email: 'bill@mrsprinklerrepair.com',
    role: 'super_admin',
    username: 'admin'
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  logger.info("Auth test server running on port ", {});
});