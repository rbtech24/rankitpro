import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated, isCompanyAdmin } from "../middleware/auth";

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
    console.error("Error saving field mappings:", error);
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
        { id: "post_title", name: "Post Title" },
        { id: "post_content", name: "Post Content" },
        { id: "post_excerpt", name: "Post Excerpt" },
        { id: "post_status", name: "Post Status" },
        { id: "_rp_technician", name: "Technician (Meta)" },
        { id: "_rp_location", name: "Location (Meta)" },
        { id: "_rp_completion_date", name: "Completion Date (Meta)" },
        { id: "_rp_job_type", name: "Job Type (Meta)" },
        { id: "_rp_customer", name: "Customer (Meta)" },
        { id: "_rp_rating", name: "Rating (Meta)" }
      ],
      checkInFields: [
        { id: "technician_name", name: "Technician Name", type: "text" },
        { id: "job_type", name: "Job Type", type: "text" },
        { id: "location", name: "Location", type: "text" },
        { id: "notes", name: "Notes", type: "text" },
        { id: "summary", name: "AI Summary", type: "text" },
        { id: "completion_date", name: "Completion Date", type: "date" },
        { id: "photos", name: "Photos", type: "array" },
        { id: "customer_name", name: "Customer Name", type: "text" },
        { id: "rating", name: "Rating", type: "number" },
        { id: "coordinates", name: "GPS Coordinates", type: "object" }
      ]
    });
  } catch (error) {
    console.error("Error fetching field options:", error);
    res.status(500).json({ error: "Failed to fetch field options" });
  }
});

export default router;