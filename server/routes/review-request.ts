import { Router, Request, Response } from 'express';
import { isAuthenticated, isCompanyAdmin } from '../middleware/auth';
import { storage } from '../storage';
import { z } from 'zod';
import { insertReviewRequestSchema } from '../../shared/schema';
import emailService from '../services/email-service';
import smsService from '../services/sms-service';

import { logger } from '../services/logger';
const router = Router();

// Validation schema for sending review requests
const sendReviewRequestSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  method: z.enum(["email", "sms"]),
  technicianId: z.number().int().positive(),
  jobType: z.string().optional(),
  customMessage: z.string().optional(),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone is required",
  path: ["email"]
});

// Get review request settings
router.get('/settings', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Default settings
    const defaultSettings = {
      autoSendReviews: true,
      delayHours: 24,
      contactPreference: 'email',
      emailTemplate: 'default',
      smsTemplate: 'default',
      includeTechnicianName: true,
      includeJobDetails: true,
    };

    // Return settings from company data or defaults
    const reviewSettings = company.reviewSettings 
      ? JSON.parse(company.reviewSettings) 
      : defaultSettings;

    res.json(reviewSettings);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Error fetching review settings' });
  }
});

// Update review request settings
router.post('/settings', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    // Validate settings
    const settingsSchema = z.object({
      autoSendReviews: z.boolean().default(true),
      delayHours: z.number().int().min(0).max(240).default(24),
      contactPreference: z.enum(['email', 'sms', 'both', 'customer-preference']).default('email'),
      emailTemplate: z.string().default('default'),
      smsTemplate: z.string().default('default'),
      includeTechnicianName: z.boolean().default(true),
      includeJobDetails: z.boolean().default(true),
    });

    const parsedSettings = settingsSchema.safeParse(req.body);
    if (!parsedSettings.success) {
      return res.status(400).json({ 
        message: 'Invalid review settings', 
        errors: parsedSettings.error.format() 
      });
    }

    const settings = parsedSettings.data;
    
    // Save settings
    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    await storage.updateCompany(companyId, {
      reviewSettings: JSON.stringify(settings)
    });
    
    res.json({ 
      message: 'Review settings saved successfully',
      settings
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Error saving review settings' });
  }
});

// Get all review requests for a company
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const reviewRequests = await storage.getReviewRequestsByCompany(companyId);
    
    // Enrich the review requests with technician names
    const enrichedRequests = await Promise.all(reviewRequests.map(async (request) => {
      const technician = await storage.getTechnician(request.technicianId);
      return {
        ...request,
        technicianName: technician ? technician.name : 'Unknown'
      };
    }));
    
    res.json(enrichedRequests);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Error fetching review requests' });
  }
});

