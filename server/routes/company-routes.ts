/**
 * Company Management Routes Module
 * Extracted from main routes.ts for better maintainability
 */

import { Router } from "express";
import { storage } from "../storage";
import { logger } from "../services/logger";
import { isAuthenticated, isCompanyAdmin, isSuperAdmin } from "../middleware/auth";
import { validateBody } from "../middleware/validation";
import { insertCompanySchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Company update schema
const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  plan: z.enum(["starter", "pro", "agency"]).optional(),
  usageLimit: z.number().min(0).optional(),
  featuresEnabled: z.record(z.boolean()).optional(),
  isActive: z.boolean().optional()
});

// Get company details
router.get('/:id', 
  isAuthenticated,
  async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.session.userId!;

      logger.info(req.method, req.path, { 
        userId, 
        companyId,
        ip: req.ip 
      });

      // Check if user belongs to company or is super admin
      const user = await storage.getUser(userId);
      if (!user) {
        logger.warn('User not found for company access', { userId, companyId });
        return res.status(401).json({ message: "User not found" });
      }

      if (user.role !== 'super_admin' && user.companyId !== companyId) {
        logger.warn('Unauthorized company access attempt', { 
          userId, 
          userCompanyId: user.companyId,
          requestedCompanyId: companyId 
        });
        return res.status(403).json({ message: "Access denied" });
      }

      const company = await storage.getCompany(companyId);
      if (!company) {
        logger.warn('Company not found', { companyId, userId });
        return res.status(404).json({ message: "Company not found" });
      }

      logger.info('Company details retrieved', { 
        companyId,
        userId,
        companyName: company.name 
      });

      res.json(company);

    } catch (error) {
      logger.error('Get company endpoint error', { 
        companyId: req.params.id,
        userId: req.session.userId 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update company
router.put('/:id',
  isAuthenticated,
  isCompanyAdmin,
  validateBody(updateCompanySchema),
  async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.session.userId!;
      const updates = req.body;

      logger.info(req.method, req.path, { 
        userId, 
        companyId,
        updates: Object.keys(updates),
        ip: req.ip 
      });

      // Verify user belongs to company (unless super admin)
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (user.role !== 'super_admin' && user.companyId !== companyId) {
        logger.authFailure('Unauthorized company update attempt', { 
          userId, 
          userCompanyId: user.companyId,
          requestedCompanyId: companyId 
        });
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedCompany = await storage.updateCompany(companyId, updates);
      if (!updatedCompany) {
        logger.warn('Company update failed - company not found', { companyId, userId });
        return res.status(404).json({ message: "Company not found" });
      }

      logger.businessEvent('Company updated successfully', {
        companyId,
        userId,
        updatedFields: Object.keys(updates),
        companyName: updatedCompany.name
      });

      res.json(updatedCompany);

    } catch (error) {
      logger.error('Update company endpoint error', { 
        companyId: req.params.id,
        userId: req.session.userId 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get current user's company
router.get('/current',
  isAuthenticated,
  async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      logger.info(req.method, req.path, { 
        userId,
        ip: req.ip 
      });

      const user = await storage.getUser(userId);
      if (!user) {
        logger.warn('User not found for current company request', { userId });
        return res.status(401).json({ message: "User not found" });
      }

      if (!user.companyId) {
        logger.warn('User has no company association', { userId });
        return res.status(404).json({ message: "No company associated with user" });
      }

      const company = await storage.getCompany(user.companyId);
      if (!company) {
        logger.warn('Company not found for user', { userId, companyId: user.companyId });
        return res.status(404).json({ message: "Company not found" });
      }

      logger.info('Current company retrieved', { 
        userId,
        companyId: company.id,
        companyName: company.name 
      });

      res.json(company);

    } catch (error) {
      logger.error('Get current company endpoint error', { 
        userId: req.session.userId 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get all companies (super admin only)
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

      const companies = await storage.getAllCompanies();
      logger.info('Retrieved companies for super admin', { 
        userId,
        companyCount: companies.length 
      });

      res.json(companies);

    } catch (error) {
      logger.error('Get all companies endpoint error', { 
        userId: req.session.userId,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Create company (super admin only)
router.post('/',
  isAuthenticated,
  isSuperAdmin,
  validateBody(insertCompanySchema),
  async (req, res) => {
    try {
      const userId = req.session.userId!;
      const companyData = req.body;

      logger.info(req.method, req.path, { 
        userId, 
        companyName: companyData.name,
        ip: req.ip 
      });

      const company = await storage.createCompany(companyData);

      logger.businessEvent('New company created by super admin', {
        companyId: company.id,
        userId,
        companyName: company.name,
        plan: company.plan
      });

      res.status(201).json(company);

    } catch (error) {
      logger.error('Create company endpoint error', { 
        userId: req.session.userId,
        companyName: req.body.name 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete company (super admin only)
router.delete('/:id',
  isAuthenticated,
  isSuperAdmin,
  async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.session.userId!;

      logger.info(req.method, req.path, { 
        userId, 
        companyId,
        ip: req.ip 
      });

      // Get company details before deletion for logging
      const company = await storage.getCompany(companyId);
      if (!company) {
        logger.warn('Company deletion failed - company not found', { companyId, userId });
        return res.status(404).json({ message: "Company not found" });
      }

      const deleted = await storage.deleteCompany(companyId);
      if (!deleted) {
        logger.error('Company deletion failed', { companyId, userId });
        return res.status(500).json({ message: "Failed to delete company" });
      }

      logger.businessEvent('Company deleted by super admin', {
        companyId,
        userId,
        companyName: company.name
      });

      res.json({ message: "Company deleted successfully" });

    } catch (error) {
      logger.error('Delete company endpoint error', { 
        companyId: req.params.id,
        userId: req.session.userId 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Toggle company status (activate/deactivate)
router.patch('/:id/status',
  isAuthenticated,
  isSuperAdmin,
  async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.session.userId!;

      logger.info(req.method, req.path, { 
        userId, 
        companyId,
        ip: req.ip 
      });

      // Get current company status
      const company = await storage.getCompany(companyId);
      if (!company) {
        logger.warn('Company not found for status toggle', { companyId, userId });
        return res.status(404).json({ message: "Company not found" });
      }

      // Toggle the active status
      const newStatus = !company.isActive;
      const updatedCompany = await storage.updateCompany(companyId, { 
        isActive: newStatus 
      });

      if (!updatedCompany) {
        logger.error('Failed to update company status', { companyId, userId });
        return res.status(500).json({ message: "Failed to update company status" });
      }

      logger.businessEvent('Company status toggled', {
        companyId,
        userId,
        companyName: updatedCompany.name,
        newStatus: newStatus ? 'active' : 'inactive',
        previousStatus: company.isActive ? 'active' : 'inactive'
      });

      res.json({ 
        message: `Company ${newStatus ? 'activated' : 'deactivated'} successfully`,
        company: updatedCompany
      });

    } catch (error) {
      logger.error('Toggle company status endpoint error', { 
        companyId: req.params.id,
        userId: req.session.userId 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;