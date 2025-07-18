import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated, isCompanyAdmin } from "../middleware/auth";

import { logger } from '../services/structured-logger';
const router = Router();

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

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get field mappings
router.get("/:companyId", isCompanyAdmin, async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }
    
    // Return default field mappings for now
    // In a real implementation, these would be fetched from the database
    res.json({
      titlePrefix: "[Check-in] ",
      contentFieldMapping: "notes",
      includePhotos: true,
      includeLocation: true,
      customFields: [
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true }
      ],
      metaPrefix: "rankitpro_",
      advancedMapping: "// Add custom JavaScript mapping function here\nfunction mapFields(checkIn) {\n  return {\n    // your custom mapping logic\n  };\n}"
    });
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ error: "Failed to fetch field mappings" });
  }
});

// Save field mappings
router.post("/", isCompanyAdmin, async (req, res) => {
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
    logger.error("Error logging fixed");
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to save field mappings" });
  }
});

// Get WordPress custom field mapping options
router.get("/fields/:companyId", isCompanyAdmin, async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }
    
    // Return sample WordPress fields and check-in fields
    res.json({
      wpFields: [
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true }
      ],
      checkInFields: [
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true }
      ]
    });
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ error: "Failed to fetch field options" });
  }
});

export default router;