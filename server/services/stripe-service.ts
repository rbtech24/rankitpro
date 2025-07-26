import Stripe from "stripe";
import { storage } from "../storage";
import { User, Company } from "@shared/schema";

import { logger } from '../services/logger';
// Check if Stripe API key is available
if (!process.env.STRIPE_SECRET_KEY) {
  logger.warn("Stripe secret key not configured - payment functionality will be disabled");
}

// Initialize Stripe client conditionally based on API key availability
let stripe: Stripe | null = null;

// Only initialize Stripe if the API key is available
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16" as any,
  });
}

// Define price IDs for different subscription plans (monthly and yearly)
const PRICE_IDS = {
  starter_monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "price_1QVjyeJA4p6J7X8dMjQi4qCT",
  starter_yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || "price_starter_yearly_fallback",
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "price_1QVjzPJA4p6J7X8dGnH8fY2K",
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "price_pro_yearly_fallback",
  agency_monthly: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID || "price_1QVk0MJA4p6J7X8dZkL3nP9R",
  agency_yearly: process.env.STRIPE_AGENCY_YEARLY_PRICE_ID || "price_agency_yearly_fallback"
};

// Validate price IDs on startup
function validatePriceIds() {
  const requiredEnvVars = ['STRIPE_STARTER_PRICE_ID', 'STRIPE_PRO_PRICE_ID', 'STRIPE_AGENCY_PRICE_ID'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.warn(`Missing Stripe price environment variables: ${missingVars.join(', ')}`);
    logger.warn('Using fallback price IDs - payments may fail in production');
  }
}

// Run validation on module load
validatePriceIds();

