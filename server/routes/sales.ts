import express, { Request, Response } from 'express';
import { isAuthenticated, isSuperAdmin } from '../middleware/auth';
import { storage } from '../storage';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import Stripe from 'stripe';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// Validation schemas
const createSalesPersonSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  commissionRate: z.number().min(0).max(1).default(0.10), // 10% default commission
  username: z.string().min(3),
  password: z.string().min(6)
});

const updateSalesPersonSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  commissionRate: z.number().min(0).max(1).optional(),
  isActive: z.boolean().optional(),
  stripeAccountId: z.string().optional(),
  bankingDetails: z.any().optional()
});

const createCompanyAssignmentSchema = z.object({
  salesPersonId: z.number(),
  companyId: z.number(),
  subscriptionPlan: z.string(),
  initialPlanPrice: z.number(),
  currentPlanPrice: z.number(),
  billingPeriod: z.enum(['monthly', 'yearly']),
  stripeSubscriptionId: z.string().optional()
});

const createCommissionSchema = z.object({
  salesPersonId: z.number(),
  companyId: z.number(),
  subscriptionId: z.string().optional(),
  amount: z.number(),
  commissionRate: z.number(),
  baseAmount: z.number(),
  billingPeriod: z.string(),
  type: z.enum(['signup', 'renewal', 'setup', 'bonus']),
  paymentDate: z.string()
});

const approveCommissionsSchema = z.object({
  commissionIds: z.array(z.number())
});

const createPayoutSchema = z.object({
  salesPersonId: z.number(),
  commissionIds: z.array(z.number()),
  totalAmount: z.number()
});

// ==================== SALES STAFF MANAGEMENT ====================

// Get all sales people with stats (super admin only)
router.get('/people', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const salesPeople = await storage.getAllSalesPeople();
    res.json(salesPeople);
  } catch (error: any) {
    console.error('Error fetching sales people:', error);
    res.status(500).json({ error: 'Failed to fetch sales people' });
  }
});

// Get single sales person (super admin or self)
router.get('/people/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const salesPerson = await storage.getSalesPerson(id);
    
    if (!salesPerson) {
      return res.status(404).json({ error: 'Sales person not found' });
    }

    // Check if user is super admin or accessing their own data
    const user = (req as any).user;
    const userSalesPerson = await storage.getSalesPersonByUserId(user.id);
    
    if (user.role !== 'super_admin' && (!userSalesPerson || userSalesPerson.id !== id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(salesPerson);
  } catch (error: any) {
    console.error('Error fetching sales person:', error);
    res.status(500).json({ error: 'Failed to fetch sales person' });
  }
});

// Create new sales person with full user account (super admin only)
router.post('/people', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const data = createSalesPersonSchema.parse(req.body);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Create user account first
    const user = await storage.createUser({
      email: data.email,
      username: data.username,
      password: hashedPassword,
      role: 'sales_staff',
      active: true
    });

    // Create sales person record
    const salesPerson = await storage.createSalesPerson({
      userId: user.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      commissionRate: data.commissionRate.toString(),
      isActive: true
    });

    res.json({ user, salesPerson });
  } catch (error: any) {
    console.error('Error creating sales person:', error);
    res.status(500).json({ error: 'Failed to create sales person' });
  }
});

// Update sales person (super admin only)
router.put('/people/:id', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updates = updateSalesPersonSchema.parse(req.body);
    
    const updatedSalesPerson = await storage.updateSalesPerson(id, updates);
    
    if (!updatedSalesPerson) {
      return res.status(404).json({ error: 'Sales person not found' });
    }
    
    res.json(updatedSalesPerson);
  } catch (error: any) {
    console.error('Error updating sales person:', error);
    res.status(500).json({ error: 'Failed to update sales person' });
  }
});

