import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated, isCompanyAdmin } from '../middleware/auth';
import { logger } from '../services/logger';
import { WordPressService } from '../services/wordpress-service';
import crypto from 'crypto';

const router = Router();

// Get WordPress plugin for download
router.get('/plugin/:companyId', isAuthenticated, async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    
    if (isNaN(companyId)) {
      return res.status(400).json({ error: 'Invalid company ID' });
    }

    // Verify user has access to this company
    if (req.user.role !== 'super_admin' && req.user.companyId !== companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const company = await storage.getCompany(companyId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get or create API key for this company
    let apiKey = null;
    
    if (company.wordpressConfig) {
      try {
        const config = JSON.parse(company.wordpressConfig);
        apiKey = config.apiKey;
      } catch (error) {
        logger.error('Error parsing WordPress config', { error: error instanceof Error ? error.message : String(error) });
      }
    }
    
    if (!apiKey) {
      // Generate a new API key
      apiKey = crypto.randomBytes(32).toString('hex');
      
      // Store the API key in the company's WordPress configuration
      let config = {};
      
      if (company.wordpressConfig) {
        try {
          config = JSON.parse(company.wordpressConfig);
        } catch (error) {
          logger.error('Error parsing existing WordPress config', { error: error instanceof Error ? error.message : String(error) });
        }
      }
      
      config = { ...config, apiKey };
      
      await storage.updateCompany(companyId, {
        wordpressConfig: JSON.stringify(config)
      });
    }
    
    // Generate the WordPress plugin code
    const apiEndpoint = 'https://rankitpro.com/api';
    const pluginCode = await WordPressService.generatePluginCode(apiKey, apiEndpoint);
    
    // Validate plugin code exists
    if (!pluginCode || typeof pluginCode !== 'string') {
      return res.status(500).json({ error: 'Failed to generate plugin code' });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="rank-it-pro-plugin.php"');
    res.setHeader('Content-Length', Buffer.byteLength(pluginCode, 'utf8'));

    // Send the plugin code
    res.send(pluginCode);
    
    logger.info('WordPress plugin downloaded', { companyId, apiKey: apiKey.substring(0, 8) + '...' });
    
  } catch (error) {
    logger.error('Error generating WordPress plugin', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;