// Monthly usage limits for each plan
const PLAN_LIMITS = {
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

export class StripeService {
  /**
   * Check if Stripe is available for use
   */
  isStripeAvailable(): boolean {
    return stripe !== null;
  }

  /**
   * Create a payment intent for processing payments
   */
  async createPaymentIntent(amount: number, currency: string = 'usd', metadata: any = {}): Promise<any> {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error: any) {
      logger.error("Failed to create payment intent", { errorMessage: error?.message || "Unknown error" });
      throw error;
    }
  }

  /**
   * Create or update Stripe price for a subscription plan
   * This eliminates the need to manually configure price IDs when prices change
   */
  async createOrUpdatePlanPrice(planName: string, amount: number, interval: 'month' | 'year'): Promise<string | null> {
    if (!this.isStripeAvailable()) {
      logger.warn('Stripe not available - skipping price creation');
      return null;
    }

    try {
      // Create a new price object in Stripe
      const price = await stripe!.prices.create({
        unit_amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: interval
        },
        product_data: {
          name: `Rank It Pro - ${planName}`,
          description: `${planName} subscription plan for Rank It Pro platform`
        },
        metadata: {
          plan: planName.toLowerCase(),
          interval: interval,
          created_by: 'rank_it_pro_admin'
        }
      });

      logger.info("Stripe price created successfully", { priceId: price.id, planName, amount, interval });
      return price.id;
    } catch (error) {
      logger.error("Failed to create Stripe price", { 
        errorMessage: error instanceof Error ? error.message : String(error),
        planName,
        amount,
        interval
      });
      return null;
    }
  }

  /**
   * Get the appropriate price ID for a plan, creating it if necessary
   */
  async getPriceId(planName: string, amount: number, interval: 'month' | 'year' = 'month'): Promise<string | null> {
    if (!this.isStripeAvailable()) {
      return null;
    }

    // Try to find existing price first
    try {
      const prices = await stripe!.prices.list({
        limit: 100,
        metadata: {
          plan: planName.toLowerCase(),
          interval: interval
        }
      });

      // Look for a price with the exact amount
      const exactPrice = prices.data.find(price => 
        price.unit_amount === Math.round(amount * 100) && 
        price.active
      );

      if (exactPrice) {
        return exactPrice.id;
      }

      // If no exact match, create a new price
      return await this.createOrUpdatePlanPrice(planName, amount, interval);
    } catch (error) {
      logger.error("Failed to find existing Stripe price", { 
        errorMessage: error instanceof Error ? error.message : String(error),
        planName,
        amount,
        interval
      });
      return await this.createOrUpdatePlanPrice(planName, amount, interval);
    }
  }

  /**
   * Map frontend plan identifiers to database plan names
   */
  private mapPlanToDatabase(plan: string): string {
    const planMapping: { [key: string]: string } = {
      'starter': 'Essential',
      'pro': 'Professional', 
      'agency': 'Enterprise'
    };
    return planMapping[plan] || plan;
  }

  /**
   * Get or create a subscription for a user
   */
  async getOrCreateSubscription(userId: number, plan: string): Promise<{
    clientSecret?: string;
    subscriptionId?: string;
    alreadySubscribed?: boolean;
  }> {
    // Return early if Stripe is not available
    if (!this.isStripeAvailable()) {
      logger.warn('Stripe not available - simulating subscription update');
      // Update plan in database without Stripe
      const user = await storage.getUser(userId);
      if (user && user.companyId) {
        await storage.updateCompany(user.companyId, { plan: plan as any });
      }
      return { alreadySubscribed: false };
    }
    
    // Validate plan
    if (!['starter', 'pro', 'agency'].includes(plan)) {
      throw new Error(`Invalid plan: ${plan}`);
    }
    
    // Get the actual plan from database using the mapped name
    const dbPlanName = this.mapPlanToDatabase(plan);
    const dbPlan = await storage.getSubscriptionPlanByName(dbPlanName);
    
    if (!dbPlan || !dbPlan.stripePriceId) {
      throw new Error(`No Stripe price ID found for plan: ${plan} (${dbPlanName})`);
    }
    
    const priceId = dbPlan.stripePriceId;
    
    // For development, simulate subscription with client secret if using dummy price IDs
    if (priceId.startsWith('price_1HgBKn')) {
      logger.warn('Using dummy Stripe price ID - simulating subscription with payment flow');
      
      // Return a dummy client secret to trigger the payment modal in development
      // The plan will be updated when the frontend confirms the "payment"
      return { 
        clientSecret: 'pi_dev_' + Date.now() + '_secret_dev',
        subscriptionId: 'dummy_sub_' + Date.now(),
        alreadySubscribed: false,
        developmentMode: true
      };
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // If user already has a subscription, retrieve it
      if (user.stripeSubscriptionId) {
        if (!stripe) {
          throw new Error('Stripe service is not available. Please configure STRIPE_SECRET_KEY.');
        }
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        // If user is already subscribed to this plan, return early
        if (subscription.items.data[0].price.id === priceId) {
          return { 
            subscriptionId: subscription.id,
            alreadySubscribed: true
          };
        }
        
        // Otherwise, update the subscription with the new plan
        if (!stripe) {
          throw new Error('Stripe service is not available. Please configure STRIPE_SECRET_KEY.');
        }
        const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
          items: [{
            id: subscription.items.data[0].id,
            price: priceId,
          }],
          payment_behavior: 'default_incomplete',
          proration_behavior: 'create_prorations',
          expand: ['latest_invoice.payment_intent'],
        });
        
        // Update the user in the database
        await storage.updateUserStripeInfo(user.id, {
          customerId: user.stripeCustomerId || '', 
          subscriptionId: updatedSubscription.id
        });
        
        // @ts-ignore - Property 'payment_intent' exists on type 'Invoice' even if TypeScript doesn't recognize it
        const clientSecret = updatedSubscription.latest_invoice?.payment_intent?.client_secret;
        
        return {
          subscriptionId: updatedSubscription.id,
          clientSecret: clientSecret
        };
      }
      
      // If the user doesn't have a stripe customer ID, create one
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        if (!stripe) {
          throw new Error('Stripe service is not available. Please configure STRIPE_SECRET_KEY.');
        }
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
          metadata: {
            userId: user.id.toString()
          }
        });
        
        customerId = customer.id;
        await storage.updateUser(user.id, { stripeCustomerId: customerId });
      }
      
      // Create a new subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: priceId,
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      
      // Update the user with the subscription ID
      await storage.updateUserStripeInfo(user.id, {
        customerId: customerId,
        subscriptionId: subscription.id
      });
      
      // @ts-ignore - Property 'payment_intent' exists on type 'Invoice' even if TypeScript doesn't recognize it
      const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;
      
      return {
        subscriptionId: subscription.id,
        clientSecret: clientSecret
      };
    } catch (error: any) {
      logger.error("Failed to create subscription", { 
        errorMessage: error instanceof Error ? error.message : String(error),
        plan,
        userId
      });
      throw new Error(`Failed to create subscription: ${error.message || error}`);
    }
  }
  
  /**
   * Cancel a user's subscription
   */
  async cancelSubscription(userId: number): Promise<{ success: true }> {
    // Return early if Stripe is not available
    if (!this.isStripeAvailable()) {
      return { success: true };
    }
    
    const user = await storage.getUser(userId);
    if (!user || !user.stripeSubscriptionId) {
      throw new Error("No active subscription found");
    }
    
    try {
      const subscription = await stripe!.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
      
      // Get the current_period_end as number (timestamps in Stripe are in seconds)
      const periodEnd = subscription.current_period_end as unknown as number;
      
      return {
        success: true,
        cancelDate: new Date(periodEnd * 1000).toISOString()
      };
    } catch (error: any) {
      logger.error("Unhandled error occurred");
      throw new Error("Failed to cancel subscription");
    }
  }
  
  /**
   * Get a user's subscription data
   */
  async getSubscriptionData(userId: number) {
    // Return default data if Stripe is not available
    if (!this.isStripeAvailable()) {
      return {
        status: "inactive",
        plan: "starter",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        paymentMethods: [],
        invoices: [],
        usage: {
          checkins: { success: true },
          blogPosts: { success: true },
          technicians: { success: true }
        }
      };
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // If user doesn't have a subscription, return empty data
    if (!user.stripeSubscriptionId) {
      return {
        status: "inactive",
        plan: "starter",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        paymentMethods: [],
        invoices: [],
        usage: {
          checkins: { success: true },
          blogPosts: { success: true },
          technicians: { success: true }
        }
      };
    }
    
    try {
      // Get subscription details
      const subscription = await stripe!.subscriptions.retrieve(user.stripeSubscriptionId);
      
      // Get the company for usage data
      const company = user.companyId ? await storage.getCompany(user.companyId) : null;
      
      // Get payment methods
      const paymentMethods = user.stripeCustomerId 
        ? await stripe!.paymentMethods.list({
            customer: user.stripeCustomerId,
            type: 'card'
          })
        : { data: [] };
      
      // Get invoices
      const invoices = user.stripeCustomerId 
        ? await stripe!.invoices.list({
            customer: user.stripeCustomerId,
            limit: 5
          })
        : { data: [] };
      
      // Get company usage statistics
      const companyStats = company 
        ? await storage.getCompanyStats(company.id)
        : { success: true };
      
      // Determine the plan from the subscription
      const planId = subscription.items.data[0].price.id;
      let plan = "starter";
      for (const [key, value] of Object.entries(PRICE_IDS)) {
        if (value === planId) {
          plan = key;
          break;
        }
      }
      
      const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];
      
      // Format invoice data
      const formattedInvoices = invoices.data.map(invoice => ({
        id: invoice.id,
        date: new Date(invoice.created * 1000).toISOString(),
        amount: invoice.amount_paid / 100,
        status: invoice.status,
        url: invoice.hosted_invoice_url || '#'
      }));
      
      // Format payment method data
      const formattedPaymentMethods = paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card?.brand || 'unknown',
        last4: pm.card?.last4 || '****',
        expMonth: pm.card?.exp_month || 0,
        expYear: pm.card?.exp_year || 0,
        isDefault: pm.id === subscription.default_payment_method
      }));
      
      // Get the current_period_end as number (timestamps in Stripe are in seconds)
      const periodEnd = subscription.current_period_end as unknown as number;
      
      return {
        status: subscription.status,
        plan,
        currentPeriodEnd: new Date(periodEnd * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        paymentMethods: formattedPaymentMethods,
        invoices: formattedInvoices,
        usage: {
          checkins: {
            used: companyStats.totalCheckins,
            limit: limits.checkins
          },
          blogPosts: {
            used: companyStats.blogPosts,
            limit: limits.blogPosts
          },
          technicians: {
            used: companyStats.activeTechs,
            limit: limits.technicians
          }
        }
      };
    } catch (error: any) {
      logger.error("Unhandled error occurred");
      throw new Error("Failed to get subscription data");
    }
  }
  
  /**
   * Create a payment intent for a one-time payment
   */
  async createPaymentIntent(amount: number, currency: string = 'usd', customerId?: string): Promise<string> {
    // Return empty string if Stripe is not available
    if (!this.isStripeAvailable()) {
      return '';
    }
    
    try {
      const paymentIntent = await stripe!.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        ...(customerId && { customer: customerId }),
      });
      
      return paymentIntent.client_secret || '';
    } catch (error: any) {
      logger.error("Unhandled error occurred");
      throw new Error("Failed to create payment intent");
    }
  }
  
  /**
   * Update a company's plan based on a user's subscription
   */
  async updateCompanyPlan(userId: number): Promise<void> {
    // Return early if Stripe is not available
    if (!this.isStripeAvailable()) {
      return;
    }
    
    const user = await storage.getUser(userId);
    if (!user || !user.companyId || !user.stripeSubscriptionId) {
      return;
    }
    
    try {
      const subscription = await stripe!.subscriptions.retrieve(user.stripeSubscriptionId);
      const planId = subscription.items.data[0].price.id;
      
      let plan = "starter";
      for (const [key, value] of Object.entries(PRICE_IDS)) {
        if (value === planId) {
          plan = key;
          break;
        }
      }
      
      // Update company plan and usage limit
      await storage.updateCompany(user.companyId, {
        plan: plan as "starter" | "pro" | "agency",
        usageLimit: PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS].checkins
      });
    } catch (error) {
      logger.error("Unhandled error occurred");
    }
  }
}

// Export a singleton instance
export const stripeService = new StripeService();