import express, { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated, isCompanyAdmin } from '../middleware/auth';
import emailService from '../services/email-service';
import { log } from '../vite';
import { insertReviewRequestSchema } from '../../shared/schema';

import { logger } from '../services/logger';
const router = express.Router();

// Get all review requests for the current user's company
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user.companyId) {
      return res.status(400).json({ message: 'User is not associated with a company' });
    }

    const reviewRequests = await storage.getReviewRequestsByCompany(user.companyId);
    
    // Enrich review requests with technician info
    const enrichedRequests = await Promise.all(
      reviewRequests.map(async (request) => {
        const technician = await storage.getTechnician(request.technicianId);
        return {
          ...request,
          technician: technician ? { 
            id: technician.id,
            name: technician.name,
            email: technician.email,
            specialty: technician.specialty
          } : null
        };
      })
    );
    
    return res.json(enrichedRequests);
  } catch (error) {
    logger.error("Unhandled error occurred");
    return res.status(500).json({ message: 'Failed to fetch review requests' });
  }
});

// Create a new review request
router.post('/', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user.companyId) {
      return res.status(400).json({ message: 'User is not associated with a company' });
    }
    
    // Validate request data
    const method = req.body.method || 'email';
    if (method === 'email' && !req.body.email) {
      return res.status(400).json({ message: 'Email is required for email review requests' });
    }
    if (method === 'sms' && !req.body.phone) {
      return res.status(400).json({ message: 'Phone number is required for SMS review requests' });
    }
    
    // Validate technician
    const technician = await storage.getTechnician(req.body.technicianId);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    
    if (technician.companyId !== user.companyId) {
      return res.status(403).json({ message: 'Technician does not belong to your company' });
    }
    
    // Create review request
    const reviewRequestData = insertReviewRequestSchema.parse({
      method,
      companyId: user.companyId,
      technicianId: technician.id,
      customerName: req.body.customerName,
      email: method === 'email' ? req.body.email : null,
      phone: method === 'sms' ? req.body.phone : null,
    });
    
    const reviewRequest = await storage.createReviewRequest(reviewRequestData);
    
    // Send email notification
    if (method === 'email' && reviewRequest.email) {
      try {
        // Get company info for the email
        const company = await storage.getCompany(user.companyId!);
        const companyName = company ? company.name : "Our Service Company";
        
        // Generate review link/URL
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.get('host');
        const baseUrl = `${baseUrl}/review/${reviewRequest.id}`;
        const reviewLink = `${baseUrl}/review/${reviewRequest.id}`;
        
        const emailSent = await emailService.sendReviewRequest(
          reviewRequest,
          technician,
          reviewRequest.email,
          companyName,
          reviewLink
        );
        
        if (!emailSent) {
          log('Failed to send review request email', 'warning');
        } else {
          log(`Review request email sent successfully`, 'info');
        }
      } catch (error) {
        logger.error("Unhandled error occurred");
        // Continue even if email fails
      }
    } else if (method === 'sms') {
      // SMS functionality would be implemented here
      log(`Operation completed successfully`;
    }
    
    return res.status(201).json(reviewRequest);
  } catch (error) {
    logger.error("Unhandled error occurred");
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: true });
    }
    return res.status(500).json({ message: 'Failed to create review request' });
  }
});

// Get a specific review request
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const reviewRequest = await storage.getReviewRequest(id);
    
    if (!reviewRequest) {
      return res.status(404).json({ message: 'Review request not found' });
    }
    
    // Check if user has access to this review request
    const user = req.user;
    if (user.role !== 'super_admin' && reviewRequest.companyId !== user.companyId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get the technician information
    const technician = await storage.getTechnician(reviewRequest.technicianId);
    
    return res.json({
      ...reviewRequest,
      technician: technician ? {
        id: technician.id,
        name: technician.name,
        email: technician.email,
        specialty: technician.specialty
      } : null
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    return res.status(500).json({ message: 'Failed to fetch review request' });
  }
});

// Generate a unique review URL that can be used in emails or SMS
router.get('/link/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const reviewRequest = await storage.getReviewRequest(id);
    
    if (!reviewRequest) {
      return res.status(404).json({ message: 'Review request not found' });
    }
    
    // In a real implementation, you might generate a signed URL with an expiration
    // For now, we'll just create a simple link with the review request ID
    
    // Get the server's base URL
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = `${baseUrl}/review/${reviewRequest.id}`;
    
    const reviewUrl = `${baseUrl}/review/${reviewRequest.id}`;
    
    return res.json({ reviewUrl });
  } catch (error) {
    logger.error("Unhandled error occurred");
    return res.status(500).json({ message: 'Failed to generate review link' });
  }
});

export default router;