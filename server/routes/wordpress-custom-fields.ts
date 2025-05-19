import express, { Request, Response } from "express";
import { isAuthenticated, isCompanyAdmin } from "../middleware/auth";
import { storage } from "../storage";
import { z } from "zod";

const router = express.Router();

// Custom field type from WordPress
interface CustomField {
  key: string;
  name: string;
  type: string;
}

// Template type from WordPress
interface Template {
  file: string;
  name: string;
}

// Template mappings
interface WordPressTemplates {
  customFieldTemplates?: Record<string, string>;
  defaultTitle?: string;
  defaultContent?: string;
  uploadPhotosToWP?: boolean;
  useAsFeaturedImage?: boolean;
  defaultTemplate?: string;
  defaultPostType?: string;
}

/**
 * Get available custom fields from WordPress site
 */
router.get("/fields", isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const company = await storage.getCompany(user.companyId!);
    
    if (!company || !company.wordpressConfig) {
      return res.status(400).json({ error: "WordPress integration not configured" });
    }
    
    const wpConfig = JSON.parse(company.wordpressConfig);
    
    // Mock response for now - in production this would call the WordPress API
    // to get the actual custom fields from Advanced Custom Fields plugin
    const customFields: CustomField[] = [
      { key: "service_type", name: "Service Type", type: "text" },
      { key: "technician", name: "Technician", type: "text" },
      { key: "service_date", name: "Service Date", type: "date" },
      { key: "service_location", name: "Service Location", type: "text" },
      { key: "service_details", name: "Service Details", type: "textarea" },
      { key: "customer_name", name: "Customer Name", type: "text" },
      { key: "customer_rating", name: "Customer Rating", type: "number" },
      { key: "customer_feedback", name: "Customer Feedback", type: "textarea" },
      { key: "before_photos", name: "Before Photos", type: "gallery" },
      { key: "after_photos", name: "After Photos", type: "gallery" },
    ];
    
    res.json(customFields);
  } catch (error) {
    console.error("Error fetching WordPress custom fields:", error);
    res.status(500).json({ error: "Failed to fetch WordPress custom fields" });
  }
});

/**
 * Get WordPress templates
 */
router.get("/templates", isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const company = await storage.getCompany(user.companyId!);
    
    if (!company || !company.wordpressConfig) {
      return res.status(400).json({ error: "WordPress integration not configured" });
    }
    
    const wpConfig = JSON.parse(company.wordpressConfig);
    
    // Mock response for now - in production this would call the WordPress API
    // to get the actual templates from the WordPress site
    const templates: Template[] = [
      { file: "default", name: "Default Template" },
      { file: "service-template", name: "Service Template" },
      { file: "technician-spotlight", name: "Technician Spotlight" },
      { file: "before-after", name: "Before & After" },
      { file: "customer-testimonial", name: "Customer Testimonial" }
    ];
    
    res.json(templates);
  } catch (error) {
    console.error("Error fetching WordPress templates:", error);
    res.status(500).json({ error: "Failed to fetch WordPress templates" });
  }
});

/**
 * Save WordPress custom field templates
 */
router.post("/templates", isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const company = await storage.getCompany(user.companyId!);
    
    if (!company || !company.wordpressConfig) {
      return res.status(400).json({ error: "WordPress integration not configured" });
    }
    
    // Validate request body
    const templateSchema = z.object({
      templates: z.record(z.string()),
      defaultTitle: z.string().optional(),
      defaultContent: z.string().optional(),
      uploadPhotosToWP: z.boolean().optional(),
      useAsFeaturedImage: z.boolean().optional(),
      defaultTemplate: z.string().optional(),
      defaultPostType: z.string().optional()
    });
    
    const validation = templateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid template data", 
        details: validation.error.errors 
      });
    }
    
    const templateData = validation.data;
    
    // Get current WordPress config
    const wpConfig = JSON.parse(company.wordpressConfig);
    
    // Update config with new template settings
    wpConfig.customFields = {
      ...(wpConfig.customFields || {}),
      templates: templateData.templates,
      defaultTitle: templateData.defaultTitle,
      defaultContent: templateData.defaultContent,
      uploadPhotosToWP: templateData.uploadPhotosToWP,
      useAsFeaturedImage: templateData.useAsFeaturedImage,
      defaultTemplate: templateData.defaultTemplate,
      defaultPostType: templateData.defaultPostType
    };
    
    // Save updated config
    await storage.updateCompany(company.id, {
      wordpressConfig: JSON.stringify(wpConfig)
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving WordPress templates:", error);
    res.status(500).json({ error: "Failed to save WordPress templates" });
  }
});

/**
 * Test publishing a check-in with custom fields
 */
