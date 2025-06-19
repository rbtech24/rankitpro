# Stripe Automatic Email & Alert System

## Stripe's Built-in Email Notifications

Stripe automatically sends professional emails to customers when payments fail:

### Payment Failure Email Sequence:
1. **Immediate notification** - "Payment failed for your Rank It Pro subscription"
2. **Retry attempts** - 3-day intervals with retry notifications
3. **Final notice** - 7 days before subscription cancellation
4. **Cancellation notice** - If payment still fails after retry period

### Email Content Examples:

**Payment Failed Email:**
```
Subject: Action required: Payment failed for Rank It Pro

Hi [Customer Name],

We weren't able to process your payment for your Rank It Pro subscription.

Plan: Professional Plan ($99.00/month)
Payment method: •••• 4242
Reason: Your card was declined

What happens next:
• We'll retry the payment in 3 days
• Your account remains active during this time
• Update your payment method to avoid service interruption

[Update Payment Method] [View Invoice]

Need help? Contact our support team.
```

**Final Notice Email:**
```
Subject: Final notice: Update payment method to avoid service interruption

Hi [Customer Name],

We've been unable to process payment for your Rank It Pro subscription.

Your subscription will be cancelled in 2 days unless you update your payment method.

[Update Payment Method - Urgent]
```

## In-App Alert System

Your platform shows real-time alerts when users log in with payment issues:

### Dashboard Banner Alerts:
```javascript
// Payment status banner appears at top of dashboard
if (subscriptionStatus === 'past_due') {
  showAlert({
    type: 'error',
    title: 'Payment Required',
    message: 'Your payment method needs attention. Update it to restore full access.',
    actions: [
      { text: 'Update Payment', link: '/billing' }
    ],
    persistent: true
  });
}
```

### Usage Blocking Alerts:
```javascript
// When trying to create check-ins/content
if (paymentFailed) {
  showModal({
    title: 'Subscription Payment Failed',
    message: 'Update your payment method to continue creating content.',
    buttons: [
      { text: 'Update Payment Method', action: 'openBilling' },
      { text: 'Contact Support', action: 'openSupport' }
    ],
    canClose: false
  });
}
```

## Notification Timeline

### Day 1 - Payment Fails:
- **Stripe Email**: "Payment failed" notification sent immediately
- **In-App Alert**: Red banner appears on dashboard
- **Access**: Login works, usage blocked

### Day 4 - First Retry:
- **Stripe Email**: "We're retrying your payment" notification
- **In-App**: Alert becomes more prominent
- **Access**: Still blocked from creating content

### Day 7 - Second Retry:
- **Stripe Email**: "Second payment attempt" notification
- **In-App**: Urgent upgrade prompts
- **Access**: Multiple reminders to update payment

### Day 10 - Final Notice:
- **Stripe Email**: "Final notice - subscription will cancel"
- **In-App**: Critical alerts with countdown
- **Access**: Imminent cancellation warnings

### Day 14 - Cancellation:
- **Stripe Email**: "Subscription cancelled" notification
- **In-App**: Account downgraded to trial/free tier
- **Access**: Limited to free features only

## Smart Retry Logic

Stripe automatically handles intelligent payment retries:

### Retry Schedule:
- **3 days** after initial failure
- **5 days** after first retry
- **7 days** after second retry
- **Final attempt** before cancellation

### Retry Reasons:
- Temporary network issues
- Insufficient funds (may be resolved)
- Card processor downtime
- Bank authorization delays

## Custom Email Enhancements

You can add your own email notifications on top of Stripe's:

### Payment Restored Email:
```javascript
// When payment succeeds after failure
async function sendPaymentRestoredEmail(customer) {
  await sendEmail({
    to: customer.email,
    subject: 'Welcome back! Your Rank It Pro subscription is active',
    template: 'payment-restored',
    data: {
      customerName: customer.name,
      planName: customer.planName,
      submissionsAvailable: customer.submissionLimit,
      techniciansAvailable: customer.technicianLimit
    }
  });
}
```

### Usage Limit Warning Emails:
```javascript
// When approaching submission limits
async function sendUsageLimitWarning(company, usage) {
  if (usage.percentage >= 90) {
    await sendEmail({
      to: company.email,
      subject: `Usage Alert: ${usage.used}/${usage.limit} submissions used`,
      template: 'usage-warning',
      data: {
        companyName: company.name,
        usagePercentage: usage.percentage,
        submissionsRemaining: usage.limit - usage.used,
        resetDate: getNextMonthFirst()
      }
    });
  }
}
```

## Customer Communication Benefits

### Professional Email Sequence:
- Branded emails from Stripe (looks professional)
- Clear action items and next steps
- Multiple chances to resolve payment issues
- Transparent timeline and expectations

### Real-time In-App Feedback:
- Immediate alerts when logging in
- Clear distinction between login access and usage features
- Direct links to payment update forms
- Context-aware messaging

### Grace Period Approach:
- 14-day window to resolve payment issues
- Multiple retry attempts
- Data preservation during payment failures
- Easy restoration once payment is updated

## Technical Implementation

### Webhook Handling:
```javascript
// Listen for Stripe payment events
app.post('/stripe/webhook', async (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'invoice.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCancelled(event.data.object);
      break;
  }
  
  res.json({ received: true });
});
```

The system provides comprehensive notifications through both Stripe's professional email system and your platform's real-time alerts, ensuring customers never miss payment issues and have clear paths to resolution.