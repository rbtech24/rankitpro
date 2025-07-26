
/**
 * Trial Expired Modal Component
 * Redesigned with streamlined payment options for service restoration
 */

import { AlertTriangle, CreditCard, Clock, Loader2, Check, X, ArrowLeft, Star } from "lucide-react";
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
  
  // Check if we're in development and use test key
  const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('replit');
  const testKey = "pk_test_51Q1IJKABx6OzSP6kRq8F1vKKJ6r1r7QfQ8Y7nU8TnH5gH8cKL9hWpA8YqL8qK8cN7vN6tM8hB9aY6xC4vS8wD7aR5nE1zF2aK00XhY8qY";
  
  const keyToUse = isDev && testKey ? testKey : publicKey;
  
  if (!keyToUse || !keyToUse.startsWith('pk_')) {
    console.warn('Stripe key not configured properly');
    return Promise.resolve(null);
  }
  
  try {
    console.log('Loading Stripe with key:', keyToUse.substring(0, 20) + '...');
    return loadStripe(keyToUse);
  } catch (error) {
    console.error('Failed to load Stripe:', error);
    return Promise.resolve(null);
  }
};

const stripePromise = getStripePromise();

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose?: () => void;
  trialEndDate?: string;
}

interface PaymentFailedModalProps {
  isOpen: boolean;
  onClose?: () => void;
  error?: string;
  attemptedPlan?: any;
}

