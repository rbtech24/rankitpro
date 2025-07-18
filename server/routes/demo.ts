import express, { Request, Response } from 'express';
import { createSampleData } from '../utils/sample-data';
import { isSuperAdmin } from '../middleware/auth';
// Simple logging function for production
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

const router = express.Router();

// Route to generate sample data (only available to super admins)
router.post('/generate-sample-data', isSuperAdmin, async (_req: Request, res: Response) => {
  try {
    const result = await createSampleData();
    log('Sample data generated successfully', 'info');
    
    return res.status(201).json({ 
      message: 'Sample data generated successfully',
      demoLogin: {
        email: result.adminEmail,
        password: result.adminPassword
      }
    });
  } catch (error) {
    log(`Error generating sample data: ${error}`, 'error');
    return res.status(500).json({ message: 'Failed to generate sample data' });
  }
});

export default router;