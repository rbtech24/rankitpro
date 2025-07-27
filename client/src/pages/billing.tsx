import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useToast } from "../hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "../lib/auth";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "../components/billing/payment-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Loader2 } from "lucide-react";
import StripeConfigNotice from "../components/billing/stripe-config-notice";

// Initialize Stripe with correct public key from user
const getStripePromise = () => {
  // Use the provided public key from user's Stripe dashboard
  const publicKey = "pk_live_51Q1IJKABx6OzSP6kA2eNndSD5luY9WJPP6HSuQ9QFZOFGIlTQaT0YeHAQCIuTlHXEZ0eV04wBl3WdjBtCf4gXi2W00jdezk2mo";
  if (!publicKey || !publicKey.startsWith('pk_')) {
    console.warn('Stripe public key not configured or invalid');
    return Promise.resolve(null);
  }
  try {
    return loadStripe(publicKey);
  } catch (error) {
    console.error('Failed to load Stripe:', error);
    return Promise.resolve(null);
  }
};

const stripePromise = getStripePromise();

interface PlanFeature {
  name: string;
  starter: string | boolean;
  pro: string | boolean;
  agency: string | boolean;
}

// Dynamic plan features will be loaded from database

export default function Billing() {
  const { toast } = useToast();
  
  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  // State for subscription management and payment modal
  const [currentPlan, setCurrentPlan] = useState<string>("starter");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [renewalDate, setRenewalDate] = useState<Date | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  
  // Query for subscription plans from database
  const { data: subscriptionPlans } = useQuery({
    queryKey: ["/api/billing/plans"],
    queryFn: async () => {
      const response = await apiRequest('GET', "/api/billing/plans");
      return response.json();
    }
  });

  // Query for subscription data
  const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['/api/billing/subscription'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/billing/subscription');
        return response.json();
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        return null;
      }
    },
    enabled: !!auth?.company
  });

  // Plans are now fetched from the main subscriptionPlans query above
  
  // Update state based on subscription data
  useEffect(() => {
    if (subscriptionData) {
      // Map company plan to plan names for comparison
      let planName = subscriptionData.plan || "starter";
      if (planName === "starter") planName = "essential";
      if (planName === "pro") planName = "professional";
      if (planName === "agency") planName = "enterprise";
      
      setCurrentPlan(planName);
      setSubscriptionStatus(subscriptionData.status || "inactive");
      
      if (subscriptionData.paymentMethods) {
        setPaymentMethods(subscriptionData.paymentMethods);
      }
      
      if (subscriptionData.invoices) {
        setInvoices(subscriptionData.invoices);
      }
      
      if (subscriptionData.currentPeriodEnd) {
        setRenewalDate(new Date(subscriptionData.currentPeriodEnd));
      }
    }
  }, [subscriptionData]);
  
  // Mutation for updating subscription with plan selection
  const updateSubscription = useMutation({
    mutationFn: async (data: { planId: number; billingPeriod: 'monthly' | 'yearly' }) => {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/billing/subscription', { 
        planId: data.planId,
        billingPeriod: data.billingPeriod
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsLoading(false);
      
      // Handle development mode response (direct plan update)
      if (data.devMode || data.success) {
        toast({
          title: "Plan Updated",
          description: data.message || "Your subscription plan has been updated successfully!",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        setSelectedPlan(null);
        return;
      }
      
      // Handle Stripe payment flow
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        // Fallback success case
        toast({
          title: "Subscription Updated",
          description: "Your subscription plan has been updated.",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        setSelectedPlan(null);
      }
    },
    onError: async (error: any) => {
      setIsLoading(false);
      console.error('Error updating subscription:', error);
      
      // Extract detailed error message from response
      let errorMessage = "Failed to update your subscription. Please try again.";
      let planDetails = null;
      
      try {
        if (error?.response) {
          const errorData = await error.response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
            setSubscriptionError(errorData.message);
          } else if (errorData.error) {
            errorMessage = errorData.error;
            setSubscriptionError(errorData.error);
          }
        } else if (error?.message) {
          errorMessage = error.message;
          setSubscriptionError(error.message);
        }

        // Get plan details for the failed payment
        if (selectedPlan && subscriptionPlans) {
          planDetails = subscriptionPlans.find(p => p.name.toLowerCase() === selectedPlan);
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      
      // Trigger payment failed modal
      window.dispatchEvent(new CustomEvent('paymentFailed', {
        detail: {
          error: errorMessage,
          plan: planDetails
        }
      }));
      
      toast({
        title: "Payment Setup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setSelectedPlan(null);
    }
  });
  
  // Mutation for canceling subscription
  const cancelSubscription = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/billing/subscription/cancel');
      return response.json();
    },
    onSuccess: (data) => {
      setIsLoading(false);
      toast({
        title: "Subscription Canceled",
        description: `Your subscription will be canceled at the end of the current billing period (${new Date(data.cancelDate).toLocaleDateString()}).`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
    },
    onError: (error) => {
      setIsLoading(false);
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel your subscription. Please try again or contact support.",
        variant: "destructive",
      });
    }
  });
  
  const handleChangePlan = (planId: number, billingPeriod: 'monthly' | 'yearly') => {
    const planDetails = subscriptionPlans?.find(p => p.id === planId);
    if (!planDetails) {
      toast({
        title: "Plan Not Found",
        description: "The selected plan could not be found.",
        variant: "destructive",
      });
      return;
    }

    if (planDetails.name.toLowerCase() === currentPlan) {
      toast({
        title: "Already Subscribed",
        description: `You are already subscribed to the ${planDetails.name} plan.`,
        variant: "default",
      });
      return;
    }
    
    setSelectedPlan(planDetails.name.toLowerCase());
    setSelectedBillingPeriod(billingPeriod);
    
    // Proceed with upgrade directly - no confirmation popup needed
    updateSubscription.mutate({ planId, billingPeriod });
  };
  
  const handleCancelSubscription = () => {
    if (subscriptionStatus === 'active') {
      // Confirm cancellation
      if (window.confirm("Are you sure you want to cancel your subscription? Your service will continue until the end of your current billing period.")) {
        cancelSubscription.mutate();
      }
    } else {
      toast({
        title: "No Active Subscription",
        description: "You don't have an active subscription to cancel.",
        variant: "default",
      });
    }
  };
  
  const formatFeatureValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
          <path d="M18 6 6 18"/>
          <path d="m6 6 12 12"/>
        </svg>
      );
    }
    return value;
  };

  return (
    <DashboardLayout>
      {/* Payment Modal */}
      <Dialog open={!!clientSecret} onOpenChange={(open) => !open && setClientSecret(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
            <DialogDescription>
              {selectedPlan && subscriptionPlans && (() => {
                const planDetails = subscriptionPlans.find(p => p.name.toLowerCase() === selectedPlan);
                return planDetails ? `Upgrade to ${planDetails.name} plan for $${planDetails.price}/${planDetails.billingPeriod}` : 'Complete your subscription upgrade';
              })()}
            </DialogDescription>
          </DialogHeader>
          
          {/* Real Stripe Payment Form */}
          {clientSecret && stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Subscription Details:</h4>
                  {selectedPlan && subscriptionPlans && (() => {
                    const planDetails = subscriptionPlans.find(p => p.name.toLowerCase() === selectedPlan);
                    if (!planDetails) return null;
                    
                    const price = selectedBillingPeriod === 'yearly' ? 
                      (planDetails.yearlyPrice || planDetails.price * 12) : 
                      planDetails.price;
                    
                    return (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{planDetails.name} Plan</span>
                          <span className="text-lg font-bold">${price}/{selectedBillingPeriod}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {planDetails.maxTechnicians === -1 ? 'Unlimited' : planDetails.maxTechnicians} technicians, 
                          {planDetails.maxCheckIns === -1 ? 'Unlimited' : planDetails.maxCheckIns} submissions
                        </div>
                        {selectedBillingPeriod === 'yearly' && planDetails.yearlyPrice && (
                          <div className="text-sm text-green-600 mt-1 font-medium">
                            Save ${(planDetails.price * 12) - planDetails.yearlyPrice}/year with annual billing
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  {/* Billing Period Selector */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Billing Period:</h5>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={async () => {
                          setSelectedBillingPeriod('monthly');
                          // Update payment with new billing period
                          if (selectedPlan && subscriptionPlans) {
                            const planDetails = subscriptionPlans.find(p => p.name.toLowerCase() === selectedPlan);
                            if (planDetails) {
                              try {
                                const response = await updateSubscription.mutateAsync({ 
                                  planId: planDetails.id, 
                                  billingPeriod: 'monthly' 
                                });
                                if (response.clientSecret) {
                                  setClientSecret(response.clientSecret);
                                }
                              } catch (error) {
                                console.error('Error updating billing period:', error);
                              }
                            }
                          }
                        }}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          selectedBillingPeriod === 'monthly'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setSelectedBillingPeriod('yearly');
                          // Update payment with new billing period
                          if (selectedPlan && subscriptionPlans) {
                            const planDetails = subscriptionPlans.find(p => p.name.toLowerCase() === selectedPlan);
                            if (planDetails) {
                              try {
                                const response = await updateSubscription.mutateAsync({ 
                                  planId: planDetails.id, 
                                  billingPeriod: 'yearly' 
                                });
                                if (response.clientSecret) {
                                  setClientSecret(response.clientSecret);
                                }
                              } catch (error) {
                                console.error('Error updating billing period:', error);
                              }
                            }
                          }
                        }}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          selectedBillingPeriod === 'yearly'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                        }`}
                      >
                        Yearly
                        {selectedPlan && subscriptionPlans && (() => {
                          const planDetails = subscriptionPlans.find(p => p.name.toLowerCase() === selectedPlan);
                          if (planDetails?.yearlyPrice) {
                            const savings = (planDetails.price * 12) - planDetails.yearlyPrice;
                            return <span className="ml-1 text-xs text-green-600">(Save ${savings})</span>;
                          }
                          return null;
                        })()}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Development Mode: Simple Payment Button */}
                {process.env.NODE_ENV !== 'production' ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md bg-yellow-50 border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <strong>Development Mode:</strong> Click the button below to simulate payment completion.
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        setClientSecret(null);
                        toast({
                          title: "Plan Updated",
                          description: "Your subscription plan has been updated successfully (development mode)!",
                          variant: "default",
                        });
                        queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
                        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
                        setSelectedPlan(null);
                      }}
                      className="w-full"
                    >
                      Complete Subscription Update
                    </Button>
                  </div>
                ) : (
                  <PaymentForm 
                    onSuccess={() => {
                      setClientSecret(null);
                      toast({
                        title: "Subscription Updated",
                        description: "Your subscription has been successfully updated!",
                        variant: "default",
                      });
                      queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
                      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
                      setSelectedPlan(null);
                    }}
                    onError={(error) => {
                      toast({
                        title: "Payment Failed",
                        description: error,
                        variant: "destructive",
                      });
                    }}
                    onCancel={() => setClientSecret(null)}
                  />
                )}
              </div>
            </Elements>
          ) : clientSecret ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Payment system is being configured. Please try again in a moment.
                </p>
              </div>
              <Button onClick={() => setClientSecret(null)}>Close</Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      
      <div className="space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="text-sm text-gray-500">Manage your subscription plan and billing information.</p>
          </div>
          
          <div className="space-y-6">
            {/* Configuration Notice */}
            {subscriptionError && (
              <StripeConfigNotice error={subscriptionError} />
            )}
            
            {/* Current Plan Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>Your subscription information and usage.</CardDescription>
                  </div>
                  <Badge className="capitalize">{currentPlan}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-500">Plan</h4>
                    <p className="capitalize text-xl font-semibold">{currentPlan}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-500">Billing Cycle</h4>
                    <p className="text-xl font-semibold">{subscriptionData?.interval || 'Monthly'}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-500">Next Renewal</h4>
                    <p className="text-xl font-semibold">
                      {renewalDate ? renewalDate.toLocaleDateString() : 'N/A'}
                      {subscriptionStatus === 'canceled' && ' (Canceling)'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-medium">Usage</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {isLoadingSubscription ? (
                      <div className="col-span-3 flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : subscriptionData?.usage ? (
                      <>
                        <div className="bg-white rounded-lg border p-4">
                          <div className="text-sm text-gray-500 mb-1">Submissions</div>
                          <div className="flex items-end justify-between">
                            <div className="text-xl font-semibold">{subscriptionData.usage.checkins.used}</div>
                            <div className="text-sm text-gray-500">/ {subscriptionData.usage.checkins.limit}</div>
                          </div>
                          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${subscriptionData.usage.checkins.used / subscriptionData.usage.checkins.limit > 0.9 ? 'bg-red-500' : 'bg-primary'}`} 
                              style={{ width: `${Math.min(100, (subscriptionData.usage.checkins.used / subscriptionData.usage.checkins.limit) * 100)}%` }}>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg border p-4">
                          <div className="text-sm text-gray-500 mb-1">Blog Posts</div>
                          <div className="flex items-end justify-between">
                            <div className="text-xl font-semibold">{subscriptionData.usage?.blogposts?.used || 0}</div>
                            <div className="text-sm text-gray-500">/ {subscriptionData.usage?.blogposts?.limit || 0}</div>
                          </div>
                          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${(subscriptionData.usage?.blogposts?.used || 0) / (subscriptionData.usage?.blogposts?.limit || 1) > 0.9 ? 'bg-red-500' : 'bg-primary'}`} 
                              style={{ width: `${Math.min(100, ((subscriptionData.usage?.blogposts?.used || 0) / (subscriptionData.usage?.blogposts?.limit || 1)) * 100)}%` }}>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg border p-4">
                          <div className="text-sm text-gray-500 mb-1">Technicians</div>
                          <div className="flex items-end justify-between">
                            <div className="text-xl font-semibold">{subscriptionData.usage.technicians.used}</div>
                            <div className="text-sm text-gray-500">/ {subscriptionData.usage.technicians.limit}</div>
                          </div>
                          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${subscriptionData.usage.technicians.used / subscriptionData.usage.technicians.limit > 0.9 ? 'bg-yellow-500' : 'bg-primary'}`}
                              style={{ width: `${Math.min(100, (subscriptionData.usage.technicians.used / subscriptionData.usage.technicians.limit) * 100)}%` }}>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-3 text-center py-4 text-gray-500">
                        Usage data not available
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleCancelSubscription}>Cancel Subscription</Button>
                <Button onClick={() => {
                  const professionalPlan = subscriptionPlans?.find(p => p.name.toLowerCase() === 'professional');
                  if (professionalPlan) {
                    handleChangePlan(professionalPlan.id, 'monthly');
                  }
                }}>Upgrade Plan</Button>
              </CardFooter>
            </Card>
            
            {/* Available Plans - Dynamic from Database */}
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>
                  {subscriptionPlans && Array.isArray(subscriptionPlans) && subscriptionPlans.length > 0 
                    ? "Choose the plan that works best for your business."
                    : "No subscription plans available. Please contact support."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionPlans && Array.isArray(subscriptionPlans) && subscriptionPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {subscriptionPlans.map((plan: any) => (
                      <Card key={plan.id} className={`border-2 ${currentPlan === plan.name.toLowerCase() ? 'border-primary' : 'border-gray-200'}`}>
                        <CardHeader>
                          <CardTitle>{plan.name}</CardTitle>
                          <CardDescription>
                            {plan.maxTechnicians === -1 ? 'Unlimited' : plan.maxTechnicians} technicians, 
                            {plan.maxCheckIns === -1 ? 'Unlimited' : plan.maxCheckIns} submissions
                          </CardDescription>
                          <div className="mt-2">
                            <span className="text-3xl font-bold">${plan.price}</span>
                            <span className="text-gray-500">/{plan.billingPeriod}</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            <li className="flex items-center">
                              <span className="mr-2">👥</span>
                              <span>Max {plan.maxTechnicians === -1 ? 'Unlimited' : plan.maxTechnicians} Technicians</span>
                            </li>
                            <li className="flex items-center">
                              <span className="mr-2">📋</span>
                              <span>Max {plan.maxCheckIns === -1 ? 'Unlimited' : plan.maxCheckIns} Submissions</span>
                            </li>
                            {plan.features && Array.isArray(plan.features) && plan.features.map((feature: string, index: number) => (
                              <li key={index} className="flex items-center">
                                <span className="mr-2">✓</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <div className="w-full space-y-2">
                            <Button 
                              className="w-full" 
                              variant={currentPlan === plan.name.toLowerCase() ? 'outline' : 'default'}
                              onClick={() => handleChangePlan(plan.id, 'monthly')}
                              disabled={currentPlan === plan.name.toLowerCase() || isLoading}
                            >
                              {currentPlan === plan.name.toLowerCase() ? 'Current Plan' : 'Select Monthly'}
                            </Button>
                            {plan.yearlyPrice && (
                              <Button 
                                className="w-full" 
                                variant="outline"
                                onClick={() => handleChangePlan(plan.id, 'yearly')}
                                disabled={currentPlan === plan.name.toLowerCase() || isLoading}
                                size="sm"
                              >
                                Select Yearly (${plan.yearlyPrice}/year)
                              </Button>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No subscription plans available.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Super admin must create subscription plans first.
                    </p>
                  </div>
                )}
              </CardContent>
              {subscriptionPlans && Array.isArray(subscriptionPlans) && subscriptionPlans.length > 0 && (
                <CardFooter>
                  <p className="text-sm text-gray-500">All plans include a 14-day free trial. No credit card required to try.</p>
                </CardFooter>
              )}
            </Card>
          </div>
      </div>
    </DashboardLayout>
  );
}