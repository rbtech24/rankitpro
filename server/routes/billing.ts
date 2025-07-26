import express, { Request, Response } from 'express';
import { isAuthenticated, isCompanyAdmin, isSuperAdmin } from '../middleware/auth';
import { stripeService } from '../services/stripe-service';
import { storage } from '../storage';

import { logger } from '../services/logger';
const router = express.Router();

/**
 * Get all subscription plans (admin only)
 */
router.get('/plans', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const plans = await storage.getActiveSubscriptionPlans();
    res.json(plans);
  } catch (error: any) {
    logger.error("Storage operation error", { errorMessage: error?.message || "Unknown error" });
    res.status(500).json({ 
      error: 'Failed to retrieve subscription plans',
      message: error.message
    });
  }
});

/**
 * Create a new subscription plan with Stripe integration (admin only)
 */
router.post('/plans', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { name, price, yearlyPrice, billingPeriod, maxTechnicians, maxCheckIns, features, isActive } = req.body;

    if (!name || !price || !features) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create plan in database first
    const newPlan = await storage.createSubscriptionPlan({
      name,
      price,
      yearlyPrice: yearlyPrice || null,
      billingPeriod: billingPeriod || 'monthly',
      maxTechnicians: maxTechnicians || 5,
      maxCheckIns: maxCheckIns || 50,
      features: Array.isArray(features) ? features : [features],
      isActive: isActive !== undefined ? isActive : true
    });

    // Auto-sync with Stripe
    try {
      const stripeProductId = await stripeService.createOrUpdatePlanPrice(
        name, 
        parseFloat(price), 
        billingPeriod === 'yearly' ? 'year' : 'month'
      );

      if (stripeProductId) {
        // Update plan with Stripe IDs
        await storage.updateSubscriptionPlan(newPlan.id, {
          stripePriceId: stripeProductId
        });
        newPlan.stripePriceId = stripeProductId;
      }
    } catch (stripeError: any) {
      logger.warn("Stripe sync failed during plan creation", { errorMessage: stripeError?.message || "Unknown error" });
    }

    res.json(newPlan);
  } catch (error: any) {
    logger.error("Storage operation error", { errorMessage: error?.message || "Unknown error" });
    res.status(500).json({ 
      error: 'Failed to create subscription plan',
      message: error.message
    });
  }
});

/**
 * Update a subscription plan with Stripe sync (admin only)
 */
router.put('/plans/:id', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedPlan = await storage.updateSubscriptionPlan(parseInt(id), updates);

    if (!updatedPlan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    // Auto-sync with Stripe if price changed
    if (updates.price || updates.name) {
      try {
        const stripeProductId = await stripeService.createOrUpdatePlanPrice(
          updatedPlan.name, 
          parseFloat(updatedPlan.price), 
          updatedPlan.billingPeriod === 'yearly' ? 'year' : 'month'
        );

        if (stripeProductId && stripeProductId !== updatedPlan.stripePriceId) {
          // Update plan with new Stripe ID
          await storage.updateSubscriptionPlan(parseInt(id), {
            stripePriceId: stripeProductId
          });
          updatedPlan.stripePriceId = stripeProductId;
        }
      } catch (stripeError: any) {
        logger.warn("Stripe sync failed during plan update", { errorMessage: stripeError?.message || "Unknown error" });
      }
    }

    res.json(updatedPlan);
  } catch (error: any) {
    logger.error("Storage operation error", { errorMessage: error?.message || "Unknown error" });
    res.status(500).json({ 
      error: 'Failed to update subscription plan',
      message: error.message
    });
  }
});

/**
 * Delete a subscription plan (admin only)
 */
router.delete('/plans/:id', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const success = await storage.deleteSubscriptionPlan(parseInt(id));

    if (!success) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    res.json({ 
      message: 'Subscription plan deleted successfully',
      id: parseInt(id)
    });
  } catch (error: any) {
    logger.error("Storage operation error", { errorMessage: error?.message || "Unknown error" });
    res.status(500).json({ 
      error: 'Failed to delete subscription plan',
      message: error.message
    });
  }
});

