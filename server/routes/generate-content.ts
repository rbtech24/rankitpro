import express, { Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { storage } from '../storage';
import { generateSummary, generateBlogPost } from '../ai';
import { AIProviderType } from '../ai/types';

const router = express.Router();

// Generate content from a check-in
router.post('/check-ins/:id/generate-content', isAuthenticated, async (req: Request, res: Response) => {
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
    const { contentType, aiProvider, customPrompt, includePhotos } = req.body;
    
    let result: { title?: string; content: string };
    
    // Generate different types of content based on contentType
    switch (contentType) {
      case 'summary':
        const summary = await generateSummary({
          jobType: checkIn.jobType,
          notes: checkIn.notes || '',
          location: checkIn.location || undefined,
          technicianName: technician.name,
          customInstructions: customPrompt
        }, aiProvider as AIProviderType);
        
        result = { content: summary };
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
          content: blogPost.content
        };
        break;
        
      case 'social':
        // For social media, we'll generate a shorter piece of content
        const socialContent = await generateSummary({
          jobType: checkIn.jobType,
          notes: checkIn.notes || '',
          location: checkIn.location || undefined,
          technicianName: technician.name,
          customInstructions: customPrompt ? 
            `${customPrompt} Keep it short and engaging for social media.` : 
            'Create a short, engaging social media post.'
        }, aiProvider as AIProviderType);
        
        result = { content: socialContent };
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid content type' });
    }
    
    // If auto-publish is enabled, create the content immediately
    if (req.body.autoPublish && contentType === 'blog') {
      await storage.createBlogPost({
        title: result.title || `${checkIn.jobType} by ${technician.name}`,
        content: result.content,
        companyId: checkIn.companyId,
        checkInId: checkIn.id,
        photos: includePhotos ? checkIn.photos : null
      });
    }
    
    return res.json(result);
  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({ message: 'Failed to generate content' });
  }
});

export default router;