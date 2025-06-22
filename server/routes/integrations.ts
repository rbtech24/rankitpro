import { Router, Request, Response } from 'express';
import { isAuthenticated, isCompanyAdmin } from '../middleware/auth';
import { z } from 'zod';
import { storage } from '../storage';
import { WordPressService } from '../services/wordpress-service';

const router = Router();

// Helper function to get WordPress service for a company
const getWordPressService = async (companyId: number): Promise<WordPressService> => {
  const company = await storage.getCompany(companyId);
  if (!company || !company.wordpressConfig) {
    throw new Error('WordPress integration not configured');
  }
  
  const config = JSON.parse(company.wordpressConfig);
  return new WordPressService({
    siteUrl: config.siteUrl,
    username: config.username,
    password: config.applicationPassword, // Use application password as password
    categories: config.defaultCategory ? [parseInt(config.defaultCategory, 10)] : undefined,
    companyId
  });
};

// The WordPress integration schema
const wordpressConfigSchema = z.object({
  siteUrl: z.string().url(),
  username: z.string().min(1),
  applicationPassword: z.string().min(1),
  defaultCategory: z.string().default('1'),
  defaultStatus: z.enum(['draft', 'publish']).default('draft')
});

// JavaScript widget embed schema
const jsWidgetConfigSchema = z.object({
  displayStyle: z.enum(['grid', 'list', 'carousel']).default('grid'),
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  postLimit: z.number().int().min(1).max(50).default(10),
  showImages: z.boolean().default(true),
  autoRefresh: z.boolean().default(false)
});

// GET /api/integration/wordpress - Updated route path to match client expectations
router.get('/wordpress', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (!company.wordpressConfig) {
      return res.json({ configured: false });
    }

    try {
      const config = JSON.parse(company.wordpressConfig);
      // Hide sensitive information
      return res.json({
        configured: true,
        siteUrl: config.siteUrl,
        username: config.username,
        defaultCategory: config.defaultCategory,
        defaultStatus: config.defaultStatus
      });
    } catch (error) {
      return res.status(500).json({ message: 'Invalid WordPress configuration' });
    }
  } catch (error) {
    console.error('Error fetching WordPress config:', error);
    res.status(500).json({ message: 'Error fetching WordPress configuration' });
  }
});

// POST /api/integrations/wordpress/config
// Save WordPress configuration for the company
router.post('/wordpress/config', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    // Validate configuration
    const parsedConfig = wordpressConfigSchema.safeParse(req.body);
    if (!parsedConfig.success) {
      return res.status(400).json({ 
        message: 'Invalid WordPress configuration', 
        errors: parsedConfig.error.format() 
      });
    }

    const config = parsedConfig.data;
    
    // Test connection before saving
    const wpService = new WordPressService({
      siteUrl: config.siteUrl,
      username: config.username,
      password: config.applicationPassword, // Use application password as password
      categories: config.defaultCategory ? [parseInt(config.defaultCategory, 10)] : undefined,
      defaultStatus: config.defaultStatus,
      companyId
    });
    
    const connectionSuccess = await wpService.testConnection();
    if (!connectionSuccess) {
      return res.status(400).json({ message: 'Failed to connect to WordPress site' });
    }
    
    // Save configuration
    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    await storage.updateCompany(companyId, {
      wordpressConfig: JSON.stringify(config)
    });
    
    res.json({ 
      message: 'WordPress configuration saved successfully',
      siteUrl: config.siteUrl
    });
  } catch (error) {
    console.error('Error saving WordPress config:', error);
    res.status(500).json({ message: 'Error saving WordPress configuration' });
  }
});

// DELETE /api/integrations/wordpress/config
// Remove WordPress configuration for the company
router.delete('/wordpress/config', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    await storage.updateCompany(companyId, {
      wordpressConfig: null
    });
    
    res.json({ message: 'WordPress configuration removed successfully' });
  } catch (error) {
    console.error('Error removing WordPress config:', error);
    res.status(500).json({ message: 'Error removing WordPress configuration' });
  }
});

// POST /api/integrations/wordpress/test-connection
// Test WordPress connection
router.post('/wordpress/test-connection', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    // Validate configuration
    const parsedConfig = wordpressConfigSchema.safeParse(req.body);
    if (!parsedConfig.success) {
      return res.status(400).json({ 
        message: 'Invalid WordPress configuration', 
        errors: parsedConfig.error.format() 
      });
    }
    
    const config = parsedConfig.data;
    const companyId = req.user.companyId;
    
    // Test connection
    const wpService = new WordPressService({
      siteUrl: config.siteUrl,
      username: config.username,
      password: config.applicationPassword, // Use application password as password
      companyId
    });
    const connectionSuccess = await wpService.testConnection();
    
    if (connectionSuccess) {
      res.json({ success: true, message: 'Connection successful' });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Failed to connect to WordPress site. Please check your credentials and site URL.' 
      });
    }
  } catch (error) {
    console.error('Error testing WordPress connection:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error testing WordPress connection' 
    });
  }
});

