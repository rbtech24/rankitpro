import { Router } from 'express';
import { storage } from '../storage';
import { isSuperAdmin } from '../middleware/auth';
import { insertSubscriptionPlanSchema } from '@shared/schema';
import Stripe from 'stripe';

import { logger } from '../services/logger';
const router = Router();

// Financial dashboard endpoints for super admin
router.get('/financial/metrics', isSuperAdmin, async (req, res) => {
  try {
    const companies = await storage.getAllCompanies();
    
    // Mock financial metrics for demo - in production, integrate with Stripe
    const metrics = {
      totalRevenue: companies.length * 2400, // $2400 average per company
      monthlyRecurringRevenue: companies.length * 197, // Average plan price
      totalSubscriptions: companies.length,
      activeSubscriptions: companies.filter(c => c.isActive !== false).length,
      churnRate: 0.05, // 5% monthly churn
      averageRevenuePerUser: 197,
      lifetimeValue: 2400,
      totalPayments: companies.length * 12, // 12 payments per company
      failedPayments: Math.floor(companies.length * 0.02), // 2% failure rate
      refunds: Math.floor(companies.length * 0.01), // 1% refund rate
      netRevenue: companies.length * 2300 // After refunds/fees
    };
    
    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching financial metrics', { error });
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/financial/revenue-trends', isSuperAdmin, async (req, res) => {
  try {
    // Generate demo revenue trends data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueData = months.map((month, index) => ({
      month,
      revenue: 15000 + (index * 2000) + Math.random() * 3000,
      subscriptions: 50 + (index * 5) + Math.floor(Math.random() * 10),
      newSignups: 8 + Math.floor(Math.random() * 12),
      churn: 2 + Math.floor(Math.random() * 5)
    }));
    
    res.json(revenueData);
  } catch (error) {
    logger.error('Error fetching revenue trends', { error });
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/financial/payments', isSuperAdmin, async (req, res) => {
  try {
    const companies = await storage.getAllCompanies();
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Generate demo payment data based on actual companies
    const payments = companies.slice(0, limit).map((company, index) => ({
      id: `pay_${company.id}_${Date.now()}`,
      companyName: company.name,
      amount: company.plan === 'starter' ? 97 : company.plan === 'professional' ? 197 : 397,
      status: Math.random() > 0.95 ? 'failed' : 'success',
      paymentMethod: 'Visa ****1234',
      date: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString(),
      subscriptionPlan: company.plan || 'starter'
    }));
    
    res.json(payments);
  } catch (error) {
    logger.error('Error fetching payments', { error });
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/financial/subscription-breakdown', isSuperAdmin, async (req, res) => {
  try {
    const companies = await storage.getAllCompanies();
    
    const planCounts = {
      starter: companies.filter(c => c.plan === 'starter').length,
      professional: companies.filter(c => c.plan === 'professional').length,
      enterprise: companies.filter(c => c.plan === 'enterprise').length
    };
    
    const subscriptionBreakdown = [
      {
        planName: 'Essential',
        subscribers: planCounts.starter,
        revenue: planCounts.starter * 97,
        percentage: companies.length > 0 ? Math.round((planCounts.starter / companies.length) * 100) : 0,
        color: '#0088FE'
      },
      {
        planName: 'Professional',
        subscribers: planCounts.professional,
        revenue: planCounts.professional * 197,
        percentage: companies.length > 0 ? Math.round((planCounts.professional / companies.length) * 100) : 0,
        color: '#00C49F'
      },
      {
        planName: 'Enterprise',
        subscribers: planCounts.enterprise,
        revenue: planCounts.enterprise * 397,
        percentage: companies.length > 0 ? Math.round((planCounts.enterprise / companies.length) * 100) : 0,
        color: '#FFBB28'
      }
    ];
    
    res.json(subscriptionBreakdown);
  } catch (error) {
    logger.error('Error fetching subscription breakdown', { error });
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/financial/export', isSuperAdmin, async (req, res) => {
  try {
    // Return CSV export of financial data
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-data.csv');
    
    const csvData = `Date,Company,Plan,Amount,Status\n${new Date().toISOString().split('T')[0]},Sample Export,Professional,$197,Success\n`;
    res.send(csvData);
  } catch (error) {
    logger.error('Error exporting financial data', { error });
    res.status(500).json({ message: 'Server error' });
  }
});

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
      return res.json({ success: true });
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
    logger.error("Unhandled error occurred");
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
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new subscription plan
router.post('/subscription-plans', isSuperAdmin, async (req, res) => {
  try {
    logger.info("Converted logger call");
    
    // Validate the request data - convert price to string
    const requestData = {
      ...req.body,
      price: req.body.price.toString() // Convert number to string for schema validation
    };
    const validatedData = insertSubscriptionPlanSchema.parse(requestData);
    logger.info('Validated data:', { validatedData });
    
    // Create Stripe product and price
    const stripeProduct = await stripe.products.create({
      name: validatedData.name,
      description: "placeholder-text",
    });

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(Number(validatedData.price) * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval: validatedData.billingPeriod === 'yearly' ? 'year' : 'month',
      },
    });

    // Create subscription plan in database
    const plan = await storage.createSubscriptionPlan({
      ...validatedData,
      price: validatedData.price.toString(), // Ensure price is string for database
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id
    });

    logger.info('Created plan:', { plan });
    res.json(plan);
  } catch (error) {
    logger.error("Unhandled error occurred");
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
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
        description: "placeholder-text",
      });
    }

    // Update subscription plan in database
    const updatedPlan = await storage.updateSubscriptionPlan(planId, validatedData);
    res.json(updatedPlan);
  } catch (error) {
    logger.error("Unhandled error occurred");
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
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Financial Dashboard Routes

// Get financial metrics
router.get('/financial/metrics', isSuperAdmin, async (req, res) => {
  try {
    const metrics = await storage.getFinancialMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error("Unhandled error occurred");
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
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment history
router.get('/financial/payments', isSuperAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const payments = await storage.getPaymentHistory(limit);
    res.json(payments);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Get signup metrics
router.get('/signup-metrics', isSuperAdmin, async (req, res) => {
  try {
    const period = req.query.period as string || '12months';
    const signups = await storage.getSignupMetrics(period);
    res.json(signups);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subscription breakdown
router.get('/financial/subscription-breakdown', isSuperAdmin, async (req, res) => {
  try {
    const breakdown = await storage.getSubscriptionBreakdown();
    res.json(breakdown);
  } catch (error) {
    logger.error("Unhandled error occurred");
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
      res.setHeader('Content-Disposition', "System message");
      
      // Convert to CSV format
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      res.send(csv);
    } else {
      res.json(data);
    }
  } catch (error) {
    logger.error("Unhandled error occurred");
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
        logger.info("Unhandled event type ", {});
    }
    
    res.json({ received: true });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(400).send("System message");
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
    logger.error("Unhandled error occurred");
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
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system health metrics
router.get('/system-health', isSuperAdmin, async (req, res) => {
  try {
    const healthMetrics = await storage.getSystemHealthMetrics();
    res.json(healthMetrics);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activities
router.get('/recent-activities', isSuperAdmin, async (req, res) => {
  try {
    const activities = await storage.getRecentActivities();
    res.json(activities);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all companies for admin management
router.get('/companies', isSuperAdmin, async (req, res) => {
  try {
    const companies = await storage.getAllCompanies();
    
    // Add status calculation based on trial period and subscription
    const companiesWithStatus = companies.map(company => {
      let status = 'Inactive';
      
      // Check if company has active trial period
      if (company.trialEndDate && new Date(company.trialEndDate) > new Date()) {
        status = 'Active';
      }
      // Check if company has active Stripe subscription
      else if (company.stripeSubscriptionId) {
        status = 'Active';
      }
      
      return {
        ...company,
        status
      };
    });
    
    res.json(companiesWithStatus);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent system activity
router.get('/recent-activity', isSuperAdmin, async (req, res) => {
  try {
    const activities = await storage.getRecentActivity();
    res.json(activities);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Super Admin Analytics Dashboard
router.get('/analytics/dashboard', isSuperAdmin, async (req, res) => {
  try {
    // Get comprehensive analytics data
    const systemStats = {
      totalCompanies: await storage.getCompanyCount(),
      activeCompanies: await storage.getActiveCompaniesCount(),
      totalUsers: await storage.getUserCount(),
      totalTechnicians: await storage.getTechnicianCount(),
      totalCheckIns: await storage.getCheckInCount(),
      totalReviews: await storage.getReviewCount(),
      avgRating: (await storage.getSystemReviewStats()).averageRating || 0
    };

    const financialMetrics = await storage.getFinancialMetrics();
    const recentActivities = await storage.getRecentActivities();
    const chartData = {
      checkIns: await storage.getCheckInChartData(),
      reviews: await storage.getReviewChartData(),
      companyGrowth: await storage.getCompanyGrowthData(),
      revenue: await storage.getRevenueChartData()
    };

    const subscriptionBreakdown = await storage.getSubscriptionBreakdown();
    const systemHealth = await storage.getSystemHealthMetrics();

    res.json({
      systemStats,
      financialMetrics,
      recentActivities,
      chartData,
      subscriptionBreakdown,
      systemHealth,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// User Management for Super Admin
router.get('/users', isSuperAdmin, async (req, res) => {
  try {
    const allUsers = await storage.getAllUsers();
    
    // Add additional user information
    const usersWithStats = allUsers.map(user => ({
      ...user,
      lastLogin: user.lastLoginAt || 'Never',
      status: user.isActive ? 'Active' : 'Inactive',
      checkInCount: 0, // Would be calculated from user's check-ins
      companyName: user.companyName || 'No Company'
    }));

    res.json(usersWithStats);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// Company Management with Enhanced Data
router.get('/companies/detailed', isSuperAdmin, async (req, res) => {
  try {
    const companies = await storage.getAllCompanies();
    
    // Add detailed metrics for each company
    const companiesWithMetrics = await Promise.all(
      companies.map(async (company) => {
        const checkInCount = await storage.getCheckInCountByCompany(company.id);
        const reviewCount = await storage.getReviewCountByCompany(company.id);
        const userCount = await storage.getUserCountByCompany(company.id);
        const avgRating = await storage.getAverageRatingByCompany(company.id);

        return {
          ...company,
          metrics: {
            checkIns: checkInCount,
            reviews: reviewCount,
            users: userCount,
            averageRating: avgRating,
            monthlyRevenue: company.plan === 'starter' ? 29 : company.plan === 'pro' ? 79 : 149,
            lastActivity: await storage.getLastActivityByCompany(company.id)
          }
        };
      })
    );

    res.json(companiesWithMetrics);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Server error' });
  }
});

// API Endpoint Testing Tool
router.get('/test-endpoints', isSuperAdmin, async (req, res) => {
  const testResults = [];
  
  // Test all admin endpoints
  const endpoints = [
    { success: true },
    { success: true },
    { success: true },
    { success: true },
    { success: true },
    { success: true },
    { success: true },
    { success: true },
    { success: true },
    { success: true },
    { success: true }
  ];

  for (const endpoint of endpoints) {
    try {
      let result;
      const startTime = Date.now();
      
      switch (endpoint.path) {
        case '/api/admin/system-stats':
          result = {
            totalCompanies: await storage.getCompanyCount(),
            activeCompanies: await storage.getActiveCompaniesCount(),
            totalUsers: await storage.getUserCount(),
            totalTechnicians: await storage.getTechnicianCount(),
            totalCheckIns: await storage.getCheckInCount(),
            reviewStats: await storage.getSystemReviewStats()
          };
          break;
        case '/api/admin/chart-data':
          result = {
            checkIns: await storage.getCheckInChartData(),
            reviews: await storage.getReviewChartData(),
            companyGrowth: await storage.getCompanyGrowthData(),
            revenue: await storage.getRevenueChartData()
          };
          break;
        case '/api/admin/system-health':
          result = await storage.getSystemHealthMetrics();
          break;
        case '/api/admin/companies':
          result = await storage.getAllCompanies();
          break;
        case '/api/admin/recent-activity':
          result = await storage.getRecentActivity();
          break;
        case '/api/admin/recent-activities':
          result = await storage.getRecentActivities();
          break;
        case '/api/companies':
          result = await storage.getAllCompanies();
          break;
        case '/api/check-ins':
          result = await storage.getCheckInsByCompany(1);
          break;
        case '/api/reviews':
          result = await storage.getReviewsByCompany(1);
          break;
        case '/api/blog-posts':
          result = await storage.getBlogPostsByCompany(1);
          break;
        case '/api/auth/me':
          result = { status: 'authentication endpoint - requires session' };
          break;
        default:
          result = { error: 'Endpoint not implemented in test' };
      }
      
      const responseTime = Date.now() - startTime;
      
      testResults.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        status: 'success',
        responseTime: "placeholder-text",
        dataSize: JSON.stringify(result).length,
        sampleData: typeof result === 'object' ? Object.keys(result) : result
      });
      
    } catch (error) {
      testResults.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        status: 'error',
        error: error.message,
        responseTime: 'timeout'
      });
    }
  }

  res.json({
    timestamp: new Date().toISOString(),
    totalEndpoints: endpoints.length,
    successCount: testResults.filter(r => r.status === 'success').length,
    errorCount: testResults.filter(r => r.status === 'error').length,
    results: testResults
  });
});

export default router;