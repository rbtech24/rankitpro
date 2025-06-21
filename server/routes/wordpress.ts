import { Router, Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated, isCompanyAdmin } from "../middleware/auth";
import { WordPressService } from "../services/wordpress-service";
import crypto from "crypto";
import archiver from "archiver";
import { storage } from "../storage";

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

export default router;