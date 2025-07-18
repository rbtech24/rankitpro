import express, { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated } from '../middleware/auth';
import emailService from '../services/email-service';
import { log } from '../vite';
import { insertCheckInSchema } from '../../shared/schema';
import { generateSummary, generateBlogPost } from '../ai/index';
import type { AIProviderType } from '../ai/types';
import { reverseGeocode, formatLocationAddress } from '../services/geocoding';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { validateCheckIn, validateParams, validateFileUpload, sanitizeAllInputs } from '../middleware/input-validation';
import { asyncHandler, successResponse, createdResponse, updatedResponse, notFoundError, validationError } from '../middleware/error-handling';
import { logger } from '../services/logger';

import { logger } from '../services/logger';
const router = express.Router();

// Configure multer storage for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'server', 'public', 'uploads');
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

// Filter to only allow image files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ 
  storage: storage_config, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 10 // Max 10 files
  }
});

// Upload photos endpoint
router.post('/upload-photos', isAuthenticated, upload.array('photos', 10), async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Extract photo categories from form data
    const category = req.body.category || 'general'; // general, before, after
    
    // Base URL for serving static files
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads`;
    
    // Create URLs for uploaded files
    const photoUrls = (req.files as Express.Multer.File[]).map(file => ({
      url: `${baseUrl}/${file.filename}`,
      category
    }));
    
    // Organize photos by category
    const photosByCategory = {
      photoUrls: photoUrls.filter(p => p.category === 'general').map(p => ({ url: p.url })),
      beforePhotoUrls: photoUrls.filter(p => p.category === 'before').map(p => ({ url: p.url })),
      afterPhotoUrls: photoUrls.filter(p => p.category === 'after').map(p => ({ url: p.url }))
    };
    
    res.json(photosByCategory);
  } catch (error) {
    logger.error("Database operation error", { error: error?.message || "Unknown error" });
    res.status(500).json({ message: 'Failed to upload photos' });
  }
});

// PUT endpoint for updating check-ins
router.put('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const checkInId = parseInt(req.params.id);
    const { jobType, notes, location } = req.body;
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Validate required fields
    if (!jobType || !notes) {
      return res.status(400).json({ message: "Job type and job description are required" });
    }

    // Get existing check-in to verify ownership
    const existingCheckIn = await storage.getCheckIn(checkInId);
    if (!existingCheckIn || existingCheckIn.companyId !== user.companyId) {
      return res.status(404).json({ message: "Check-in not found" });
    }

    // Update check-in
    const updatedCheckIn = await storage.updateCheckIn(checkInId, {
      jobType: jobType.trim(),
      notes: notes.trim(),
      location: location?.trim() || existingCheckIn.location
    });

    if (!updatedCheckIn) {
      return res.status(500).json({ message: "Failed to update check-in" });
    }

    res.json(updatedCheckIn);
  } catch (error) {
    logger.error("Database operation error", { error: error?.message || "Unknown error" });
    res.status(500).json({ message: 'Failed to update check-in' });
  }
});

// Get check-ins for the current user's company
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    // Critical security check - ensure user is authenticated
    if (!user || !user.companyId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const checkIns = await storage.getCheckInsByCompany(user.companyId, limit);
    
    // Enrich check-ins with technician data and format photos
    const enrichedCheckIns = await Promise.all(
      checkIns.map(async (checkIn) => {
        // Get technician info
        const technician = await storage.getTechnician(checkIn.technicianId);
        
        // Parse photos from JSON string or URL
        let photos = [];
        if (checkIn.photos) {
          try {
            // Try to parse as JSON array first
      const parsed = JSON.parse(checkIn.photos);
            if (Array.isArray(parsed)) {
              photos = parsed.map(url => ({ url, filename: url.split('/').pop() || 'image' }));
            }
          } catch (e) {
            // If parsing fails, assume it's a single URL or comma-separated URLs
      const photoStr = checkIn.photos.toString();
            if (photoStr.startsWith('http')) {
              photos = [{ success: true }];
            } else if (photoStr.includes('http')) {
              // Extract all URLs from the string
        const urlMatches = photoStr.match(/https?:\/\/[^\s,\]"]+/g) || [];
              photos = urlMatches.map(url => ({ url, filename: url.split('/').pop() || 'image' }));
            }
          }
        }

        // Format location with reverse geocoding if coordinates exist
        let formattedLocation = checkIn.location;
        
        // Check if location is just coordinates
        const isCoordinatesOnly = !checkIn.location || 
          checkIn.location.match(/^-?\d+\.?\d*,?\s*-?\d+\.?\d*$/) ||
          checkIn.location === "";
        
        if (checkIn.latitude && checkIn.longitude && isCoordinatesOnly) {
          try {
      const fullAddress = await reverseGeocode(Number(checkIn.latitude), Number(checkIn.longitude));
            
            // Extract city, state, zip for cleaner display (exclude street number)
      const parts = fullAddress.split(', ');
            if (parts.length >= 3) {
              // Skip the first part (street number + street name) and take city, state
              formattedLocation = parts.slice(1, -1).join(', ') + ', ' + parts[parts.length - 1];
            } else if (parts.length >= 2) {
              // Take the last 2 parts for city, state format
              formattedLocation = parts.slice(-2).join(', ');
            } else {
              formattedLocation = fullAddress;
            }
          } catch (error) {
            logger.warn("Parameter processed");
            formattedLocation = `${checkIn.latitude}, ${checkIn.longitude}`;
          }
        }

        return {
          ...checkIn,
          technician: technician ? {
            id: technician.id,
            name: technician.name,
            email: technician.email,
            specialty: technician.specialty
          } : {
            id: 0,
            name: 'Unknown Technician',
            email: '',
            specialty: ''
          },
          photos,
          location: formattedLocation
        };
      })
    );
    
    // Ensure JSON response
    res.setHeader('Content-Type', 'application/json');
    return res.json(enrichedCheckIns);
  } catch (error) {
    logger.error("Database operation error", { error: error?.message || "Unknown error" });
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ message: 'Failed to fetch check-ins' });
  }
});

// Create a new check-in with photo upload support
router.post('/', isAuthenticated, upload.array('photos', 10), async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    // Process uploaded photos
    let photoUrls: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Use correct upload path that matches the server setup
      const baseUrl = `${req.protocol}://${req.get('host')}/uploads`;
      photoUrls = req.files.map(file => `${baseUrl}/${file.filename}`);
      logger.info("Photo uploads processed", { count: req.files.length });
    }
    
    // Prepare check-in data with photos and default values
    const checkInData = {
      jobType: req.body.jobType?.trim() || 'General Service',
      notes: req.body.notes?.trim() || '',
      customerName: req.body.customerName?.trim() || null,
      customerEmail: req.body.customerEmail?.trim() || null,
      customerPhone: req.body.customerPhone?.trim() || null,
      workPerformed: req.body.workPerformed?.trim() || null,
      materialsUsed: req.body.materialsUsed?.trim() || null,
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
      location: req.body.location?.trim() || 'Service Location',
      address: req.body.address?.trim() || null,
      city: req.body.city?.trim() || null,
      state: req.body.state?.trim() || null,
      zip: req.body.zip?.trim() || null,
      companyId: user.companyId,
      technicianId: req.body.technicianId || null, // Will be resolved below
      photos: photoUrls.length > 0 ? JSON.stringify(photoUrls) : JSON.stringify([]),
      generatedContent: req.body.generatedContent || null,
    };

    logger.info("Operation completed");

    // Resolve technician ID - either from form or find/create one for the user
    if (!checkInData.technicianId) {
      try {
        // First, try to find a technician associated with this user
        const userTechnician = await storage.getTechnicianByUserId(user.id);
        
        if (userTechnician) {
          checkInData.technicianId = userTechnician.id;
        } else {
          // If no technician exists for this user, find any technician in the company
          const companyTechnicians = await storage.getTechniciansByCompany(user.companyId);
          
          if (companyTechnicians && companyTechnicians.length > 0) {
            // Use the first available technician
            checkInData.technicianId = companyTechnicians[0].id;
            logger.info("Using existing company technician", { technicianId: companyTechnicians[0].id });
          } else {
            // Create a default technician for this company admin
            const defaultTechnician = await storage.createTechnician({
              name: user.username || user.email.split('@')[0],
              email: user.email,
              phone: null,
              specialty: 'General Service',
              userId: user.id,
              companyId: user.companyId,
              location: 'Main Office',
              active: true
            });
            checkInData.technicianId = defaultTechnician.id;
            logger.info("Created default technician", { technicianId: defaultTechnician.id });
          }
        }
      } catch (techError: any) {
        logger.error("Error resolving technician", { error: techError?.message });
        return res.status(500).json({ 
          message: 'Failed to resolve technician for check-in',
          details: techError?.message || 'Unknown error'
        });
      }
    }

    // Validate required fields before creating check-in
    if (!checkInData.jobType || !checkInData.companyId || !checkInData.technicianId) {
      return res.status(400).json({ 
        message: 'Missing required fields: jobType, companyId, or technicianId',
        received: {
          jobType: checkInData.jobType,
          companyId: checkInData.companyId,
          technicianId: checkInData.technicianId
        }
      });
    }

    // Create the check-in with enhanced error handling
    let checkIn;
    try {
      checkIn = await storage.createCheckIn(checkInData);
      if (!checkIn) {
        return res.status(500).json({ message: 'Failed to create check-in - database returned null' });
      }
    } catch (dbError: any) {
      logger.error("Database error creating check-in", { 
        error: dbError?.message || "Unknown database error",
        data: checkInData 
      });
      return res.status(500).json({ 
        message: 'Database error creating check-in',
        details: dbError?.message || 'Unknown error'
      });
    }
    
    // Get the technician info for notifications
    const technician = await storage.getTechnician(checkIn.technicianId);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    // Send email notification to company admins
    try {
      // Get the company for email notifications
      const company = await storage.getCompany(user.companyId!);
      
      if (company) {
        // Find company admin emails
        const companyAdmins = await storage.getUsersByCompanyAndRole(company.id, 'company_admin');
        const adminEmails = companyAdmins.map(admin => admin.email).filter(Boolean) as string[];
        
        // Add current user's email if not already included and if it exists
        if (user.email && !adminEmails.includes(user.email)) {
          adminEmails.push(user.email);
        }
        
        if (adminEmails.length > 0) {
          // Send the notification email
          const emailSent = await emailService.sendCheckInNotification({
            to: adminEmails,
            companyName: company.name,
            technicianName: technician.name,
            jobType: checkIn.jobType,
            customerName: checkIn.customerName,
            location: checkIn.location,
            notes: checkIn.notes,
            photos: checkIn.photos,
            checkInId: checkIn.id
          });
          
          if (!emailSent) {
            log('Failed to send check-in notification email', 'warning');
          }
        }
      }
    } catch (error) {
      logger.error("Database operation error", { error: error?.message || "Unknown error" });
      // Don't fail the check-in creation if notification fails
    }

    // If this check-in should be published as a blog post
    if (req.body.createBlogPost === 'true' || req.body.createBlogPost === true) {
      try {
        // Format location for AI
        let aiLocation = checkIn.location;
        if (checkIn.latitude && checkIn.longitude) {
          try {
            aiLocation = await reverseGeocode(checkIn.latitude, checkIn.longitude);
          } catch (error) {
            aiLocation = `${checkIn.latitude}, ${checkIn.longitude}`;
          }
        }

        // Generate blog post placeholder using AI
        const aiProvider: AIProviderType = req.body.aiProvider || 'openai';
        const blogPostResult = await generateBlogPost({
          jobType: checkIn.jobType,
          notes: checkIn.notes || '',
          location: aiLocation || 'Service Location',
          technicianName: technician.name
        }, aiProvider);

        // Create the blog post
        const blogPost = await storage.createBlogPost({
          title: blogPostResult.title,
          content: blogPostResult.content,
          companyId: user.companyId!,
          checkInId: checkIn.id,
          photos: checkIn.photos,
          status: "published"
        });

        // Send blog post notification
        try {
          await emailService.sendBlogPostNotification(blogPost, user.email);
        } catch (emailError) {
          logger.warn('Email notification failed:', { emailError });
        }

        // Mark the check-in as having been made into a blog post
        await storage.updateCheckIn(checkIn.id, { isBlog: true });
      } catch (error) {
        logger.error("Unhandled error occurred");
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
        const customerEmail = req.body.customerEmail;
        if (customerEmail) {
          // Get company info for the email
          const company = await storage.getCompany(user.companyId!);
          const companyName = company ? company.name : "Our Service Company";
          
          // Create review link (in a real app, this would be a unique URL)
          const reviewLink = `${req.protocol}://${req.get('host')}/review/${reviewRequest.token || reviewRequest.id}`;
          
          await emailService.sendReviewRequest(
            reviewRequest,
            technician,
            customerEmail,
            companyName,
            reviewLink
          );
        }
      } catch (error) {
        logger.error("Unhandled error occurred");
        // Don't fail the whole request if review request creation fails
      }
    }

    return res.status(201).json(checkIn);
  } catch (error: any) {
    logger.error("Unhandled error in check-in creation", { 
      error: error?.message || "Unknown error",
      stack: error?.stack,
      body: req.body 
    });
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error',
        details: error.errors 
      });
    }
    return res.status(500).json({ 
      message: 'Failed to create check-in',
      details: error?.message || 'Unknown error'
    });
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
    logger.error("Unhandled error occurred");
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
    logger.error("Unhandled error occurred");
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
    
    // First delete any related blog posts to avoid foreign key constraint
    try {
      const blogPosts = await storage.getBlogPostsByCheckIn(id);
      for (const blogPost of blogPosts) {
        await storage.deleteBlogPost(blogPost.id);
      }
    } catch (error) {
      logger.warn('Error deleting related blog posts:', { error });
    }
    
    const success = await storage.deleteCheckIn(id);
    if (success) {
      return res.status(204).send();
    } else {
      return res.status(500).json({ message: 'Failed to delete check-in' });
    }
  } catch (error) {
    logger.error("Unhandled error occurred");
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
    logger.error("Unhandled error occurred");
    return res.status(500).json({ message: 'Failed to generate summary' });
  }
});

// Convert GPS coordinates to readable address
router.post('/convert-coordinates', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'Invalid coordinates format' });
    }

    const result = await reverseGeocode(lat, lng);
    
    res.json({
      success: result.success,
      formattedAddress: result.formattedAddress,
      components: result.components,
      error: result.error
    });
  } catch (error: any) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ 
      message: 'Failed to convert coordinates',
      error: error.message 
    });
  }
});

// Format location address (handles both coordinates and addresses)
router.post('/format-location', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { location } = req.body;

    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    const formattedAddress = await formatLocationAddress(location);
    
    res.json({
      originalLocation: location,
      formattedAddress
    });
  } catch (error: any) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ 
      message: 'Failed to format location',
      error: error.message 
    });
  }
});

export default router;