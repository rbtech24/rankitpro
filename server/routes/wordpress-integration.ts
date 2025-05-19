import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated, isCompanyAdmin } from '../middleware/auth';
import { WordPressService, WordPressCredentials } from '../services/wordpress-service';
import crypto from 'crypto';

const router = Router();

// Schema for WordPress credentials
const wordpressCredentialsSchema = z.object({
  siteUrl: z.string().url(),
  username: z.string().min(1),
  password: z.string().min(1),
  categories: z.array(z.number()).optional(),
  tags: z.array(z.number()).optional()
});

// Schema for storing WordPress configuration
const wordpressConfigSchema = z.object({
  credentials: wordpressCredentialsSchema,
  autoPublish: z.boolean().default(false),
  autoPublishBlogPosts: z.boolean().default(false),
  autoPublishCheckIns: z.boolean().default(false)
});

// Get WordPress configuration for a company
router.get('/config', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  const companyId = req.user?.companyId;
  
  if (!companyId) {
    return res.status(400).json({ error: 'No company associated with this account' });
  }
  
  try {
    const company = await storage.getCompany(companyId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    if (!company.wordpressConfig) {
      return res.json({ configured: false });
    }
    
    // Parse the WordPress configuration
    try {
      const config = JSON.parse(company.wordpressConfig);
      
      // Mask the password for security
      if (config.credentials) {
        config.credentials.password = '********';
      }
      
      return res.json({
        configured: true,
        config
      });
    } catch (error) {
      console.error('Error parsing WordPress configuration:', error);
      return res.status(500).json({ error: 'Invalid WordPress configuration' });
    }
  } catch (error) {
    console.error('Error getting WordPress configuration:', error);
    return res.status(500).json({ error: 'Error getting WordPress configuration' });
  }
});

// Save WordPress configuration for a company
router.post('/config', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  const companyId = req.user?.companyId;
  
  if (!companyId) {
    return res.status(400).json({ error: 'No company associated with this account' });
  }
  
  try {
    // Validate the request body
    const validationResult = wordpressConfigSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid WordPress configuration', details: validationResult.error });
    }
    
    const config = validationResult.data;
    
    // Test the WordPress connection
    try {
      const isValid = await WordPressService.validateCredentials(config.credentials);
      
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid WordPress credentials' });
      }
    } catch (error) {
      console.error('Error validating WordPress credentials:', error);
      return res.status(400).json({ error: 'Failed to connect to WordPress' });
    }
    
    // Update the company's WordPress configuration
    await storage.updateCompany(companyId, {
      wordpressConfig: JSON.stringify(config)
    });
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error saving WordPress configuration:', error);
    return res.status(500).json({ error: 'Error saving WordPress configuration' });
  }
});

// Generate a WordPress plugin for the company
router.get('/plugin', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  const companyId = req.user?.companyId;
  
  if (!companyId) {
    return res.status(400).json({ error: 'No company associated with this account' });
  }
  
  try {
    const company = await storage.getCompany(companyId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    // Generate a unique API key for the company if not already present
    let apiKey = '';
    
    if (company.wordpressConfig) {
      try {
        const config = JSON.parse(company.wordpressConfig);
        
        if (config.apiKey) {
          apiKey = config.apiKey;
        }
      } catch (error) {
        console.error('Error parsing WordPress configuration:', error);
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
          console.error('Error parsing WordPress configuration:', error);
        }
      }
      
      config = { ...config, apiKey };
      
      await storage.updateCompany(companyId, {
        wordpressConfig: JSON.stringify(config)
      });
    }
    
    // Generate the WordPress plugin code
    const apiEndpoint = process.env.API_ENDPOINT || `https://${req.headers.host}`;
    const pluginCode = WordPressService.generatePluginCode(apiKey, apiEndpoint);
    
    // Set the response headers for downloading the plugin
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=check-in-integration.php');
    
    return res.send(pluginCode);
  } catch (error) {
    console.error('Error generating WordPress plugin:', error);
    return res.status(500).json({ error: 'Error generating WordPress plugin' });
  }
});