/**
 * Sync all plans with Stripe (admin only)
 */
router.post('/plans/sync', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const plans = await storage.getAllSubscriptionPlans();
    const syncResults = [];

    for (const plan of plans) {
      try {
        // Extract numeric price from database value
        const numericPrice = typeof plan.price === 'string' 
          ? parseFloat(plan.price.replace('$', '')) 
          : parseFloat(plan.price);

        const stripeProductId = await stripeService.createOrUpdatePlanPrice(
          plan.name, 
          numericPrice, 
          plan.billingPeriod === 'yearly' ? 'year' : 'month'
        );

        if (stripeProductId) {
          await storage.updateSubscriptionPlan(plan.id, {
            stripePriceId: stripeProductId
          });

          syncResults.push({
            planId: plan.id,
            planName: plan.name,
            stripePriceId: stripeProductId,
            success: true
          });
        } else {
          syncResults.push({
            planId: plan.id,
            planName: plan.name,
            success: false,
            error: 'Failed to create Stripe price'
          });
        }
      } catch (error: any) {
        syncResults.push({
          planId: plan.id,
          planName: plan.name,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      message: 'Stripe sync completed',
      results: syncResults
    });
  } catch (error: any) {
    logger.error("Stripe sync operation failed", { errorMessage: error?.message || "Unknown error" });
    res.status(500).json({ 
      error: 'Failed to sync plans with Stripe',
      message: error.message
    });
  }
});

/**
 * Get subscription information for the current user's company
 */
router.get('/subscription', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    // @ts-ignore - userId does exist on req.user
    const userId = req.user.id;

    // Get subscription data
    const subscriptionData = await stripeService.getSubscriptionData(userId);

    // Return subscription data
    res.json(subscriptionData);
  } catch (error: any) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ 
      error: 'Failed to retrieve subscription information',
      message: error.message
    });
  }
});

/**
 * Create or update subscription with real Stripe integration
 */
