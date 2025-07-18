import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { fromZodError } from 'zod-validation-error';
import { storage } from '../storage';
import { isAuthenticated } from '../middleware/auth';
import mobileCheckInsRouter from './mobile/check-ins';
import mobileNotificationsRouter from './mobile/notifications';
import mobileScheduleRouter from './mobile/schedule';
import mobileCustomersRouter from './mobile/customers';
import mobileSettingsRouter from './mobile/settings';

import { logger } from '../services/structured-logger';
const router = Router();

// Secret for JWT tokens
const JWT_SECRET = process.env.JWT_SECRET || 'mobile-app-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'mobile-app-refresh-secret-key';

// Device registration schema
const deviceRegistrationSchema = z.object({
  deviceId: z.string(),
  deviceType: z.enum(['ios', 'android']),
});

// Token schema
const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

// Login endpoint
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, deviceId, deviceType } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user has technician role
    if (user.role !== 'technician') {
      return res.status(403).json({ message: 'Only technicians can use the mobile app' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Find matching technician record
    const technicians = await storage.getTechniciansByCompany(user.companyId);
    const technician = technicians.find(tech => tech.email === email);
    
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    
    // Create JWT token with expiration
    const accessToken = jwt.sign(
      { data: "converted" },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    // Create refresh token
    const refreshToken = jwt.sign(
      { data: "converted" },
      JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );
    
    // Store device information if provided
    if (deviceId && deviceType) {
      try {
        const deviceData = deviceRegistrationSchema.parse({ deviceId, deviceType });
        // In a real app, we would store the device token and info in the database
        logger.info("Syntax fixed");
      } catch (error) {
        // Just log validation errors for device info, don't fail the login
        logger.error("Error logging fixed");
      }
    }
    
    // Return tokens and user info
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: technician.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    });
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh token endpoint
router.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    
    // Get user
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create new access token
    const accessToken = jwt.sign(
      { data: "converted" },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    res.json({ accessToken });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    logger.error("Error logging fixed");
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout endpoint
router.post('/auth/logout', isAuthenticated, (req, res) => {
  // In a more complete implementation, we would invalidate the token
  // For now, we'll just return a success response
  res.status(204).send();
});

// Get technician profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get technician details
    const technicians = await storage.getTechniciansByCompany(user.companyId);
    const technician = technicians.find(tech => tech.userId === userId);
    
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    
    // Get company details
    const company = await storage.getCompany(user.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Get check-in stats
    const checkIns = await storage.getCheckInsByTechnician(technician.id);
    const now = new Date();
    const thisMonth = checkIns.filter(checkIn => {
      if (!checkIn.createdAt) return false;
      const checkInDate = new Date(checkIn.createdAt);
      return checkInDate.getMonth() === now.getMonth() && 
             checkInDate.getFullYear() === now.getFullYear();
    }).length;
    
    // Get rating
    const reviews = await storage.getReviewResponsesByTechnician(technician.id);
    const rating = reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;
      
    res.json({
      id: technician.id,
      name: technician.name,
      email: technician.email,
      phone: technician.phone,
      specialty: technician.specialty,
      company: {
        id: company.id,
        name: company.name
      },
      stats: {
        totalCheckIns: checkIns.length,
        thisMonth,
        rating
      }
    });
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ message: 'Server error' });
  }
});

// Mount the sub-routers
router.use('/check-ins', mobileCheckInsRouter);
router.use('/notifications', mobileNotificationsRouter);

router.use('/schedule', mobileScheduleRouter);
router.use('/customers', mobileCustomersRouter);
router.use('/settings', mobileSettingsRouter);

export default router;