// Get detailed financial information for a sales person (super admin only)
router.get('/people/:id/financials', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get sales person details
    const salesPerson = await storage.getSalesPerson(id);
    if (!salesPerson) {
      return res.status(404).json({ error: 'Sales person not found' });
    }

    // Get comprehensive financial data safely
    let commissions = [];
    let customers = [];
    let payouts = [];
    let stats = {
      totalEarnings: '0.00',
      pendingCommissions: '0.00', 
      monthlyEarnings: '0.00',
      totalCustomers: '0'
    };

    try {
      commissions = await storage.getSalesCommissionsBySalesPerson(id) || [];
    } catch (error) {
      console.log('No commissions found for sales person:', id);
    }

    try {
      customers = await storage.getCompanyAssignmentsBySalesPerson(id) || [];
    } catch (error) {
      console.log('No customer assignments found for sales person:', id);
    }

    try {
      payouts = await storage.getCommissionPayoutsBySalesPerson ? 
        await storage.getCommissionPayoutsBySalesPerson(id) : [];
    } catch (error) {
      console.log('No payouts found for sales person:', id);
      payouts = []; // Default to empty array if method doesn't exist
    }

    try {
      const actualStats = await storage.getSalesPersonStats(id);
      if (actualStats) {
        stats = {
          totalEarnings: '0.00', // Will be calculated from commissions
          pendingCommissions: '0.00', // Will be calculated from pending commissions
          monthlyEarnings: actualStats.monthlyEarnings?.toString() || '0.00',
          totalCustomers: actualStats.totalCustomers?.toString() || '0'
        };
      }
    } catch (error) {
      console.log('Could not get stats for sales person:', id);
    }

    const financialDetails = {
      salesPerson,
      totalEarnings: stats.totalEarnings,
      pendingCommissions: stats.pendingCommissions,
      monthlyEarnings: stats.monthlyEarnings,
      totalCustomers: stats.totalCustomers,
      commissions: commissions,
      customers: customers,
      payouts: payouts
    };

    res.json(financialDetails);
  } catch (error: any) {
    console.error('Error fetching financial details:', error);
    res.status(500).json({ error: 'Failed to fetch financial details' });
  }
});

// Get sales person dashboard (sales staff only)
router.get('/dashboard', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const salesPerson = await storage.getSalesPersonByUserId(user.id);
    
    if (!salesPerson || user.role !== 'sales_staff') {
      return res.status(403).json({ error: 'Access denied - not a sales staff member' });
    }

    // Get comprehensive stats
    const stats = await storage.getSalesPersonStats(salesPerson.id);
    const customers = await storage.getCompanyAssignmentsBySalesPerson(salesPerson.id);
    const commissions = await storage.getSalesCommissionsBySalesPerson(salesPerson.id);
    const pendingCommissions = await storage.getPendingCommissionsBySalesPerson(salesPerson.id);

    res.json({
      salesPerson,
      stats,
      customers,
      commissions,
      pendingCommissions
    });
  } catch (error: any) {
    console.error('Error fetching sales dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch sales dashboard' });
  }
});

// ==================== CUSTOMER MANAGEMENT ====================

// Get customers assigned to sales person
router.get('/customers', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let salesPersonId: number;

    if (user.role === 'super_admin') {
      // Super admin can specify salesPersonId or get all
      salesPersonId = req.query.salesPersonId ? parseInt(req.query.salesPersonId as string) : 0;
    } else if (user.role === 'sales_staff') {
      const salesPerson = await storage.getSalesPersonByUserId(user.id);
      if (!salesPerson) {
        return res.status(403).json({ error: 'Access denied' });
      }
      salesPersonId = salesPerson.id;
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    const customers = await storage.getCompanyAssignmentsBySalesPerson(salesPersonId);
    res.json(customers);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Assign company to sales person
router.post('/customers/assign', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const data = createCompanyAssignmentSchema.parse(req.body);
    const assignment = await storage.createCompanyAssignment(data);
    res.json(assignment);
  } catch (error: any) {
    console.error('Error assigning customer:', error);
    res.status(500).json({ error: 'Failed to assign customer' });
  }
});

// ==================== COMMISSION MANAGEMENT ====================

