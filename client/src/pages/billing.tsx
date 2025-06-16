import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "@/components/billing/payment-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import StripeConfigNotice from "@/components/billing/stripe-config-notice";

// Initialize Stripe conditionally - only if public key is available
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : Promise.resolve(null);

interface PlanFeature {
  name: string;
  starter: string | boolean;
  pro: string | boolean;
  agency: string | boolean;
}

const planFeatures: PlanFeature[] = [
  { name: "Check-ins per month", starter: "50", pro: "500", agency: "Unlimited" },
  { name: "Blog posts", starter: "20", pro: "200", agency: "Unlimited" },
  { name: "Active technicians", starter: "2", pro: "10", agency: "Unlimited" },
  { name: "AI content generation", starter: true, pro: true, agency: true },
  { name: "WordPress plugin", starter: true, pro: true, agency: true },
  { name: "JavaScript embed", starter: true, pro: true, agency: true },
  { name: "Custom domain", starter: false, pro: true, agency: true },
  { name: "White labeling", starter: false, pro: false, agency: true },
  { name: "API access", starter: false, pro: true, agency: true },
  { name: "Priority support", starter: false, pro: true, agency: true },
];

export default function Billing() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  // State for subscription management and payment modal
  const [currentPlan, setCurrentPlan] = useState<string>("starter");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [renewalDate, setRenewalDate] = useState<Date | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  
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
  
  // Update state based on subscription data
  useEffect(() => {
    if (subscriptionData) {
      setCurrentPlan(subscriptionData.plan || "starter");
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
  
  // Mutation for updating subscription
  const updateSubscription = useMutation({
    mutationFn: async (plan: string) => {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/billing/subscription', { plan });
      return response.json();
    },
    onSuccess: (data) => {
      setIsLoading(false);
      
      // If we have a clientSecret, open the payment modal
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        // Otherwise, just update the subscription
        toast({
          title: "Subscription Updated",
          description: `Your subscription plan has been updated.`,
          variant: "default",
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        setSelectedPlan(null);
      }
    },
    onError: (error: any) => {
      setIsLoading(false);
      console.error('Error updating subscription:', error);
      
      // Extract error message from response
      let errorMessage = "Failed to update your subscription. Please try again.";
      if (error?.response?.json) {
        error.response.json().then((data: any) => {
          if (data.message) {
            setSubscriptionError(data.message);
          }
        });
      } else if (error?.message) {
        setSubscriptionError(error.message);
      }
      
      toast({
        title: "Subscription Error",
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
  
  const handleChangePlan = (plan: string) => {
    setSelectedPlan(plan);
    
    if (plan === currentPlan) {
      toast({
        title: "Already Subscribed",
        description: `You are already subscribed to the ${plan} plan.`,
        variant: "default",
      });
      return;
    }
    
    // Confirm plan change
    if (window.confirm(`Are you sure you want to change your subscription to the ${plan} plan?`)) {
      setIsLoading(true);
      updateSubscription.mutate(plan);
    } else {
      setSelectedPlan(null);
    }
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Payment Modal */}
      <Dialog open={!!clientSecret} onOpenChange={(open) => !open && setClientSecret(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
            <DialogDescription>
              Please provide your payment details to {selectedPlan ? `switch to the ${selectedPlan} plan` : 'complete your subscription'}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
{clientSecret && import.meta.env.VITE_STRIPE_PUBLIC_KEY ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm 
                  clientSecret={clientSecret}
                  onSuccess={() => {
                    setClientSecret(null);
                    toast({
                      title: "Payment Successful",
                      description: `Your subscription has been updated to the ${selectedPlan} plan.`,
                      variant: "default",
                    });
                    queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
                    setSelectedPlan(null);
                  }}
                  buttonText="Complete Payment"
                  isSubscription={true}
                />
              </Elements>
            ) : !import.meta.env.VITE_STRIPE_PUBLIC_KEY ? (
              <StripeConfigNotice showConfigHelp={true} />
            ) : (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Sidebar className={`fixed inset-0 z-40 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:relative`} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
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
                          <div className="text-sm text-gray-500 mb-1">Check-ins</div>
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
                <Button onClick={() => handleChangePlan("pro")}>Upgrade Plan</Button>
              </CardFooter>
            </Card>
            
            {/* Available Plans */}
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>Choose the plan that works best for your business.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Starter Plan */}
                  <Card className={`border-2 ${currentPlan === 'starter' ? 'border-primary' : 'border-gray-200'}`}>
                    <CardHeader>
                      <CardTitle>Starter</CardTitle>
                      <CardDescription>For small businesses just getting started</CardDescription>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">$29</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {planFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="mr-2">{formatFeatureValue(feature.starter)}</span>
                            <span>{typeof feature.starter === 'boolean' ? feature.name : `${feature.name}: ${feature.starter}`}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant={currentPlan === 'starter' ? 'outline' : 'default'}
                        onClick={() => handleChangePlan('starter')}
                        disabled={currentPlan === 'starter' || isLoading}
                      >
                        {currentPlan === 'starter' ? 'Current Plan' : 'Select Plan'}
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Pro Plan */}
                  <Card className={`border-2 ${currentPlan === 'pro' ? 'border-primary' : 'border-gray-200'}`}>
                    <CardHeader>
                      <CardTitle>Pro</CardTitle>
                      <CardDescription>For growing businesses with more needs</CardDescription>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">$79</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {planFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="mr-2">{formatFeatureValue(feature.pro)}</span>
                            <span>{typeof feature.pro === 'boolean' ? feature.name : `${feature.name}: ${feature.pro}`}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant={currentPlan === 'pro' ? 'outline' : 'default'}
                        onClick={() => handleChangePlan('pro')}
                        disabled={currentPlan === 'pro' || isLoading}
                      >
                        {currentPlan === 'pro' ? 'Current Plan' : 'Select Plan'}
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Agency Plan */}
                  <Card className={`border-2 ${currentPlan === 'agency' ? 'border-primary' : 'border-gray-200'}`}>
                    <CardHeader>
                      <CardTitle>Agency</CardTitle>
                      <CardDescription>For larger businesses with advanced needs</CardDescription>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">$199</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {planFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="mr-2">{formatFeatureValue(feature.agency)}</span>
                            <span>{typeof feature.agency === 'boolean' ? feature.name : `${feature.name}: ${feature.agency}`}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant={currentPlan === 'agency' ? 'outline' : 'default'}
                        onClick={() => handleChangePlan('agency')}
                        disabled={currentPlan === 'agency' || isLoading}
                      >
                        {currentPlan === 'agency' ? 'Current Plan' : 'Select Plan'}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">All plans include a 14-day free trial. No credit card required to try.</p>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}