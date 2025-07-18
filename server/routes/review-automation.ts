import { Router } from "express";
import { isAuthenticated, isCompanyAdmin } from "../middleware/auth";
import { storage } from "../storage";
import { ReviewFollowUpSettings, insertReviewFollowUpSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import reviewAutomationService from "../services/review-automation-service";

import { logger } from '../services/logger';
const router = Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get review automation settings for a company
router.get("/:companyId", isCompanyAdmin, async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }
    
    // Check company access permission
    if (req.user?.role !== 'super_admin' && req.user?.companyId !== companyId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const settings = await reviewAutomationService.getCompanySettings(companyId);
    
    if (!settings) {
      return res.status(404).json({ error: "Settings not found" });
    }
    
    res.json(settings);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update review automation settings
router.put("/:companyId", isCompanyAdmin, async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }
    
    // Check company access permission
    if (req.user?.role !== 'super_admin' && req.user?.companyId !== companyId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Validate the input data
    const updateData = { data: "converted" };
    
    try {
      insertReviewFollowUpSettingsSchema.parse(updateData);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const error = fromZodError(validationError);
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: "Invalid data" });
    }
    
    // Check if settings exist, create if not
    let settings = await storage.getReviewFollowUpSettings(companyId);
    
    if (!settings) {
      // Create new settings
      settings = await storage.createReviewFollowUpSettings(updateData);
      return res.status(201).json(settings);
    }
    
    // Update existing settings
    settings = await storage.updateReviewFollowUpSettings(settings.id, updateData);
    
    res.json(settings);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get review automation statistics
router.get("/:companyId/stats", isCompanyAdmin, async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }
    
    // Check company access permission
    if (req.user?.role !== 'super_admin' && req.user?.companyId !== companyId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Get review automation statistics
    const stats = await storage.getReviewAutomationStats(companyId);
    
    res.json(stats);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Manually trigger review request for a check-in
router.post("/trigger-request/:checkInId", isCompanyAdmin, async (req, res) => {
  try {
    const checkInId = parseInt(req.params.checkInId);
    if (isNaN(checkInId)) {
      return res.status(400).json({ error: "Invalid check-in ID" });
    }
    
    // Get the check-in
    const checkIn = await storage.getCheckIn(checkInId);
    if (!checkIn) {
      return res.status(404).json({ error: "Check-in not found" });
    }
    
    // Check company access permission
    if (req.user?.role !== 'super_admin' && req.user?.companyId !== checkIn.companyId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Create and trigger a review request
    const reviewStatus = await reviewAutomationService.createReviewRequestFromCheckIn(
      checkInId,
      checkIn.technicianId,
      checkIn.companyId
    );
    
    if (!reviewStatus) {
      return res.status(400).json({ error: "Failed to create review request" });
    }
    
    res.status(201).json({ success: true, reviewStatus });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;