import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { CheckInWithTechnician } from '@shared/schema';
import crypto from 'crypto';

import { logger } from '../services/logger';
const router = Router();

// Schema for JS widget configuration 
interface JSWidgetConfig {
  displayStyle: 'grid' | 'list' | 'carousel';
  theme: 'light' | 'dark' | 'auto';
  limit: number;
  showTechPhotos: boolean;
  showCheckInPhotos: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  customCSS?: string;
}

// Get default config for a company
const getDefaultConfig = (): JSWidgetConfig => {
  return {
    displayStyle: 'grid',
    theme: 'light',
    limit: 5,
    showTechPhotos: true,
    showCheckInPhotos: true,
    autoRefresh: false,
    refreshInterval: 300 // 5 minutes
  };
};

// Create company API key if it doesn't exist
const getOrCreateApiKey = async (companyId: number): Promise<string> => {
  const company = await storage.getCompany(companyId);
  if (!company) {
    throw new Error('Company not found');
  }
  
  // Check if company already has a JS widget configuration
  if (company.javaScriptEmbedConfig) {
    try {
      const config = JSON.parse(company.javaScriptEmbedConfig);
      if (config.apiKey) {
        return config.apiKey;
      }
    } catch (error) {
      // Invalid config, will create a new one
    }
  }
  
  // Generate new API key
  const apiKey = crypto.randomBytes(16).toString('hex');
  
  // Save API key to company configuration
  const widgetConfig = {
    apiKey,
    ...getDefaultConfig()
  };
  
  await storage.updateCompany(companyId, {
    ...company,
    javaScriptEmbedConfig: JSON.stringify(widgetConfig)
  });
  
  return apiKey;
};

// Helper function to validate API key
const validateApiKey = async (apiKey: string): Promise<number | null> => {
  // Get all companies
  const companies = await storage.getAllCompanies();
  
  // Find company with matching API key
  for (const company of companies) {
    if (company.javaScriptEmbedConfig) {
      try {
        const config = JSON.parse(company.javaScriptEmbedConfig);
        if (config.apiKey === apiKey) {
          return company.id;
        }
      } catch (error) {
        // Skip invalid config
      }
    }
  }
  
  return null;
};

