import express from 'express';
import path from 'path';
import { registerRoutes } from './routes';
import { db } from './db';

const app = express();

// For production, we know the structure - dist/index.js and dist/public/
const __dirname = process.cwd();

async function startServer() {
  try {
    // The database connection is already initialized in db.ts
    console.log("✅ Database connection ready");

    // Register API routes
    await registerRoutes(app);

    // Serve static files from public directory
    const publicPath = path.join(__dirname, 'public');
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