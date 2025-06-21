import { Router, Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated, isCompanyAdmin } from "../middleware/auth";
import { WordPressService } from "../services/wordpress-service";
import crypto from "crypto";
import archiver from "archiver";

const router = Router();

// WordPress connection schema
const wordpressConnectionSchema = z.object({
  siteUrl: z.string().url(),
  apiKey: z.string().min(10),
  secretKey: z.string().min(20),
  useRestApi: z.boolean().default(true),
  autoPublish: z.boolean().default(false),
  postStatus: z.enum(["publish", "draft", "pending"]).default("draft"),
  category: z.string().optional(),
  author: z.string().optional(),
  companyId: z.number(),
});

// WordPress field mapping schema
const fieldMappingSchema = z.object({
  titlePrefix: z.string().optional(),
  contentFieldMapping: z.string(),
  includePhotos: z.boolean().default(true),
  includeLocation: z.boolean().default(true),
  customFields: z.array(
    z.object({
      wpField: z.string(),
      checkInField: z.string(),
      isActive: z.boolean().default(true),
    })
  ),
  metaPrefix: z.string().default("rankitpro_"),
  advancedMapping: z.string().optional(),
  companyId: z.number(),
});

// Get WordPress connection settings
router.get("/:companyId", async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }

    // In a real implementation, we would fetch this from the database
    // For now, return sample data
    res.json({
      siteUrl: "https://example.com",
      apiKey: "wp_api_key_123456789",
      secretKey: "wp_secret_key_1234567890abcdef",
      useRestApi: true,
      autoPublish: false,
      postStatus: "draft",
      category: "1",
      author: "1",
      status: "connected",
      version: "6.4.2",
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching WordPress connection:", error);
    res.status(500).json({ error: "Failed to fetch WordPress connection settings" });
  }
});

// Save WordPress connection settings
router.post("/connection", async (req, res) => {
  try {
    const data = wordpressConnectionSchema.parse(req.body);
    
    // In a real implementation, we would save this to the database
    // For now, just return success
    res.json({
      success: true,
      message: "WordPress connection settings saved successfully",
      data: {
        ...data,
        status: "connected",
        version: "6.4.2",
        lastSync: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error saving WordPress connection:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to save WordPress connection settings" });
  }
});

// Test WordPress connection
router.post("/test-connection", async (req, res) => {
  try {
    const { siteUrl, apiKey, secretKey } = req.body;
    
    if (!siteUrl || !apiKey || !secretKey) {
      return res.status(400).json({ error: "Missing required connection parameters" });
    }
    
    // In a real implementation, we would test the connection to WordPress
    // For now, just return success
    res.json({
      success: true,
      status: "connected",
      version: "6.4.2",
      apiStatus: "active",
      message: "Successfully connected to WordPress site"
    });
  } catch (error) {
    console.error("Error testing WordPress connection:", error);
    res.status(500).json({ error: "Failed to test WordPress connection" });
  }
});

// Save field mappings
router.post("/field-mapping", async (req, res) => {
  try {
    const data = fieldMappingSchema.parse(req.body);
    
    // In a real implementation, we would save this to the database
    // For now, just return success
    res.json({
      success: true,
      message: "WordPress field mappings saved successfully",
      data
    });
  } catch (error) {
    console.error("Error saving field mappings:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to save field mappings" });
  }
});

// Get field mappings
router.get("/field-mapping/:companyId", async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }
    
    // In a real implementation, we would fetch this from the database
    // For now, return sample data
    res.json({
      titlePrefix: "[Check-in] ",
      contentFieldMapping: "notes",
      includePhotos: true,
      includeLocation: true,
      customFields: [
        { wpField: "post_title", checkInField: "job_type", isActive: true },
        { wpField: "post_content", checkInField: "notes", isActive: true },
        { wpField: "rp_technician", checkInField: "technician_name", isActive: true },
        { wpField: "rp_location", checkInField: "location", isActive: true },
        { wpField: "rp_completion_date", checkInField: "completion_date", isActive: true }
      ],
      metaPrefix: "rankitpro_",
      advancedMapping: "// Add custom JavaScript mapping function here\nfunction mapFields(checkIn) {\n  return {\n    // your custom mapping logic\n  };\n}"
    });
  } catch (error) {
    console.error("Error fetching field mappings:", error);
    res.status(500).json({ error: "Failed to fetch field mappings" });
  }
});

// WordPress Plugin Download - matches the frontend endpoint - using direct session check
router.get('/plugin', async (req: Request, res: Response) => {
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
    const apiEndpoint = 'https://rankitpro.com/api';
    const pluginCode = await WordPressService.generatePluginCode(apiKey, apiEndpoint);
    
    // Create installation instructions
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

## Features

- Automatic check-in publishing
- SEO-optimized post creation
- Schema.org markup for local SEO
- Photo integration
- Custom post types for service visits
- Webhook support for real-time updates

Version: 1.0.0
Author: Rank It Pro
`;

    // Validate plugin code exists
    if (!pluginCode || typeof pluginCode !== 'string') {
      return res.status(500).json({ error: 'Failed to generate plugin code' });
    }

    console.log('Generating ZIP file for WordPress plugin...');
    
    // Set proper headers for ZIP download BEFORE creating archive
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=rank-it-pro-plugin.zip');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Length', '0'); // Will be updated by archiver

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

    // Add basic CSS and JS files
    const fallbackCSS = `/* Rank It Pro Plugin Styles */
.rankitpro-container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.rankitpro-visit-card { max-width: 450px; margin: 20px auto; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; border: 1px solid #eee; }
.rankitpro-review-card { max-width: 500px; margin: 20px auto; background: white; border-radius: 12px; box-shadow: 0 3px 12px rgba(0,0,0,0.08); padding: 25px; border: 1px solid #f0f0f0; }
.rankitpro-blog-card { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #e0e0e0; }`;
    
    const fallbackJS = `jQuery(document).ready(function($) { $('.rankitpro-container').addClass('loaded'); });`;
    
    archive.append(Buffer.from(fallbackCSS, 'utf8'), { name: 'rank-it-pro-plugin/assets/css/rank-it-pro.css' });
    archive.append(Buffer.from(fallbackJS, 'utf8'), { name: 'rank-it-pro-plugin/assets/js/rank-it-pro.js' });

    // Finalize the archive
    await archive.finalize();
  } catch (authError) {
    console.error('Authentication error:', authError);
    return res.status(401).json({ error: 'Authentication failed' });
  } catch (error) {
    console.error('Error generating WordPress plugin:', error);
    return res.status(500).json({ error: 'Error generating WordPress plugin' });
  }
});

export default router;