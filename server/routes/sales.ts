import express, { Request, Response } from 'express';
import { isAuthenticated, isSuperAdmin } from '../middleware/auth';
import { storage } from '../storage';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createSalesPersonSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  commissionRate: z.number().min(0).max(100)
});

const assignCompanySchema = z.object({
  salesPersonId: z.number(),
  companyId: z.number()
});

// Get all sales people (super admin only)
router.get('/people', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const salesPeople = await storage.getAllSalesPeople();
    res.json(salesPeople);
  } catch (error: any) {
    console.error('Error fetching sales people:', error);
    res.status(500).json({ error: 'Failed to fetch sales people' });
  }
});

// Create new sales person (super admin only)
router.post('/people', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const data = createSalesPersonSchema.parse(req.body);
    const salesPerson = await storage.createSalesPerson(data);
    res.json(salesPerson);
  } catch (error: any) {
    console.error('Error creating sales person:', error);
    res.status(500).json({ error: 'Failed to create sales person' });
  }
});

// Assign company to sales person (super admin only)
router.post('/assignments', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const data = assignCompanySchema.parse(req.body);
    const assignment = await storage.assignCompanyToSalesPerson(data.salesPersonId, data.companyId);
    res.json(assignment);
  } catch (error: any) {
    console.error('Error assigning company:', error);
    res.status(500).json({ error: 'Failed to assign company' });
  }
});

// Get commissions for a sales person
router.get('/people/:id/commissions', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const salesPersonId = parseInt(req.params.id);
    const commissions = await storage.getSalesCommissions(salesPersonId);
    res.json(commissions);
  } catch (error: any) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({ error: 'Failed to fetch commissions' });
  }
});

// Calculate monthly commissions (super admin only)
router.post('/commissions/calculate', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { month } = req.body; // Format: YYYY-MM
    
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
    }
    
    const results = await storage.calculateMonthlyCommissions(month);
    res.json(results);
  } catch (error: any) {
    console.error('Error calculating commissions:', error);
    res.status(500).json({ error: 'Failed to calculate commissions' });
  }
});

// Mark commission as paid (super admin only)
router.patch('/commissions/:id/paid', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const commissionId = parseInt(req.params.id);
    const commission = await storage.markCommissionPaid(commissionId);
    res.json(commission);
  } catch (error: any) {
    console.error('Error marking commission as paid:', error);
    res.status(500).json({ error: 'Failed to mark commission as paid' });
  }
});

// Get commission dashboard data (super admin only)
router.get('/dashboard', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const data = await storage.getSalesCommissionDashboard();
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching commission dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch commission dashboard' });
  }
});

export default router;