import express, { Request, Response } from "express";
import { isAuthenticated, isCompanyAdmin } from "../middleware/auth";
import { storage } from "../storage";
import { WordPressService } from "../services/wordpress-service";

const router = express.Router();

/**
 * Get available custom fields from WordPress site
 */
router.get("/fields", isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }
    
    const company = await storage.getCompany(companyId);
    if (!company || !company.wordpressConfig) {
      return res.status(400).json({ message: "WordPress is not configured for this company" });
    }
    
    try {
      const config = JSON.parse(company.wordpressConfig);
      const wpService = new WordPressService({
        ...config,
        companyId
      });
      
      // Fetch custom fields
      const customFields = await wpService.getCustomFields();
      
      res.json(customFields);
    } catch (error) {
      console.error("Error fetching WordPress custom fields:", error);
      res.status(500).json({ message: "Error fetching WordPress custom fields" });
    }
  } catch (error) {
    console.error("Error in WordPress custom fields route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Get WordPress templates
 */
router.get("/templates", isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }
    
    const company = await storage.getCompany(companyId);
    if (!company || !company.wordpressConfig) {
      return res.status(400).json({ message: "WordPress is not configured for this company" });
    }
    
    try {
      const config = JSON.parse(company.wordpressConfig);
      const wpService = new WordPressService({
        ...config,
        companyId
      });
      
      // Fetch templates
      const templates = await wpService.getTemplates();
      
      res.json(templates);
    } catch (error) {
      console.error("Error fetching WordPress templates:", error);
      res.status(500).json({ message: "Error fetching WordPress templates" });
    }
  } catch (error) {
    console.error("Error in WordPress templates route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Save WordPress custom field templates
 */
router.post("/templates", isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }
    
    const company = await storage.getCompany(companyId);
    if (!company || !company.wordpressConfig) {
      return res.status(400).json({ message: "WordPress is not configured for this company" });
    }
    
    try {
      const config = JSON.parse(company.wordpressConfig);
      
      // Update the custom field templates
      const updatedConfig = {
        ...config,
        customFieldTemplates: req.body.templates || {},
        defaultTitle: req.body.defaultTitle,
        defaultContent: req.body.defaultContent,
        uploadPhotosToWP: req.body.uploadPhotosToWP,
        useAsFeaturedImage: req.body.useAsFeaturedImage,
        defaultTemplate: req.body.defaultTemplate,
        defaultPostType: req.body.defaultPostType || "post"
      };
      
      // Save the updated config
      await storage.updateCompany(companyId, {
        wordpressConfig: JSON.stringify(updatedConfig)
      });
      
      res.json({ message: "WordPress custom field templates saved successfully" });
    } catch (error) {
      console.error("Error saving WordPress custom field templates:", error);
      res.status(500).json({ message: "Error saving WordPress custom field templates" });
    }
  } catch (error) {
    console.error("Error in WordPress custom field templates route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Test publishing a check-in with custom fields
 */
router.post("/test-publish", isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }
    
    const company = await storage.getCompany(companyId);
    if (!company || !company.wordpressConfig) {
      return res.status(400).json({ message: "WordPress is not configured for this company" });
    }
    
    // Get a sample check-in for testing
    const checkIns = await storage.getCheckInsByCompany(companyId, 1);
    if (!checkIns || checkIns.length === 0) {
      return res.status(404).json({ message: "No check-ins found to test with" });
    }
    
    try {
      const config = JSON.parse(company.wordpressConfig);
      const wpService = new WordPressService({
        ...config,
        companyId
      });
      
      // Get custom fields settings from request
      const customFieldsConfig = req.body;
      
      // Set up technician name for template variables
      const technician = await storage.getTechnician(checkIns[0].technician.id);
      
      // Prepare custom fields for WordPress
      const customFields = {
        title_template: customFieldsConfig.titleTemplate,
        content_template: customFieldsConfig.contentTemplate,
        upload_photos_to_wp: customFieldsConfig.uploadPhotos,
        use_as_featured_image: customFieldsConfig.useFeaturedImage,
        include_photos: customFieldsConfig.includePhotos,
        company_name: company.name,
        technician_name: technician?.name || "Technician",
        post_type: customFieldsConfig.postType || "post"
      };
      
      // Prepare ACF fields if provided
      const acfFields = customFieldsConfig.acfFields || {};
      
      // Test publishing
      const result = await wpService.publishCheckIn(checkIns[0], {
        status: "draft", // Always use draft for testing
        customFields,
        acfFields,
        template: customFieldsConfig.template
      });
      
      res.json({
        message: "Test publishing successful",
        result,
        previewUrl: result.link
      });
    } catch (error) {
      console.error("Error testing WordPress publishing:", error);
      res.status(500).json({ message: "Error testing WordPress publishing: " + error.message });
    }
  } catch (error) {
    console.error("Error in WordPress test publishing route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Get custom field mappings (the saved mapping configuration)
 */
router.get("/mappings", isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }
    
    const company = await storage.getCompany(companyId);
    if (!company || !company.wordpressConfig) {
      return res.status(400).json({ message: "WordPress is not configured for this company" });
    }
    
    try {
      const config = JSON.parse(company.wordpressConfig);
      
      res.json({
        customFieldTemplates: config.customFieldTemplates || {},
        defaultTitle: config.defaultTitle,
        defaultContent: config.defaultContent,
        uploadPhotosToWP: config.uploadPhotosToWP,
        useAsFeaturedImage: config.useAsFeaturedImage,
        defaultTemplate: config.defaultTemplate,
        defaultPostType: config.defaultPostType || "post"
      });
    } catch (error) {
      console.error("Error fetching WordPress custom field mappings:", error);
      res.status(500).json({ message: "Error fetching WordPress custom field mappings" });
    }
  } catch (error) {
    console.error("Error in WordPress custom field mappings route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;