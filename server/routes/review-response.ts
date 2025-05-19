import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertReviewResponseSchema } from '../../shared/schema';

const router = Router();

// Define validation schema for submitting a review
const submitReviewSchema = z.object({
  token: z.string(),
  rating: z.number().min(1).max(5),
  feedback: z.string().optional().nullable(),
  publicDisplay: z.boolean().optional().nullable()
});

/**
 * Get the public review submission page
 * Accessible by customers via a unique URL with token
 */
router.get('/:token', async (req, res) => {
  const { token } = req.params;
  
  try {
    // Find the review request with this token
    const reviewRequests = await storage.getReviewRequestsByCompany(0); // Get all review requests initially
    const reviewRequest = reviewRequests.find(request => request.token === token);
    
    if (!reviewRequest) {
      return res.status(404).render('review-error', {
        error: 'Review request not found or has expired.'
      });
    }
    
    // Check if the review request has already been responded to
    const existingResponse = await storage.getReviewResponseForRequest(reviewRequest.id);
    if (existingResponse) {
      return res.status(400).render('review-submitted', {
        message: 'You have already submitted a review. Thank you for your feedback!'
      });
    }
    
    // Get company info to display in the review form
    const company = await storage.getCompany(reviewRequest.companyId);
    const technician = await storage.getTechnician(reviewRequest.technicianId);
    
    if (!company || !technician) {
      return res.status(404).render('review-error', {
        error: 'Company or technician information not found.'
      });
    }
    
    // Render the review submission form
    return res.render('review-submission', {
      company,
      technician,
      reviewRequest,
      token
    });
  } catch (error) {
    console.error('Error fetching review request:', error);
    return res.status(500).render('review-error', {
      error: 'An error occurred while processing your review request.'
    });
  }
});

/**
 * Submit a customer review
 */
router.post('/submit', async (req, res) => {
  try {
    const { token, rating, feedback, publicDisplay } = submitReviewSchema.parse(req.body);
    
    // Find the review request with this token
    const reviewRequests = await storage.getReviewRequestsByCompany(0); // Get all review requests initially
    const reviewRequest = reviewRequests.find(request => request.token === token);
    
    if (!reviewRequest) {
      return res.status(404).json({
        success: false,
        message: 'Review request not found or has expired.'
      });
    }
    
    // Check if the review request has already been responded to
    const existingResponse = await storage.getReviewResponseForRequest(reviewRequest.id);
    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review.'
      });
    }
    
    // Create a new review response
    const newReviewResponse = await storage.createReviewResponse({
      companyId: reviewRequest.companyId,
      customerName: reviewRequest.customerName,
      technicianId: reviewRequest.technicianId,
      reviewRequestId: reviewRequest.id,
      rating,
      feedback,
      publicDisplay: publicDisplay ?? true
    });
    
    return res.json({
      success: true,
      message: 'Thank you for your review!',
      reviewResponse: newReviewResponse
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    let errorMessage = 'An error occurred while submitting your review.';
    
    if (error instanceof z.ZodError) {
      errorMessage = 'Please provide a valid rating between 1 and 5.';
    }
    
    return res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
});

/**
 * Get all review responses for a company (admin only)
 */
router.get('/company/:companyId', async (req, res) => {
  // This would typically check authentication and authorization
  // We'll leave that implementation for auth middleware
  
  try {
    const companyId = parseInt(req.params.companyId);
    const reviewResponses = await storage.getReviewResponsesByCompany(companyId);
    
    return res.json(reviewResponses);
  } catch (error) {
    console.error('Error fetching review responses:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching review responses.'
    });
  }
});

/**
 * Get review statistics for a company
 */
router.get('/stats/:companyId', async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    const stats = await storage.getReviewStats(companyId);
    
    return res.json(stats);
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching review statistics.'
    });
  }
});

export default router;