// Get commissions (filtered by user role)
router.get('/commissions', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let commissions;

    if (user.role === 'super_admin') {
      const salesPersonId = req.query.salesPersonId ? parseInt(req.query.salesPersonId as string) : undefined;
      const status = req.query.status as string;
      
      if (salesPersonId) {
        commissions = await storage.getSalesCommissionsBySalesPerson(salesPersonId, status);
      } else {
        commissions = await storage.getPendingCommissions();
      }
    } else if (user.role === 'sales_staff') {
      const salesPerson = await storage.getSalesPersonByUserId(user.id);
      if (!salesPerson) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const status = req.query.status as string;
      commissions = await storage.getSalesCommissionsBySalesPerson(salesPerson.id, status);
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(commissions);
  } catch (error: any) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({ error: 'Failed to fetch commissions' });
  }
});

// Create commission (automatic system call)
router.post('/commissions', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const data = createCommissionSchema.parse(req.body);
    const commission = await storage.createSalesCommission(data);
    res.json(commission);
  } catch (error: any) {
    console.error('Error creating commission:', error);
    res.status(500).json({ error: 'Failed to create commission' });
  }
});

// Approve pending commissions (super admin only)
router.post('/commissions/approve', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { commissionIds } = approveCommissionsSchema.parse(req.body);
    await storage.approvePendingCommissions(commissionIds);
    res.json({ message: 'Commissions approved successfully' });
  } catch (error: any) {
    console.error('Error approving commissions:', error);
    res.status(500).json({ error: 'Failed to approve commissions' });
  }
});

// Get pending commissions (super admin only)
router.get('/commissions/pending', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const pendingCommissions = await storage.getPendingCommissions();
    res.json(pendingCommissions);
  } catch (error: any) {
    console.error('Error fetching pending commissions:', error);
    res.status(500).json({ error: 'Failed to fetch pending commissions' });
  }
});

// ==================== STRIPE PAYOUT MANAGEMENT ====================

// Create commission payout via Stripe (super admin only)
router.post('/payouts', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { salesPersonId, commissionIds, totalAmount } = createPayoutSchema.parse(req.body);
    
    const salesPerson = await storage.getSalesPerson(salesPersonId);
    if (!salesPerson) {
      return res.status(404).json({ error: 'Sales person not found' });
    }

    if (!salesPerson.stripeAccountId) {
      return res.status(400).json({ error: 'Sales person must have connected Stripe account' });
    }

    // Create Stripe transfer
    const transfer = await stripe.transfers.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      destination: salesPerson.stripeAccountId,
      description: `Commission payout for ${salesPerson.name}`,
    });

    // Record payout in database
    const payout = await storage.createCommissionPayout({
      salesPersonId,
      totalAmount,
      commissionIds,
      stripePayoutId: transfer.id,
      payoutDate: new Date(),
      status: 'completed',
      metadata: { transferId: transfer.id }
    });

    // Update commission statuses to paid
    for (const commissionId of commissionIds) {
      await storage.updateSalesCommission(commissionId, {
        status: 'paid',
        isPaid: true,
        paidAt: new Date(),
        stripePayoutId: transfer.id
      });
    }

    res.json({ payout, transfer });
  } catch (error: any) {
    console.error('Error creating payout:', error);
    res.status(500).json({ error: 'Failed to create payout' });
  }
});

// Get payouts
router.get('/payouts', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let payouts;

    if (user.role === 'super_admin') {
      const salesPersonId = req.query.salesPersonId ? parseInt(req.query.salesPersonId as string) : undefined;
      
      if (salesPersonId) {
        payouts = await storage.getCommissionPayoutsBySalesPerson(salesPersonId);
      } else {
        payouts = await storage.getAllCommissionPayouts();
      }
    } else if (user.role === 'sales_staff') {
      const salesPerson = await storage.getSalesPersonByUserId(user.id);
      if (!salesPerson) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      payouts = await storage.getCommissionPayoutsBySalesPerson(salesPerson.id);
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(payouts);
  } catch (error: any) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

// ==================== ANALYTICS AND REPORTING ====================

// Get sales analytics (super admin only)
router.get('/analytics', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const totalRevenue = await storage.getTotalSalesRevenue();
    const monthlyCommissions = await storage.getMonthlyCommissionsSummary();
    const salesPeople = await storage.getAllSalesPeople();

    res.json({
      totalRevenue,
      monthlyCommissions,
      salesPeople,
      totalSalesStaff: salesPeople.length,
      activeSalesStaff: salesPeople.filter((sp: any) => sp.isActive).length
    });
  } catch (error: any) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
  }
});

