import { Router, Request, Response } from 'express';
import { logger } from '../services/logger';

const router = Router();

// System info endpoint to check environment
router.get('/info', async (req: Request, res: Response) => {
  logger.info('System info requested');
  res.json({
    nodeEnv: process.env.NODE_ENV,
    productionMode: process.env.NODE_ENV === 'production',
    timestamp: new Date().toISOString(),
    routeWorking: true
  });
});

export default router;