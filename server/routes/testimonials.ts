import type { Express } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { storage } from "../storage";
import { insertTestimonialSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = './uploads/testimonials';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `testimonial-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/webm', 'video/mp4', 'audio/webm', 'audio/mp3', 'audio/wav'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video and audio files are allowed.'));
    }
  }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export function registerTestimonialRoutes(app: Express) {
  
  // Create new testimonial with file upload
  app.post('/api/testimonials', isAuthenticated, upload.single('file'), async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const user = req.user;
      const companyId = user.companyId;
      
      if (!companyId) {
        return res.status(400).json({ message: 'User must be associated with a company' });
      }

      const {
        technicianId,
        checkInId,
        customerName,
        customerEmail,
        customerPhone,
        title,
        jobType,
        location,
        rating,
        type,
        duration
      } = req.body;

      // Generate approval token for customer
      const approvalToken = crypto.randomBytes(32).toString('hex');
      
      // Create testimonial record
      const testimonialData = {
        companyId,
        technicianId: parseInt(technicianId),
        checkInId: checkInId ? parseInt(checkInId) : null,
        customerName,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        type: type as 'audio' | 'video',
        title,
        duration: duration ? parseInt(duration) : null,
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        storageUrl: `/uploads/testimonials/${req.file.filename}`,
        jobType: jobType || null,
        location: location || null,
        rating: rating ? parseInt(rating) : null,
        status: 'pending' as const,
        approvalToken,
        isPublic: false,
        showOnWebsite: false,
        tags: jobType ? [jobType] : []
      };

      const testimonial = await storage.createTestimonial(testimonialData);
      
      // If customer email provided, create approval record and send email
      if (customerEmail) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days to approve
        
        await storage.createTestimonialApproval({
          testimonialId: testimonial.id,
          customerEmail,
          approvalToken,
          status: 'pending',
          expiresAt
        });
        
        // TODO: Send approval email to customer
        // This would integrate with the existing email service
      }

      res.status(201).json({
        message: 'Testimonial uploaded successfully',
        testimonial: {
          id: testimonial.id,
          title: testimonial.title,
          customerName: testimonial.customerName,
          type: testimonial.type,
          status: testimonial.status,
          createdAt: testimonial.createdAt
        }
      });

    } catch (error: any) {
      console.error('Error creating testimonial:', error);
      res.status(500).json({ message: 'Failed to create testimonial', error: error.message });
    }
  });

  // Get testimonials for a company
  app.get('/api/testimonials', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user;
      const companyId = user.companyId;
      
      if (!companyId) {
        return res.status(400).json({ message: 'User must be associated with a company' });
      }

      const { status, type, isPublic } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status;
      if (type) filters.type = type;
      if (isPublic !== undefined) filters.isPublic = isPublic === 'true';
      
      const testimonials = await storage.getTestimonialsByCompany(companyId, filters);
      
      res.json(testimonials);
    } catch (error: any) {
      console.error('Error fetching testimonials:', error);
      res.status(500).json({ message: 'Failed to fetch testimonials' });
    }
  });

  // Get single testimonial
  app.get('/api/testimonials/:id', isAuthenticated, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      const testimonial = await storage.getTestimonialById(parseInt(id));
      
      if (!testimonial) {
        return res.status(404).json({ message: 'Testimonial not found' });
      }
      
      // Check if user has access to this testimonial
      if (user.role !== 'super_admin' && testimonial.companyId !== user.companyId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(testimonial);
    } catch (error: any) {
      console.error('Error fetching testimonial:', error);
      res.status(500).json({ message: 'Failed to fetch testimonial' });
    }
  });

  // Update testimonial status (approve/reject)
  app.patch('/api/testimonials/:id/status', isAuthenticated, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.user;
      
      if (!['pending', 'approved', 'published', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const testimonial = await storage.getTestimonialById(parseInt(id));
      
      if (!testimonial) {
        return res.status(404).json({ message: 'Testimonial not found' });
      }
      
      // Check permissions
      if (user.role !== 'super_admin' && testimonial.companyId !== user.companyId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const approvedAt = status === 'approved' || status === 'published' ? new Date() : undefined;
      const updatedTestimonial = await storage.updateTestimonialStatus(parseInt(id), status, approvedAt);
      
      res.json(updatedTestimonial);
    } catch (error: any) {
      console.error('Error updating testimonial status:', error);
      res.status(500).json({ message: 'Failed to update testimonial status' });
    }
  });

  // Customer approval endpoint (public, no auth required)
  app.get('/api/testimonials/approve/:token', async (req: any, res: any) => {
    try {
      const { token } = req.params;
      
      const approval = await storage.getTestimonialApprovalByToken(token);
      
      if (!approval) {
        return res.status(404).json({ message: 'Invalid or expired approval link' });
      }
      
      if (new Date() > approval.expiresAt) {
        return res.status(400).json({ message: 'Approval link has expired' });
      }
      
      if (approval.status !== 'pending') {
        return res.status(400).json({ message: 'Testimonial has already been processed' });
      }
      
      const testimonial = await storage.getTestimonialById(approval.testimonialId);
      
      if (!testimonial) {
        return res.status(404).json({ message: 'Testimonial not found' });
      }
      
      res.json({
        testimonial: {
          id: testimonial.id,
          title: testimonial.title,
          customerName: testimonial.customerName,
          type: testimonial.type,
          createdAt: testimonial.createdAt,
          storageUrl: testimonial.storageUrl
        },
        approval: {
          id: approval.id,
          status: approval.status,
          expiresAt: approval.expiresAt
        }
      });
    } catch (error: any) {
      console.error('Error fetching approval:', error);
      res.status(500).json({ message: 'Failed to fetch approval details' });
    }
  });

  // Customer approve testimonial
  app.post('/api/testimonials/approve/:token', async (req: any, res: any) => {
    try {
      const { token } = req.params;
      const { approved } = req.body;
      
      const approval = await storage.getTestimonialApprovalByToken(token);
      
      if (!approval) {
        return res.status(404).json({ message: 'Invalid or expired approval link' });
      }
      
      if (new Date() > approval.expiresAt) {
        return res.status(400).json({ message: 'Approval link has expired' });
      }
      
      if (approval.status !== 'pending') {
        return res.status(400).json({ message: 'Testimonial has already been processed' });
      }
      
      // Update testimonial status based on customer approval
      const newStatus = approved ? 'approved' : 'rejected';
      const approvedAt = approved ? new Date() : undefined;
      
      await storage.updateTestimonialStatus(approval.testimonialId, newStatus, approvedAt);
      
      // Update approval record
      // Note: This would need to be implemented in storage
      
      res.json({
        message: approved ? 'Testimonial approved successfully' : 'Testimonial rejected',
        status: newStatus
      });
    } catch (error: any) {
      console.error('Error processing approval:', error);
      res.status(500).json({ message: 'Failed to process approval' });
    }
  });

  // Generate WordPress shortcode for testimonials
  app.get('/api/testimonials/shortcode', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = req.user;
      const companyId = user.companyId;
      const { location, service, type, limit = 5 } = req.query;
      
      if (!companyId) {
        return res.status(400).json({ message: 'User must be associated with a company' });
      }
      
      let shortcode = '[rank_it_pro_testimonials';
      if (location) shortcode += ` location="${location}"`;
      if (service) shortcode += ` service="${service}"`;
      if (type) shortcode += ` type="${type}"`;
      shortcode += ` limit="${limit}"`;
      shortcode += ` company_id="${companyId}"`;
      shortcode += ']';
      
      const jsEmbed = `
<div id="rank-it-pro-testimonials-${companyId}"></div>
<script>
(function() {
  const params = new URLSearchParams({
    company_id: '${companyId}',
    location: '${location || ''}',
    service: '${service || ''}',
    type: '${type || ''}',
    limit: '${limit}'
  });
  
  fetch('https://your-domain.com/api/embed/testimonials?' + params)
    .then(response => response.json())
    .then(data => {
      document.getElementById('rank-it-pro-testimonials-${companyId}').innerHTML = data.html;
    });
})();
</script>`;
      
      res.json({
        wordpress_shortcode: shortcode,
        javascript_embed: jsEmbed,
        instructions: {
          wordpress: "Copy and paste this shortcode into any WordPress post or page where you want to display testimonials.",
          javascript: "Copy and paste this JavaScript code into your website's HTML where you want to display testimonials."
        }
      });
    } catch (error: any) {
      console.error('Error generating shortcode:', error);
      res.status(500).json({ message: 'Failed to generate shortcode' });
    }
  });

  // Public embed endpoint for testimonials
  app.get('/api/embed/testimonials', async (req: any, res: any) => {
    try {
      const { company_id, location, service, type, limit = 5 } = req.query;
      
      if (!company_id) {
        return res.status(400).json({ message: 'Company ID is required' });
      }
      
      const filters: any = { status: 'published', isPublic: true };
      if (type) filters.type = type;
      
      const testimonials = await storage.getTestimonialsByCompany(parseInt(company_id as string), filters);
      
      // Filter by location or service if specified
      let filteredTestimonials = testimonials;
      if (location) {
        filteredTestimonials = filteredTestimonials.filter(t => 
          t.location?.toLowerCase().includes((location as string).toLowerCase())
        );
      }
      if (service) {
        filteredTestimonials = filteredTestimonials.filter(t => 
          t.jobType?.toLowerCase().includes((service as string).toLowerCase()) ||
          t.tags?.some(tag => tag.toLowerCase().includes((service as string).toLowerCase()))
        );
      }
      
      // Limit results
      filteredTestimonials = filteredTestimonials.slice(0, parseInt(limit as string));
      
      // Generate HTML for embedding
      const html = `
        <div class="rank-it-pro-testimonials" style="font-family: Arial, sans-serif;">
          ${filteredTestimonials.map(testimonial => `
            <div class="testimonial" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
              <div class="testimonial-header" style="margin-bottom: 10px;">
                <h4 style="margin: 0 0 5px 0; color: #333;">${testimonial.title}</h4>
                <div style="color: #666; font-size: 14px;">
                  <strong>${testimonial.customerName}</strong>
                  ${testimonial.location ? ` • ${testimonial.location}` : ''}
                  ${testimonial.rating ? ` • ${'⭐'.repeat(testimonial.rating)}` : ''}
                </div>
              </div>
              ${testimonial.type === 'video' ? `
                <video controls style="width: 100%; max-width: 400px; height: auto;">
                  <source src="${testimonial.storageUrl}" type="${testimonial.mimeType}">
                  Your browser does not support video playback.
                </video>
              ` : `
                <audio controls style="width: 100%;">
                  <source src="${testimonial.storageUrl}" type="${testimonial.mimeType}">
                  Your browser does not support audio playback.
                </audio>
              `}
              ${testimonial.content ? `
                <p style="margin-top: 10px; font-style: italic; color: #555;">"${testimonial.content}"</p>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
      
      res.json({
        html,
        count: filteredTestimonials.length,
        testimonials: filteredTestimonials.map(t => ({
          id: t.id,
          title: t.title,
          customerName: t.customerName,
          type: t.type,
          rating: t.rating,
          location: t.location,
          jobType: t.jobType
        }))
      });
    } catch (error: any) {
      console.error('Error generating embed:', error);
      res.status(500).json({ message: 'Failed to generate embed' });
    }
  });
}