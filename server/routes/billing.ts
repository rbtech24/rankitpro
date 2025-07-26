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
    const plans = await storage.getAllSubscriptionPlans();
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
 * Create or update a subscription for the current user's company
 */
router.post('/subscription', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    
    if (!plan || !['starter', 'pro', 'agency'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan specified' });
    }
    
    // @ts-ignore - userId does exist on req.user
    const userId = req.user.id;
    
    // Create or update subscription
    const result = await stripeService.getOrCreateSubscription(userId, plan);
    
    // If the user is already subscribed to this plan
    if (result.alreadySubscribed) {
      return res.json({ 
        message: 'Already subscribed to this plan',
        alreadySubscribed: true,
        subscriptionId: result.subscriptionId
      });
    }
    
    // If there's no client secret, subscription was updated without requiring payment
    if (!result.clientSecret) {
      // Update company plan
      await stripeService.updateCompanyPlan(userId);
      
      return res.json({ 
        message: 'Subscription updated successfully',
        subscriptionId: result.subscriptionId
      });
    }
    
    // Return the client secret for the frontend to complete the payment
    res.json({ 
      clientSecret: result.clientSecret,
      subscriptionId: result.subscriptionId
    });
  } catch (error: any) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ 
      error: 'Failed to create or update subscription',
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

export default router;