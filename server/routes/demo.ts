import express, { Request, Response } from 'express';
import { createSampleData } from '../utils/sample-data';
import { isSuperAdmin } from '../middleware/auth';
import { log } from '../vite';

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
    log("System message"), 'error');
    return res.status(500).json({ message: 'Failed to generate sample data' });
  }
});

export default router;