router.post('/subscription', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const { planId, billingPeriod } = req.body;
    const user = req.user as any;
    const companyId = user.companyId;

    // Debug logging to understand what's being received
    logger.info("Billing subscription request received", { 
      planId, 
      planIdType: typeof planId,
      billingPeriod,
      companyId,
      requestBody: req.body
    });

    if (!planId || !billingPeriod) {
      return res.status(400).json({ error: 'Plan ID and billing period are required' });
    }

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found in session' });
    }

    // Get the current company data
    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get plan details from database
    const planDetails = await storage.getSubscriptionPlan(planId);
    if (!planDetails) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    // Determine the price based on billing period
    const price = billingPeriod === 'yearly' ? 
      (planDetails.yearlyPrice || planDetails.price * 12) : 
      planDetails.price;

    // Development mode: Only bypass Stripe if BYPASS_STRIPE environment variable is set
    if (process.env.BYPASS_STRIPE === 'true') {
      logger.info("Stripe bypass mode enabled: Updating plan directly", { 
        companyId, 
        planId, 
        planName: planDetails.name,
        billingPeriod 
      });

      // Update company plan directly in bypass mode
      await storage.updateCompany(companyId, { 
        plan: planDetails.name.toLowerCase() as any
      });

      // Create payment success notification
      try {
        await storage.createNotification({
          userId: user.id,
          companyId: companyId,
          type: 'payment_success',
          title: 'Account Reactivated! 🎉',
          message: `Your ${planDetails.name} subscription is now active. All features have been restored and your account is ready to use.`,
          data: {
            planName: planDetails.name,
            amount: price,
            billingPeriod: billingPeriod,
            activatedAt: new Date().toISOString()
          }
        });
      } catch (notificationError) {
        logger.warn("Failed to create payment success notification", { 
          errorMessage: notificationError?.message || "Unknown error" 
        });
      }

      return res.json({
        success: true,
        planId: planId,
        planName: planDetails.name,
        billingPeriod: billingPeriod,
        amount: price,
        message: 'Plan updated successfully (bypass mode)',
        devMode: true
      });
    }

    // Check if Stripe is available, if not use development mode for testing
    if (!stripeService.isStripeAvailable()) {
      logger.warn("Stripe not available, using development mode for testing", { 
        companyId, 
        planId, 
        planName: planDetails.name,
        billingPeriod 
      });

      // Update company plan directly in development mode when Stripe isn't available
      await storage.updateCompany(companyId, { 
        plan: planDetails.name.toLowerCase() as any
      });

      // Create payment success notification
      try {
        await storage.createNotification({
          userId: user.id,
          companyId: companyId,
          type: 'payment_success',
          title: 'Account Reactivated! 🎉',
          message: `Your ${planDetails.name} subscription is now active. All features have been restored and your account is ready to use.`,
          data: {
            planName: planDetails.name,
            amount: price,
            billingPeriod: billingPeriod,
            activatedAt: new Date().toISOString()
          }
        });
      } catch (notificationError) {
        logger.warn("Failed to create payment success notification", { 
          errorMessage: notificationError?.message || "Unknown error" 
        });
      }

      return res.json({
        success: true,
        planId: planId,
        planName: planDetails.name,
        billingPeriod: billingPeriod,
        amount: price,
        message: 'Plan updated successfully (development mode - Stripe unavailable)',
        devMode: true
      });
    }

    try {
      // Create Stripe payment intent for the plan
      const paymentIntent = await stripeService.createPaymentIntent(
        Math.round(price * 100), // Convert to cents
        'usd',
        {
          companyId: companyId,
          planId: planId,
          billingPeriod: billingPeriod,
          planName: planDetails.name
        }
      );

      if (!paymentIntent.client_secret) {
        throw new Error('Failed to create payment intent');
      }

      return res.json({
        clientSecret: paymentIntent.client_secret,
        planId: planId,
        planName: planDetails.name,
        billingPeriod: billingPeriod,
        amount: price,
        message: 'Payment intent created successfully'
      });
    } catch (stripeError: any) {
      logger.error("Stripe payment intent creation failed", { 
        errorMessage: stripeError?.message || "Unknown error",
        companyId,
        planId,
        planName: planDetails.name
      });

      return res.status(500).json({
        error: 'Payment processing failed',
        message: stripeError.message || 'Unable to process payment. Please try again or contact support.',
        details: stripeError.message
      });
    }



  } catch (error: any) {
    logger.error("Subscription creation error", { errorMessage: error?.message || "Unknown error" });
    res.status(500).json({
      error: 'Failed to process subscription request',
      message: error.message
    });
  }
});

/**
 * Cancel the current user's subscription
 */
router.post('/subscription/cancel', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    // @ts-ignore - userId does exist on req.user
    const userId = req.user.id;

    // Cancel subscription
    const result = await stripeService.cancelSubscription(userId);

    res.json({ 
      message: 'Subscription canceled successfully',
      cancelDate: result.cancelDate
    });
  } catch (error: any) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      message: error.message
    });
  }
});

/**
 * Create a payment intent for a one-time payment
 */
router.post('/payment-intent', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount specified' });
    }

    // @ts-ignore - userId does exist on req.user
    const userId = req.user.id;
    const user = await storage.getUser(userId);

    // Create payment intent
    const clientSecret = await stripeService.createPaymentIntent(
      amount,
      currency || 'usd',
      user?.stripeCustomerId || undefined
    );

    res.json({ clientSecret });
  } catch (error: any) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      message: error.message
    });
  }
});

/**
 * Get usage statistics for the current user's company
 */
router.get('/usage', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    // @ts-ignore - userId does exist on req.user
    const userId = req.user.id;
    const user = await storage.getUser(userId);

    if (!user || !user.companyId) {
      return res.status(400).json({ error: 'No company associated with this user' });
    }

    // Get usage statistics
    const stats = await getUsageStats(user.companyId);

    res.json(stats);
  } catch (error: any) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ 
      error: 'Failed to retrieve usage statistics',
      message: error.message
    });
  }
});

