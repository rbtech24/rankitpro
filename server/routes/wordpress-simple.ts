import { Router, Request, Response } from 'express';
import { logger } from '../services/logger';

const router = Router();

// Simple test route to verify routing works
router.get('/test', async (req: Request, res: Response) => {
  logger.info('WordPress test endpoint hit');
  res.json({ message: 'WordPress routes working', timestamp: new Date().toISOString() });
});

// WordPress Plugin Download - Ultra Simple Version
router.get('/plugin', async (req: Request, res: Response) => {
  logger.info('WordPress plugin endpoint hit');
  
  const simplePlugin = `<?php
/**
 * Plugin Name: Rank It Pro
 * Description: Simple WordPress plugin for Rank It Pro
 * Version: 1.0.0
 */

// Basic shortcode
add_shortcode('rankitpro_test', function() {
    return '<p>Rank It Pro plugin is working!</p>';
});
?>`;

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="rank-it-pro-plugin.php"');
  res.send(simplePlugin);
  
  logger.info('Plugin sent successfully');
});

export default router;