// Send a new review request
router.post('/send', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    // Validate request
    const parsedRequest = sendReviewRequestSchema.safeParse(req.body);
    if (!parsedRequest.success) {
      return res.status(400).json({ 
        message: 'Invalid review request', 
        errors: parsedRequest.error.format() 
      });
    }

    const { customerName, email, phone, method, technicianId, jobType, customMessage } = parsedRequest.data;
    
    // Check if technician exists and belongs to the company
    const technician = await storage.getTechnician(technicianId);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    
    if (technician.companyId !== companyId) {
      return res.status(403).json({ message: 'Technician does not belong to your company' });
    }
    
    // Create review request in database
    const reviewRequest = await storage.createReviewRequest({
      customerName,
      email: email || null,
      phone: phone || null,
      method,
      technicianId,
      companyId,
      jobType: jobType || null,
      customMessage: customMessage || null,
      status: 'pending'
    });
    
    // Get the company for the email template
    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Send the email or SMS based on the method
    let sendResult = false;
    
    if (method === 'email' && email) {
      // Send email through email service
      sendResult = await emailService.sendReviewRequest({
        to: email,
        customerName,
        companyName: company.name,
        technicianName: technician.name,
        jobType: jobType || 'service',
        customMessage: customMessage || ''
      });
    } else if (method === 'sms' && phone) {
      // Initialize SMS service if not already initialized
      if (!smsService.isAvailable()) {
        smsService.initialize();
      }
      
      // Send SMS through SMS service
      sendResult = await smsService.sendReviewRequest({
        to: phone,
        customerName,
        companyName: company.name,
        technicianName: technician.name,
        jobType: jobType || 'service',
        customMessage: customMessage || ''
      });
    }
    
    // Update the review request status
    const updatedReviewRequest = await storage.updateReviewRequest(reviewRequest.id, {
      status: sendResult ? 'sent' : 'failed'
    });
    
    // Send notification to company admins about the new review request
    try {
      // Find company admin emails
      const companyAdmins = await storage.getUsersByCompanyAndRole(companyId, 'company_admin');
      const adminEmails = companyAdmins.map(admin => admin.email).filter(Boolean) as string[];
      
      // Add current user's email if not already included and if it exists
      if (req.user.email && !adminEmails.includes(req.user.email)) {
        adminEmails.push(req.user.email);
      }
      
      if (adminEmails.length > 0) {
        // Create a custom notification email for admins about the review request
        const emailSubject = "placeholder-text";
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Review Request Notification</h2>
            <p>A new review request has been sent in the placeholder system.</p>
            
            <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Customer:</strong> placeholder</p>
              <p><strong>Technician:</strong> placeholder</p>
              <p><strong>Job Type:</strong> placeholder</p>
              <p><strong>Contact Method:</strong> placeholder</p>
              <p><strong>Status:</strong> placeholder</p>
            </div>
            
            <p>
              <a href="https://checkin.app/review-requests/placeholder" 
                 style="background-color: #4a7aff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Review Request Details
              </a>
            </p>
          </div>
        `;
        
        // Send email to all admin recipients
        for (const recipient of adminEmails) {
          const msg = {
            to: recipient,
            from: "placeholder-text",
            subject: emailSubject,
            html: emailHtml,
          };
          
          try {
            await emailService.sendEmail(msg);
            logger.info("Review request notification email sent to ", {});
          } catch (emailError) {
            logger.error("Template literal processed");
            // Continue with other recipients even if one fails
          }
        }
      }
    } catch (notificationError) {
      logger.error("Unhandled error occurred");
      // Don't fail the whole request if notifications fail
    }
    
    res.json({ 
      message: sendResult ? 'Review request sent successfully' : 'Failed to send review request',
      success: sendResult,
      reviewRequest: {
        ...updatedReviewRequest || reviewRequest,
        status: sendResult ? 'sent' : 'failed'
      }
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Error sending review request' });
  }
});

// Resend a review request
router.post('/resend/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const reviewRequestId = parseInt(req.params.id, 10);
    if (isNaN(reviewRequestId)) {
      return res.status(400).json({ message: 'Invalid review request ID' });
    }
    
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    // Get the review request
    const reviewRequest = await storage.getReviewRequest(reviewRequestId);
    if (!reviewRequest) {
      return res.status(404).json({ message: 'Review request not found' });
    }
    
    // Verify that the request belongs to the company
    if (reviewRequest.companyId !== companyId) {
      return res.status(403).json({ message: 'Review request does not belong to your company' });
    }
    
    // Get technician information
    const technician = await storage.getTechnician(reviewRequest.technicianId);
    
    // Get company information
    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Resend the review request
    let sendResult = false;
    
    if (reviewRequest.method === 'email' && reviewRequest.email) {
      // Send email through email service
      sendResult = await emailService.sendReviewRequest({
        to: reviewRequest.email,
        customerName: reviewRequest.customerName,
        companyName: company.name,
        technicianName: technician ? technician.name : 'our technician',
        jobType: reviewRequest.jobType || 'service',
        customMessage: reviewRequest.customMessage || ''
      });
    } else if (reviewRequest.method === 'sms' && reviewRequest.phone) {
      // Initialize SMS service if not already initialized
      if (!smsService.isAvailable()) {
        smsService.initialize();
      }
      
      // Send SMS through SMS service
      sendResult = await smsService.sendReviewRequest({
        to: reviewRequest.phone,
        customerName: reviewRequest.customerName,
        companyName: company.name,
        technicianName: technician ? technician.name : 'our technician',
        jobType: reviewRequest.jobType || 'service',
        customMessage: reviewRequest.customMessage || ''
      });
    }
    
    // Update the review request status and sent time
    await storage.updateReviewRequest(reviewRequestId, {
      status: sendResult ? 'sent' : 'failed',
      sentAt: new Date()
    });
    
    res.json({ 
      message: sendResult ? 'Review request resent successfully' : 'Failed to resend review request',
      success: sendResult
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Error resending review request' });
  }
});

// Get stats for review requests
router.get('/stats', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }
    
    // Get all review requests for the company
    const reviewRequests = await storage.getReviewRequestsByCompany(companyId);
    
    // Calculate stats
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    
    const sentThisWeek = reviewRequests.filter(req => {
      if (!req.sentAt) return false;
      const sentDate = new Date(req.sentAt);
      return sentDate >= oneWeekAgo && sentDate <= today;
    }).length;
    
    const totalSent = reviewRequests.length;
    const successfulSent = reviewRequests.filter(req => req.status === 'sent').length;
    const failedSent = totalSent - successfulSent;
    
    // Use production-ready statistics calculation
    const { calculateRealReviewStats } = await import("../utils/production-fixes");
    const stats = await calculateRealReviewStats(companyId);
    const { responseRate, averageRating, positiveReviews } = stats;
    
    res.json({
      sentThisWeek,
      totalSent,
      successfulSent,
      failedSent,
      responseRate,
      averageRating,
      positiveReviews,
      lastSent: reviewRequests.length > 0 ? reviewRequests[0].sentAt : null
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Error fetching review request stats' });
  }
});

export default router;