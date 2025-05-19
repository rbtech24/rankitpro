import Stripe from 'stripe';
import { User, Company } from '../../shared/schema';

// Initialize Stripe with the secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set. Stripe functionality will be disabled.');
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

class StripeService {
  private isAvailable(): boolean {
    return !!process.env.STRIPE_SECRET_KEY;
  }

  /**
   * Create a new customer in Stripe
   */
  async createCustomer(user: User, company: Company): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Stripe service is not available');
    }

    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: company.name,
        metadata: {
          userId: String(user.id),
          companyId: String(company.id)
        }
      });

      return customer.id;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create Stripe customer');
    }
  }

  /**
   * Create a subscription for a customer
   */
  async createSubscription(
    customerId: string,
    planId: string,
    trialDays = 0
  ): Promise<{
    subscriptionId: string;
    clientSecret: string | null;
  }> {
    if (!this.isAvailable()) {
      throw new Error('Stripe service is not available');
    }

    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: planId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        trial_period_days: trialDays > 0 ? trialDays : undefined,
      });

      // Get the client secret from the latest invoice's payment intent
      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
      const clientSecret = paymentIntent?.client_secret || null;

      return {
        subscriptionId: subscription.id,
        clientSecret
      };
    } catch (error) {
      console.error('Error creating Stripe subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Update a subscription's price
   */
  async updateSubscription(
    subscriptionId: string,
    planId: string
  ): Promise<{
    subscriptionId: string;
    clientSecret: string | null;
  }> {
    if (!this.isAvailable()) {
      throw new Error('Stripe service is not available');
    }

    try {
      // Get the subscription items
      const subscriptionItems = await stripe.subscriptionItems.list({
        subscription: subscriptionId,
      });

      // Update the subscription with the new price
      if (subscriptionItems.data.length > 0) {
        const itemId = subscriptionItems.data[0].id;
        await stripe.subscriptionItems.update(itemId, {
          price: planId,
        });
      }

      // Create a new invoice immediately to capture the change
      const invoice = await stripe.invoices.create({
        customer: (await stripe.subscriptions.retrieve(subscriptionId)).customer as string,
        subscription: subscriptionId,
        auto_advance: true,
      });

      // Return the subscription ID and client secret (if available)
      let clientSecret = null;
      if (invoice.payment_intent) {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          invoice.payment_intent as string
        );
        clientSecret = paymentIntent.client_secret;
      }

      return {
        subscriptionId,
        clientSecret
      };
    } catch (error) {
      console.error('Error updating Stripe subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error('Stripe service is not available');
    }

    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription.status === 'canceled';
    } catch (error) {
      console.error('Error canceling Stripe subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!this.isAvailable()) {
      throw new Error('Stripe service is not available');
    }

    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error('Error retrieving Stripe subscription:', error);
      throw new Error('Failed to retrieve subscription details');
    }
  }

  /**
   * Get customer payment methods
   */
  async getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    if (!this.isAvailable()) {
      throw new Error('Stripe service is not available');
    }

    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods.data;
    } catch (error) {
      console.error('Error retrieving payment methods:', error);
      throw new Error('Failed to retrieve payment methods');
    }
  }

  /**
   * Get customer invoices
   */
  async getCustomerInvoices(customerId: string): Promise<Stripe.Invoice[]> {
    if (!this.isAvailable()) {
      throw new Error('Stripe service is not available');
    }

    try {
      const invoices = await stripe.invoices.list({
        customer: customerId,
      });
      return invoices.data;
    } catch (error) {
      console.error('Error retrieving invoices:', error);
      throw new Error('Failed to retrieve invoices');
    }
  }
}

export default new StripeService();