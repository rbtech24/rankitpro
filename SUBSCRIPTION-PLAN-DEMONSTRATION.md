# Subscription Plan Restrictions - Live Demonstration

## Your Professional Plan Implementation

Successfully created your example plan with these exact specifications:

**Plan Name**: Professional Plan  
**Price**: $99.00/month  
**Technician Limit**: 15  
**Check-in Limit**: 200 per month  
**Blog Posts**: 10 per month  
**Testimonials**: BLOCKED (not included in features)

### Features Enabled:
- `blog_posts_10` - Allows 10 blog posts per month
- `advanced_reporting` - Enhanced analytics and reporting
- `priority_support` - Priority customer support 
- `custom_branding` - White-label options
- `wordpress_integration` - WordPress plugin functionality

### Features Blocked:
- `audio_testimonials` - Audio testimonial collection
- `video_testimonials` - Video testimonial collection  
- `testimonial_collection` - General testimonial features

## How Restrictions Are Enforced

### 1. Check-in Limits (200/month)
The system tracks monthly usage and prevents creation when limits are reached:

```typescript
// In server/routes/mobile/check-ins.ts
const usageLimits = await storage.checkUsageLimits(companyId);
if (usageLimits.limitReached) {
  return res.status(429).json({
    message: "Monthly check-in limit reached",
    error: "USAGE_LIMIT_EXCEEDED",
    details: {
      currentUsage: usageLimits.currentUsage, // e.g., 200
      limit: usageLimits.limit, // 200
      planName: usageLimits.planName // "Professional Plan"
    }
  });
}
```

### 2. Technician Limits (15 maximum)
When adding technicians, the system checks current count vs plan limit:

```typescript
// Enhanced limit checking
const planLimits = await storage.checkPlanLimits(companyId);
if (!planLimits.canAddTechnician) {
  return res.status(429).json({
    message: "Technician limit reached",
    details: {
      currentTechnicians: planLimits.currentTechnicians, // e.g., 15
      limit: planLimits.technicianLimit, // 15
      planName: planLimits.planName
    }
  });
}
```

### 3. Feature-Based Restrictions
Features are checked against the plan's enabled features array:

```typescript
// Blog posts allowed (up to 10)
if (planLimits.canUseFeature('blog_posts_10')) {
  // Allow blog post creation
} else {
  // Block with upgrade prompt
}

// Testimonials blocked
if (!planLimits.canUseFeature('video_testimonials')) {
  // Hide testimonial UI elements
  // Show upgrade prompts
}
```

## User Experience

### When Limits Are Reached:
1. **Warning Phase** (80% of limit): Orange banner appears on dashboard
2. **Limit Reached**: Modal dialog blocks action with upgrade options
3. **API Level**: 429 status code with detailed error information

### Frontend Integration:
- Usage warnings integrated into dashboard
- Real-time limit checking in visit forms
- Modal dialogs for limit exceeded scenarios
- Progressive disclosure of upgrade options

## Testing Your Plan

Current status for Demo Company (ID: 15):
- **Technicians**: 0/15 (can add 15 more)
- **Check-ins**: 0/200 this month (can create 200 more)
- **Blog posts**: Feature enabled (up to 10/month)
- **Testimonials**: Feature blocked (will show upgrade prompts)

## API Endpoints for Plan Management

### Check Plan Limits
```
GET /api/plan-limits
Response: {
  canCreateCheckIn: boolean,
  canAddTechnician: boolean,
  canUseFeature: (feature: string) => boolean,
  currentCheckIns: number,
  currentTechnicians: number,
  checkInLimit: 200,
  technicianLimit: 15,
  features: ["blog_posts_10", "advanced_reporting", ...],
  limits: {
    checkInsReached: boolean,
    techniciansReached: boolean
  }
}
```

### Usage Monitoring
```
GET /api/usage-limits
Response: {
  canCreateCheckIn: boolean,
  currentUsage: number,
  limit: 200,
  planName: "Professional Plan",
  limitReached: boolean
}
```

## Implementation Details

The restriction system uses a multi-layered approach:

1. **Database Schema**: Plans store limits in `max_technicians`, `max_check_ins`, and `features` columns
2. **Storage Layer**: Enhanced `checkPlanLimits()` function provides comprehensive checking
3. **API Routes**: Enforcement at creation endpoints with proper error responses
4. **Frontend**: Usage warnings, modals, and progressive upgrade prompts
5. **Real-time**: Live usage tracking with monthly reset cycles

This provides complete control over subscription-based feature access with clear user feedback and upgrade pathways.