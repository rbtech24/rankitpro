/**
 * Technician Management Routes Module
 * Extracted from main routes.ts for better maintainability
 */

import { Router } from "express";
import { storage } from "../storage";
import { logger } from "../services/logger";
import { isAuthenticated, isCompanyAdmin } from "../middleware/auth";
import { validateBody } from "../middleware/validation";
import { insertTechnicianSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get all technicians (super admin only)
router.get('/all',
  isAuthenticated,
  async (req, res) => {
    try {
      const userId = req.session.userId!;
      console.log(`API request: GET /api/technicians/all from user ${userId}`);
      
      // Check if user is super admin
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'super_admin') {
        console.log(`Access denied for user ${userId}, role: ${user?.role}`);
        return res.status(403).json({ message: "Access denied" });
      }

      // Get all technicians across all companies
      const technicians = await storage.getAllTechnicians();
      console.log(`Retrieved ${technicians.length} technicians`);

      res.json(technicians);

    } catch (error) {
      console.error('Get all technicians endpoint error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Technician update schema
const updateTechnicianSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  hourlyRate: z.number().min(0).optional()
});

// Get technicians by company
router.get('/company/:companyId',
  isAuthenticated,
  async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const userId = req.session.userId!;

      logger.apiRequest(req.method, req.path, { 
        userId, 
        companyId,
        ip: req.ip 
      });

      // Verify user has access to company
      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'super_admin' && user.companyId !== companyId)) {
        logger.authFailure('Unauthorized access to company technicians', { 
          userId, 
          requestedCompanyId: companyId,
          userCompanyId: user?.companyId 
        });
        return res.status(403).json({ message: "Access denied" });
      }

      const technicians = await storage.getTechniciansByCompany(companyId);

      logger.info('Company technicians retrieved', { 
        userId,
        companyId,
        technicianCount: technicians.length 
      });

      res.json(technicians);

    } catch (error) {
      logger.error('Get company technicians endpoint error', { 
        userId: req.session.userId,
        companyId: req.params.companyId 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get technicians with stats
router.get('/company/:companyId/stats',
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

      // Verify user has access to company
      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'super_admin' && user.companyId !== companyId)) {
        logger.authFailure('Unauthorized access to technician stats', { 
          userId, 
          requestedCompanyId: companyId,
          userCompanyId: user?.companyId 
        });
        return res.status(403).json({ message: "Access denied" });
      }

      const techniciansWithStats = await storage.getTechniciansWithStats(companyId);

      logger.info('Technician stats retrieved', { 
        userId,
        companyId,
        technicianCount: techniciansWithStats.length 
      });

      res.json(techniciansWithStats);

    } catch (error) {
      logger.error('Get technician stats endpoint error', { 
        userId: req.session.userId,
        companyId: req.params.companyId 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get single technician
router.get('/:id',
  isAuthenticated,
  async (req, res) => {
    try {
      const technicianId = parseInt(req.params.id);
      const userId = req.session.userId!;

      logger.apiRequest(req.method, req.path, { 
        userId, 
        technicianId,
        ip: req.ip 
      });

      const technician = await storage.getTechnician(technicianId);
      if (!technician) {
        logger.warn('Technician not found', { userId, technicianId });
        return res.status(404).json({ message: "Technician not found" });
      }

      // Verify user has access to technician's company
      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'super_admin' && user.companyId !== technician.companyId)) {
        logger.authFailure('Unauthorized access to technician', { 
          userId, 
          technicianId,
          technicianCompanyId: technician.companyId,
          userCompanyId: user?.companyId 
        });
        return res.status(403).json({ message: "Access denied" });
      }

      logger.info('Technician details retrieved', { 
        userId,
        technicianId,
        technicianEmail: technician.email 
      });

      res.json(technician);

    } catch (error) {
      logger.error('Get technician endpoint error', { 
        userId: req.session.userId,
        technicianId: req.params.id 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Create new technician
router.post('/',
  isAuthenticated,
  isCompanyAdmin,
  validateBody(insertTechnicianSchema),
  async (req, res) => {
    try {
      const technicianData = req.body;
      const userId = req.session.userId!;

      logger.apiRequest(req.method, req.path, { 
        userId, 
        technicianEmail: technicianData.email,
        ip: req.ip 
      });

      // Set company ID from user's company
      const user = await storage.getUser(userId);
      if (!user || !user.companyId) {
        logger.error('Technician creation failed - user has no company', { userId });
        return res.status(400).json({ message: "Unable to determine company" });
      }

      technicianData.companyId = user.companyId;

      // Check if technician with email already exists in company
      const existingTechnicians = await storage.getTechniciansByCompany(user.companyId);
      const emailExists = existingTechnicians.some(tech => tech.email === technicianData.email);
      
      if (emailExists) {
        logger.warn('Technician creation failed - email already exists', { 
          userId,
          email: technicianData.email,
          companyId: user.companyId 
        });
        return res.status(400).json({ message: "Technician with this email already exists" });
      }

      const technician = await storage.createTechnician(technicianData);

      logger.businessEvent('New technician created', {
        createdBy: userId,
        technicianId: technician.id,
        technicianEmail: technician.email,
        companyId: technician.companyId
      });

      res.status(201).json(technician);

    } catch (error) {
      logger.error('Create technician endpoint error', { 
        userId: req.session.userId,
        email: req.body.email 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update technician
router.put('/:id',
  isAuthenticated,
  isCompanyAdmin,
  validateBody(updateTechnicianSchema),
  async (req, res) => {
    try {
      const technicianId = parseInt(req.params.id);
      const updates = req.body;
      const userId = req.session.userId!;

      logger.apiRequest(req.method, req.path, { 
        userId, 
        technicianId,
        updateFields: Object.keys(updates),
        ip: req.ip 
      });

      // Verify technician exists and user has permission
      const technician = await storage.getTechnician(technicianId);
      if (!technician) {
        logger.warn('Technician update failed - technician not found', { 
          userId, 
          technicianId 
        });
        return res.status(404).json({ message: "Technician not found" });
      }

      const user = await storage.getUser(userId);
      if (!user || (user.role !== 'super_admin' && user.companyId !== technician.companyId)) {
        logger.authFailure('Unauthorized technician update attempt', { 
          userId, 
          technicianId,
          technicianCompanyId: technician.companyId,
          userCompanyId: user?.companyId 
        });
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedTechnician = await storage.updateTechnician(technicianId, updates);
      if (!updatedTechnician) {
        logger.error('Technician update failed', { userId, technicianId });
        return res.status(500).json({ message: "Failed to update technician" });
      }

      logger.businessEvent('Technician updated successfully', {
        updatedBy: userId,
        technicianId,
        updatedFields: Object.keys(updates),
        technicianEmail: updatedTechnician.email
      });

      res.json(updatedTechnician);

    } catch (error) {
      logger.error('Update technician endpoint error', { 
        userId: req.session.userId,
        technicianId: req.params.id 
      }, error as Error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;