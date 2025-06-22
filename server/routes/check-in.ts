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
    const uniqueFilename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
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
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
    
    // Create URLs for uploaded files
    const photoUrls = (req.files as Express.Multer.File[]).map(file => ({
      url: `${baseUrl}${file.filename}`,
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
    console.error('Error uploading photos:', error);
    res.status(500).json({ message: 'Failed to upload photos' });
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
              photos = [{ url: photoStr, filename: photoStr.split('/').pop() || 'image' }];
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
          checkIn.location === `${checkIn.latitude}, ${checkIn.longitude}`;
        
        if (checkIn.latitude && checkIn.longitude && isCoordinatesOnly) {
          try {
            const fullAddress = await reverseGeocode(Number(checkIn.latitude), Number(checkIn.longitude));
            
            // Extract city, state, zip for cleaner display
            const parts = fullAddress.split(', ');
            if (parts.length >= 2) {
              // Take the last 2-3 parts for city, state format
              formattedLocation = parts.slice(-3).join(', ');
            } else {
              formattedLocation = fullAddress;
            }
          } catch (error) {
            console.warn('Reverse geocoding failed for', checkIn.latitude, checkIn.longitude, ':', error);
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
    console.error('Error fetching check-ins:', error);
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
      const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
      photoUrls = req.files.map(file => `${baseUrl}${file.filename}`);
    }
    
    // Prepare check-in data with photos
    const checkInData = {
      ...req.body,
      companyId: user.companyId,
      technicianId: req.body.technicianId || user.id,
      photos: photoUrls.length > 0 ? JSON.stringify(photoUrls) : null,
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
    };

    console.log('Creating check-in with data:', checkInData);

    // Create the check-in
    const checkIn = await storage.createCheckIn(checkInData);
    
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
      console.error('Error sending check-in notification:', error);
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

        // Generate blog post content using AI
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
          published: true
        });

        console.log('Blog post created successfully:', blogPost.id);

        // Send blog post notification
        try {
          await emailService.sendBlogPostNotification(blogPost, user.email);
        } catch (emailError) {
          console.warn('Email notification failed:', emailError);
        }

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
        const customerEmail = req.body.customerEmail;
        if (customerEmail) {
          // Get company info for the email
          const company = await storage.getCompany(user.companyId!);
          const companyName = company ? company.name : "Our Service Company";
          
          // Create review link (in a real app, this would be a unique URL)
          const reviewLink = `https://checkin-platform.com/reviews/${reviewRequest.id}`;
          
          await emailService.sendReviewRequest(
            reviewRequest,
            technician,
            customerEmail,
            companyName,
            reviewLink
          );
        }
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
    
    // First delete any related blog posts to avoid foreign key constraint
    try {
      const blogPosts = await storage.getBlogPostsByCheckIn(id);
      for (const blogPost of blogPosts) {
        await storage.deleteBlogPost(blogPost.id);
      }
    } catch (error) {
      console.warn('Error deleting related blog posts:', error);
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
    console.error('Error converting coordinates:', error);
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
    console.error('Error formatting location:', error);
    res.status(500).json({ 
      message: 'Failed to format location',
      error: error.message 
    });
  }
});

export default router;