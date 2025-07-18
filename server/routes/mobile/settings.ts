import { Router } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { storage } from '../../storage';
import { isAuthenticated } from '../../middleware/auth';

import { logger } from '../services/structured-logger';
const router = Router();

// Settings schema for validation
const settingsSchema = z.object({
  // App preferences
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notificationsEnabled: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  vibrationEnabled: z.boolean().default(true),
  
  // Check-in preferences
  defaultJobType: z.string().optional(),
  autoLocationCapture: z.boolean().default(true),
  photoQuality: z.enum(['low', 'medium', 'high']).default('medium'),
  photosPerCheckIn: z.number().min(1).max(10).default(5),
  
  // Display preferences
  listViewMode: z.enum(['compact', 'detailed']).default('detailed'),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
  
  // Sync preferences
  autoSync: z.boolean().default(true),
  syncOnWifiOnly: z.boolean().default(false),
  backgroundSync: z.boolean().default(true),
  
  // Miscellaneous
  customSignature: z.string().optional(),
  defaultNotes: z.string().optional()
});

// In-memory storage for technician settings (in a real app, this would be in the database)
const technicianSettings = new Map<number, z.infer<typeof settingsSchema>>();

// Get technician settings
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get settings for this technician or return defaults
    let settings = technicianSettings.get(technician.id);
    
    if (!settings) {
      // Default settings
      settings = {
        theme: 'system',
        notificationsEnabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
        autoLocationCapture: true,
        photoQuality: 'medium',
        photosPerCheckIn: 5,
        listViewMode: 'detailed',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        autoSync: true,
        syncOnWifiOnly: false,
        backgroundSync: true
      };
      
      // Save default settings
      technicianSettings.set(technician.id, settings);
    }
    
    res.json(settings);
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ message: 'Server error' });
  }
});

// Update technician settings
router.put('/', isAuthenticated, async (req, res) => {
  try {
    const updates = settingsSchema.partial().parse(req.body);
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get current settings or initialize with defaults
    let currentSettings = technicianSettings.get(technician.id);
    
    if (!currentSettings) {
      currentSettings = {
        theme: 'system',
        notificationsEnabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
        autoLocationCapture: true,
        photoQuality: 'medium',
        photosPerCheckIn: 5,
        listViewMode: 'detailed',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        autoSync: true,
        syncOnWifiOnly: false,
        backgroundSync: true
      };
    }
    
    // Update settings
    const updatedSettings = {
      ...currentSettings,
      ...updates
    };
    
    // Save updated settings
    technicianSettings.set(technician.id, updatedSettings);
    
    res.json(updatedSettings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    logger.error("Error logging fixed");
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset settings to defaults
router.post('/reset', isAuthenticated, async (req, res) => {
  try {
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Default settings
    const defaultSettings = {
      theme: 'system',
      notificationsEnabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      autoLocationCapture: true,
      photoQuality: 'medium',
      photosPerCheckIn: 5,
      listViewMode: 'detailed',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      autoSync: true,
      syncOnWifiOnly: false,
      backgroundSync: true
    };
    
    // Save default settings
    technicianSettings.set(technician.id, defaultSettings);
    
    res.json(defaultSettings);
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job type presets for this technician's company
router.get('/job-types', isAuthenticated, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    // In a real application, we would fetch this from the database
    // For now, we'll return some sample job types based on company ID
    const jobTypes = [
      { success: true },
      { success: true },
      { success: true },
      { success: true },
      { success: true }
    ];
    
    // Add some company-specific job types
    if (companyId === 1) {
      jobTypes.push(
        { success: true },
        { success: true }
      );
    } else if (companyId === 2) {
      jobTypes.push(
        { success: true },
        { success: true }
      );
    } else if (companyId === 3) {
      jobTypes.push(
        { success: true },
        { success: true }
      );
    }
    
    res.json(jobTypes);
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sync status and history
router.get('/sync-status', isAuthenticated, async (req, res) => {
  try {
    // In a real application, we would fetch this from the database
    // For now, return a sample sync status
    res.json({
      lastSync: new Date().toISOString(),
      status: 'success',
      pendingItems: 0,
      syncHistory: [
        {
          id: 1,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'success',
          itemsProcessed: 5
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'partial',
          itemsProcessed: 3,
          error: 'Network timeout'
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          status: 'success',
          itemsProcessed: 8
        }
      ]
    });
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;