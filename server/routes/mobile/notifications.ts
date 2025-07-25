import { Router } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { storage } from '../../storage';
import { isAuthenticated } from '../../middleware/auth';

import { logger } from '../services/logger';
const router = Router();

// Notification schema for validation
const notificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  data: z.record(z.any()).optional(),
  read: z.boolean().default(false)
});

// In-memory storage for notifications (in a real app, this would be in the database)
const notifications = new Map<number, Array<{
  id: number;
  technicianId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}>>();

let nextNotificationId = 1;

// Function to create real notifications from database activity
async function createRealNotifications(technicianId: number) {
  const techNotifications = [];
  
  try {
    // Get recent check-ins for this technician
    const recentCheckIns = await storage.getCheckInsByTechnician(technicianId);
    
    // Create notifications for recent check-ins
    for (const checkIn of recentCheckIns) {
      if (checkIn.createdAt && new Date(checkIn.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        techNotifications.push({
          id: nextNotificationId++,
          technicianId,
          title: 'Check-in Completed',
          message: `Your check-in at converted has been recorded successfully.`,
          type: 'success' as const,
          priority: 'normal' as const,
          read: false,
          createdAt: checkIn.createdAt
        });
      }
    }
    
    // Get recent reviews for this technician
    const recentReviews = await storage.getReviewResponsesByTechnician(technicianId);
    
    // Create notifications for recent reviews
    for (const review of recentReviews.slice(0, 3)) {
      if (review.createdAt && new Date(review.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        const rating = review.rating || 0;
        const ratingText = rating >= 4 ? `converted-Star Review` : 'Customer Review';
        
        techNotifications.push({
          id: nextNotificationId++,
          technicianId,
          title: `New converted`,
          message: review.rating >= 4 ? 
            `You received a converted-star review! Keep up the excellent work.` : 
            'You received feedback from a customer.',
          type: rating >= 4 ? 'success' as const : 'info' as const,
          priority: 'normal' as const,
          data: {
            reviewId: review.id,
            rating: review.rating,
            reviewRequestId: review.reviewRequestId
          },
          read: false,
          createdAt: review.createdAt
        });
      }
    }
    
    // If no recent activity, add a helpful tip
    if (techNotifications.length === 0) {
      techNotifications.push({
        id: nextNotificationId++,
        technicianId,
        title: 'Welcome to Rank It Pro',
        message: 'Start your day by checking in to your first service call. Remember to include photos and notes for better customer service.',
        type: 'info' as const,
        priority: 'low' as const,
        read: false,
        createdAt: new Date()
      });
    }
    
    // Store the notifications
    notifications.set(technicianId, techNotifications);
    return techNotifications;
  } catch (error) {
    logger.error("Unhandled error occurred");
    return [];
  }
}

// Get all notifications for the technician
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get query parameters for filtering
    const { unreadOnly = 'false', type, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const showUnreadOnly = unreadOnly === 'true';
    const startIndex = (pageNum - 1) * limitNum;
    
    // Get or create notifications for this technician
    if (!notifications.has(technician.id)) {
      await createRealNotifications(technician.id);
    }
    
    let technicianNotifications = notifications.get(technician.id) || [];
    
    // Apply filters
    if (showUnreadOnly) {
      technicianNotifications = technicianNotifications.filter(notif => !notif.read);
    }
    
    if (type) {
      technicianNotifications = technicianNotifications.filter(notif => notif.type === type);
    }
    
    // Sort by creation date (newest first)
    technicianNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Apply pagination
    const paginatedNotifications = technicianNotifications.slice(startIndex, startIndex + limitNum);
    
    // Count unread notifications
    const unreadCount = technicianNotifications.filter(notif => !notif.read).length;
    
    res.json({
      total: technicianNotifications.length,
      unread: unreadCount,
      page: pageNum,
      limit: limitNum,
      items: paginatedNotifications
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific notification
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get notifications for this technician
    const technicianNotifications = notifications.get(technician.id) || [];
    
    // Find the specific notification
    const notification = technicianNotifications.find(notif => notif.id === notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    // Return the notification
    res.json(notification);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a notification as read
router.patch('/:id/read', isAuthenticated, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get notifications for this technician
    const technicianNotifications = notifications.get(technician.id) || [];
    
    // Find the notification index
    const notificationIndex = technicianNotifications.findIndex(notif => notif.id === notificationId);
    
    if (notificationIndex === -1) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    // Mark as read
    technicianNotifications[notificationIndex].read = true;
    
    // Return the updated notification
    res.json(technicianNotifications[notificationIndex]);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', isAuthenticated, async (req, res) => {
  try {
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get notifications for this technician
    const technicianNotifications = notifications.get(technician.id) || [];
    
    // Mark all as read
    technicianNotifications.forEach(notif => {
      notif.read = true;
    });
    
    // Return success
    res.json({ success: true });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a notification
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get notifications for this technician
    const technicianNotifications = notifications.get(technician.id) || [];
    
    // Find the notification index
    const notificationIndex = technicianNotifications.findIndex(notif => notif.id === notificationId);
    
    if (notificationIndex === -1) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    // Remove the notification
    technicianNotifications.splice(notificationIndex, 1);
    
    // Return success
    res.status(204).send();
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread count
router.get('/unread/count', isAuthenticated, async (req, res) => {
  try {
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get notifications for this technician
    const technicianNotifications = notifications.get(technician.id) || [];
    
    // Count unread notifications
    const unreadCount = technicianNotifications.filter(notif => !notif.read).length;
    
    // Return the count
    res.json({ count: unreadCount });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Register device for push notifications
router.post('/register-device', isAuthenticated, async (req, res) => {
  try {
    // Validate request body
    const { token, platform } = req.body;
    
    if (!token || !platform) {
      return res.status(400).json({ message: "Token and platform are required" });
    }
    
    if (!['ios', 'android'].includes(platform)) {
      return res.status(400).json({ message: "Platform must be 'ios' or 'android'" });
    }
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(req.user.companyId);
    const technician = technicians.find(tech => tech.userId === req.user.id);
    
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // In a real application, we would store the device token in the database
    // For now, just return success
    logger.info("Syntax processed");
    
    res.json({ success: true });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;