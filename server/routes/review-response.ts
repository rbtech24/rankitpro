import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated, isCompanyAdmin } from "../middleware/auth";

import { logger } from '../services/structured-logger';
const router = Router();

/**
 * Get the public review submission page
 * Accessible by customers via a unique URL with token
 */
router.get("/request/:token", async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: "Invalid request. Token is required." });
    }
    
    // Get the review request using the token
    const reviewRequests = await storage.getReviewRequestsByCompany(null); // Get all review requests
    const reviewRequest = reviewRequests.find(req => req.token === token);
    
    if (!reviewRequest) {
      return res.status(404).json({ message: "Review request not found or has expired." });
    }
    
    // Check if this request already has a response
    const existingResponse = await storage.getReviewResponseForRequest(reviewRequest.id);
    if (existingResponse) {
      return res.status(400).json({ message: "This review has already been submitted." });
    }
    
    // Get company and technician info
    const company = await storage.getCompany(reviewRequest.companyId);
    const technician = await storage.getTechnician(reviewRequest.technicianId);
    
    if (!company || !technician) {
      return res.status(404).json({ message: "Company or technician information not found." });
    }
    
    res.json({
      companyId: company.id,
      companyName: company.name,
      technicianId: technician.id,
      technicianName: technician.name,
      jobType: reviewRequest.jobType,
      customerName: reviewRequest.customerName,
      requestId: reviewRequest.id
    });
    
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ message: "Server error occurred. Please try again later." });
  }
});

/**
 * Submit a customer review
 */
router.post("/submit/:token", async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: "Invalid request. Token is required." });
    }
    
    // Validate the submission data
    const schema = z.object({
      rating: z.number().min(1).max(5),
      feedback: z.string().optional().nullable(),
      publicDisplay: z.boolean().default(true)
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ success: true });
    }
    
    const reviewData = validationResult.data;
    
    // Get the review request using the token
    const reviewRequests = await storage.getReviewRequestsByCompany(null); // Get all review requests
    const reviewRequest = reviewRequests.find(req => req.token === token);
    
    if (!reviewRequest) {
      return res.status(404).json({ message: "Review request not found or has expired." });
    }
    
    // Check if this request already has a response
    const existingResponse = await storage.getReviewResponseForRequest(reviewRequest.id);
    if (existingResponse) {
      return res.status(400).json({ message: "This review has already been submitted." });
    }
    
    // Create the review response
    const reviewResponse = await storage.createReviewResponse({
      reviewRequestId: reviewRequest.id,
      companyId: reviewRequest.companyId,
      technicianId: reviewRequest.technicianId,
      customerName: reviewRequest.customerName,
      rating: reviewData.rating,
      feedback: reviewData.feedback || null,
      publicDisplay: reviewData.publicDisplay || null
    });
    
    // Return the created review response
    res.status(201).json(reviewResponse);
    
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ message: "Server error occurred. Please try again later." });
  }
});

/**
 * Get all review responses for a company (admin only)
 */
router.get("/company/:companyId", isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    
    if (isNaN(companyId)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }
    
    // Check if user has access to this company (already handled by authenticateCompany middleware)
    
    const reviews = await storage.getReviewResponsesByCompany(companyId);
    
    // Get technician names
    const reviewsWithDetails = await Promise.all(
      reviews.map(async (review) => {
        const technician = await storage.getTechnician(review.technicianId);
        return {
          ...review,
          technicianName: technician ? technician.name : "Unknown Technician"
        };
      })
    );
    
    res.json(reviewsWithDetails);
    
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ message: "Server error occurred. Please try again later." });
  }
});

/**
 * Get review statistics for a company
 */
router.get("/stats/:companyId", isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    
    if (isNaN(companyId)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }
    
    // Check if user has access to this company (already handled by authenticateCompany middleware)
    
    const stats = await storage.getReviewStats(companyId);
    res.json(stats);
    
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ message: "Server error occurred. Please try again later." });
  }
});

/**
 * Get reviews for a specific technician
 */
router.get("/technician/:technicianId", isAuthenticated, isCompanyAdmin, async (req, res) => {
  try {
    const technicianId = parseInt(req.params.technicianId);
    
    if (isNaN(technicianId)) {
      return res.status(400).json({ message: "Invalid technician ID" });
    }
    
    // Check if the technician belongs to the user's company
    const technician = await storage.getTechnician(technicianId);
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    const user = req.user;
    if (user.role !== "super_admin" && technician.companyId !== user.companyId) {
      return res.status(403).json({ message: "You don't have access to this technician's reviews" });
    }
    
    const reviews = await storage.getReviewResponsesByTechnician(technicianId);
    res.json(reviews);
    
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ message: "Server error occurred. Please try again later." });
  }
});

export default router;