import express from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";

const app = express();
const port = process.env.PORT || 10000;

// Serve static files from the same directory
app.use(express.static(__dirname));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  });
});

// Catch-all for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not found');
  }
});

const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Rank It Pro serving on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'unknown'}`);
  console.log(`🔗 Health check: /api/health`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});