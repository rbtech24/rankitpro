/**
 * User Management Routes Module
 * Extracted from main routes.ts for better maintainability
 */

import { Router } from "express";
import bcrypt from "bcrypt";
import { storage } from "../storage";
import { logger } from "../services/logger";
import { isAuthenticated, isCompanyAdmin, isSuperAdmin } from "../middleware/auth";
import { validateBody } from "../middleware/validation";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// User update schema
const updateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  password: z.string().min(8).optional(),
  role: z.enum(["super_admin", "company_admin", "technician", "sales_staff"]).optional(),
  active: z.boolean().optional()
});

// Get user profile
router.get('/profile', 
  isAuthenticated,
  async (req, res) => {
    try {
      const userId = req.session.userId!;

      logger.apiRequest(req.method, req.path, { userId, ip: req.ip });

      const user = await storage.getUser(userId);
      if (!user) {
        logger.warn('User profile request for non-existent user', { userId });
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without sensitive data
      const { password, ...userProfile } = user;

      logger.info("Operation completed");

      res.json(userProfile);

    } catch (error) {
      logger.error('Get user profile endpoint error', { 
        userId: req.session.userId 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update user profile
router.put('/profile',
  isAuthenticated,
  validateBody(updateUserSchema),
  async (req, res) => {
    try {
      const userId = req.session.userId!;
      const updates = req.body;

      logger.apiRequest(req.method, req.path, { 
        userId, 
        updateFields: Object.keys(updates),
        ip: req.ip 
      });

      // Hash password if provided
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 12);
        logger.info('User password updated', { userId });
      }

      // Check if email is being changed and ensure uniqueness
      if (updates.email) {
        const existingUser = await storage.getUserByEmail(updates.email);
        if (existingUser && existingUser.id !== userId) {
          logger.warn('User profile update failed - email already exists', { 
            userId, 
            email: updates.email 
          });
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      // Check if username is being changed and ensure uniqueness
      if (updates.username) {
        const existingUser = await storage.getUserByUsername(updates.username);
        if (existingUser && existingUser.id !== userId) {
          logger.warn('User profile update failed - username already exists', { 
            userId, 
            username: updates.username 
          });
          return res.status(400).json({ message: "Username already taken" });
        }
      }

      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        logger.error('User profile update failed', { userId });
        return res.status(500).json({ message: "Failed to update profile" });
      }

      // Return user without sensitive data
      const { password, ...userProfile } = updatedUser;

      logger.businessEvent('User profile updated successfully', {
        userId,
        updatedFields: Object.keys(updates),
        email: updatedUser.email
      });

      res.json(userProfile);

    } catch (error) {
      logger.error('Update user profile endpoint error', { 
        userId: req.session.userId 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get users by company (company admin only)
router.get('/company/:companyId',
  isAuthenticated,
  isCompanyAdmin,
  async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const userId = req.session.userId!;

      logger.apiRequest(req.method, req.path, { 
        userId, 
        companyId,
        ip: req.ip 
      });

      // Verify user belongs to company
      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'super_admin' && user.companyId !== companyId)) {
        logger.authFailure('Unauthorized access to company users', { 
          userId, 
          requestedCompanyId: companyId,
          userCompanyId: user?.companyId 
        });
        return res.status(403).json({ message: "Access denied" });
      }

      const users = await storage.getUsersByCompany(companyId);

      // Remove sensitive data from all users
      const safeUsers = users.map(({ password, ...user }) => user);

      logger.info('Company users retrieved', { 
        userId,
        companyId,
        userCount: users.length 
      });

      res.json(safeUsers);

    } catch (error) {
      logger.error('Get company users endpoint error', { 
        userId: req.session.userId,
        companyId: req.params.companyId 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Create new user (company admin only)
router.post('/',
  isAuthenticated,
  isCompanyAdmin,
  validateBody(insertUserSchema),
  async (req, res) => {
    try {
      const userData = req.body;
      const userId = req.session.userId!;

      logger.apiRequest(req.method, req.path, { 
        userId, 
        newUserEmail: userData.email,
        newUserRole: userData.role,
        ip: req.ip 
      });

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        logger.warn('User creation failed - email already exists', { 
          creatorId: userId,
          email: userData.email 
        });
        return res.status(400).json({ message: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        logger.warn('User creation failed - username already exists', { 
          creatorId: userId,
          username: userData.username 
        });
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      userData.password = hashedPassword;

      // Set company ID from creator's company
      const creator = await storage.getUser(userId);
      if (!creator || !creator.companyId) {
        logger.error("Parameter processed");
        return res.status(400).json({ message: "Unable to determine company" });
      }

      userData.companyId = creator.companyId;

      const newUser = await storage.createUser(userData);

      // Return user without sensitive data
      const { password, ...safeUser } = newUser;

      logger.businessEvent('New user created', {
        creatorId: userId,
        newUserId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        companyId: newUser.companyId
      });

      res.status(201).json(safeUser);

    } catch (error) {
      logger.error('Create user endpoint error', { 
        creatorId: req.session.userId,
        email: req.body.email 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update user (company admin only)
router.put('/:id',
  isAuthenticated,
  isCompanyAdmin,
  validateBody(updateUserSchema),
  async (req, res) => {
    try {
      const targetUserId = parseInt(req.params.id);
      const updates = req.body;
      const userId = req.session.userId!;

      logger.apiRequest(req.method, req.path, { 
        userId, 
        targetUserId,
        updateFields: Object.keys(updates),
        ip: req.ip 
      });

      // Verify user has permission to update target user
      const user = await storage.getUser(userId);
      const targetUser = await storage.getUser(targetUserId);

      if (!user || !targetUser) {
        logger.warn('User update failed - user not found', { 
          userId, 
          targetUserId 
        });
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== 'super_admin' && user.companyId !== targetUser.companyId) {
        logger.authFailure('Unauthorized user update attempt', { 
          userId, 
          targetUserId,
          userCompanyId: user.companyId,
          targetUserCompanyId: targetUser.companyId 
        });
        return res.status(403).json({ message: "Access denied" });
      }

      // Hash password if provided
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 12);
      }

      const updatedUser = await storage.updateUser(targetUserId, updates);
      if (!updatedUser) {
        logger.error('User update failed', { userId, targetUserId });
        return res.status(500).json({ message: "Failed to update user" });
      }

      // Return user without sensitive data
      const { password, ...safeUser } = updatedUser;

      logger.businessEvent('User updated successfully', {
        updatedBy: userId,
        targetUserId,
        updatedFields: Object.keys(updates),
        email: updatedUser.email
      });

      res.json(safeUser);

    } catch (error) {
      logger.error('Update user endpoint error', { 
        userId: req.session.userId,
        targetUserId: req.params.id 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;