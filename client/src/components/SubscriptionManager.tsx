import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, CreditCard, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SubscriptionDetails {
  plan: string;
  planName: string;
  amount: number;
  billingPeriod: string;
  status: 'active' | 'canceled' | 'expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextRenewalDate: string;
  daysUntilRenewal: number;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
}

export function SubscriptionManager() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['/api/billing/subscription-details'],
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription-details'] });
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled. You'll continue to have access until the end of your current billing period.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const reactivateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/billing/reactivate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reactivate subscription');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription-details'] });
      toast({
        title: "Subscription Reactivated",
        description: "Your subscription has been reactivated and will continue as normal.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Reactivation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCancelSubscription = () => {
    setIsLoading(true);
    cancelMutation.mutate();
    setIsLoading(false);
  };

  const handleReactivateSubscription = () => {
    setIsLoading(true);
    reactivateMutation.mutate();
    setIsLoading(false);
  };

  if (isLoadingSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No active subscription found.</p>
          <Button onClick={() => window.location.href = '/billing'} className="mt-4">
            View Subscription Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sub = subscription as SubscriptionDetails;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Management
        </CardTitle>
        <CardDescription>
          Manage your subscription, billing, and cancellation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Current Plan</p>
            <div className="flex items-center gap-2">
              <Badge variant={sub.status === 'active' ? "default" : "secondary"} className="text-sm">
                {sub.planName}
              </Badge>
              <Badge variant={sub.status === 'active' ? "default" : sub.status === 'canceled' ? "destructive" : "secondary"}>
                {sub.status === 'active' ? 'Active' : sub.status === 'canceled' ? 'Canceled' : 'Expired'}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Monthly Cost</p>
            <p className="text-lg font-semibold">${sub.amount}</p>
          </div>
        </div>

        {/* Renewal Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">
                {sub.cancelAtPeriodEnd ? 'Service Ends' : 'Next Renewal'}
              </h4>
              <p className="text-blue-700">
                {new Date(sub.nextRenewalDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-blue-600">
                {sub.daysUntilRenewal} days from now
                {!sub.cancelAtPeriodEnd && ` • Renews every 30 days from first payment`}
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation Warning */}
        {sub.cancelAtPeriodEnd && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900">Subscription Canceled</h4>
                <p className="text-orange-700">
                  Your subscription is set to cancel at the end of your current billing period. 
                  You'll continue to have full access until {new Date(sub.nextRenewalDate).toLocaleDateString()}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {sub.status === 'active' && !sub.cancelAtPeriodEnd && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your subscription? You'll continue to have access 
                    until the end of your current billing period ({new Date(sub.nextRenewalDate).toLocaleDateString()}), 
                    but it won't renew automatically.
                    <br /><br />
                    You can reactivate your subscription at any time before the end of your billing period.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelSubscription} disabled={isLoading}>
                    {isLoading ? 'Canceling...' : 'Yes, Cancel Subscription'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {sub.cancelAtPeriodEnd && (
            <Button onClick={handleReactivateSubscription} disabled={isLoading} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {isLoading ? 'Reactivating...' : 'Reactivate Subscription'}
            </Button>
          )}

          <Button variant="outline" onClick={() => window.location.href = '/billing'}>
            Change Plan
          </Button>
        </div>

        {/* Billing Period Details */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Billing Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Current Period</p>
              <p>{new Date(sub.currentPeriodStart).toLocaleDateString()} - {new Date(sub.currentPeriodEnd).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Billing Frequency</p>
              <p className="capitalize">{sub.billingPeriod} (every 30 days)</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}