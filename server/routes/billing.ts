import express, { Request, Response } from 'express';
import { isAuthenticated, isCompanyAdmin } from '../middleware/auth';
import { stripeService } from '../services/stripe-service';
import { storage } from '../storage';

const router = express.Router();

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
    console.error('Error getting subscription data:', error);
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
    console.error('Error creating subscription:', error);
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
    console.error('Error canceling subscription:', error);
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
    console.error('Error creating payment intent:', error);
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
    console.error('Error getting usage stats:', error);
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

export default router;