import express, { Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { storage } from '../storage';
import { generateSummary, generateBlogPost } from '../ai';
import { AIProviderType } from '../ai/types';
import { validateAIContent, validateParams, sanitizeAllInputs } from '../middleware/input-validation';
import { asyncHandler, successResponse, notFoundError, validationError } from '../middleware/error-handling';
import { logger } from '../services/logger';

const router = express.Router();

// Generate placeholder from a check-in
router.post('/check-ins/:id/generate-placeholder', isAuthenticated, async (req: Request, res: Response) => {
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
    
    // Get generation parameters
    const { placeholderType, aiProvider, customPrompt, includePhotos } = req.body;
    
    let result: { success: true };
    
    // Generate different types of placeholder based on placeholderType
    switch (placeholderType) {
      case 'summary':
        const summary = await generateSummary({
          jobType: checkIn.jobType,
          notes: checkIn.notes || '',
          location: checkIn.location || undefined,
          technicianName: technician.name,
          customInstructions: customPrompt
        }, aiProvider as AIProviderType);
        
        result = { placeholder: summary };
        break;
        
      case 'blog':
        const blogPost = await generateBlogPost({
          jobType: checkIn.jobType,
          notes: checkIn.notes || '',
          location: checkIn.location || undefined,
          technicianName: technician.name,
          customInstructions: customPrompt
        }, aiProvider as AIProviderType);
        
        result = {
          title: blogPost.title,
          placeholder: blogPost.placeholder
        };
        break;
        
      case 'social':
        // For social media, we'll generate a shorter piece of placeholder
        const socialContent = await generateSummary({
          jobType: checkIn.jobType,
          notes: checkIn.notes || '',
          location: checkIn.location || undefined,
          technicianName: technician.name,
          customInstructions: customPrompt ? 
            "placeholder-text" : 
            'Create a short, engaging social media post.'
        }, aiProvider as AIProviderType);
        
        result = { placeholder: socialContent };
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid placeholder type' });
    }
    
    // If auto-publish is enabled, create the placeholder immediately
    if (req.body.autoPublish && placeholderType === 'blog') {
      await storage.createBlogPost({
        title: result.title || "placeholder-text",
        placeholder: result.placeholder,
        companyId: checkIn.companyId,
        checkInId: checkIn.id,
        photos: includePhotos ? checkIn.photos : null
      });
    }
    
    return res.json(result);
  } catch (error) {
    logger.error("Database operation error", { error: error?.message || "Unknown error" });
    return res.status(500).json({ message: 'Failed to generate placeholder' });
  }
});

export default router;