import { Router } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { storage } from '../../storage';
import { isAuthenticated } from '../../middleware/auth';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

const router = Router();

// Setup multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'checkins');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'checkin-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!') as any);
    }
  }
});

// Location schema for validation
const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  addressText: z.string().optional()
});

// Check-in schema for validation
const checkInSchema = z.object({
  jobType: z.string().min(1, "Job type is required"),
  notes: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  workPerformed: z.string().optional(),
  materialsUsed: z.string().optional(),
  location: locationSchema.optional(),
  offlineId: z.string().optional(), // For offline sync
  completedAt: z.string().optional(), // ISO date string
  isBillable: z.boolean().optional(),
  followUpRequired: z.boolean().optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().positive().optional(),
  signature: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// Get all check-ins for the technician
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get query parameters for filtering and pagination
    const { status, startDate, endDate, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    
    // Get check-ins for this technician
    let checkIns = await storage.getCheckInsByTechnician(technician.id);
    
    // Apply date filters if provided
    if (startDate) {
      const startDateObj = new Date(startDate as string);
      checkIns = checkIns.filter(checkIn => 
        checkIn.createdAt && new Date(checkIn.createdAt) >= startDateObj
      );
    }
    
    if (endDate) {
      const endDateObj = new Date(endDate as string);
      endDateObj.setHours(23, 59, 59, 999); // End of day
      checkIns = checkIns.filter(checkIn => 
        checkIn.createdAt && new Date(checkIn.createdAt) <= endDateObj
      );
    }
    
    // Apply status filter if provided
    if (status) {
      // Convert to string to handle both null and undefined
      const statusStr = status as string;
      if (statusStr === 'completed') {
        checkIns = checkIns.filter(checkIn => checkIn.completedAt !== null);
      } else if (statusStr === 'pending') {
        checkIns = checkIns.filter(checkIn => checkIn.completedAt === null);
      }
    }
    
    // Sort by created date (newest first)
    checkIns.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Calculate pagination
    const totalItems = checkIns.length;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedCheckIns = checkIns.slice(startIndex, endIndex);
    
    // Prepare response with pagination metadata
    res.json({
      total: totalItems,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalItems / limitNum),
      items: paginatedCheckIns.map(checkIn => {
        // Add photo URLs for each check-in
        const photos = checkIn.photos ? JSON.parse(checkIn.photos as string) : [];
        return {
          ...checkIn,
          photos: Array.isArray(photos) ? photos.map((photo: any) => {
            if (typeof photo === 'string') {
              return { url: `/uploads/checkins/${photo}` };
            }
            return photo;
          }) : []
        };
      })
    });
  } catch (error) {
    console.error('Get check-ins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific check-in
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const checkInId = parseInt(req.params.id);
    if (isNaN(checkInId)) {
      return res.status(400).json({ message: "Invalid check-in ID" });
    }
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get the check-in
    const checkIn = await storage.getCheckIn(checkInId);
    
    // Verify the check-in exists and belongs to this technician
    if (!checkIn || checkIn.technicianId !== technician.id) {
      return res.status(404).json({ message: "Check-in not found" });
    }
    
    // Parse photos from JSON
    const photos = checkIn.photos ? JSON.parse(checkIn.photos as string) : [];
    
    // Add full URLs to photos
    const photosWithUrls = Array.isArray(photos) ? photos.map((photo: any) => {
      if (typeof photo === 'string') {
        return { url: `/uploads/checkins/${photo}` };
      }
      return photo;
    }) : [];
    
    // Return the check-in with photos
    res.json({
      ...checkIn,
      photos: photosWithUrls
    });
  } catch (error) {
    console.error('Get check-in details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new check-in
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const data = checkInSchema.parse(req.body);
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Create the check-in
    const checkIn = await storage.createCheckIn({
      companyId: req.user.companyId,
      technicianId: technician.id,
      jobType: data.jobType,
      notes: data.notes || null,
      customerName: data.customerName || null,
      customerEmail: data.customerEmail || null,
      customerPhone: data.customerPhone || null,
      workPerformed: data.workPerformed || null,
      materialsUsed: data.materialsUsed || null,
      address: data.location?.addressText || null,
      latitude: data.location?.latitude?.toString() || null,
      longitude: data.location?.longitude?.toString() || null,
      isBillable: data.isBillable || false,
      followUpRequired: data.followUpRequired || false,
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      offlineId: data.offlineId || null,
      // We'll add photos separately
      photos: JSON.stringify([])
    });
    
    res.status(201).json({
      ...checkIn,
      photos: [],
      message: "Check-in created successfully. Use the upload endpoint to add photos."
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

// Upload photos for a check-in
router.post('/:id/photos', isAuthenticated, upload.array('photos', 10), async (req, res) => {
  try {
    const checkInId = parseInt(req.params.id);
    if (isNaN(checkInId)) {
      return res.status(400).json({ message: "Invalid check-in ID" });
    }
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get the check-in
    const checkIn = await storage.getCheckIn(checkInId);
    
    // Verify the check-in exists and belongs to this technician
    if (!checkIn || checkIn.technicianId !== technician.id) {
      return res.status(404).json({ message: "Check-in not found or unauthorized" });
    }
    
    // Get uploaded files
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    
    // Get existing photos
    const existingPhotos = checkIn.photos ? JSON.parse(checkIn.photos as string) : [];
    
    // Add new photos
    const newPhotos = files.map(file => path.basename(file.path));
    const updatedPhotos = [...existingPhotos, ...newPhotos];
    
    // Update the check-in with new photos
    const updatedCheckIn = await storage.updateCheckIn(checkInId, {
      photos: JSON.stringify(updatedPhotos)
    });
    
    // Return success with photo URLs
    res.status(200).json({
      message: "Photos uploaded successfully",
      checkIn: updatedCheckIn,
      photos: updatedPhotos.map(photo => ({
        url: `/uploads/checkins/${photo}`
      }))
    });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a check-in
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const checkInId = parseInt(req.params.id);
    if (isNaN(checkInId)) {
      return res.status(400).json({ message: "Invalid check-in ID" });
    }
    
    const updates = checkInSchema.partial().parse(req.body);
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get the check-in
    const checkIn = await storage.getCheckIn(checkInId);
    
    // Verify the check-in exists and belongs to this technician
    if (!checkIn || checkIn.technicianId !== technician.id) {
      return res.status(404).json({ message: "Check-in not found or unauthorized" });
    }
    
    // Prepare updates for storage
    const updateData: any = {};
    
    if (updates.jobType) updateData.jobType = updates.jobType;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.customerName !== undefined) updateData.customerName = updates.customerName;
    if (updates.customerEmail !== undefined) updateData.customerEmail = updates.customerEmail;
    if (updates.customerPhone !== undefined) updateData.customerPhone = updates.customerPhone;
    if (updates.workPerformed !== undefined) updateData.workPerformed = updates.workPerformed;
    if (updates.materialsUsed !== undefined) updateData.materialsUsed = updates.materialsUsed;
    
    if (updates.location) {
      if (updates.location.addressText !== undefined) updateData.address = updates.location.addressText;
      if (updates.location.latitude !== undefined) updateData.latitude = updates.location.latitude.toString();
      if (updates.location.longitude !== undefined) updateData.longitude = updates.location.longitude.toString();
    }
    
    if (updates.isBillable !== undefined) updateData.isBillable = updates.isBillable;
    if (updates.followUpRequired !== undefined) updateData.followUpRequired = updates.followUpRequired;
    if (updates.completedAt !== undefined) updateData.completedAt = updates.completedAt ? new Date(updates.completedAt) : null;
    
    if (updates.tags !== undefined) updateData.tags = JSON.stringify(updates.tags);
    
    // Update the check-in
    const updatedCheckIn = await storage.updateCheckIn(checkInId, updateData);
    
    // Parse photos for response
    const photos = updatedCheckIn.photos ? JSON.parse(updatedCheckIn.photos as string) : [];
    
    // Return the updated check-in
    res.json({
      ...updatedCheckIn,
      photos: Array.isArray(photos) ? photos.map((photo: any) => {
        if (typeof photo === 'string') {
          return { url: `/uploads/checkins/${photo}` };
        }
        return photo;
      }) : []
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    console.error('Update check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a photo from a check-in
router.delete('/:id/photos/:photoName', isAuthenticated, async (req, res) => {
  try {
    const checkInId = parseInt(req.params.id);
    if (isNaN(checkInId)) {
      return res.status(400).json({ message: "Invalid check-in ID" });
    }
    
    const photoName = req.params.photoName;
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get the check-in
    const checkIn = await storage.getCheckIn(checkInId);
    
    // Verify the check-in exists and belongs to this technician
    if (!checkIn || checkIn.technicianId !== technician.id) {
      return res.status(404).json({ message: "Check-in not found or unauthorized" });
    }
    
    // Get existing photos
    const existingPhotos = checkIn.photos ? JSON.parse(checkIn.photos as string) : [];
    
    // Check if photo exists
    if (!existingPhotos.includes(photoName)) {
      return res.status(404).json({ message: "Photo not found" });
    }
    
    // Remove the photo from the array
    const updatedPhotos = existingPhotos.filter((p: string) => p !== photoName);
    
    // Update the check-in with new photo list
    await storage.updateCheckIn(checkInId, {
      photos: JSON.stringify(updatedPhotos)
    });
    
    // Try to delete the file from the filesystem
    try {
      const photoPath = path.join(uploadDir, photoName);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    } catch (err) {
      console.warn('Could not delete photo file:', err);
      // Continue even if file deletion fails
    }
    
    // Return success
    res.status(200).json({
      message: "Photo deleted successfully",
      remainingPhotos: updatedPhotos.map((photo: string) => ({
        url: `/uploads/checkins/${photo}`
      }))
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a check-in as completed
router.patch('/:id/complete', isAuthenticated, async (req, res) => {
  try {
    const checkInId = parseInt(req.params.id);
    if (isNaN(checkInId)) {
      return res.status(400).json({ message: "Invalid check-in ID" });
    }
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get the check-in
    const checkIn = await storage.getCheckIn(checkInId);
    
    // Verify the check-in exists and belongs to this technician
    if (!checkIn || checkIn.technicianId !== technician.id) {
      return res.status(404).json({ message: "Check-in not found or unauthorized" });
    }
    
    // Update the check-in as completed
    const updatedCheckIn = await storage.updateCheckIn(checkInId, {
      completedAt: new Date()
    });
    
    // Parse photos for response
    const photos = updatedCheckIn.photos ? JSON.parse(updatedCheckIn.photos as string) : [];
    
    // Return the updated check-in
    res.json({
      ...updatedCheckIn,
      photos: Array.isArray(photos) ? photos.map((photo: any) => {
        if (typeof photo === 'string') {
          return { url: `/uploads/checkins/${photo}` };
        }
        return photo;
      }) : []
    });
  } catch (error) {
    console.error('Complete check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a check-in
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const checkInId = parseInt(req.params.id);
    if (isNaN(checkInId)) {
      return res.status(400).json({ message: "Invalid check-in ID" });
    }
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get the check-in
    const checkIn = await storage.getCheckIn(checkInId);
    
    // Verify the check-in exists and belongs to this technician
    if (!checkIn || checkIn.technicianId !== technician.id) {
      return res.status(404).json({ message: "Check-in not found or unauthorized" });
    }
    
    // Delete associated photos from filesystem
    if (checkIn.photos) {
      try {
        const photos = JSON.parse(checkIn.photos as string);
        if (Array.isArray(photos)) {
          photos.forEach((photo: string) => {
            const photoPath = path.join(uploadDir, photo);
            if (fs.existsSync(photoPath)) {
              fs.unlinkSync(photoPath);
            }
          });
        }
      } catch (err) {
        console.warn('Could not delete photo files:', err);
        // Continue even if file deletion fails
      }
    }
    
    // Delete the check-in
    const deleted = await storage.deleteCheckIn(checkInId);
    
    if (!deleted) {
      return res.status(500).json({ message: "Failed to delete check-in" });
    }
    
    // Return success
    res.status(204).send();
  } catch (error) {
    console.error('Delete check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk sync check-ins from offline storage
router.post('/sync', isAuthenticated, async (req, res) => {
  try {
    // Validate request body
    if (!req.body.checkIns || !Array.isArray(req.body.checkIns)) {
      return res.status(400).json({ message: "Invalid request format. Expected 'checkIns' array." });
    }
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    const results = {
      success: [] as any[],
      errors: [] as any[]
    };
    
    // Process each check-in
    for (const checkInData of req.body.checkIns) {
      try {
        // Validate the check-in data
        const validatedData = checkInSchema.parse(checkInData);
        
        // Check if this is a new check-in or an update to an existing one
        if (checkInData.id) {
          // This is an update to an existing check-in
          const checkInId = parseInt(checkInData.id);
          const existingCheckIn = await storage.getCheckIn(checkInId);
          
          // Verify the check-in exists and belongs to this technician
          if (!existingCheckIn || existingCheckIn.technicianId !== technician.id) {
            results.errors.push({
              offlineId: checkInData.offlineId,
              message: "Check-in not found or unauthorized"
            });
            continue;
          }
          
          // Prepare updates
          const updateData: any = {};
          
          if (validatedData.jobType) updateData.jobType = validatedData.jobType;
          if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
          if (validatedData.customerName !== undefined) updateData.customerName = validatedData.customerName;
          if (validatedData.customerEmail !== undefined) updateData.customerEmail = validatedData.customerEmail;
          if (validatedData.customerPhone !== undefined) updateData.customerPhone = validatedData.customerPhone;
          if (validatedData.workPerformed !== undefined) updateData.workPerformed = validatedData.workPerformed;
          if (validatedData.materialsUsed !== undefined) updateData.materialsUsed = validatedData.materialsUsed;
          
          if (validatedData.location) {
            if (validatedData.location.addressText !== undefined) updateData.address = validatedData.location.addressText;
            if (validatedData.location.latitude !== undefined) updateData.latitude = validatedData.location.latitude.toString();
            if (validatedData.location.longitude !== undefined) updateData.longitude = validatedData.location.longitude.toString();
          }
          
          if (validatedData.isBillable !== undefined) updateData.isBillable = validatedData.isBillable;
          if (validatedData.followUpRequired !== undefined) updateData.followUpRequired = validatedData.followUpRequired;
          if (validatedData.completedAt !== undefined) updateData.completedAt = validatedData.completedAt ? new Date(validatedData.completedAt) : null;
          
          if (validatedData.tags !== undefined) updateData.tags = JSON.stringify(validatedData.tags);
          
          // Update the check-in
          const updatedCheckIn = await storage.updateCheckIn(checkInId, updateData);
          
          results.success.push({
            id: updatedCheckIn.id,
            offlineId: checkInData.offlineId,
            action: 'updated'
          });
        } else {
          // This is a new check-in
          const newCheckIn = await storage.createCheckIn({
            companyId: req.user.companyId,
            technicianId: technician.id,
            jobType: validatedData.jobType,
            notes: validatedData.notes || null,
            customerName: validatedData.customerName || null,
            customerEmail: validatedData.customerEmail || null,
            customerPhone: validatedData.customerPhone || null,
            workPerformed: validatedData.workPerformed || null,
            materialsUsed: validatedData.materialsUsed || null,
            address: validatedData.location?.addressText || null,
            latitude: validatedData.location?.latitude?.toString() || null,
            longitude: validatedData.location?.longitude?.toString() || null,
            isBillable: validatedData.isBillable || false,
            followUpRequired: validatedData.followUpRequired || false,
            completedAt: validatedData.completedAt ? new Date(validatedData.completedAt) : null,
            tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
            offlineId: validatedData.offlineId || null,
            photos: JSON.stringify([])
          });
          
          results.success.push({
            id: newCheckIn.id,
            offlineId: checkInData.offlineId,
            action: 'created'
          });
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          results.errors.push({
            offlineId: checkInData.offlineId,
            message: validationError.message
          });
        } else {
          results.errors.push({
            offlineId: checkInData.offlineId,
            message: "Server error processing this check-in"
          });
        }
      }
    }
    
    // Return results
    res.json({
      sync: {
        total: req.body.checkIns.length,
        success: results.success.length,
        errors: results.errors.length
      },
      results
    });
  } catch (error) {
    console.error('Sync check-ins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;