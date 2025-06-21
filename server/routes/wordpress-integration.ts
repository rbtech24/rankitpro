import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated, isCompanyAdmin } from '../middleware/auth';
import { WordPressService, WordPressCredentials } from '../services/wordpress-service';
import { schemaMarkupService, BusinessInfo, ServiceVisit, ReviewData } from '../services/schema-markup-service';
import crypto from 'crypto';
import { insertWordpressCustomFieldsSchema } from '@shared/schema';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

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

// Generate a WordPress plugin for the company - using direct session check to avoid redirects
router.get('/download-plugin', async (req: Request, res: Response) => {
  // Direct session authentication check without middleware redirect
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const user = await storage.getUser(userId);
    console.log('WordPress plugin download - User found:', user ? `${user.email} (${user.role})` : 'Not found');
    
    if (!user || user.role !== 'company_admin') {
      return res.status(403).json({ error: 'Company admin access required' });
    }
    
    req.user = user; // Set user for downstream code
    console.log('WordPress plugin generation starting for company:', user.companyId);
  
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({ error: 'No company associated with this account' });
    }
    
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
    const apiEndpoint = 'https://rankitpro.com/api';
    const pluginCode = await WordPressService.generatePluginCode(apiKey, apiEndpoint);
    
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

    // Validate plugin code exists
    if (!pluginCode || typeof pluginCode !== 'string') {
      return res.status(500).json({ error: 'Failed to generate plugin code' });
    }

    console.log('Generating ZIP file for WordPress plugin...');
    
    // Remove conflicting headers
    res.removeHeader('Content-Type');
    res.removeHeader('Cache-Control');
    
    // Set proper headers for ZIP download
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=rank-it-pro-plugin.zip',
      'Cache-Control': 'no-cache'
    });

    // Create ZIP file for WordPress plugin
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    let hasErrored = false;

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      hasErrored = true;
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create plugin archive' });
      }
    });

    // Handle archive completion
    archive.on('end', () => {
      if (!hasErrored) {
        console.log('Archive created successfully, size:', archive.pointer(), 'bytes');
      }
    });

    // Pipe archive data to response
    archive.pipe(res);

    // Add the main plugin file
    archive.append(Buffer.from(pluginCode, 'utf8'), { name: 'rank-it-pro-plugin/rank-it-pro-plugin.php' });

    // Add readme file
    archive.append(Buffer.from(readmeContent, 'utf8'), { name: 'rank-it-pro-plugin/README.md' });

    // Add complete professional CSS styles from template
    try {
      // Use import.meta.url for ES modules
      const currentDir = path.dirname(new URL(import.meta.url).pathname);
      const cssTemplatePath = path.join(currentDir, '../templates/rankitpro-styles.css');
      const cssContent = fs.readFileSync(cssTemplatePath, 'utf8');
      
      archive.append(Buffer.from(cssContent, 'utf8'), { name: 'rank-it-pro-plugin/assets/css/rank-it-pro.css' });

      // Read the complete JavaScript template
      const jsTemplatePath = path.join(currentDir, '../templates/rankitpro-script.js');
      const jsContent = fs.readFileSync(jsTemplatePath, 'utf8');
      
      archive.append(Buffer.from(jsContent, 'utf8'), { name: 'rank-it-pro-plugin/assets/js/rank-it-pro.js' });
    } catch (error) {
      console.error('Error reading template files:', error);
      // Fallback to basic CSS if templates not found
      const fallbackCSS = `/* Rank It Pro Plugin Styles */
.rankitpro-container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.rankitpro-visit-card { max-width: 450px; margin: 20px auto; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; border: 1px solid #eee; }
.rankitpro-review-card { max-width: 500px; margin: 20px auto; background: white; border-radius: 12px; box-shadow: 0 3px 12px rgba(0,0,0,0.08); padding: 25px; border: 1px solid #f0f0f0; }
.rankitpro-blog-card { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #e0e0e0; }`;
      
      const fallbackJS = `jQuery(document).ready(function($) { $('.rankitpro-container').addClass('loaded'); });`;
      
      archive.append(Buffer.from(fallbackCSS, 'utf8'), { name: 'rank-it-pro-plugin/assets/css/rank-it-pro.css' });
      archive.append(Buffer.from(fallbackJS, 'utf8'), { name: 'rank-it-pro-plugin/assets/js/rank-it-pro.js' });
    }

    // Finalize the archive
    archive.finalize();
  } catch (error) {
    console.error('Error generating WordPress plugin:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Error generating WordPress plugin' });
    }
  }
});
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
        const apiEndpoint = process.env.API_ENDPOINT || 'https://rankitpro.com';
        const embedCode = `<script>
(function() {
  window.RankItProConfig = {
    apiKey: '${apiKey}',
    endpoint: '${apiEndpoint}'
  };
  var script = document.createElement('script');
  script.src = '${apiEndpoint}/widget.js';
  document.head.appendChild(script);
})();
</script>`;
        
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
    const companies = await storage.getAllCompanies();
    
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
    const checkIns = await storage.getCheckInsByCompany(companyId);
    
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
          if (typeof checkIn.photos === 'string' && checkIn.photos.trim()) {
            photoUrls = JSON.parse(checkIn.photos);
          } else if (Array.isArray(checkIn.photos)) {
            photoUrls = checkIn.photos;
          }
        } catch (error) {
          // Silently handle invalid JSON, default to empty array
          photoUrls = [];
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

// Public API endpoints for WordPress shortcodes (no authentication required)


// Public endpoint for blog posts
router.get('/public/blogs', async (req: Request, res: Response) => {
  try {
    const { apiKey, limit = 3, category = 'all' } = req.query;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    // Find company by API key
    const companies = await storage.getAllCompanies();
    const company = companies.find(c => {
      if (c.wordpressConfig) {
        try {
          const config = JSON.parse(c.wordpressConfig);
          return config.apiKey === apiKey;
        } catch (e) {
          return false;
        }
      }
      return false;
    });
    
    if (!company) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Get blog posts for the company
    const blogPosts = await storage.getBlogPostsByCompany(company.id);
    
    let filteredPosts = blogPosts;
    // Note: Blog posts don't have jobType property, filtering by category not implemented
    
    // Limit results
    const limitedPosts = filteredPosts.slice(0, parseInt(limit as string));
    
    return res.json(limitedPosts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Public endpoint for audio testimonials
router.get('/public/audio-testimonials', async (req: Request, res: Response) => {
  try {
    const { apiKey, limit = 5 } = req.query;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    // Find company by API key
    const companies = await storage.getAllCompanies();
    const company = companies.find(c => {
      if (c.wordpressConfig) {
        try {
          const config = JSON.parse(c.wordpressConfig);
          return config.apiKey === apiKey;
        } catch (e) {
          return false;
        }
      }
      return false;
    });
    
    if (!company) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Get check-ins with audio testimonials
    const checkIns = await storage.getCheckInsByCompany(company.id);
    const audioTestimonials = checkIns
      .filter(checkIn => checkIn.audioUrl)
      .slice(0, parseInt(limit as string))
      .map(checkIn => ({
        customerName: checkIn.customerName,
        audioUrl: checkIn.audioUrl,
        transcript: checkIn.audioTranscript || checkIn.notes,
        rating: 5, // Default rating since we don't have review ratings linked
        date: checkIn.completionDate
      }));
    
    return res.json(audioTestimonials);
  } catch (error) {
    console.error('Error fetching audio testimonials:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Public endpoint for video testimonials
router.get('/public/video-testimonials', async (req: Request, res: Response) => {
  try {
    const { apiKey, limit = 3 } = req.query;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    // Find company by API key
    const companies = await storage.getAllCompanies();
    const company = companies.find(c => {
      if (c.wordpressConfig) {
        try {
          const config = JSON.parse(c.wordpressConfig);
          return config.apiKey === apiKey;
        } catch (e) {
          return false;
        }
      }
      return false;
    });
    
    if (!company) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Get check-ins with video testimonials
    const checkIns = await storage.getCheckInsByCompany(company.id);
    const videoTestimonials = checkIns
      .filter(checkIn => checkIn.videoUrl)
      .slice(0, parseInt(limit as string))
      .map(checkIn => ({
        customerName: checkIn.customerName,
        videoUrl: checkIn.videoUrl,
        description: checkIn.notes || 'Video testimonial',
        rating: 5, // Default rating since we don't have review ratings linked
        date: checkIn.completionDate
      }));
    
    return res.json(videoTestimonials);
  } catch (error) {
    console.error('Error fetching video testimonials:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate schema markup for WordPress content
router.get('/schema/:contentType/:contentId', async (req: Request, res: Response) => {
  const { contentType, contentId } = req.params;
  const { companyId } = req.query;

  try {
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const company = await storage.getCompany(parseInt(companyId as string));
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const businessInfo: BusinessInfo = {
      name: company.name,
      serviceTypes: ["HVAC", "Plumbing", "Electrical", "General Maintenance"],
      description: `Professional ${company.name} services`,
      website: `https://${company.name.toLowerCase().replace(/\s+/g, '')}.com`
    };

    let schemaMarkup = '';

    switch (contentType) {
      case 'visit':
        const checkIn = await storage.getCheckIn(parseInt(contentId));
        if (checkIn) {
          const visit: ServiceVisit = {
            id: checkIn.id,
            jobType: checkIn.jobType,
            customerName: checkIn.customerName,
            address: checkIn.customerAddress,
            completedAt: checkIn.createdAt,
            photos: checkIn.photos || [],
            description: checkIn.notes || checkIn.aiGeneratedContent,
            technician: checkIn.technicianName
          };
          schemaMarkup = schemaMarkupService.generateServiceSchema(visit, businessInfo);
        }
        break;

      case 'review':
        const reviewResponse = await storage.getReviewResponse(parseInt(contentId));
        if (reviewResponse) {
          const review: ReviewData = {
            rating: reviewResponse.rating,
            reviewText: reviewResponse.comment,
            customerName: reviewResponse.customerName || 'Satisfied Customer',
            serviceType: 'Professional Service',
            reviewDate: reviewResponse.createdAt,
            businessName: company.name
          };
          schemaMarkup = schemaMarkupService.generateReviewSchema(review);
        }
        break;

      case 'business':
        schemaMarkup = schemaMarkupService.generateLocalBusinessSchema(businessInfo);
        break;

      case 'aggregate':
        const reviews = await storage.getReviewsByCompany(parseInt(companyId as string));
        const reviewData: ReviewData[] = reviews.map(r => ({
          rating: r.rating,
          reviewText: r.comment,
          customerName: r.customerName || 'Customer',
          serviceType: 'Professional Service',
          reviewDate: r.createdAt,
          businessName: company.name
        }));
        schemaMarkup = schemaMarkupService.generateAggregateRatingSchema(reviewData, businessInfo);
        break;

      default:
        return res.status(400).json({ error: 'Invalid content type' });
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(schemaMarkup);
  } catch (error) {
    console.error('Schema generation error:', error);
    res.status(500).json({ error: 'Failed to generate schema markup' });
  }
});

export default router;