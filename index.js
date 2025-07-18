
const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'dist/public')));

// Basic API endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo authentication
  if (email === 'bill@mrsprinklerrepair.com' && password === 'admin123') {
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: { email, role: 'admin' }
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  res.status(401).json({ message: 'Not authenticated' });
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Rank It Pro server running on port ' + PORT);
});
