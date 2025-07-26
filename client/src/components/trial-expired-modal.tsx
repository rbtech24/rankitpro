
/**
 * Trial Expired Modal Component
 * Blocks access when trial expires and allows direct payment
 */

import { AlertTriangle, CreditCard, Clock, Loader2, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./billing/payment-form";

const getStripePromise = () => {
  const publicKey = "pk_live_51Q1IJKABx6OzSP6kA2eNndSD5luY9WJPP6HSuQ9QFZOFGIlTQaT0YeHAQCIuTlHXEZ0eV04wBl3WdjBtCf4gXi2W00jdezk2mo";
  if (!publicKey || !publicKey.startsWith('pk_')) {
    return Promise.resolve(null);
  }
  try {
    return loadStripe(publicKey);
  } catch (error) {
    return Promise.resolve(null);
  }
};

const stripePromise = getStripePromise();

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose?: () => void;
  trialEndDate?: string;
}

export function TrialExpiredModal({ isOpen, onClose, trialEndDate }: TrialExpiredModalProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'expired' | 'plans' | 'payment' | 'success'>('expired');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get subscription plans
  const { data: subscriptionPlans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/billing/plans"],
    queryFn: async () => {
      const response = await apiRequest('GET', "/api/billing/plans");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create subscription mutation
  const createSubscription = useMutation({
    mutationFn: async (data: { planId: number; billingPeriod: 'monthly' | 'yearly' }) => {
      setIsProcessing(true);
      const response = await apiRequest('POST', '/api/billing/subscription', data);
      return response.json();
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      
      if (data.devMode || data.success) {
        // Success in development mode or direct payment
        setCurrentStep('success');
        toast({
          title: "Account Reactivated!",
          description: "Your subscription has been activated successfully. Full access restored!",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
        
        // Reload page after success
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      }
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setCurrentStep('payment');
      }
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Payment Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    createSubscription.mutate({ planId: plan.id, billingPeriod: 'monthly' });
  };

  const handleViewBilling = () => {
    setLocation('/billing');
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  const handlePaymentSuccess = () => {
    setCurrentStep('success');
    setClientSecret(null);
    toast({
      title: "Payment Successful!",
      description: "Your account has been reactivated. Welcome back!",
      variant: "default",
    });
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
    
    // Reload page to restore access
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleBack = () => {
    if (currentStep === 'plans') {
      setCurrentStep('expired');
    } else if (currentStep === 'payment') {
      setCurrentStep('plans');
      setClientSecret(null);
    }
  };

  // Success step
  if (currentStep === 'success') {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-green-700">
              Account Reactivated!
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Your subscription is now active. You have full access to all features.
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Redirecting you back to the dashboard...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Payment step
  if (currentStep === 'payment' && clientSecret && stripePromise) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
                ← Back
              </Button>
              <div>
                <DialogTitle>Complete Your Subscription</DialogTitle>
                <DialogDescription>
                  Complete payment to reactivate your account immediately
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{selectedPlan.name} Plan</span>
                <span className="text-lg font-bold">${selectedPlan.price}/month</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {selectedPlan.maxTechnicians === -1 ? 'Unlimited' : selectedPlan.maxTechnicians} technicians, 
                {selectedPlan.maxCheckIns === -1 ? 'Unlimited' : selectedPlan.maxCheckIns} submissions
              </div>
            </div>
          )}
          
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm 
              onSuccess={handlePaymentSuccess}
              onError={(error) => {
                toast({
                  title: "Payment Failed",
                  description: error,
                  variant: "destructive",
                });
              }}
              onCancel={handleBack}
            />
          </Elements>
        </DialogContent>
      </Dialog>
    );
  }

  // Plans selection step
  if (currentStep === 'plans') {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
                ← Back
              </Button>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Choose Your Plan
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2">
                  Select a plan to immediately restore access to your account
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="mt-6">
            {plansLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : subscriptionPlans && subscriptionPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionPlans.map((plan: any) => (
                  <div key={plan.id} className="border rounded-lg p-4 hover:border-blue-500 transition-colors relative">
                    {plan.name.toLowerCase() === 'professional' && (
                      <Badge className="absolute -top-2 -right-2 bg-blue-600">Most Popular</Badge>
                    )}
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-2xl font-bold">${plan.price}</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {plan.maxTechnicians === -1 ? 'Unlimited' : plan.maxTechnicians} technicians<br/>
                        {plan.maxCheckIns === -1 ? 'Unlimited' : plan.maxCheckIns} submissions
                      </p>
                      
                      {plan.features && plan.features.length > 0 && (
                        <ul className="text-xs text-gray-600 mt-3 space-y-1 text-left">
                          {plan.features.slice(0, 4).map((feature: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      <Button 
                        onClick={() => handlePlanSelect(plan)}
                        disabled={isProcessing}
                        className="w-full mt-4"
                        variant={plan.name.toLowerCase() === 'professional' ? 'default' : 'outline'}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Select Plan
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Unable to load subscription plans</p>
                <Button onClick={handleViewBilling}>
                  Go to Billing Page
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Initial expired step
  return (
    <Dialog open={isOpen} onOpenChange={onClose ? () => onClose() : undefined}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Trial Expired
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Your company's 14-day free trial ended on {trialEndDate ? new Date(trialEndDate).toLocaleDateString() : '7/5/2025'}.
            Choose a subscription plan to restore access for your team.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2 flex items-center">
              <X className="h-4 w-4 mr-2 text-red-600" />
              Access Restricted
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• All platform features are now locked</li>
              <li>• Your data and settings are safely preserved</li>
              <li>• Upgrade now to restore immediate access</li>
            </ul>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={() => setCurrentStep('plans')}
              className="w-full"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              View Subscription Plans
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleViewBilling}
              className="w-full"
            >
              Go to Billing Page
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full"
              size="sm"
            >
              Sign Out
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Need help? Contact our support team for assistance with upgrading your account.
        </p>
      </DialogContent>
    </Dialog>
  );
}
