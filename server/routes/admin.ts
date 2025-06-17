import { Router } from 'express';
import { storage } from '../storage';
import { isSuperAdmin } from '../middleware/auth';
import { insertSubscriptionPlanSchema } from '@shared/schema';
import Stripe from 'stripe';

const router = Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Subscription Plan Management Routes

// Initialize predefined subscription plans
router.post('/initialize-plans', isSuperAdmin, async (req, res) => {
  try {
    // Check if plans already exist
    const existingPlans = await storage.getSubscriptionPlans();
    if (existingPlans.length > 0) {
      return res.json({ message: 'Subscription plans already exist', count: existingPlans.length });
    }

    // Create the three predefined plans
    const plans = [
      {
        name: 'Starter',
        price: '29.00',
        billingPeriod: 'monthly',
        maxTechnicians: 5,
        maxCheckIns: 100,
        features: [
          'Basic check-in tracking',
          'Photo uploads',
          'Email review requests',
          'Basic analytics',
          'WordPress integration'
        ],
        isActive: true
      },
      {
        name: 'Professional',
        price: '79.00',
        billingPeriod: 'monthly',
        maxTechnicians: 15,
        maxCheckIns: 500,
        features: [
          'All Starter features',
          'Advanced analytics',
          'Custom branding',
          'Audio testimonials',
          'Priority support',
          'API access'
        ],
        isActive: true
      },
      {
        name: 'Agency',
        price: '149.00',
        billingPeriod: 'monthly',
        maxTechnicians: -1, // Unlimited
        maxCheckIns: -1, // Unlimited
        features: [
          'All Professional features',
          'Unlimited technicians',
          'Unlimited check-ins',
          'Video testimonials',
          'White-label solution',
          'Dedicated support',
          'Custom integrations'
        ],
        isActive: true
      }
    ];

    const createdPlans = [];
    for (const planData of plans) {
      const plan = await storage.createSubscriptionPlan(planData);
      createdPlans.push(plan);
    }

    res.json({ 
      message: 'Successfully created subscription plans', 
      plans: createdPlans 
    });
  } catch (error) {
    console.error('Error initializing subscription plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all subscription plans
router.get('/subscription-plans', isSuperAdmin, async (req, res) => {
  try {
    const plans = await storage.getSubscriptionPlans();
    
    // Add subscriber count and revenue for each plan
    const plansWithStats = await Promise.all(plans.map(async (plan) => {
      const subscriberCount = await storage.getSubscriberCountForPlan(plan.id);
      const monthlyRevenue = await storage.getMonthlyRevenueForPlan(plan.id);
      
      return {
        ...plan,
        subscriberCount,
        monthlyRevenue
      };
    }));
    
    res.json(plansWithStats);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new subscription plan
router.post('/subscription-plans', isSuperAdmin, async (req, res) => {
  try {
    const validatedData = insertSubscriptionPlanSchema.parse(req.body);
    
    // Create Stripe product and price
    const stripeProduct = await stripe.products.create({
      name: validatedData.name,
      description: `${validatedData.name} subscription plan`,
    });

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(validatedData.price * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval: validatedData.billingPeriod === 'yearly' ? 'year' : 'month',
      },
    });

    // Create subscription plan in database
    const plan = await storage.createSubscriptionPlan({
      ...validatedData,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id
    });

    res.json(plan);
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update subscription plan
router.put('/subscription-plans/:id', isSuperAdmin, async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    const validatedData = insertSubscriptionPlanSchema.parse(req.body);
    
    const existingPlan = await storage.getSubscriptionPlan(planId);
    if (!existingPlan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    // Update Stripe product if it exists
    if (existingPlan.stripeProductId) {
      await stripe.products.update(existingPlan.stripeProductId, {
        name: validatedData.name,
        description: `${validatedData.name} subscription plan`,
      });
    }

    // Update subscription plan in database
    const updatedPlan = await storage.updateSubscriptionPlan(planId, validatedData);
    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete subscription plan
router.delete('/subscription-plans/:id', isSuperAdmin, async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    
    const existingPlan = await storage.getSubscriptionPlan(planId);
    if (!existingPlan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    // Check if plan has active subscribers
    const subscriberCount = await storage.getSubscriberCountForPlan(planId);
    if (subscriberCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete plan with active subscribers. Please migrate subscribers first.' 
      });
    }

    // Archive Stripe product if it exists
    if (existingPlan.stripeProductId) {
      await stripe.products.update(existingPlan.stripeProductId, {
        active: false,
      });
    }

    await storage.deleteSubscriptionPlan(planId);
    res.json({ message: 'Subscription plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Financial Dashboard Routes

// Get financial metrics
router.get('/financial/metrics', isSuperAdmin, async (req, res) => {
  try {
    const period = req.query.period as string || '12months';
    const metrics = await storage.getFinancialMetrics(period);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching financial metrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get revenue trends
router.get('/financial/revenue-trends', isSuperAdmin, async (req, res) => {
  try {
    const period = req.query.period as string || '12months';
    const trends = await storage.getRevenueTrends(period);
    res.json(trends);
  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment history
router.get('/financial/payments', isSuperAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const payments = await storage.getPaymentHistory(limit, offset);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subscription breakdown
router.get('/financial/subscription-breakdown', isSuperAdmin, async (req, res) => {
  try {
    const breakdown = await storage.getSubscriptionBreakdown();
    res.json(breakdown);
  } catch (error) {
    console.error('Error fetching subscription breakdown:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export financial data
router.get('/financial/export', isSuperAdmin, async (req, res) => {
  try {
    const period = req.query.period as string || '12months';
    const format = req.query.format as string || 'csv';
    
    const data = await storage.getFinancialExportData(period);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="financial_data_${period}.csv"`);
      
      // Convert to CSV format
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      res.send(csv);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error('Error exporting financial data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Webhook for Stripe events
router.post('/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await storage.handleSuccessfulPayment(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await storage.handleFailedPayment(event.data.object);
        break;
      case 'customer.subscription.created':
        await storage.handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await storage.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await storage.handleSubscriptionCanceled(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// System Overview Routes - Real data implementation

// Get system statistics
router.get('/system-stats', isSuperAdmin, async (req, res) => {
  try {
    const totalCompanies = await storage.getCompanyCount();
    const activeCompanies = await storage.getActiveCompaniesCount();
    const totalUsers = await storage.getUserCount();
    const totalTechnicians = await storage.getTechnicianCount();
    const totalCheckIns = await storage.getCheckInCount();
    const reviewStats = await storage.getSystemReviewStats();

    const stats = {
      totalCompanies,
      activeCompanies,
      totalUsers,
      totalTechnicians,
      totalCheckIns,
      avgRating: reviewStats.averageRating || 0,
      totalReviews: reviewStats.totalReviews || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chart data for system overview
router.get('/chart-data', isSuperAdmin, async (req, res) => {
  try {
    const checkIns = await storage.getCheckInChartData();
    const reviews = await storage.getReviewChartData();
    const companyGrowth = await storage.getCompanyGrowthData();
    const revenue = await storage.getRevenueChartData();

    const chartData = {
      checkIns,
      reviews,
      companyGrowth,
      revenue
    };

    res.json(chartData);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system health metrics
router.get('/system-health', isSuperAdmin, async (req, res) => {
  try {
    const healthMetrics = await storage.getSystemHealthMetrics();
    res.json(healthMetrics);
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activities
router.get('/recent-activities', isSuperAdmin, async (req, res) => {
  try {
    const activities = await storage.getRecentActivities();
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;