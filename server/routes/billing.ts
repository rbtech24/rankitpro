import { Router, Request, Response } from 'express';
import { isAuthenticated, isCompanyAdmin } from '../middleware/auth';
import { storage } from '../storage';
import { z } from 'zod';
import stripeService from '../services/stripe-service';

const router = Router();

// Pricing plan IDs (would normally come from environment variables or database)
const STRIPE_PRICE_IDS = {
  starter: 'price_1OvXyzExample123Starter',
  pro: 'price_1OvXyzExample123Pro',
  agency: 'price_1OvXyzExample123Agency'
};

// Get subscription details
router.get('/subscription', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user.companyId) {
      return res.status(400).json({ message: 'User is not associated with a company' });
    }

    const company = await storage.getCompany(user.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // If user has no Stripe customer ID, return basic information
    if (!user.stripeCustomerId) {
      return res.json({
        plan: company.plan || 'starter',
        status: 'inactive',
        usage: await getUsageStats(company.id)
      });
    }

    // If user has a Stripe customer ID but no subscription, return customer info
    if (!user.stripeSubscriptionId) {
      return res.json({
        plan: company.plan || 'starter',
        status: 'inactive',
        customerId: user.stripeCustomerId,
        usage: await getUsageStats(company.id)
      });
    }

    // Get subscription details from Stripe
    const subscription = await stripeService.getSubscription(user.stripeSubscriptionId);
    
    // Get payment methods
    const paymentMethods = await stripeService.getCustomerPaymentMethods(user.stripeCustomerId);
    
    // Get invoices
    const invoices = await stripeService.getCustomerInvoices(user.stripeCustomerId);

    res.json({
      plan: company.plan || 'starter',
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      paymentMethods: paymentMethods.map(pm => ({
        id: pm.id,
        brand: pm.card?.brand || 'unknown',
        last4: pm.card?.last4 || '****',
        expMonth: pm.card?.exp_month || 0,
        expYear: pm.card?.exp_year || 0,
        isDefault: pm.id === subscription.default_payment_method
      })),
      invoices: invoices.map(invoice => ({
        id: invoice.id,
        number: invoice.number,
        amount: invoice.amount_paid / 100,
        status: invoice.status,
        date: new Date(invoice.created * 1000),
        url: invoice.hosted_invoice_url
      })),
      usage: await getUsageStats(company.id)
    });
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    res.status(500).json({ message: 'Error fetching subscription details' });
  }
});

// Create or update subscription
router.post('/subscription', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const planSchema = z.object({
      plan: z.enum(['starter', 'pro', 'agency'])
    });

    const parsedData = planSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ 
        message: 'Invalid plan data', 
        errors: parsedData.error.format() 
      });
    }

    const { plan } = parsedData.data;
    const user = req.user;
    
    if (!user.companyId) {
      return res.status(400).json({ message: 'User is not associated with a company' });
    }

    const company = await storage.getCompany(user.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Set the stripe price ID based on the plan
    const priceId = STRIPE_PRICE_IDS[plan];
    if (!priceId) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    let clientSecret: string | null = null;
    let customerId: string | null = null;
    let subscriptionId: string | null = null;

    // If no customer ID exists, create a new customer
    if (!user.stripeCustomerId) {
      customerId = await stripeService.createCustomer(user, company);
      await storage.updateUser(user.id, { stripeCustomerId: customerId });
      user.stripeCustomerId = customerId;
    } else {
      customerId = user.stripeCustomerId;
    }

    // If no subscription exists, create a new one
    if (!user.stripeSubscriptionId) {
      const result = await stripeService.createSubscription(customerId, priceId);
      clientSecret = result.clientSecret;
      subscriptionId = result.subscriptionId;
      
      // Update user with subscription ID
      await storage.updateUser(user.id, { stripeSubscriptionId: subscriptionId });
      
      // Update company plan
      await storage.updateCompany(company.id, { plan });
    } else {
      // Update existing subscription
      const result = await stripeService.updateSubscription(user.stripeSubscriptionId, priceId);
      clientSecret = result.clientSecret;
      subscriptionId = result.subscriptionId;
      
      // Update company plan
      await storage.updateCompany(company.id, { plan });
    }

    res.json({
      message: 'Subscription updated successfully',
      clientSecret,
      subscriptionId,
      plan
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Error updating subscription' });
  }
});

// Cancel subscription
router.post('/subscription/cancel', isAuthenticated, isCompanyAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    // Cancel the subscription at the end of the current period
    const subscription = await stripeService.getSubscription(user.stripeSubscriptionId);
    
    if (subscription.cancel_at_period_end) {
      return res.json({ 
        message: 'Subscription is already set to cancel at the end of the billing period',
        cancelDate: new Date(subscription.current_period_end * 1000)
      });
    }

    // Cancel the subscription at the end of the current period
    await stripeService.cancelSubscription(user.stripeSubscriptionId);
    
    res.json({ 
      message: 'Subscription will be canceled at the end of the current billing period',
      cancelDate: new Date(subscription.current_period_end * 1000)
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ message: 'Error canceling subscription' });
  }
});

// Helper function to get usage statistics
async function getUsageStats(companyId: number) {
  const stats = await storage.getCompanyStats(companyId);
  
  return {
    checkins: {
      used: stats.totalCheckins,
      limit: 50 // This would be based on the plan
    },
    blogPosts: {
      used: stats.blogPosts,
      limit: 20 // This would be based on the plan
    },
    technicians: {
      used: stats.activeTechs,
      limit: 2 // This would be based on the plan
    }
  };
}

export default router;