// Get subscription plans for sales staff
router.get('/subscription-plans', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'sales_staff') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const plans = await storage.getActiveSubscriptionPlans();
    res.json(plans);
  } catch (error: any) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// Connect Stripe account for sales person
router.post('/connect-stripe', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const salesPerson = await storage.getSalesPersonByUserId(user.id);
    
    if (!salesPerson || user.role !== 'sales_staff') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: salesPerson.email,
      business_type: 'individual',
      individual: {
        email: salesPerson.email,
        first_name: salesPerson.name.split(' ')[0],
        last_name: salesPerson.name.split(' ').slice(1).join(' ') || 'Unknown'
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.protocol}://${req.get('host')}/sales/connect-stripe`,
      return_url: `${req.protocol}://${req.get('host')}/sales/dashboard`,
      type: 'account_onboarding',
    });

    // Update sales person with Stripe account ID
    await storage.updateSalesPerson(salesPerson.id, {
      stripeAccountId: account.id
    });

    res.json({ accountLink: accountLink.url, accountId: account.id });
  } catch (error: any) {
    console.error('Error connecting Stripe account:', error);
    res.status(500).json({ error: 'Failed to connect Stripe account' });
  }
});

// Update sales person profile
router.put('/profile', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'sales_staff') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const salesPerson = await storage.getSalesPersonByUserId(user.id);
    if (!salesPerson) {
      return res.status(404).json({ error: 'Sales person not found' });
    }

    const { name, email, phone, bankingDetails } = req.body;

    // Update sales person data
    const updatedSalesPerson = await storage.updateSalesPerson(salesPerson.id, {
      name,
      email,
      phone,
      bankingDetails
    });

    res.json(updatedSalesPerson);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Create new company (sales staff feature)
router.post('/companies', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'sales_staff') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const salesPerson = await storage.getSalesPersonByUserId(user.id);
    if (!salesPerson) {
      return res.status(404).json({ error: 'Sales person not found' });
    }

    const { name, contactEmail, phone, address, plan, billingPeriod } = req.body;

    // Plan pricing
    const planPrices = {
      starter: billingPeriod === 'yearly' ? 490 : 49,  // $49/month or $490/year
      pro: billingPeriod === 'yearly' ? 1290 : 129,    // $129/month or $1290/year  
      agency: billingPeriod === 'yearly' ? 2990 : 299  // $299/month or $2990/year
    };

    const planPrice = planPrices[plan as keyof typeof planPrices];

    // Create company
    const company = await storage.createCompany({
      name,
      contactEmail,
      phone,
      address,
      plan,
      domain: '', // To be filled later
      isActive: true,
      subscriptionStatus: 'trial'
    });

    // Create sales assignment
    await storage.createSalesAssignment({
      salesPersonId: salesPerson.id,
      companyId: company.id,
      subscriptionPlan: plan,
      billingPeriod: billingPeriod as 'monthly' | 'yearly',
      initialPlanPrice: planPrice.toString(),
      currentPlanPrice: planPrice.toString(),
      status: 'active'
    });

    // Calculate commission (10% of first payment)
    const commissionAmount = planPrice * 0.10;

    // Create signup commission
    await storage.createSalesCommission({
      salesPersonId: salesPerson.id,
      companyId: company.id,
      type: 'signup',
      amount: commissionAmount.toString(),
      baseAmount: planPrice.toString(),
      commissionRate: '0.10',
      billingPeriod: billingPeriod,
      paymentDate: new Date(),
      status: 'pending'
    });

    res.json({ 
      company, 
      message: 'Company created successfully. Commission pending approval.',
      commission: commissionAmount 
    });
  } catch (error: any) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: error.message || 'Failed to create company' });
  }
});

export default router;