import { Router } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { storage } from '../../storage';
import { isAuthenticated } from '../../middleware/auth';

import { logger } from '../services/logger';
const router = Router();

// Schedule item schema for validation
const scheduleItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string(), // ISO date string
  endTime: z.string().optional(), // ISO date string
  location: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  jobType: z.string().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  notes: z.string().optional(),
});

// In-memory storage for technician schedules (in a real app, this would be in the database)
// This is just for demonstration purposes
const scheduleItems = new Map<number, Array<{
  id: number;
  technicianId: number;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  jobType?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  notes?: string;
  createdAt: Date;
}>>();

let nextScheduleItemId = 1;

// Get today's schedule
router.get('/today', isAuthenticated, async (req, res) => {
  try {
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get schedule for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get items for this technician from our demo storage
    const technicianSchedule = scheduleItems.get(technician.id) || [];
    
    // Filter for today's items
    const todaysSchedule = technicianSchedule.filter(item => {
      const itemDate = new Date(item.startTime);
      return itemDate >= today && itemDate < tomorrow;
    });
    
    // Sort by start time
    todaysSchedule.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    res.json({
      date: today.toISOString().split('T')[0],
      items: todaysSchedule
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Get schedule for a date range
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Parse query parameters
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date(startDate);
    
    // Default to 7 days if no end date
    if (!req.query.endDate) {
      endDate.setDate(endDate.getDate() + 7);
    }
    endDate.setHours(23, 59, 59, 999);
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get items for this technician from our demo storage
    const technicianSchedule = scheduleItems.get(technician.id) || [];
    
    // Filter for the date range
    const rangeSchedule = technicianSchedule.filter(item => {
      const itemDate = new Date(item.startTime);
      return itemDate >= startDate && itemDate <= endDate;
    });
    
    // Sort by start time
    rangeSchedule.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    // Group by date
    const groupedSchedule: Record<string, any[]> = {};
    
    rangeSchedule.forEach(item => {
      const date = new Date(item.startTime).toISOString().split('T')[0];
      if (!groupedSchedule[date]) {
        groupedSchedule[date] = [];
      }
      groupedSchedule[date].push(item);
    });
    
    res.json({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      schedule: groupedSchedule
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific schedule item
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: "Invalid schedule item ID" });
    }
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get items for this technician
    const technicianSchedule = scheduleItems.get(technician.id) || [];
    
    // Find the specific item
    const item = technicianSchedule.find(item => item.id === itemId);
    
    if (!item) {
      return res.status(404).json({ message: "Schedule item not found" });
    }
    
    res.json(item);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new schedule item
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const data = scheduleItemSchema.parse(req.body);
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Create the new schedule item
    const newItem = {
      id: nextScheduleItemId++,
      technicianId: technician.id,
      ...data,
      createdAt: new Date()
    };
    
    // Get or initialize the technician's schedule
    if (!scheduleItems.has(technician.id)) {
      scheduleItems.set(technician.id, []);
    }
    
    // Add the new item
    scheduleItems.get(technician.id)?.push(newItem);
    
    res.status(201).json(newItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a schedule item
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: "Invalid schedule item ID" });
    }
    
    const updates = scheduleItemSchema.partial().parse(req.body);
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get items for this technician
    const technicianSchedule = scheduleItems.get(technician.id) || [];
    
    // Find the item index
    const itemIndex = technicianSchedule.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Schedule item not found" });
    }
    
    // Update the item
    const updatedItem = {
      ...technicianSchedule[itemIndex],
      ...updates
    };
    
    technicianSchedule[itemIndex] = updatedItem;
    
    res.json(updatedItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Update schedule item status (special endpoint for quick status updates)
router.patch('/:id/status', isAuthenticated, async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: "Invalid schedule item ID" });
    }
    
    const { status } = req.body;
    
    if (!status || !['scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: true });
    }
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get items for this technician
    const technicianSchedule = scheduleItems.get(technician.id) || [];
    
    // Find the item index
    const itemIndex = technicianSchedule.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Schedule item not found" });
    }
    
    // Update status
    technicianSchedule[itemIndex].status = status as "scheduled" | "in_progress" | "completed" | "cancelled";
    
    // If status is completed and there's no end time, set it to now
    if (status === 'completed' && !technicianSchedule[itemIndex].endTime) {
      technicianSchedule[itemIndex].endTime = new Date().toISOString();
    }
    
    res.json(technicianSchedule[itemIndex]);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a schedule item
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: "Invalid schedule item ID" });
    }
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get items for this technician
    const technicianSchedule = scheduleItems.get(technician.id) || [];
    
    // Find the item index
    const itemIndex = technicianSchedule.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Schedule item not found" });
    }
    
    // Remove the item
    technicianSchedule.splice(itemIndex, 1);
    
    res.status(204).send();
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;