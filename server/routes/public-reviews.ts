import express from 'express';
import { storage } from '../storage.js';

import { logger } from '../services/logger';
const router = express.Router();

// Public endpoint for website widget to fetch reviews
router.get('/', async (req, res) => {
  try {
    const { company_id, limit = 10 } = req.query;
    
    if (!company_id) {
      return res.status(400).json({ message: "Company ID is required" });
    }
    
    const reviews = await storage.getReviewResponses(parseInt(company_id as string));
    
    // Filter for approved reviews and sort by date
    const approvedReviews = reviews
      .filter(review => review.rating && review.rating > 0)
      .sort((a, b) => new Date(b.respondedAt || b.createdAt || 0).getTime() - new Date(a.respondedAt || a.createdAt || 0).getTime())
      .slice(0, parseInt(limit as string));
    
    // Format for public display
    const formattedReviews = approvedReviews.map(review => ({
      id: review.id,
      rating: review.rating || 5,
      feedback: review.feedback || 'Excellent service and professional work.',
      customerName: review.customerName || 'Satisfied Customer',
      date: review.respondedAt || review.createdAt,
      serviceType: review.serviceType || 'Professional Service'
    }));
    
    res.json({
      success: true,
      reviews: formattedReviews,
      total: formattedReviews.length
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

export default router;