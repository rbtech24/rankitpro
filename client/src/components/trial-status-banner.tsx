/**
 * Trial Status Banner Component
 * Shows trial countdown and upgrade prompts
 */

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Calendar, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface TrialStatus {
  expired: boolean;
  daysLeft: number;
  subscriptionActive?: boolean;
  trialEndDate?: string;
}

export function TrialStatusBanner() {
  const [, setLocation] = useLocation();
  
  const { data: trialStatus } = useQuery<TrialStatus>({
    queryKey: ['/api/trial/status'],
    retry: false,
    refetchInterval: 60000, // Check every minute
  });

  // Don't show banner if user has active subscription
  if (!trialStatus || trialStatus.subscriptionActive) {
    return null;
  }

  // Trial expired - show urgent upgrade notice
  if (trialStatus.expired) {
    return (
      <Alert className="border-red-500 bg-red-50 mb-4">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="text-red-800">
            <strong>Trial Expired</strong> - Your 14-day free trial has ended. 
            Upgrade now to continue using Rank It Pro.
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setLocation('/billing')}
            className="ml-4"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Trial active but running low - show warning
  if (trialStatus.daysLeft <= 3) {
    return (
      <Alert className="border-orange-500 bg-orange-50 mb-4">
        <Calendar className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="text-orange-800">
            <strong>{trialStatus.daysLeft} day{trialStatus.daysLeft !== 1 ? 's' : ''} left</strong> in your free trial. 
            Upgrade to continue accessing all features.
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation('/billing')}
            className="ml-4 border-orange-500 text-orange-700 hover:bg-orange-100"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            View Plans
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Trial active with plenty of time - subtle reminder
  if (trialStatus.daysLeft <= 7) {
    return (
      <Alert className="border-blue-500 bg-blue-50 mb-4">
        <Calendar className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="text-blue-800">
            {trialStatus.daysLeft} days remaining in your free trial
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation('/billing')}
            className="ml-4 text-blue-700 hover:bg-blue-100"
          >
            View Plans
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}