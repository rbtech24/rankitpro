import { Router } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { storage } from '../../storage';
import { isAuthenticated } from '../../middleware/auth';

const router = Router();

// Device registration schema
const deviceRegistrationSchema = z.object({
  deviceToken: z.string(),
  deviceType: z.enum(['ios', 'android'])
});

// Define a simple in-memory store for device tokens (in a real app, this would be in the database)
interface DeviceRegistration {
  userId: number;
  deviceToken: string;
  deviceType: 'ios' | 'android';
  lastRegistered: Date;
}

const deviceTokens = new Map<string, DeviceRegistration>();

// Register device for push notifications
router.post('/register', isAuthenticated, async (req, res) => {
  try {
    const { deviceToken, deviceType } = deviceRegistrationSchema.parse(req.body);
    
    // Store device token with user ID
    deviceTokens.set(deviceToken, {
      userId: req.user.id,
      deviceToken,
      deviceType,
      lastRegistered: new Date()
    });
    
    console.log(`Registered device token for user ${req.user.id}: ${deviceToken} (${deviceType})`);
    
    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    console.error('Device registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get technician's notification history
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const startIndex = (page - 1) * limit;
    
    // In a real implementation, we would fetch notifications from a database
    // For now, we'll return simulated notifications based on check-ins and reviews
    
    // Get technician info
    const technician = await storage.getTechnician(req.user.id);
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }
    
    // Get check-ins for this technician
    const checkIns = await storage.getCheckInsByTechnician(technician.id);
    const checkInNotifications = checkIns.map(checkIn => ({
      id: `check-in-${checkIn.id}`,
      title: 'Check-in Submitted',
      message: `Your check-in for ${checkIn.jobType} job was successfully submitted.`,
      type: 'check-in',
      read: true, // Assume all are read in this demo
      createdAt: checkIn.createdAt,
      data: {
        checkInId: checkIn.id
      }
    }));
    
    // Get reviews for this technician
    const reviews = await storage.getReviewResponsesByTechnician(technician.id);
    const reviewNotifications = reviews.map(review => ({
      id: `review-${review.id}`,
      title: 'New Review Received',
      message: `You received a ${review.rating}-star review from ${review.customerName}.`,
      type: 'review',
      read: true, // Assume all are read in this demo
      createdAt: review.respondedAt,
      data: {
        reviewId: review.id
      }
    }));
    
    // Combine and sort notifications by date (newest first)
    const allNotifications = [...checkInNotifications, ...reviewNotifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Add a system notification as an example
    if (allNotifications.length === 0) {
      allNotifications.push({
        id: 'system-welcome',
        title: 'Welcome to Rank It Pro',
        message: 'Thank you for using our mobile app. Tap here to learn more about the features.',
        type: 'system',
        read: false,
        createdAt: new Date(),
        data: {
          url: '/help'
        }
      });
    }
    
    // Paginate results
    const paginatedNotifications = allNotifications.slice(startIndex, startIndex + limit);
    
    res.json({
      items: paginatedNotifications,
      total: allNotifications.length,
      page,
      limit
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// In a real app, you would have additional endpoints for marking notifications as read
// and for deleting notifications

export default router;