router.post("/test-publish", isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const company = await storage.getCompany(user.companyId!);
    
    if (!company || !company.wordpressConfig) {
      return res.status(400).json({ error: "WordPress integration not configured" });
    }
    
    // Get a recent check-in to use for the test
    const checkIns = await storage.getCheckInsByCompany(company.id, 1);
    
    if (checkIns.length === 0) {
      return res.status(400).json({ error: "No check-ins available for test publish" });
    }
    
    const checkIn = checkIns[0];
    const technician = await storage.getTechnician(checkIn.technicianId);
    
    if (!technician) {
      return res.status(400).json({ error: "Technician not found" });
    }
    
    // Validate request body
    const publishSchema = z.object({
      titleTemplate: z.string(),
      contentTemplate: z.string(),
      uploadPhotos: z.boolean().optional(),
      useFeaturedImage: z.boolean().optional(),
      template: z.string().optional(),
      postType: z.string().optional(),
      acfFields: z.record(z.string()).optional()
    });
    
    const validation = publishSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid publish data", 
        details: validation.error.errors 
      });
    }
    
    const publishData = validation.data;
    
    // In a real implementation, this would call the WordPress API to create a draft post
    // For now, we'll just return a mock success response
    
    // Simulate processing the templates with the check-in data
    const dateFormatted = new Date(checkIn.createdAt || new Date()).toLocaleDateString();
    
    const mockTitle = publishData.titleTemplate
      .replace(/{job_type}/g, checkIn.jobType)
      .replace(/{location}/g, checkIn.address || "N/A")
      .replace(/{date}/g, dateFormatted)
      .replace(/{technician_name}/g, technician.name);
    
    const mockContent = publishData.contentTemplate
      .replace(/{job_type}/g, checkIn.jobType)
      .replace(/{location}/g, checkIn.address || "N/A")
      .replace(/{date}/g, dateFormatted)
      .replace(/{technician_name}/g, technician.name)
      .replace(/{notes}/g, checkIn.notes || "")
      .replace(/{customer_name}/g, checkIn.customerName || "")
      .replace(/{work_performed}/g, checkIn.workPerformed || "")
      .replace(/{materials_used}/g, checkIn.materialsUsed || "");
    
    // Mock custom fields processing
    const mockCustomFields: Record<string, string> = {};
    if (publishData.acfFields) {
      for (const [key, template] of Object.entries(publishData.acfFields)) {
        let value = template;
        value = value.replace(/{job_type}/g, checkIn.jobType);
        value = value.replace(/{location}/g, checkIn.address || "N/A");
        value = value.replace(/{date}/g, dateFormatted);
        value = value.replace(/{technician_name}/g, technician.name);
        value = value.replace(/{notes}/g, checkIn.notes || "");
        value = value.replace(/{customer_name}/g, checkIn.customerName || "");
        value = value.replace(/{work_performed}/g, checkIn.workPerformed || "");
        value = value.replace(/{materials_used}/g, checkIn.materialsUsed || "");
        
        mockCustomFields[key] = value;
      }
    }
    
    // For the demo, return a mock WordPress post preview URL
    res.json({
      success: true,
      title: mockTitle,
      content: mockContent,
      customFields: mockCustomFields,
      postType: publishData.postType || "post",
      template: publishData.template || "default",
      previewUrl: "https://example.com/wp-admin/post.php?post=12345&action=edit"
    });
  } catch (error) {
    console.error("Error testing WordPress publish:", error);
    res.status(500).json({ error: "Failed to test WordPress publish" });
  }
});

/**
 * Get custom field mappings (the saved mapping configuration)
 */
router.get("/mappings", isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const company = await storage.getCompany(user.companyId!);
    
    if (!company || !company.wordpressConfig) {
      return res.status(400).json({ error: "WordPress integration not configured" });
    }
    
    const wpConfig = JSON.parse(company.wordpressConfig);
    
    // Return the custom field mappings if they exist, otherwise return defaults
    const customFields = wpConfig.customFields || {};
    
    const response: WordPressTemplates = {
      customFieldTemplates: customFields.templates || {},
      defaultTitle: customFields.defaultTitle || "{job_type} Service at {location} - {date}",
      defaultContent: customFields.defaultContent || "<h2>Service Details</h2>\n<p><strong>Service:</strong> {job_type}</p>\n<p><strong>Location:</strong> {location}</p>\n<p><strong>Date:</strong> {date}</p>\n<p><strong>Technician:</strong> {technician_name}</p>\n\n<h3>Work Performed</h3>\n<p>{work_performed}</p>\n\n<h3>Notes</h3>\n<p>{notes}</p>",
      uploadPhotosToWP: customFields.uploadPhotosToWP || false,
      useAsFeaturedImage: customFields.useAsFeaturedImage || false,
      defaultTemplate: customFields.defaultTemplate || "",
      defaultPostType: customFields.defaultPostType || "post"
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error fetching WordPress mappings:", error);
    res.status(500).json({ error: "Failed to fetch WordPress mappings" });
  }
});

export default router;