// GET /api/integrations/js-widget/config
// Get JavaScript widget configuration
router.get('/js-widget/config', async (req: Request, res: Response) => {
  try {
    // Validate user is authenticated and has company
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const companyId = req.user!.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID required' });
    }
    
    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    let widgetConfig: JSWidgetConfig & { apiKey: string };
    
    // Check if company already has widget configuration
    if (company.javaScriptEmbedConfig) {
      try {
        const existingConfig = JSON.parse(company.javaScriptEmbedConfig);
        if (existingConfig.apiKey) {
          widgetConfig = existingConfig;
        } else {
          // Missing API key, create a new one
          const apiKey = await getOrCreateApiKey(companyId);
          widgetConfig = {
            apiKey,
            ...getDefaultConfig()
          };
        }
      } catch (error) {
        // Invalid configuration, create a new one
        const apiKey = await getOrCreateApiKey(companyId);
        widgetConfig = {
          apiKey,
          ...getDefaultConfig()
        };
      }
    } else {
      // No configuration exists, create a new one
      const apiKey = await getOrCreateApiKey(companyId);
      widgetConfig = {
        apiKey,
        ...getDefaultConfig()
      };
    }
    
    res.json(widgetConfig);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/integrations/js-widget/config
// Update JavaScript widget configuration
router.post('/js-widget/config', async (req: Request, res: Response) => {
  try {
    // Validate user is authenticated and has company
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const companyId = req.user!.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID required' });
    }
    
    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Get current config or create default
    let currentConfig: JSWidgetConfig & { apiKey: string };
    if (company.javaScriptEmbedConfig) {
      try {
        currentConfig = JSON.parse(company.javaScriptEmbedConfig);
        if (!currentConfig.apiKey) {
          currentConfig.apiKey = await getOrCreateApiKey(companyId);
        }
      } catch (error) {
        const apiKey = await getOrCreateApiKey(companyId);
        currentConfig = {
          apiKey,
          ...getDefaultConfig()
        };
      }
    } else {
      const apiKey = await getOrCreateApiKey(companyId);
      currentConfig = {
        apiKey,
        ...getDefaultConfig()
      };
    }
    
    // Update with new values
    const updatedConfig = {
      ...currentConfig,
      displayStyle: req.body.displayStyle || currentConfig.displayStyle,
      theme: req.body.theme || currentConfig.theme,
      limit: req.body.limit || currentConfig.limit,
      showTechPhotos: req.body.showTechPhotos !== undefined ? req.body.showTechPhotos : currentConfig.showTechPhotos,
      showCheckInPhotos: req.body.showCheckInPhotos !== undefined ? req.body.showCheckInPhotos : currentConfig.showCheckInPhotos,
      autoRefresh: req.body.autoRefresh !== undefined ? req.body.autoRefresh : currentConfig.autoRefresh,
      refreshInterval: req.body.refreshInterval || currentConfig.refreshInterval,
      customCSS: req.body.customCSS
    };
    
    // Save configuration
    await storage.updateCompany(companyId, {
      ...company,
      javaScriptEmbedConfig: JSON.stringify(updatedConfig)
    });
    
    res.json({
      message: 'Widget configuration updated successfully',
      config: updatedConfig
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/integrations/js-widget/embed-code
// Get JavaScript widget embed code
router.get('/js-widget/embed-code', async (req: Request, res: Response) => {
  try {
    // Validate user is authenticated and has company
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const companyId = req.user!.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID required' });
    }
    
    // Get or create API key
    const apiKey = await getOrCreateApiKey(companyId);
    
    // Generate embed code
    const embedCode = `
<!-- Rank it Pro Widget -->
<div id="checkin-widget" class="ci-widget"></div>
<script>
(function() {
  var script = document.createElement('script');
  script.src = "placeholder://placeholder/api/public/js/checkin-widget.js";
  script.async = true;
  script.onload = function() {
    CheckInWidget.init({
      selector: '#checkin-widget',
      apiKey: 'placeholder',
      apiUrl: 'placeholder://placeholder/api/public/check-ins'
    });
  };
  document.head.appendChild(script);
})();
</script>
`;
    
    res.json({ embedCode });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// PUBLIC ENDPOINTS (accessible without authentication)

// GET /api/public/js/checkin-widget.js
// Serve the JavaScript widget file
router.get('/public/js/checkin-widget.js', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile('checkin-widget.js', { root: './server/public/js' });
});

// GET /api/public/check-ins
// Get check-ins data for widget (publicly accessible with API key)
router.get('/public/check-ins', async (req: Request, res: Response) => {
  try {
    const apiKey = req.query.apiKey as string;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    // Validate API key and get company ID
    const companyId = await validateApiKey(apiKey);
    
    if (!companyId) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Get limit from query params (default to 5)
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    
    // Get check-ins for the company
    const checkIns = await storage.getCheckInsByCompany(companyId, limit);
    
    // Process check-ins for display
    const processedCheckIns = checkIns.map(checkIn => {
      // Parse photos (if exists)
      let photos: string[] = [];
      if (checkIn.photos) {
        try {
          photos = typeof checkIn.photos === 'string' 
            ? JSON.parse(checkIn.photos) 
            : checkIn.photos;
        } catch (error) {
          // Ignore parsing error
        }
      }
      
      return {
        id: checkIn.id,
        jobType: checkIn.jobType,
        notes: checkIn.notes,
        location: checkIn.location,
        address: checkIn.address,
        photos,
        createdAt: checkIn.createdAt,
        technician: {
          id: checkIn.technician.id,
          name: checkIn.technician.name,
          photo: checkIn.technician.photo
        }
      };
    });
    
    // Return data
    res.json({
      companyId,
      checkIns: processedCheckIns
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;