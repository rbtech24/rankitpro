import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fromZodError } from 'zod-validation-error';
import { storage } from '../../storage';
import { isAuthenticated } from '../../middleware/auth';

const router = Router();

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: photoStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Check-in schema
const createCheckInSchema = z.object({
  jobType: z.string().min(1, "Job type is required"),
  customerName: z.string().optional().nullable(),
  customerEmail: z.string().email().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  workPerformed: z.string().optional().nullable(),
  materialsUsed: z.string().optional().nullable(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),
  photoIds: z.array(z.string()).optional()
});

// Create check-in endpoint
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const checkInData = createCheckInSchema.parse(req.body);
    const user = req.user;
    
    // Get technician info
    const technician = await storage.getTechnician(user.id);
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Construct the full address if components are provided
    let fullAddress = checkInData.address || '';
    if (checkInData.city) {
      fullAddress += fullAddress ? `, ${checkInData.city}` : checkInData.city;
    }
    if (checkInData.state) {
      fullAddress += fullAddress ? `, ${checkInData.state}` : checkInData.state;
    }
    if (checkInData.zipCode) {
      fullAddress += fullAddress ? ` ${checkInData.zipCode}` : checkInData.zipCode;
    }
    
    // Create check-in
    const checkIn = await storage.createCheckIn({
      companyId: user.companyId,
      technicianId: technician.id,
      jobType: checkInData.jobType,
      customerName: checkInData.customerName || null,
      customerEmail: checkInData.customerEmail || null,
      customerPhone: checkInData.customerPhone || null,
      address: fullAddress || null,
      city: checkInData.city || null,
      state: checkInData.state || null,
      zipCode: checkInData.zipCode || null,
      notes: checkInData.notes || null,
      workPerformed: checkInData.workPerformed || null,
      materialsUsed: checkInData.materialsUsed || null,
      latitude: checkInData.latitude || null,
      longitude: checkInData.longitude || null,
      photos: checkInData.photoIds ? JSON.stringify(checkInData.photoIds.map(id => ({ url: `/uploads/${id}` }))) : null,
      isBlog: false
    });
    
    res.status(201).json({
      id: checkIn.id,
      jobType: checkIn.jobType,
      customerName: checkIn.customerName,
      createdAt: checkIn.createdAt,
      status: 'completed'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    console.error('Create check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get check-in history endpoint
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const startIndex = (page - 1) * limit;
    
    const user = req.user;
    
    // Get technician
    const technician = await storage.getTechnician(user.id);
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get check-ins for this technician
    const checkIns = await storage.getCheckInsByTechnician(technician.id);
    
    // Apply date filtering if provided
    let filteredCheckIns = [...checkIns];
    if (req.query.startDate) {
      const startDate = new Date(req.query.startDate as string);
      filteredCheckIns = filteredCheckIns.filter(checkIn => 
        checkIn.createdAt >= startDate
      );
    }
    
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate as string);
      filteredCheckIns = filteredCheckIns.filter(checkIn => 
        checkIn.createdAt <= endDate
      );
    }
    
    // Sort by most recent first
    filteredCheckIns.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Paginate results
    const paginatedCheckIns = filteredCheckIns.slice(startIndex, startIndex + limit);
    
    // Transform for API response
    const items = paginatedCheckIns.map(checkIn => {
      // Get thumbnail from photos if available
      let thumbnail = null;
      if (checkIn.photos) {
        try {
          const photos = JSON.parse(checkIn.photos);
          if (photos && photos.length > 0 && photos[0].url) {
            thumbnail = photos[0].url;
          }
        } catch (e) {
          console.error('Error parsing photos JSON:', e);
        }
      }
      
      return {
        id: checkIn.id,
        jobType: checkIn.jobType,
        customerName: checkIn.customerName,
        address: checkIn.address,
        createdAt: checkIn.createdAt,
        status: 'completed',
        thumbnail
      };
    });
    
    res.json({
      items,
      total: filteredCheckIns.length,
      page,
      limit
    });
  } catch (error) {
    console.error('Get check-in history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get check-in details endpoint
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const checkInId = parseInt(req.params.id);
    if (isNaN(checkInId)) {
      return res.status(400).json({ message: "Invalid check-in ID" });
    }
    
    const checkIn = await storage.getCheckIn(checkInId);
    if (!checkIn) {
      return res.status(404).json({ message: "Check-in not found" });
    }
    
    // Get technician
    const technician = await storage.getTechnician(req.user.id);
    if (!technician || technician.id !== checkIn.technicianId) {
      return res.status(403).json({ message: "You don't have access to this check-in" });
    }
    
    // Parse photos
    let photos = [];
    if (checkIn.photos) {
      try {
        const parsedPhotos = JSON.parse(checkIn.photos);
        photos = parsedPhotos.map((photo: { url: string }) => ({
          id: path.basename(photo.url),
          url: photo.url,
          thumbnailUrl: photo.url,
          type: 'other'
        }));
      } catch (e) {
        console.error('Error parsing photos JSON:', e);
      }
    }
    
    res.json({
      id: checkIn.id,
      jobType: checkIn.jobType,
      customerName: checkIn.customerName,
      customerEmail: checkIn.customerEmail,
      customerPhone: checkIn.customerPhone,
      address: checkIn.address,
      city: checkIn.city,
      state: checkIn.state,
      zipCode: checkIn.zipCode,
      notes: checkIn.notes,
      workPerformed: checkIn.workPerformed,
      materialsUsed: checkIn.materialsUsed,
      latitude: checkIn.latitude,
      longitude: checkIn.longitude,
      createdAt: checkIn.createdAt,
      status: 'completed',
      photos
    });
  } catch (error) {
    console.error('Get check-in details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Photo upload endpoint
router.post('/photos', isAuthenticated, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const photoType = req.body.type || 'other';
    if (!['before', 'after', 'other'].includes(photoType)) {
      return res.status(400).json({ message: "Invalid photo type" });
    }
    
    // In a production app, we would save photo metadata to database
    // and possibly resize/optimize the image
    
    res.json({
      id: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      thumbnailUrl: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Offline sync endpoint
router.post('/sync', isAuthenticated, async (req, res) => {
  try {
    const { checkIns } = req.body;
    
    if (!Array.isArray(checkIns)) {
      return res.status(400).json({ message: "Invalid data format" });
    }
    
    const user = req.user;
    
    // Get technician
    const technician = await storage.getTechnician(user.id);
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    const syncResults = [];
    
    // Process each check-in
    for (const checkIn of checkIns) {
      try {
        // Validate data
        const validatedData = createCheckInSchema.parse(checkIn);
        
        // Process photos if they exist
        let photoUrls = null;
        if (checkIn.photos && Array.isArray(checkIn.photos)) {
          // In a real app, we would save the base64 photos to disk
          // For now, we'll just simulate this
          const urls = checkIn.photos.map((photo, index) => {
            const filename = `photo-${Date.now()}-${index}.jpg`;
            return { url: `/uploads/${filename}` };
          });
          photoUrls = JSON.stringify(urls);
        }
        
        // Create the check-in
        const newCheckIn = await storage.createCheckIn({
          companyId: user.companyId,
          technicianId: technician.id,
          jobType: validatedData.jobType,
          customerName: validatedData.customerName || null,
          customerEmail: validatedData.customerEmail || null,
          customerPhone: validatedData.customerPhone || null,
          address: validatedData.address || null,
          notes: validatedData.notes || null,
          workPerformed: validatedData.workPerformed || null,
          materialsUsed: validatedData.materialsUsed || null,
          latitude: validatedData.latitude || null,
          longitude: validatedData.longitude || null,
          photos: photoUrls,
          isBlog: false
        });
        
        syncResults.push({
          localId: checkIn.localId,
          serverId: newCheckIn.id,
          status: 'synced'
        });
      } catch (error) {
        console.error(`Error syncing check-in ${checkIn.localId}:`, error);
        syncResults.push({
          localId: checkIn.localId,
          serverId: null,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    res.json({ syncedItems: syncResults });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;