// GET /api/integrations/wordpress/categories
// Get WordPress categories
router.get('/wordpress/categories', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    // Get company configuration
    const company = await storage.getCompany(companyId);
    if (!company || !company.wordpressConfig) {
      return res.status(400).json({ message: 'WordPress is not configured for this company' });
    }
    
    try {
      const config = JSON.parse(company.wordpressConfig);
      const wpService = new WordPressService({
        ...config,
        companyId
      });
    
      // Get categories
      const categories = await wpService.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching WordPress categories:', error);
      res.status(500).json({ message: 'Error fetching WordPress categories' });
    }
  } catch (error) {
    console.error('Error in WordPress categories route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/integrations/wordpress/publish-check-in/:id
// Publish a check-in to WordPress
router.post('/wordpress/publish-check-in/:id', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const checkInId = parseInt(req.params.id, 10);
    if (isNaN(checkInId)) {
      return res.status(400).json({ message: 'Invalid check-in ID' });
    }
    
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    // Get check-in
    const checkIn = await storage.getCheckIn(checkInId);
    if (!checkIn) {
      return res.status(404).json({ message: 'Check-in not found' });
    }
    
    // Verify permission
    if (checkIn.companyId !== companyId) {
      return res.status(403).json({ message: 'You do not have permission to publish this check-in' });
    }
    
    // Get WordPress service for the company
    const wpService = await getWordPressService(companyId);
    if (!wpService) {
      return res.status(400).json({ message: 'WordPress is not configured for this company' });
    }
    
    // Extract publish options from request
    const options = {
      status: req.body.status,
      categories: req.body.categories,
      tags: req.body.tags
    };
    
    // Publish check-in
    const result = await wpService.publishCheckIn(checkIn, options);
    if (!result) {
      return res.status(500).json({ message: 'Failed to publish check-in to WordPress' });
    }
    
    res.json({ 
      message: 'Check-in published to WordPress successfully',
      postId: result.id,
      url: result.url
    });
  } catch (error) {
    console.error('Error publishing check-in to WordPress:', error);
    res.status(500).json({ message: 'Error publishing check-in to WordPress' });
  }
});

// POST /api/integrations/wordpress/publish-blog-post/:id
// Publish a blog post to WordPress
router.post('/wordpress/publish-blog-post/:id', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const blogPostId = parseInt(req.params.id, 10);
    if (isNaN(blogPostId)) {
      return res.status(400).json({ message: 'Invalid blog post ID' });
    }
    
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    // Get blog post
    const blogPost = await storage.getBlogPost(blogPostId);
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Verify permission
    if (blogPost.companyId !== companyId) {
      return res.status(403).json({ message: 'You do not have permission to publish this blog post' });
    }
    
    // Get WordPress service for the company
    const wpService = await getWordPressService(companyId);
    if (!wpService) {
      return res.status(400).json({ message: 'WordPress is not configured for this company' });
    }
    
    // Extract publish options from request
    const options = {
      status: req.body.status,
      categories: req.body.categories,
      tags: req.body.tags
    };
    
    // Publish blog post
    const result = await wpService.publishBlogPost(blogPost, options);
    if (!result) {
      return res.status(500).json({ message: 'Failed to publish blog post to WordPress' });
    }
    
    res.json({ 
      message: 'Blog post published to WordPress successfully',
      postId: result.id,
      url: result.url
    });
  } catch (error) {
    console.error('Error publishing blog post to WordPress:', error);
    res.status(500).json({ message: 'Error publishing blog post to WordPress' });
  }
});

// GET /api/integrations/js-widget/config
// Get JavaScript widget configuration
router.get('/js-widget/config', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    if (!company.javaScriptEmbedConfig) {
      // Return default configuration
      return res.json({
        configured: false,
        displayStyle: 'grid',
        theme: 'light',
        postLimit: 10,
        showImages: true,
        autoRefresh: false
      });
    }
    
    try {
      const config = JSON.parse(company.javaScriptEmbedConfig);
      return res.json({
        configured: true,
        ...config
      });
    } catch (error) {
      return res.status(500).json({ message: 'Invalid JavaScript widget configuration' });
    }
  } catch (error) {
    console.error('Error fetching JavaScript widget config:', error);
    res.status(500).json({ message: 'Error fetching JavaScript widget configuration' });
  }
});

// POST /api/integrations/js-widget/config
// Save JavaScript widget configuration
router.post('/js-widget/config', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    // Validate configuration
    const parsedConfig = jsWidgetConfigSchema.safeParse(req.body);
    if (!parsedConfig.success) {
      return res.status(400).json({ 
        message: 'Invalid JavaScript widget configuration', 
        errors: parsedConfig.error.format() 
      });
    }
    
    const config = parsedConfig.data;
    
    // Save configuration
    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    await storage.updateCompany(companyId, {
      javaScriptEmbedConfig: JSON.stringify(config)
    });
    
    res.json({ 
      message: 'JavaScript widget configuration saved successfully',
      config
    });
  } catch (error) {
    console.error('Error saving JavaScript widget config:', error);
    res.status(500).json({ message: 'Error saving JavaScript widget configuration' });
  }
});

// GET /api/integrations/js-widget/embed-code
// Get JavaScript widget embed code
router.get('/js-widget/embed-code', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Get widget configuration
    let widgetConfig = {
      displayStyle: 'grid',
      theme: 'light',
      postLimit: 10,
      showImages: true,
      autoRefresh: false
    };
    
    if (company.javaScriptEmbedConfig) {
      try {
        widgetConfig = {
          ...widgetConfig,
          ...JSON.parse(company.javaScriptEmbedConfig)
        };
      } catch (error) {
        console.error('Error parsing JavaScript widget config:', error);
      }
    }
    
    // Generate embed code
    const embedCode = `<script src="https://app.checkinpro.com/widget.js" 
  data-company-id="${companyId}"
  data-theme="${widgetConfig.theme}"
  data-display="${widgetConfig.displayStyle}"
  data-limit="${widgetConfig.postLimit}"
  data-images="${widgetConfig.showImages}"
  data-refresh="${widgetConfig.autoRefresh}">
</script>`;
    
    res.json({ 
      embedCode,
      widgetConfig
    });
  } catch (error) {
    console.error('Error generating JavaScript widget embed code:', error);
    res.status(500).json({ message: 'Error generating JavaScript widget embed code' });
  }
});

export default router;