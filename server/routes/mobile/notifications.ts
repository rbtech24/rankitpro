import { Router } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { storage } from '../../storage';
import { isAuthenticated } from '../../middleware/auth';

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

// Function to create sample notifications for new technicians
function createSampleNotifications(technicianId: number) {
  const techNotifications = [];
  
  // Add a welcome notification
  techNotifications.push({
    id: nextNotificationId++,
    technicianId,
    title: 'Welcome to Rank It Pro',
    message: 'Thank you for using the Rank It Pro mobile app! We\'re excited to help you manage your service calls more efficiently.',
    type: 'info',
    priority: 'normal',
    read: false,
    createdAt: new Date()
  });
  
  // Add a check-in tip notification
  techNotifications.push({
    id: nextNotificationId++,
    technicianId,
    title: 'Quick Tip: Check-ins',
    message: 'Remember to include photos in your check-ins to improve customer confidence and document your work properly.',
    type: 'info',
    priority: 'low',
    read: false,
    createdAt: new Date(Date.now() - 3600000) // 1 hour ago
  });
  
  // Add a sample schedule notification
  techNotifications.push({
    id: nextNotificationId++,
    technicianId,
    title: 'New Schedule Item',
    message: 'You have a new job scheduled for tomorrow at 10:00 AM.',
    type: 'info',
    priority: 'high',
    data: {
      scheduleItemId: 123,
      jobType: 'Maintenance',
      location: '123 Main St',
      time: '10:00 AM'
    },
    read: false,
    createdAt: new Date(Date.now() - 7200000) // 2 hours ago
  });
  
  // Add a sample review notification
  techNotifications.push({
    id: nextNotificationId++,
    technicianId,
    title: 'New 5-Star Review',
    message: 'You received a new 5-star review from a customer. Great job!',
    type: 'success',
    priority: 'normal',
    data: {
      reviewId: 456,
      rating: 5,
      customerName: 'John Doe'
    },
    read: true,
    createdAt: new Date(Date.now() - 86400000) // 1 day ago
  });
  
  // Store the notifications
  notifications.set(technicianId, techNotifications);
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
      createSampleNotifications(technician.id);
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
    console.error('Get notifications error:', error);
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
    console.error('Get notification error:', error);
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
    console.error('Mark notification as read error:', error);
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
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
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
    console.error('Delete notification error:', error);
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
    console.error('Get unread count error:', error);
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
    console.log(`Registered device token for technician ${technician.id}: ${token} (${platform})`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Register device error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;