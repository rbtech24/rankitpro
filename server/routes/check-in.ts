import express, { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated } from '../middleware/auth';
import emailService from '../services/email-service';
import { log } from '../vite';
import { insertCheckInSchema } from '../../shared/schema';
import { generateSummary, generateBlogPost } from '../ai/index';
import type { AIProviderType } from '../ai/types';

const router = express.Router();

// Get check-ins for the current user's company
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user.companyId) {
      return res.status(400).json({ message: 'User is not associated with a company' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const checkIns = await storage.getCheckInsByCompany(user.companyId, limit);
    
    return res.json(checkIns);
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return res.status(500).json({ message: 'Failed to fetch check-ins' });
  }
});

// Create a new check-in
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    // Validation
    const checkInData = insertCheckInSchema.parse({
      ...req.body,
      companyId: user.companyId,
      technicianId: req.body.technicianId || user.id, // Default to the current user if not specified
    });

    // Create the check-in
    const checkIn = await storage.createCheckIn(checkInData);
    
    // Get the technician info for notifications
    const technician = await storage.getTechnician(checkIn.technicianId);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    // Send email notification (will use logging if SendGrid is not set up)
    const emailSent = await emailService.sendCheckInNotification(checkIn, technician);
    if (!emailSent) {
      log('Failed to send check-in notification email', 'warning');
    }

    // If this check-in should be published as a blog post
    if (req.body.createBlogPost) {
      try {
        // Generate blog post content using AI
        const aiProvider: AIProviderType = req.body.aiProvider || 'openai';
        const blogPostResult = await generateBlogPost({
          jobType: checkIn.jobType,
          notes: checkIn.notes || '',
          location: checkIn.location || undefined,
          technicianName: technician.name
        }, aiProvider);

        // Create the blog post
        const blogPost = await storage.createBlogPost({
          title: blogPostResult.title,
          content: blogPostResult.content,
          companyId: user.companyId!,
          checkInId: checkIn.id,
          photos: checkIn.photos
        });

        // Send blog post notification
        await emailService.sendBlogPostNotification(blogPost);

        // Mark the check-in as having been made into a blog post
        await storage.updateCheckIn(checkIn.id, { isBlog: true });
      } catch (error) {
        console.error('Error creating blog post:', error);
        // Don't fail the whole request if blog post creation fails
      }
    }

    // If this check-in should trigger a review request
    if (req.body.sendReviewRequest && req.body.customerName && (req.body.customerEmail || req.body.customerPhone)) {
      try {
        // Determine whether to use email or SMS
        const method = req.body.customerEmail ? 'email' : 'sms';
        
        // Create the review request
        const reviewRequest = await storage.createReviewRequest({
          method,
          companyId: user.companyId!,
          technicianId: technician.id,
          customerName: req.body.customerName,
          email: req.body.customerEmail || null,
          phone: req.body.customerPhone || null,
        });

        // Send the review request email/notification
        await emailService.sendReviewRequest(reviewRequest, technician);
      } catch (error) {
        console.error('Error creating review request:', error);
        // Don't fail the whole request if review request creation fails
      }
    }

    return res.status(201).json(checkIn);
  } catch (error) {
    console.error('Error creating check-in:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    return res.status(500).json({ message: 'Failed to create check-in' });
  }
});

// Get a specific check-in
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const checkIn = await storage.getCheckIn(id);
    
    if (!checkIn) {
      return res.status(404).json({ message: 'Check-in not found' });
    }
    
    // Check if user has access to this check-in
    const user = req.user;
    if (user.role !== 'super_admin' && checkIn.companyId !== user.companyId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    return res.json(checkIn);
  } catch (error) {
    console.error('Error fetching check-in:', error);
    return res.status(500).json({ message: 'Failed to fetch check-in' });
  }
});

// Update a check-in
router.patch('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const checkIn = await storage.getCheckIn(id);
    
    if (!checkIn) {
      return res.status(404).json({ message: 'Check-in not found' });
    }
    
    // Check if user has access to update this check-in
    const user = req.user;
    if (user.role !== 'super_admin' && checkIn.companyId !== user.companyId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updatedCheckIn = await storage.updateCheckIn(id, req.body);
    return res.json(updatedCheckIn);
  } catch (error) {
    console.error('Error updating check-in:', error);
    return res.status(500).json({ message: 'Failed to update check-in' });
  }
});

// Delete a check-in
router.delete('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const checkIn = await storage.getCheckIn(id);
    
    if (!checkIn) {
      return res.status(404).json({ message: 'Check-in not found' });
    }
    
    // Check if user has access to delete this check-in
    const user = req.user;
    if (user.role !== 'super_admin' && checkIn.companyId !== user.companyId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const success = await storage.deleteCheckIn(id);
    if (success) {
      return res.status(204).send();
    } else {
      return res.status(500).json({ message: 'Failed to delete check-in' });
    }
  } catch (error) {
    console.error('Error deleting check-in:', error);
    return res.status(500).json({ message: 'Failed to delete check-in' });
  }
});

// Generate a summary for a check-in
router.post('/:id/summary', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const checkIn = await storage.getCheckIn(id);
    
    if (!checkIn) {
      return res.status(404).json({ message: 'Check-in not found' });
    }
    
    // Check if user has access to this check-in
    const user = req.user;
    if (user.role !== 'super_admin' && checkIn.companyId !== user.companyId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const technician = await storage.getTechnician(checkIn.technicianId);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    
    // Generate summary using AI
    const aiProvider: AIProviderType = req.body.aiProvider || 'openai';
    const summary = await generateSummary({
      jobType: checkIn.jobType,
      notes: checkIn.notes || '',
      location: checkIn.location || undefined,
      technicianName: technician.name
    }, aiProvider);
    
    return res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return res.status(500).json({ message: 'Failed to generate summary' });
  }
});

export default router;