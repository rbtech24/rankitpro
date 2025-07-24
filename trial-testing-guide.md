# Trial Plan Testing Guide

## Overview
This guide provides comprehensive methods to test that trial expiration works correctly and users are properly blocked when their 14-day trial ends.

## Current Trial System Features

### 1. **Trial Enforcement Middleware**
- Located: `server/middleware/trial-enforcement.ts`
- Blocks access when trial expires (returns 403 with `trial_expired` error)
- Skips enforcement for super admins and auth endpoints
- Adds trial info to response headers (`X-Trial-Days-Left`, `X-Trial-End-Date`)

### 2. **Frontend Components**
- **Trial Status Banner**: Shows warnings when trial is low (≤7 days) or expired
- **Trial Expired Modal**: Blocks access and forces upgrade when trial ends
- **Upgrade Buttons**: Direct users to billing page for subscription

### 3. **Database Fields**
- `is_trial_active`: Boolean indicating if trial is active
- `trial_start_date`: When trial began
- `trial_end_date`: When trial expires
- `stripe_subscription_id`: If null, user is on trial/free plan

## Testing Methods

### Method 1: Manual Database Update (Recommended)
```sql
-- 1. View current trial companies
SELECT id, name, is_trial_active, trial_end_date 
FROM companies 
WHERE is_trial_active = true;

-- 2. Expire a specific company's trial (replace ID)
UPDATE companies 
SET trial_end_date = NOW() - INTERVAL '1 day',
    is_trial_active = false
WHERE id = YOUR_COMPANY_ID;

-- 3. Verify the change
SELECT id, name, is_trial_active, trial_end_date, stripe_subscription_id 
FROM companies 
WHERE id = YOUR_COMPANY_ID;
```

### Method 2: API Testing Endpoints
Create these test endpoints for easier trial manipulation:

#### Test Endpoints to Add:
```typescript
// Add to server/routes.ts (for development only)

// Expire trial immediately
router.post('/api/test/expire-trial/:companyId', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }
  
  const companyId = parseInt(req.params.companyId);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  await storage.updateCompany(companyId, {
    trialEndDate: yesterday,
    isTrialActive: false
  });
  
  res.json({ message: 'Trial expired for testing' });
});

// Set trial to expire in X days
router.post('/api/test/set-trial-days/:companyId/:days', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }
  
  const companyId = parseInt(req.params.companyId);
  const days = parseInt(req.params.days);
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  await storage.updateCompany(companyId, {
    trialEndDate: expiryDate,
    isTrialActive: days > 0
  });
  
  res.json({ 
    message: `Trial set to expire in ${days} days`,
    expiryDate: expiryDate.toISOString()
  });
});
```

### Method 3: Browser Testing Steps

#### Step 1: Prepare Test Account
1. Login to a company account that's currently on trial
2. Note the company ID from the browser network tab or database

#### Step 2: Expire the Trial
Use either SQL command or API endpoint to expire the trial

#### Step 3: Test Access Blocking
1. **Refresh the page** - Should show trial expired banner
2. **Try accessing features**:
   - Dashboard: Should show upgrade modal
   - Check-ins: Should be blocked with 403 error
   - Blog posts: Should be blocked
   - API calls: Should return `{"error": "trial_expired"}`

#### Step 4: Verify Frontend Behavior
- Trial expired banner should appear (red alert)
- "Upgrade Now" button should redirect to billing page
- Modal should prevent access to main features
- All API calls should return 403 status

#### Step 5: Test Upgrade Path
1. Click upgrade buttons - should go to `/billing`
2. Billing page should show subscription plans
3. After subscription (or simulate with database), access should restore

## Expected Results

### When Trial is Active (>0 days left)
✅ Full access to all features
✅ Trial banner shows days remaining (if ≤7 days)
✅ API calls succeed normally
✅ Headers include `X-Trial-Days-Left`

### When Trial Expires (0 days left)
❌ Access blocked with 403 errors
❌ Trial expired modal appears
❌ API returns `{"error": "trial_expired", "upgradeRequired": true}`
❌ Only auth endpoints work (login/logout)
✅ Billing page accessible for upgrades

### After Subscription
✅ Full access restored
✅ No trial banners shown
✅ `stripe_subscription_id` populated in database

## Testing Commands

### Quick SQL Test Commands
```sql
-- Check all companies with their trial status
SELECT 
  id, 
  name, 
  is_trial_active,
  trial_end_date,
  CASE 
    WHEN trial_end_date < NOW() THEN 'EXPIRED'
    WHEN trial_end_date IS NULL THEN 'NO_TRIAL'
    ELSE 'ACTIVE'
  END as trial_status,
  stripe_subscription_id IS NOT NULL as has_subscription
FROM companies 
ORDER BY trial_end_date DESC;

-- Expire trial for company ID 1
UPDATE companies 
SET trial_end_date = NOW() - INTERVAL '1 day' 
WHERE id = 1;

-- Restore trial for 7 more days
UPDATE companies 
SET trial_end_date = NOW() + INTERVAL '7 days',
    is_trial_active = true 
WHERE id = 1;
```

### cURL Testing
```bash
# Test accessing protected endpoint with expired trial
curl -H "Cookie: your-session-cookie" \
     http://localhost:3000/api/check-ins

# Expected response:
# {"error":"trial_expired","message":"Your 14-day free trial has expired..."}
```

## Common Issues to Check

1. **Middleware Not Applied**: Ensure trial enforcement middleware is used on protected routes
2. **Super Admin Bypass**: Super admins should always have access
3. **Auth Endpoints**: Login/logout should work even with expired trial
4. **Frontend Handling**: 403 responses should trigger upgrade modals
5. **Database Consistency**: `is_trial_active` should match `trial_end_date`

## Production Considerations

⚠️ **Important**: Test endpoints should only work in development
⚠️ **Backup**: Always backup database before testing
⚠️ **Restore**: Have a plan to restore trial status after testing
⚠️ **Real Users**: Never test on real customer accounts

## Automated Testing Script

Create a test script that:
1. Creates test company
2. Sets trial to expire
3. Verifies API blocking
4. Tests upgrade flow
5. Cleans up test data

This ensures trial functionality works correctly before going to production.