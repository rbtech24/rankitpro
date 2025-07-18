import express from 'express';
import { storage } from '../storage.js';

import { logger } from '../services/logger';
const router = express.Router();

// Public endpoint for website widget to fetch company info
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const company = await storage.getCompany(parseInt(id));
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    
    // Return only public information
    const publicCompanyInfo = {
      id: company.id,
      name: company.name,
      plan: company.plan,
      // Don't expose sensitive configuration data
      hasWordPressIntegration: !!company.wordpressConfig,
      hasEmbedWidget: !!company.javaScriptEmbedConfig,
      createdAt: company.createdAt
    };
    
    res.json({
      success: true,
      company: publicCompanyInfo
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: "Failed to fetch company information" });
  }
});

export default router;