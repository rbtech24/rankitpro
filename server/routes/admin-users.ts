import { Router } from "express";
import { storage } from "../storage";
import { logger } from "../services/logger";
import { isAuthenticated, isSuperAdmin } from "../middleware/auth";
import { validateBody } from "../middleware/validation";
import { z } from "zod";
import bcrypt from "bcrypt";

const router = Router();

// Admin user creation schema
const createAdminSchema = z.object({
  email: z.string().email().min(1),
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  role: z.enum(["super_admin", "company_admin"]).default("company_admin")
});

// Get all admin users (super admin only)
router.get('/',
  isAuthenticated,
  isSuperAdmin,
  async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      logger.info('API request received', { 
        method: req.method,
        path: req.path,
        userId,
        ip: req.ip 
      });

      // Get all users with admin roles
      const adminUsers = await storage.getAdminUsers();
      
      logger.info('Retrieved admin users for management', { 
        userId,
        adminCount: adminUsers.length 
      });

      res.json(adminUsers);

    } catch (error) {
      logger.error('Get admin users endpoint error', { 
        userId: req.session.userId,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Create new admin user (super admin only)
router.post('/',
  isAuthenticated,
  isSuperAdmin,
  validateBody(createAdminSchema),
  async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { email, username, password, role } = req.body;
      
      logger.info('API request received', { 
        method: req.method,
        path: req.path,
        userId,
        newUserEmail: email,
        newUserRole: role,
        ip: req.ip 
      });

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        logger.warn('Admin creation failed - email already exists', { 
          userId, 
          email 
        });
        return res.status(400).json({ message: "Email address already registered" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        logger.warn('Admin creation failed - username already exists', { 
          userId, 
          username 
        });
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create admin user
      const newAdmin = await storage.createUser({
        email,
        username,
        password: hashedPassword,
        role,
        active: true,
        companyId: null // Admin users are not tied to specific companies
      });

      logger.businessEvent('New admin user created', {
        createdUserId: newAdmin.id,
        createdByUserId: userId,
        email: newAdmin.email,
        username: newAdmin.username,
        role: newAdmin.role
      });

      // Return user without password hash
      const { password: _, ...adminResponse } = newAdmin;
      res.status(201).json(adminResponse);

    } catch (error) {
      logger.error('Create admin user endpoint error', { 
        userId: req.session.userId,
        email: req.body.email,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Toggle admin user status (super admin only)
router.patch('/:id/status',
  isAuthenticated,
  isSuperAdmin,
  async (req, res) => {
    try {
      const targetUserId = parseInt(req.params.id);
      const userId = req.session.userId!;

      logger.info('API request received', { 
        method: req.method,
        path: req.path,
        userId,
        targetUserId,
        ip: req.ip 
      });

      // Get target user
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        logger.warn('User not found for status toggle', { userId, targetUserId });
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent super admin from deactivating themselves
      if (targetUserId === userId) {
        logger.warn('Super admin attempted to modify own status', { userId });
        return res.status(400).json({ message: "Cannot modify your own account status" });
      }

      // Prevent deactivating other super admins
      if (targetUser.role === 'super_admin') {
        logger.warn('Attempt to modify super admin status', { 
          userId, 
          targetUserId,
          targetUserEmail: targetUser.email 
        });
        return res.status(403).json({ message: "Cannot modify super admin accounts" });
      }

      // Toggle the active status
      const newStatus = !targetUser.active;
      const updatedUser = await storage.updateUser(targetUserId, { 
        active: newStatus 
      });

      if (!updatedUser) {
        logger.error('Failed to update user status', { userId, targetUserId });
        return res.status(500).json({ message: "Failed to update user status" });
      }

      logger.businessEvent('Admin user status toggled', {
        targetUserId,
        modifiedByUserId: userId,
        targetUserEmail: updatedUser.email,
        newStatus: newStatus ? 'active' : 'inactive',
        previousStatus: targetUser.active ? 'active' : 'inactive'
      });

      res.json({ 
        message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
        user: { ...updatedUser, passwordHash: undefined }
      });

    } catch (error) {
      logger.error('Toggle user status endpoint error', { 
        userId: req.session.userId,
        targetUserId: req.params.id,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete admin user (super admin only)
router.delete('/:id',
  isAuthenticated,
  isSuperAdmin,
  async (req, res) => {
    try {
      const targetUserId = parseInt(req.params.id);
      const userId = req.session.userId!;

      logger.info('API request received', { 
        method: req.method,
        path: req.path,
        userId,
        targetUserId,
        ip: req.ip 
      });

      // Get target user
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        logger.warn('User not found for deletion', { userId, targetUserId });
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent super admin from deleting themselves
      if (targetUserId === userId) {
        logger.warn('Super admin attempted to delete own account', { userId });
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      // Prevent deleting other super admins
      if (targetUser.role === 'super_admin') {
        logger.warn('Attempt to delete super admin account', { 
          userId, 
          targetUserId,
          targetUserEmail: targetUser.email 
        });
        return res.status(403).json({ message: "Cannot delete super admin accounts" });
      }

      // Delete the user
      const deleted = await storage.deleteUser(targetUserId);
      if (!deleted) {
        logger.error('User deletion failed', { userId, targetUserId });
        return res.status(500).json({ message: "Failed to delete user" });
      }

      logger.businessEvent('Admin user deleted', {
        deletedUserId: targetUserId,
        deletedByUserId: userId,
        deletedUserEmail: targetUser.email,
        deletedUserRole: targetUser.role
      });

      res.json({ message: "User deleted successfully" });

    } catch (error) {
      logger.error('Delete user endpoint error', { 
        userId: req.session.userId,
        targetUserId: req.params.id,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;