// Generate JavaScript embed code for the company
router.get('/embed', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  const companyId = req.user?.companyId;
  
  if (!companyId) {
    return res.status(400).json({ error: 'No company associated with this account' });
  }
  
  try {
    const company = await storage.getCompany(companyId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    // Generate a unique API key for the company if not already present
    let apiKey = '';
    
    if (company.wordpressConfig) {
      try {
        const config = JSON.parse(company.wordpressConfig);
        
        if (config.apiKey) {
          apiKey = config.apiKey;
        }
      } catch (error) {
        console.error('Error parsing WordPress configuration:', error);
      }
    }
    
    if (!company.javaScriptEmbedConfig) {
      try {
        // Generate a new API key if not already present
        if (!apiKey) {
          apiKey = crypto.randomBytes(32).toString('hex');
          
          // Store the API key in the company's WordPress configuration
          let config = {};
          
          if (company.wordpressConfig) {
            try {
              config = JSON.parse(company.wordpressConfig);
            } catch (error) {
              console.error('Error parsing WordPress configuration:', error);
            }
          }
          
          config = { ...config, apiKey };
          
          await storage.updateCompany(companyId, {
            wordpressConfig: JSON.stringify(config)
          });
        }
        
        // Generate the JavaScript embed code
        const apiEndpoint = process.env.API_ENDPOINT || `https://${req.headers.host}`;
        const embedCode = WordPressService.generateJavaScriptEmbedCode(apiKey, apiEndpoint);
        
        // Save the JavaScript embed code to the company
        await storage.updateCompany(companyId, {
          javaScriptEmbedConfig: embedCode
        });
      } catch (error) {
        console.error('Error generating JavaScript embed code:', error);
        return res.status(500).json({ error: 'Error generating JavaScript embed code' });
      }
    }
    
    return res.json({
      embedCode: company.javaScriptEmbedConfig || ''
    });
  } catch (error) {
    console.error('Error getting JavaScript embed code:', error);
    return res.status(500).json({ error: 'Error getting JavaScript embed code' });
  }
});

// Test publish a check-in to WordPress
router.post('/test-publish/:checkInId', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  const companyId = req.user?.companyId;
  const checkInId = parseInt(req.params.checkInId);
  
  if (!companyId) {
    return res.status(400).json({ error: 'No company associated with this account' });
  }
  
  if (isNaN(checkInId)) {
    return res.status(400).json({ error: 'Invalid check-in ID' });
  }
  
  try {
    const company = await storage.getCompany(companyId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    if (!company.wordpressConfig) {
      return res.status(400).json({ error: 'WordPress not configured for this company' });
    }
    
    const checkIn = await storage.getCheckIn(checkInId);
    
    if (!checkIn) {
      return res.status(404).json({ error: 'Check-in not found' });
    }
    
    if (checkIn.companyId !== companyId) {
      return res.status(403).json({ error: 'Not authorized to access this check-in' });
    }
    
    // Parse the WordPress configuration
    let wordpressConfig;
    
    try {
      wordpressConfig = JSON.parse(company.wordpressConfig);
    } catch (error) {
      console.error('Error parsing WordPress configuration:', error);
      return res.status(500).json({ error: 'Invalid WordPress configuration' });
    }
    
    if (!wordpressConfig.credentials) {
      return res.status(400).json({ error: 'WordPress credentials missing' });
    }
    
    // Create a WordPress service instance
    const wpService = new WordPressService(wordpressConfig.credentials);
    
    // Publish the check-in to WordPress
    try {
      const result = await wpService.publishCheckIn(checkIn);
      
      return res.json({
        success: true,
        postId: result.id,
        postUrl: result.link,
        status: result.status
      });
    } catch (error) {
      console.error('Error publishing check-in to WordPress:', error);
      return res.status(500).json({ error: 'Error publishing check-in to WordPress' });
    }
  } catch (error) {
    console.error('Error testing WordPress publishing:', error);
    return res.status(500).json({ error: 'Error testing WordPress publishing' });
  }
});

// Public API endpoint for fetching published check-ins
router.get('/public/check-ins', async (req: Request, res: Response) => {
  const apiKey = req.query.apiKey as string;
  const limit = parseInt(req.query.limit as string) || 5;
  const type = req.query.type as string || 'all';
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  try {
    // Find the company by API key
    let companyId: number | undefined;
    
    // Get all companies and find the one with the matching API key
    const companies = Array.from(
      (storage as any).companies?.values() || []
    );
    
    for (const company of companies) {
      if (company.wordpressConfig) {
        try {
          const config = JSON.parse(company.wordpressConfig);
          
          if (config.apiKey === apiKey) {
            companyId = company.id;
            break;
          }
        } catch (error) {
          console.error('Error parsing WordPress configuration:', error);
        }
      }
    }
    
    if (!companyId) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    // Get check-ins for the company
    const checkIns = await storage.getCheckInsByCompany(companyId, limit);
    
    // Filter check-ins based on type if needed
    let filteredCheckIns = checkIns;
    
    if (type !== 'all') {
      filteredCheckIns = checkIns.filter((checkIn) => checkIn.jobType === type);
    }
    
    // Transform check-ins for public consumption
    const publicCheckIns = filteredCheckIns.map((checkIn) => {
      let photoUrls: string[] = [];
      
      if (checkIn.photos) {
        try {
          photoUrls = JSON.parse(checkIn.photos as string);
        } catch (error) {
          console.error('Failed to parse photo URLs:', error);
        }
      }
      
      return {
        id: checkIn.id,
        jobType: checkIn.jobType,
        createdAt: checkIn.createdAt,
        location: checkIn.location,
        notes: checkIn.notes,
        photoUrls
      };
    });
    
    return res.json(publicCheckIns);
  } catch (error) {
    console.error('Error fetching public check-ins:', error);
    return res.status(500).json({ error: 'Error fetching check-ins' });
  }
});

export default router;