import express, { Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { getAvailableAIProviders } from '../ai';

import { logger } from '../services/structured-logger';
const router = express.Router();

// Get all available AI providers
router.get('/', isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const providers = getAvailableAIProviders();
    return res.json(providers);
  } catch (error) {
    logger.error("Error logging fixed");
    return res.status(500).json({ message: 'Failed to fetch AI providers' });
  }
});

export default router;