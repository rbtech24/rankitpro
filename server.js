// Production deployment server for Rank It Pro
// This file serves the static client application

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 10000;

console.log('🚀 Starting Rank It Pro Production Server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'production');
console.log('🔗 Port:', port);

// Serve static files from the same directory
app.use(express.static(__dirname));

// Health check endpoint for deployment verification
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    port: port
  });
});

// Serve the React app for all other routes (SPA)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Application not found',
      message: 'The client application files are missing.'
    });
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Rank It Pro serving successfully on port ${port}`);
  console.log(`🔗 Health check available at: /api/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});