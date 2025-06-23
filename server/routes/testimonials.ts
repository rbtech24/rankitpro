import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "../storage";

const router = Router();

// Authentication middleware using session
const isAuthenticated = async (req: any, res: any, next: any) => {
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const { storage } = await import('../storage');
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = 'uploads/testimonials';
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
    const allowedTypes = /\.(webm|mp4|wav|mp3|ogg)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video and audio files are allowed.'));
    }
  }
});

// Create a new testimonial
router.post('/', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    // Ensure user object exists and has companyId
    if (!req.user || !req.user.companyId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { companyId } = req.user;
    
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Audio or video file is required' });
    }

    const {
      type,
      customerName,
      customerEmail,
      customerPhone,
      jobType,
      location,
      duration,
      checkInId
    } = req.body;

    if (!type || !customerName) {
      return res.status(400).json({ message: 'Type and customer name are required' });
    }

    // Create testimonial record
    const testimonial = await storage.createTestimonial({
      companyId,
      technicianId: req.user.id,
      type: type as 'audio' | 'video',
      customerName,
      customerEmail: customerEmail || null,
      customerPhone: customerPhone || null,
      jobType: jobType || null,
      location: location || null,
      title: `${type} Testimonial from ${customerName}`,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      storageUrl: req.file.path,
      duration: duration ? parseInt(duration) : null,
      checkInId: checkInId ? parseInt(checkInId) : null,
      status: 'pending',
      isPublic: false,
      showOnWebsite: false
    });

    res.json(testimonial);
  } catch (error: any) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ 
      message: 'Error creating testimonial',
      error: error?.message || 'Unknown error occurred'
    });
  }
});

// Get testimonials for a company
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { companyId } = req.user;
    
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const testimonials = await storage.getTestimonialsByCompany(companyId);
    res.json(testimonials);
  } catch (error: any) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ 
      message: 'Error fetching testimonials',
      error: error?.message || 'Unknown error occurred'
    });
  }
});

// Update testimonial status
router.patch('/:id/status', isAuthenticated, async (req, res) => {
  try {
    const { companyId } = req.user;
    const { id } = req.params;
    const { status, isPublic, showOnWebsite } = req.body;
    
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const testimonial = await storage.getTestimonial(parseInt(id));
    
    if (!testimonial || testimonial.companyId !== companyId) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    const updatedTestimonial = await storage.updateTestimonial(parseInt(id), {
      status,
      isPublic,
      showOnWebsite
    });

    res.json(updatedTestimonial);
  } catch (error: any) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ 
      message: 'Error updating testimonial',
      error: error?.message || 'Unknown error occurred'
    });
  }
});

// Serve testimonial files
router.get('/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'testimonials', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.sendFile(filePath);
  } catch (error: any) {
    console.error('Error serving testimonial file:', error);
    res.status(500).json({ 
      message: 'Error serving file',
      error: error?.message || 'Unknown error occurred'
    });
  }
});

// Delete testimonial
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { companyId } = req.user;
    const { id } = req.params;
    
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const testimonial = await storage.getTestimonial(parseInt(id));
    
    if (!testimonial || testimonial.companyId !== companyId) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Delete file from filesystem
    if (testimonial.storageUrl && fs.existsSync(testimonial.storageUrl)) {
      fs.unlinkSync(testimonial.storageUrl);
    }

    await storage.deleteTestimonial(parseInt(id));
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ 
      message: 'Error deleting testimonial',
      error: error?.message || 'Unknown error occurred'
    });
  }
});

export default router;