/**
 * Get detailed usage statistics for a company
 */
async function getUsageStats(companyId: number) {
  const company = await storage.getCompany(companyId);
  if (!company) {
    throw new Error('Company not found');
  }

  // Get company stats from storage
  const stats = await storage.getCompanyStats(companyId);

  // Get plan limits
  const planLimits = {
    starter: {
      checkins: 50,
      blogPosts: 20,
      technicians: 2
    },
    pro: {
      checkins: 200,
      blogPosts: 50,
      technicians: 5
    },
    agency: {
      checkins: 500,
      blogPosts: 100,
      technicians: 15
    }
  };

  // Set plan to starter if not defined
  const plan = company.plan || 'starter';
  const limits = planLimits[plan];

  // Format the response
  return {
    plan,
    usage: {
      checkins: {
        used: stats.totalCheckins,
        limit: limits.checkins,
        percentage: Math.round((stats.totalCheckins / limits.checkins) * 100)
      },
      blogPosts: {
        used: stats.blogPosts,
        limit: limits.blogPosts,
        percentage: Math.round((stats.blogPosts / limits.blogPosts) * 100)
      },
      technicians: {
        used: stats.activeTechs,
        limit: limits.technicians,
        percentage: Math.round((stats.activeTechs / limits.technicians) * 100)
      }
    }
  };
}

/**
 * Manually sync a subscription plan with Stripe
 */
router.post('/plans/:id/sync-stripe', isAuthenticated, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get the plan first
    const plans = await storage.getAllSubscriptionPlans();
    const plan = plans.find(p => p.id === parseInt(id));

    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    // Sync with Stripe
    const stripeProductId = await stripeService.createOrUpdatePlanPrice(
      plan.name, 
      parseFloat(plan.price), 
      plan.billingPeriod === 'yearly' ? 'year' : 'month'
    );

    if (!stripeProductId) {
      return res.status(500).json({ error: 'Failed to sync with Stripe' });
    }

    // Update plan with Stripe ID
    const updatedPlan = await storage.updateSubscriptionPlan(parseInt(id), {
      stripePriceId: stripeProductId
    });

    res.json(updatedPlan);
  } catch (error: any) {
    logger.error("Stripe sync error", { errorMessage: error?.message || "Unknown error" });
    res.status(500).json({ 
      error: 'Failed to sync with Stripe',
      message: error.message
    });
  }
});

/**
 * Complete development payment simulation
 */
router.post('/subscription/complete-development', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;

    if (!plan) {
      return res.status(400).json({ error: 'Plan is required' });
    }

    // @ts-ignore - userId does exist on req.user
    const userId = req.user.id;
    const user = await storage.getUser(userId);

    if (!user || !user.companyId) {
      return res.status(400).json({ error: 'User or company not found' });
    }

    // Map new plan names to old ones for database compatibility
    let dbPlan = plan;
    if (plan === 'essential') dbPlan = 'starter';
    if (plan === 'professional') dbPlan = 'pro';
    if (plan === 'enterprise') dbPlan = 'agency';

    // Update company plan
    await storage.updateCompany(user.companyId, { plan: dbPlan as any });

    logger.info("Development payment simulation completed", { 
      userId,
      companyId: user.companyId,
      plan: dbPlan,
      originalPlan: plan
    });

    res.json({ 
      success: true,
      message: 'Plan updated successfully',
      plan: dbPlan
    });
  } catch (error: any) {
    logger.error("Failed to complete development payment", { 
      errorMessage: error instanceof Error ? error.message : String(error),
      plan: req.body.plan,
      userId: req.user?.id
    });
    res.status(500).json({ 
      error: 'Failed to complete development payment',
      message: error.message || error
    });
  }
});

export default router;