import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated, isCompanyAdmin } from '../middleware/auth';
import { WordPressService, WordPressCredentials } from '../services/wordpress-service';
import crypto from 'crypto';
import { insertWordpressCustomFieldsSchema } from '@shared/schema';

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
    
    // Create installation instructions to include with the plugin
    const readmeContent = `# Rank It Pro WordPress Plugin

## Installation Instructions

1. Save the rank-it-pro-plugin.php file to your computer
2. Log into your WordPress admin panel
3. Go to Plugins > Add New > Upload Plugin
4. Choose the rank-it-pro-plugin.php file and click Install Now
5. Activate the plugin
6. Go to Settings > Rank It Pro Integration
7. Enter your API credentials from your Rank It Pro dashboard
8. Configure your sync settings and save

## Configuration

- **API Key**: ${apiKey}
- **Webhook URL**: ${apiEndpoint}/api/wordpress/webhook
- **Auto Sync**: Enable to automatically publish check-ins
- **Photo Upload**: Enable to include technician photos

## Support

For support and documentation, visit your dashboard's documentation section.

## Features

- Automatic check-in publishing
- SEO-optimized post creation
- Schema.org markup for local SEO
- Photo integration
- Custom post types for service visits
- Webhook support for real-time updates

## Troubleshooting

If you experience issues:
1. Check that your API key is correct
2. Ensure your WordPress site can make outbound HTTPS requests
3. Verify the webhook URL is accessible
4. Check plugin logs in WordPress admin

Version: 1.0.0
Author: Rank It Pro
`;

    // Create a complete plugin file with embedded instructions
    const completePlugin = `<?php
/*
Plugin Name: Rank It Pro Integration
Description: ${readmeContent.replace(/\n/g, '\n * ')}
Version: 1.0.0
Author: Rank It Pro
*/

${pluginCode}
?>`;

    // Create ZIP file for WordPress plugin
    const archiver = require('archiver');
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Set proper headers for ZIP download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=rank-it-pro-plugin.zip');

    // Pipe archive data to response
    archive.pipe(res);

    // Add the main plugin file
    archive.append(completePlugin, { name: 'rank-it-pro-plugin/rank-it-pro-plugin.php' });

    // Add readme file
    archive.append(readmeContent, { name: 'rank-it-pro-plugin/README.md' });

    // Add plugin assets directory structure
    const cssContent = `/* Rank It Pro Plugin Styles */
.rank-it-pro-widget {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  background: #fff;
}

.rank-it-pro-checkin {
  border-left: 4px solid #0073aa;
  padding-left: 15px;
  margin-bottom: 20px;
}

.rank-it-pro-date {
  color: #666;
  font-size: 0.9em;
}

.rank-it-pro-location {
  color: #0073aa;
  font-weight: 500;
}`;

    archive.append(cssContent, { name: 'rank-it-pro-plugin/assets/css/rank-it-pro.css' });

    // Add JavaScript file
    const jsContent = `// Rank It Pro Plugin JavaScript
jQuery(document).ready(function($) {
  // Initialize plugin functionality
  $('.rank-it-pro-widget').each(function() {
    // Add any interactive features here
  });
});`;

    archive.append(jsContent, { name: 'rank-it-pro-plugin/assets/js/rank-it-pro.js' });

    // Finalize the archive
    archive.finalize();

    return;
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

// Custom Fields API Endpoints

// Get WordPress custom fields configuration
router.get('/custom-fields', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  const companyId = req.user?.companyId;
  
  if (!companyId) {
    return res.status(400).json({ error: 'No company associated with this account' });
  }
  
  try {
    const customFields = await storage.getWordpressCustomFieldsByCompany(companyId);
    
    if (!customFields) {
      return res.json(null);
    }
    
    return res.json(customFields);
  } catch (error) {
    console.error('Error fetching WordPress custom fields:', error);
    return res.status(500).json({ error: 'Error fetching WordPress custom fields' });
  }
});

