import express, { Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { getAvailableAIProviders } from '../ai';

const router = express.Router();

// Get all available AI providers
router.get('/', isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const providers = getAvailableAIProviders();
    return res.json(providers);
  } catch (error) {
    console.error('Error fetching AI providers:', error);
    return res.status(500).json({ message: 'Failed to fetch AI providers' });
  }
});

export default router;