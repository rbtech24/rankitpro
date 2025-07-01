// Simple server setup to bypass Vite configuration issues
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple API test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Serve static files if they exist
const staticPath = path.join(__dirname, '..', 'dist', 'public');
try {
  app.use(express.static(staticPath));
} catch (error) {
  console.log('Static files not available:', error.message);
}

// Fallback route
app.get('*', (req, res) => {
  res.json({ message: 'Rank It Pro API Server', path: req.path });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});