// Save WordPress connection settings
router.post('/custom-fields/connection', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  const companyId = req.user?.companyId;
  
  if (!companyId) {
    return res.status(400).json({ error: 'No company associated with this account' });
  }
  
  try {
    // Validate the request body
    const connectionSchema = z.object({
      siteUrl: z.string().url(),
      apiKey: z.string().min(10),
      secretKey: z.string().min(20),
      useRestApi: z.boolean().default(true),
      autoPublish: z.boolean().default(false),
      postStatus: z.enum(["publish", "draft", "pending"]).default("draft"),
      category: z.string().optional(),
      author: z.string().optional(),
    });
    
    const validationResult = connectionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid WordPress connection settings', details: validationResult.error });
    }
    
    const data = validationResult.data;
    
    // Check if settings already exist
    const existingSettings = await storage.getWordpressCustomFieldsByCompany(companyId);
    
    if (existingSettings) {
      // Update existing settings
      await storage.updateWordpressCustomFields(existingSettings.id, {
        siteUrl: data.siteUrl,
        apiKey: data.apiKey,
        secretKey: data.secretKey,
        useRestApi: data.useRestApi,
        autoPublish: data.autoPublish,
        postStatus: data.postStatus,
        defaultCategory: data.category || null,
        defaultAuthor: data.author || null,
      });
    } else {
      // Create new settings with default values for remaining fields
      await storage.createWordpressCustomFields({
        companyId,
        siteUrl: data.siteUrl,
        apiKey: data.apiKey,
        secretKey: data.secretKey,
        useRestApi: data.useRestApi,
        autoPublish: data.autoPublish,
        postStatus: data.postStatus,
        postType: "post",
        defaultCategory: data.category || null,
        defaultAuthor: data.author || null,
        titlePrefix: "[Check-in] ",
        titleTemplate: null,
        contentTemplate: null,
        includePhotos: true,
        includeLocation: true,
        includeMap: false,
        includeSchema: false,
        customFieldMappings: JSON.stringify([
          { wpField: "post_title", checkInField: "job_type", isActive: true },
          { wpField: "post_content", checkInField: "notes", isActive: true },
          { wpField: "rp_technician", checkInField: "technician_name", isActive: true },
          { wpField: "rp_location", checkInField: "location", isActive: true },
          { wpField: "rp_completion_date", checkInField: "completion_date", isActive: true },
        ]),
        taxonomyMappings: JSON.stringify({}),
        advancedMapping: null,
        metaPrefix: "rankitpro_",
        isConnected: false
      });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error saving WordPress connection settings:', error);
    return res.status(500).json({ error: 'Error saving WordPress connection settings' });
  }
});

// Save field mappings
router.post('/custom-fields/mapping', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  const companyId = req.user?.companyId;
  
  if (!companyId) {
    return res.status(400).json({ error: 'No company associated with this account' });
  }
  
  try {
    // Validate the request body
    const fieldMappingSchema = z.object({
      titlePrefix: z.string().optional(),
      contentFieldMapping: z.string().min(1),
      includePhotos: z.boolean().default(true),
      includeLocation: z.boolean().default(true),
      customFields: z.array(
        z.object({
          wpField: z.string().min(1),
          checkInField: z.string().min(1),
          isActive: z.boolean().default(true),
        })
      ).default([]),
      metaPrefix: z.string().default("rankitpro_"),
      advancedMapping: z.string().optional(),
    });
    
    const validationResult = fieldMappingSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid WordPress field mappings', details: validationResult.error });
    }
    
    const data = validationResult.data;
    
    // Check if settings already exist
    const existingSettings = await storage.getWordpressCustomFieldsByCompany(companyId);
    
    if (!existingSettings) {
      return res.status(404).json({ error: 'WordPress custom fields configuration not found' });
    }
    
    // Update existing settings
    await storage.updateWordpressCustomFields(existingSettings.id, {
      titlePrefix: data.titlePrefix || null,
      contentTemplate: data.contentFieldMapping,
      includePhotos: data.includePhotos,
      includeLocation: data.includeLocation,
      customFieldMappings: JSON.stringify(data.customFields),
      metaPrefix: data.metaPrefix,
      advancedMapping: data.advancedMapping || null,
    });
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error saving WordPress field mappings:', error);
    return res.status(500).json({ error: 'Error saving WordPress field mappings' });
  }
});

// Test WordPress connection
router.post('/custom-fields/test-connection', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  const companyId = req.user?.companyId;
  
  if (!companyId) {
    return res.status(400).json({ error: 'No company associated with this account' });
  }
  
  try {
    const result = await storage.testWordpressConnection(companyId);
    
    if (result.isConnected) {
      // Update connection status in the database
      const customFields = await storage.getWordpressCustomFieldsByCompany(companyId);
      
      if (customFields) {
        await storage.updateWordpressCustomFields(customFields.id, {
          isConnected: true,
        });
      }
    }
    
    return res.json(result);
  } catch (error) {
    console.error('Error testing WordPress connection:', error);
    return res.status(500).json({ error: 'Error testing WordPress connection' });
  }
});

// Sync check-ins to WordPress
router.post('/custom-fields/sync', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  const companyId = req.user?.companyId;
  
  if (!companyId) {
    return res.status(400).json({ error: 'No company associated with this account' });
  }
  
  try {
    const { checkInIds } = req.body;
    
    const result = await storage.syncWordpressCheckIns(companyId, checkInIds);
    
    return res.json(result);
  } catch (error) {
    console.error('Error syncing check-ins to WordPress:', error);
    return res.status(500).json({ error: 'Error syncing check-ins to WordPress' });
  }
});

export default router;