export function TrialExpiredModal({ isOpen, onClose, trialEndDate }: TrialExpiredModalProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'expired' | 'plans' | 'payment' | 'success'>('expired');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get current user to check role
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  // Don't show modal for super admins
  if (user?.role === 'super_admin') {
    return null;
  }

  // Get subscription plans
  const { data: subscriptionPlans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/billing/plans"],
    queryFn: async () => {
      const response = await apiRequest('GET', "/api/billing/plans");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
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
      
      // Always try to show Stripe payment form first
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setCurrentStep('payment');
        return;
      }
      
      // Only fall back to dev mode if no client secret is provided
      if (data.devMode || data.success) {
        setCurrentStep('success');
        toast({
          title: "🎉 Service Restored!",
          description: "Your account is now active. All features have been restored.",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      }
      
      // If neither client secret nor dev mode, show error
      toast({
        title: "Payment Setup Failed",
        description: "Unable to setup payment processing. Please try again.",
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Payment Setup Failed",
        description: "Unable to setup payment. Please try again or contact support.",
        variant: "destructive",
      });
    }
  });

  const handleQuickRestore = (plan: any, billing: 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
    setSelectedBilling(billing);
    createSubscription.mutate({ planId: plan.id, billingPeriod: billing });
  };

  const handlePaymentSuccess = () => {
    setCurrentStep('success');
    setClientSecret(null);
    toast({
      title: "🎉 Payment Successful!",
      description: "Your service has been restored. Welcome back!",
      variant: "default",
    });
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  // Success step
  if (currentStep === 'success') {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-green-700 mb-2">
            Service Restored!
          </DialogTitle>
          <DialogDescription className="text-gray-600 mb-4">
            Your subscription is active and all features are now available.
          </DialogDescription>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting you back to the dashboard...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Payment step
  if (currentStep === 'payment' && clientSecret) {
    const price = selectedBilling === 'yearly' ? 
      (selectedPlan?.yearlyPrice || selectedPlan?.price * 12) : 
      selectedPlan?.price;

    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center mb-4">
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep('plans')} className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <DialogTitle>Complete Payment</DialogTitle>
                <DialogDescription>
                  Restore your service immediately with {selectedPlan?.name} plan
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{selectedPlan?.name} Plan</span>
              <span className="text-xl font-bold">${price}/{selectedBilling}</span>
            </div>
            <div className="text-sm text-gray-600">
              {selectedPlan?.maxTechnicians === -1 ? 'Unlimited' : selectedPlan?.maxTechnicians} technicians • 
              {selectedPlan?.maxCheckIns === -1 ? 'Unlimited' : selectedPlan?.maxCheckIns} submissions
            </div>
            {selectedBilling === 'yearly' && selectedPlan?.yearlyPrice && (
              <div className="text-sm text-green-600 font-medium mt-1">
                Save ${(selectedPlan.price * 12) - selectedPlan.yearlyPrice}/year
              </div>
            )}
          </div>
          
          {stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm 
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onError={(error) => {
                  toast({
                    title: "Payment Failed",
                    description: error,
                    variant: "destructive",
                  });
                }}
                onCancel={() => setCurrentStep('plans')}
              />
            </Elements>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-yellow-800 mb-3">
                <strong>Payment Processing Unavailable</strong>
              </div>
              <p className="text-sm text-yellow-700 mb-4">
                Stripe payment processing is not configured. This typically happens in development environments.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    // Simulate successful payment for development
                    handlePaymentSuccess();
                  }}
                  className="flex-1"
                >
                  Continue (Dev Mode)
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep('plans')}
                  className="flex-1"
                >
                  Back to Plans
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Plans selection step
  if (currentStep === 'plans') {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center mb-4">
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep('expired')} className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Restore Your Service
                </DialogTitle>
                <DialogDescription>
                  Choose a plan to immediately regain access to all features
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {plansLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : subscriptionPlans && subscriptionPlans.length > 0 ? (
            <div className="space-y-6">
              {/* Billing Toggle */}
              <div className="flex justify-center">
                <div className="bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setSelectedBilling('monthly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedBilling === 'monthly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setSelectedBilling('yearly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedBilling === 'yearly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Yearly <span className="text-green-600 text-xs">Save 20%</span>
                  </button>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionPlans.map((plan: any) => {
                  const price = selectedBilling === 'yearly' ? 
                    (plan.yearlyPrice || plan.price * 12) : 
                    plan.price;
                  const isPopular = plan.name.toLowerCase() === 'professional';
                  
                  return (
                    <div key={plan.id} className={`relative border rounded-lg p-6 hover:border-blue-500 transition-colors ${
                      isPopular ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                    }`}>
                      {isPopular && (
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                          <Star className="h-3 w-3 mr-1" />
                          Most Popular
                        </Badge>
                      )}
                      
                      <div className="text-center">
                        <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                        <div className="mb-4">
                          <span className="text-3xl font-bold">${price}</span>
                          <span className="text-gray-500">/{selectedBilling}</span>
                        </div>
                        
                        <div className="space-y-2 mb-6 text-sm text-left">
                          <div className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            <span>{plan.maxTechnicians === -1 ? 'Unlimited' : plan.maxTechnicians} technicians</span>
                          </div>
                          <div className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            <span>{plan.maxCheckIns === -1 ? 'Unlimited' : plan.maxCheckIns} submissions</span>
                          </div>
                          {plan.features?.slice(0, 3).map((feature: string, index: number) => (
                            <div key={index} className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          onClick={() => handleQuickRestore(plan, selectedBilling)}
                          disabled={isProcessing}
                          className={`w-full ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                          variant={isPopular ? 'default' : 'outline'}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Restore Service
                            </>
                          )}
                        </Button>
                        
                        {selectedBilling === 'yearly' && plan.yearlyPrice && (
                          <p className="text-xs text-green-600 mt-2 font-medium">
                            Save ${(plan.price * 12) - plan.yearlyPrice} vs monthly
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Unable to load subscription plans</p>
              <Button onClick={() => setLocation('/billing')}>
                Go to Billing Page
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Initial expired step
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Service Suspended
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Your 14-day trial ended on {trialEndDate ? new Date(trialEndDate).toLocaleDateString() : 'recently'}.
            Choose a plan to restore immediate access.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h4 className="font-medium text-red-900 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-red-600" />
              Current Status
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• All features are temporarily locked</li>
              <li>• Your data is safely preserved</li>
              <li>• Restore access in under 2 minutes</li>
            </ul>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={() => setCurrentStep('plans')}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Restore Service Now
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setLocation('/billing')}
              className="w-full"
            >
              View All Options
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/api/auth/logout'}
              className="w-full text-gray-500"
              size="sm"
            >
              Sign Out
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Questions? Contact support for assistance with plan selection.
        </p>
      </DialogContent>
    </Dialog>
  );
}

// Payment Failed Modal Component
export function PaymentFailedModal({ isOpen, onClose, error, attemptedPlan }: PaymentFailedModalProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isRetrying, setIsRetrying] = useState(false);

  // Get subscription plans for retry options
  const { data: subscriptionPlans } = useQuery({
    queryKey: ["/api/billing/plans"],
    queryFn: async () => {
      const response = await apiRequest('GET', "/api/billing/plans");
      return response.json();
    },
  });

  const handleRetryPayment = () => {
    setIsRetrying(true);
    // Redirect to billing page or retry the same plan
    setLocation('/billing');
  };

  const handleTryDifferentPlan = () => {
    setLocation('/billing');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-red-700">
            Payment Failed
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            {error || "We couldn't process your payment. Your service remains suspended until payment is completed."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {attemptedPlan && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Attempted Plan</h4>
              <div className="text-sm text-blue-700">
                {attemptedPlan.name} - ${attemptedPlan.price}/month
              </div>
            </div>
          )}

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-medium text-yellow-900 mb-2">Common Solutions</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Check your card details and try again</li>
              <li>• Ensure sufficient funds are available</li>
              <li>• Try a different payment method</li>
              <li>• Contact your bank if needed</li>
            </ul>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleRetryPayment}
              disabled={isRetrying}
              className="w-full"
              size="lg"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Retry Payment
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleTryDifferentPlan}
              className="w-full"
            >
              Try Different Plan
            </Button>
            
            <Button 
              variant="ghost"
              onClick={onClose}
              className="w-full text-gray-500"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Need help? Contact our support team for payment assistance.
        </p>
      </DialogContent>
    </Dialog>
  );
}
