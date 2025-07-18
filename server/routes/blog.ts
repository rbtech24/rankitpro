import express, { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated, isCompanyAdmin } from '../middleware/auth';
import emailService from '../services/email-service';
// Simple logging function for production
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
import { insertBlogPostSchema } from '../../shared/schema';
import { generateBlogPost } from '../ai/index';
import type { AIProviderType } from '../ai/types';

const router = express.Router();

// Get all blog posts for the current user's company
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user.companyId) {
      return res.status(400).json({ message: 'User is not associated with a company' });
    }

    const blogPosts = await storage.getBlogPostsByCompany(user.companyId);
    return res.json(blogPosts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
});

// Create a new blog post
router.post('/', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user.companyId) {
      return res.status(400).json({ message: 'User is not associated with a company' });
    }

    let blogPostData;
    
    // If this blog post is generated from a check-in
    if (req.body.checkInId) {
      const checkIn = await storage.getCheckIn(req.body.checkInId);
      if (!checkIn) {
        return res.status(404).json({ message: 'Check-in not found' });
      }
      
      if (checkIn.companyId !== user.companyId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // If content is not provided, generate it
      if (!req.body.title || !req.body.content) {
        const technician = await storage.getTechnician(checkIn.technicianId);
        if (!technician) {
          return res.status(404).json({ message: 'Technician not found' });
        }
        
        // Generate blog post content using AI
        const aiProvider: AIProviderType = req.body.aiProvider || 'openai';
        const blogPostResult = await generateBlogPost({
          jobType: checkIn.jobType,
          notes: checkIn.notes || '',
          location: checkIn.location || undefined,
          technicianName: technician.name
        }, aiProvider);
        
        blogPostData = insertBlogPostSchema.parse({
          title: blogPostResult.title,
          content: blogPostResult.content,
          companyId: user.companyId,
          checkInId: checkIn.id,
          photos: checkIn.photos
        });
      } else {
        blogPostData = insertBlogPostSchema.parse({
          title: req.body.title,
          content: req.body.content,
          companyId: user.companyId,
          checkInId: checkIn.id,
          photos: checkIn.photos || req.body.photos
        });
      }
      
      // Mark the check-in as having been made into a blog post
      await storage.updateCheckIn(checkIn.id, { isBlog: true });
    } else {
      // Regular blog post creation
      blogPostData = insertBlogPostSchema.parse({
        title: req.body.title,
        content: req.body.content,
        companyId: user.companyId,
        photos: req.body.photos
      });
    }
    
    const blogPost = await storage.createBlogPost(blogPostData);
    
    // Send email notification to company stakeholders
    try {
      // Get the company for email notifications
      const company = await storage.getCompany(user.companyId!);
      
      if (company) {
        // Find company admin emails and other subscribers
        const companyAdmins = await storage.getUsersByCompanyAndRole(company.id, 'company_admin');
        const adminEmails = companyAdmins.map(admin => admin.email).filter(Boolean) as string[];
        
        // Add current user's email if not already included and if it exists
        if (user.email && !adminEmails.includes(user.email)) {
          adminEmails.push(user.email);
        }
        
        // Generate a short excerpt from the content for the email
        const excerpt = blogPost.content.length > 300 
          ? blogPost.content.substring(0, 297) + '...' 
          : blogPost.content;
        
        if (adminEmails.length > 0) {
          // Send the notification email
          const emailSent = await emailService.sendBlogPostNotification({
            to: adminEmails,
            companyName: company.name,
            title: blogPost.title,
            excerpt: excerpt,
            authorName: user.username || 'Admin',
            blogPostId: blogPost.id
          });
          
          if (!emailSent) {
            log('Failed to send blog post notification email', 'warning');
          } else {
            log(`Blog post notification emails sent to ${adminEmails.length} recipients`, 'info');
          }
        }
      }
    } catch (error) {
      console.error('Error sending blog post notification email:', error);
      // Continue even if email fails
    }
    
    return res.status(201).json(blogPost);
  } catch (error) {
    console.error('Error creating blog post:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    return res.status(500).json({ message: 'Failed to create blog post' });
  }
});

// Get a specific blog post
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const blogPost = await storage.getBlogPost(id);
    
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Check if user has access to this blog post
    const user = req.user;
    if (user.role !== 'super_admin' && blogPost.companyId !== user.companyId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    return res.json(blogPost);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return res.status(500).json({ message: 'Failed to fetch blog post' });
  }
});

// Update a blog post
router.patch('/:id', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const blogPost = await storage.getBlogPost(id);
    
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Check if user has access to update this blog post
    const user = req.user;
    if (user.role !== 'super_admin' && blogPost.companyId !== user.companyId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updatedBlogPost = await storage.updateBlogPost(id, req.body);
    return res.json(updatedBlogPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return res.status(500).json({ message: 'Failed to update blog post' });
  }
});

// Delete a blog post
router.delete('/:id', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const blogPost = await storage.getBlogPost(id);
    
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Check if user has access to delete this blog post
    const user = req.user;
    if (user.role !== 'super_admin' && blogPost.companyId !== user.companyId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const success = await storage.deleteBlogPost(id);
    if (success) {
      return res.status(204).send();
    } else {
      return res.status(500).json({ message: 'Failed to delete blog post' });
    }
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return res.status(500).json({ message: 'Failed to delete blog post' });
  }
});

// Generate a blog post from a check-in
router.post('/generate-from-checkin/:id', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const checkInId = parseInt(req.params.id);
    const checkIn = await storage.getCheckIn(checkInId);
    
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
    
    // Generate blog post content using AI
    const aiProvider: AIProviderType = req.body.aiProvider || 'openai';
    const blogPostResult = await generateBlogPost({
      jobType: checkIn.jobType,
      notes: checkIn.notes || '',
      location: checkIn.location || undefined,
      technicianName: technician.name
    }, aiProvider);
    
    // Return the generated content without saving
    return res.json({
      title: blogPostResult.title,
      content: blogPostResult.content,
      checkInId: checkIn.id,
      photos: checkIn.photos
    });
  } catch (error) {
    console.error('Error generating blog post:', error);
    return res.status(500).json({ message: 'Failed to generate blog post' });
  }
});

export default router;