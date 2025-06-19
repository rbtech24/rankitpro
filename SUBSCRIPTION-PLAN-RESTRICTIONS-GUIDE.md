# Subscription Plan Restrictions - Complete Guide

## How Plan Restrictions Work

The system enforces subscription limits through several components:

### 1. Plan Definition (Database Schema)
```typescript
// In shared/schema.ts - subscriptionPlans table
{
  maxTechnicians: number,    // Limits how many technicians can be added
  maxCheckIns: number,       // Limits monthly check-ins  
  features: string[],        // Array of enabled features
  price: number,            // Plan cost
  billingPeriod: string     // monthly/yearly
}
```

### 2. Feature-Based Restrictions
Features are stored as JSON array in the `features` column:
```json
[
  "blog_posts_10",
  "video_testimonials", 
  "advanced_analytics",
  "custom_branding"
]
```

### 3. Enforcement Points
The system checks limits at:
- **Check-in creation**: `/api/visits` and `/api/mobile/check-ins`
- **Technician creation**: `/api/technicians` 
- **Feature usage**: Throughout the app via `checkPlanLimits()`

## Creating Your Example Plan

To create a plan with "Blog Post 10, Technicians: 15, no testimonials, Check-ins: 200":

### Step 1: Access Subscription Management
1. Login as Super Admin
2. Navigate to `/subscription-management`
3. Click "Create New Plan"

### Step 2: Set Plan Details
```
Name: Professional Plan
Price: $99.00
Billing Period: monthly
Max Technicians: 15
Max Check-ins: 200
```

### Step 3: Add Features
Add these features one by one:
- `blog_posts_10` (allows 10 blog posts per month)
- `advanced_reporting`
- `priority_support`

**Do NOT add:**
- `audio_testimonials`
- `video_testimonials` 
- `testimonial_collection`

### Step 4: How Restrictions Are Enforced

#### A. Check-in Limits
```typescript
// In server/storage.ts
async checkUsageLimits(companyId: number) {
  const currentUsage = await this.getMonthlyCheckInCount(companyId);
  const plan = await this.getSubscriptionPlan(company.subscriptionPlanId);
  const limit = plan.maxCheckIns; // 200 for your plan
  
  if (currentUsage >= limit) {
    throw new Error("Monthly check-in limit reached");
  }
}
```

#### B. Technician Limits
```typescript
// When adding technicians
const technicians = await storage.getTechniciansByCompany(companyId);
if (technicians.length >= plan.maxTechnicians) { // 15 for your plan
  throw new Error("Technician limit reached");
}
```

#### C. Feature Restrictions
```typescript
// For blog posts
const planLimits = await storage.checkPlanLimits(companyId);
if (!planLimits.canUseFeature('blog_posts_10')) {
  throw new Error("Blog posts not available in your plan");
}

// For testimonials (blocked)
if (!planLimits.canUseFeature('video_testimonials')) {
  // Hide testimonial features in UI
  return <div>Upgrade to access testimonials</div>;
}
```

## Current Implementation Status

### ✅ Already Implemented
- Monthly check-in limits with usage tracking
- Usage warning banners on dashboard
- Limit exceeded modals with upgrade prompts
- Plan creation/management interface
- Database schema for storing plan limits

### 🔧 Enhanced Implementation
I've added comprehensive plan limit checking:

```typescript
// New function in server/storage.ts
async checkPlanLimits(companyId: number) {
  return {
    canCreateCheckIn: boolean,
    canAddTechnician: boolean, 
    canUseFeature: (feature: string) => boolean,
    currentCheckIns: number,
    currentTechnicians: number,
    checkInLimit: number,
    technicianLimit: number,
    features: string[],
    limits: {
      checkInsReached: boolean,
      techniciansReached: boolean
    }
  };
}
```

### API Endpoints
- `GET /api/usage-limits` - Basic check-in usage
- `GET /api/plan-limits` - Comprehensive plan restrictions  
- `POST /api/billing/plans` - Create new plans
- `PUT /api/billing/plans/:id` - Update plans

## Testing Your Plan

### 1. Create the Plan
```bash
POST /api/billing/plans
{
  "name": "Professional Plan",
  "price": "99.00", 
  "billingPeriod": "monthly",
  "maxTechnicians": 15,
  "maxCheckIns": 200,
  "features": ["blog_posts_10", "advanced_reporting"]
}
```

### 2. Assign to Company
Update company's `subscriptionPlanId` to the new plan ID

### 3. Test Restrictions
- Try adding 16th technician (should fail)
- Create 201st check-in (should fail)
- Access testimonial features (should be blocked)
- Blog posts should work (up to 10)

## Feature Naming Convention

Use descriptive feature names:
- `blog_posts_X` - X blog posts per month
- `technicians_X` - X technicians maximum  
- `check_ins_X` - X check-ins per month
- `video_testimonials` - Video testimonial collection
- `audio_testimonials` - Audio testimonial collection
- `advanced_analytics` - Advanced reporting
- `custom_branding` - White-label options
- `priority_support` - Priority customer support

This system provides granular control over what each subscription tier can access.