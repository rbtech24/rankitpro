// Plan-based feature management
export interface PlanFeatures {
  audioTestimonials: boolean;
  videoTestimonials: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  apiAccess: boolean;
}

export interface Plan {
  id: 'starter' | 'pro' | 'agency';
  name: string;
  price: number;
  features: PlanFeatures;
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  starter: {
    audioTestimonials: false,
    videoTestimonials: false,
    advancedAnalytics: false,
    prioritySupport: false,
    customBranding: false,
    apiAccess: false,
  },
  pro: {
    audioTestimonials: true,
    videoTestimonials: false,
    advancedAnalytics: true,
    prioritySupport: false,
    customBranding: true,
    apiAccess: false,
  },
  agency: {
    audioTestimonials: true,
    videoTestimonials: true,
    advancedAnalytics: true,
    prioritySupport: true,
    customBranding: true,
    apiAccess: true,
  },
};

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    features: PLAN_FEATURES.starter,
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 99,
    features: PLAN_FEATURES.pro,
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 199,
    features: PLAN_FEATURES.agency,
  },
];

export function hasFeature(
  companyPlan: string,
  feature: keyof PlanFeatures
): boolean {
  const planFeatures = PLAN_FEATURES[companyPlan];
  return planFeatures ? planFeatures[feature] : false;
}

export function getRequiredPlan(feature: keyof PlanFeatures): string {
  for (const [planId, features] of Object.entries(PLAN_FEATURES)) {
    if (features[feature]) {
      return planId;
    }
  }
  return 'agency';
}

export function getPlanName(planId: string): string {
  const plan = PLANS.find(p => p.id === planId);
  return plan ? plan.name : 'Unknown';
}