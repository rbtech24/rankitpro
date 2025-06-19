# Stripe Auto-Renewal & Payment Failure Handling

## How Auto-Renewal Works

**Yes, Stripe handles auto-renewal automatically once customers subscribe:**

### Initial Subscription Process:
1. Customer pays for first month (e.g., Professional Plan $99)
2. Stripe creates recurring subscription with auto-renewal enabled
3. Company gets full access to 200 submissions + 15 technicians
4. System stores `stripeSubscriptionId` in company record

### Monthly Auto-Renewal:
- **Stripe automatically charges** the customer's card every month
- **No manual intervention required** - completely automatic
- **Subscription continues** until cancelled by customer or payment fails

## Payment Failure Handling

**Exactly as you described - maintain login access but disable usage:**

### When Payment Fails:
```javascript
// Webhook handler for failed payments
async handleFailedPayment(paymentData) {
  // Log the failed payment
  await db.insert(paymentTransactions).values({
    stripePaymentIntentId: paymentData.id,
    amount: paymentData.amount,
    status: 'failed',
    companyId: paymentData.metadata.companyId
  });
  
  // Update company status - KEEP LOGIN ACCESS
  await db.update(companies)
    .set({ 
      subscriptionStatus: 'past_due',  // Not 'inactive' - still login
      lastPaymentFailed: new Date()
    })
    .where(eq(companies.id, companyId));
}
```

### Customer Experience During Payment Failure:

**✅ Can Still Login:**
- Account remains accessible
- Dashboard loads normally
- Can view all historical data
- Billing page works for updating payment method

**❌ Usage Features Blocked:**
```javascript
// Check plan limits with payment failure consideration
async checkPlanLimits(companyId) {
  const company = await this.getCompany(companyId);
  
  // If payment failed, block all submissions but allow login
  if (company.subscriptionStatus === 'past_due') {
    return {
      canCreateSubmission: false,  // Block all new content
      canAddTechnician: false,     // Block new technicians
      currentSubmissions: 0,       // Show as blocked
      submissionLimit: 0,          // No limit available
      blockReason: 'PAYMENT_FAILURE',
      message: 'Update your payment method to restore access'
    };
  }
  
  // Normal usage tracking for active subscriptions
  return normalPlanLimits;
}
```

## User Experience Examples

### Scenario 1: Card Expires
```
🔴 Payment Method Issue
Your card ending in 4242 was declined.

❌ New submissions blocked
✅ Account access maintained
✅ All data preserved

Action: Update payment method below
[Update Card Button]
```

### Scenario 2: Bank Declines Payment
```
💳 Payment Failed - Account Past Due
Your recent payment of $99.00 could not be processed.

What you can still do:
✅ Access your dashboard
✅ View all check-ins and data
✅ Update payment information
✅ Download reports

What's temporarily disabled:
❌ Creating new check-ins (0/200 available)
❌ Generating blog posts
❌ Sending review requests
❌ Adding new technicians

[Update Payment Method] [Contact Support]
```

### Scenario 3: After Updating Payment Method
```
✅ Payment Method Updated Successfully
Your subscription has been restored.

Restored features:
✅ Monthly submissions: 45/200 available
✅ Technician accounts: 8/15 available
✅ All platform features active
✅ Auto-renewal: February 15, 2025

Your account is fully active again.
```

## Implementation Details

### Stripe Webhook Events:
- `invoice.payment_failed` → Block usage, keep login
- `invoice.payment_succeeded` → Restore full access
- `customer.subscription.updated` → Update plan limits
- `customer.subscription.deleted` → Downgrade to trial

### Database Status Tracking:
```sql
-- Company subscription statuses
UPDATE companies SET
  subscription_status = CASE
    WHEN payment_failed THEN 'past_due'     -- Login OK, usage blocked
    WHEN subscription_active THEN 'active'  -- Full access
    WHEN cancelled THEN 'cancelled'         -- Graceful downgrade
  END
```

### Frontend Enforcement:
```typescript
// All submission endpoints check payment status
if (company.subscriptionStatus === 'past_due') {
  return res.status(402).json({
    error: 'PAYMENT_REQUIRED',
    message: 'Please update your payment method',
    canLogin: true,
    canSubmit: false,
    billingUrl: '/billing'
  });
}
```

## Benefits of This Approach

### For Customers:
- **No data loss** during payment issues
- **Easy recovery** by updating payment method
- **Clear communication** about what's blocked vs. available
- **Immediate restoration** after payment update

### For Business:
- **Reduced churn** - customers don't lose access completely
- **Higher recovery rate** - easy to fix payment issues
- **Better customer experience** - transparent and fair
- **Automatic collections** through Stripe's retry logic

## Stripe's Built-in Recovery Features

Stripe automatically handles:
- **Retry logic** - attempts payment multiple times
- **Email notifications** to customers about failed payments
- **Grace periods** before subscription cancellation
- **Dunning management** - progressive email sequences

Your system correctly implements the ideal flow: **maintain login access for payment method updates while blocking usage until payment is restored**.