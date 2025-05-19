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

// Initialize Stripe outside of the component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

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
  const [currentPlan, setCurrentPlan] = useState(auth?.company?.plan || "starter");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [renewalDate, setRenewalDate] = useState<Date | null>(null);
  
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
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setIsPaymentModalOpen(true);
      } else {
        // If no client secret is returned, the subscription was updated without requiring payment
        toast({
          title: "Subscription Updated",
          description: `Your subscription has been updated to the ${selectedPlan} plan.`,
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        setSelectedPlan(null);
      }
    },
    onError: (error) => {
      setIsLoading(false);
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update your subscription. Please try again.",
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
  
  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setClientSecret(null);
    toast({
      title: "Payment Successful",
      description: `Your subscription has been updated to the ${selectedPlan} plan.`,
      variant: "default",
    });
    queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    setSelectedPlan(null);
  };
  
  const handlePaymentCancel = () => {
    setIsPaymentModalOpen(false);
    setClientSecret(null);
    setSelectedPlan(null);
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
    <>
      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
            <DialogDescription>
              Please provide your payment details to {selectedPlan ? `switch to the ${selectedPlan} plan` : 'complete your subscription'}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {clientSecret && stripePromise ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm 
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  buttonText="Complete Payment"
                  isSubscription={true}
                />
              </Elements>
            ) : (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar className={`fixed inset-0 z-40 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:relative`} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="text-sm text-gray-500">Manage your subscription plan and billing information.</p>
          </div>
          
          <div className="space-y-6">
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
                    <p className="text-xl font-semibold">Monthly</p>
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
                            <div className="text-xl font-semibold">{subscriptionData.usage.blogposts.used}</div>
                            <div className="text-sm text-gray-500">/ {subscriptionData.usage.blogposts.limit}</div>
                          </div>
                          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${subscriptionData.usage.blogposts.used / subscriptionData.usage.blogposts.limit > 0.9 ? 'bg-red-500' : 'bg-primary'}`} 
                              style={{ width: `${Math.min(100, (subscriptionData.usage.blogposts.used / subscriptionData.usage.blogposts.limit) * 100)}%` }}>
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
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Manage your payment methods on file.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSubscription ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : paymentMethods.length > 0 ? (
                  paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center">
                        <div className="rounded-md bg-gray-100 p-2 mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                            <rect width="20" height="14" x="2" y="5" rx="2"/>
                            <line x1="2" x2="22" y1="10" y2="10"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">{method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} ending in {method.last4}</p>
                          <p className="text-sm text-gray-500">Expires {method.expMonth}/{method.expYear}</p>
                        </div>
                      </div>
                      {method.isDefault && <Badge>Default</Badge>}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No payment methods on file
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => {
                  if (subscriptionStatus === 'active') {
                    window.location.href = '/update-payment-method'; // You can implement this page later
                  } else {
                    toast({
                      title: "No Active Subscription",
                      description: "You need an active subscription to update payment methods.",
                      variant: "default",
                    });
                  }
                }}>
                  {paymentMethods.length > 0 ? 'Update Payment Method' : 'Add Payment Method'}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View your previous invoices and payments.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>May 15, 2024</TableCell>
                      <TableCell>Monthly Subscription - Starter Plan</TableCell>
                      <TableCell>$29.00</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Apr 15, 2024</TableCell>
                      <TableCell>Monthly Subscription - Starter Plan</TableCell>
                      <TableCell>$29.00</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Mar 15, 2024</TableCell>
                      <TableCell>Monthly Subscription - Starter Plan</TableCell>
                      <TableCell>$29.00</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>Compare plans and choose the best option for your business.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead>Starter<br /><span className="font-normal text-xs">$29/month</span></TableHead>
                        <TableHead>Pro<br /><span className="font-normal text-xs">$79/month</span></TableHead>
                        <TableHead>Agency<br /><span className="font-normal text-xs">$199/month</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {planFeatures.map((feature, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{feature.name}</TableCell>
                          <TableCell className="text-center">{formatFeatureValue(feature.starter)}</TableCell>
                          <TableCell className="text-center">{formatFeatureValue(feature.pro)}</TableCell>
                          <TableCell className="text-center">{formatFeatureValue(feature.agency)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card className={`border-2 ${currentPlan === "starter" ? "border-primary" : "border-gray-200"}`}>
                    <CardHeader className="py-4">
                      <CardTitle>Starter</CardTitle>
                      <CardDescription>Perfect for small businesses</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <div className="text-3xl font-bold mb-2">$29<span className="text-sm font-normal text-gray-500">/month</span></div>
                      <Button 
                        className="w-full" 
                        variant={currentPlan === "starter" ? "outline" : "default"}
                        onClick={() => handleChangePlan("starter")}
                        disabled={currentPlan === "starter"}
                      >
                        {currentPlan === "starter" ? "Current Plan" : "Switch to Starter"}
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className={`border-2 ${currentPlan === "pro" ? "border-primary" : "border-gray-200"}`}>
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Pro</CardTitle>
                          <CardDescription>For growing businesses</CardDescription>
                        </div>
                        <Badge>Popular</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <div className="text-3xl font-bold mb-2">$79<span className="text-sm font-normal text-gray-500">/month</span></div>
                      <Button 
                        className="w-full" 
                        variant={currentPlan === "pro" ? "outline" : "default"}
                        onClick={() => handleChangePlan("pro")}
                        disabled={currentPlan === "pro"}
                      >
                        {currentPlan === "pro" ? "Current Plan" : "Switch to Pro"}
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className={`border-2 ${currentPlan === "agency" ? "border-primary" : "border-gray-200"}`}>
                    <CardHeader className="py-4">
                      <CardTitle>Agency</CardTitle>
                      <CardDescription>For large teams and agencies</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <div className="text-3xl font-bold mb-2">$199<span className="text-sm font-normal text-gray-500">/month</span></div>
                      <Button 
                        className="w-full" 
                        variant={currentPlan === "agency" ? "outline" : "default"}
                        onClick={() => handleChangePlan("agency")}
                        disabled={currentPlan === "agency"}
                      >
                        {currentPlan === "agency" ? "Current Plan" : "Switch to Agency"}
                      </Button>
                    </CardContent>
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
