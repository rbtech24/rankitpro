import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from "ui/alert";
import { Button } from "ui/button";
import { Progress } from "ui/progress";
import { AlertTriangle, TrendingUp, Info } from "lucide-react";
import { useLocation } from "wouter";

interface UsageLimits {
  canCreateCheckIn: boolean;
  currentUsage: number;
  limit: number;
  planName: string;
  limitReached: boolean;
}

export default function UsageWarningBanner() {
  const [, setLocation] = useLocation();
  
  const { data: usageLimits } = useQuery<UsageLimits>({
    queryKey: ['/api/usage-limits'],
    refetchInterval: 60000, // Refetch every minute
  });

  if (!usageLimits) return null;

  const usagePercentage = (usageLimits.currentUsage / usageLimits.limit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const showWarning = isNearLimit || usageLimits.limitReached;

  if (!showWarning) return null;

  const handleUpgrade = () => {
    setLocation('/billing');
  };

  return (
    <Alert className={`mb-6 ${usageLimits.limitReached ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {usageLimits.limitReached ? (
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          ) : (
            <Info className="h-5 w-5 text-yellow-500 mt-0.5" />
          )}
          
          <div className="flex-1">
            <AlertDescription className="text-sm">
              <div className="font-medium mb-2">
                {usageLimits.limitReached 
                  ? 'Monthly Check-in Limit Reached' 
                  : 'Approaching Monthly Limit'
                }
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Usage this month ({usageLimits.planName} Plan)</span>
                  <span className="font-medium">
                    {usageLimits.currentUsage} / {usageLimits.limit} check-ins
                  </span>
                </div>
                <Progress 
                  value={usagePercentage} 
                  className="h-2"
                />
                
                <div className="text-xs text-gray-600">
                  {usageLimits.limitReached 
                    ? 'Upgrade your plan to continue creating check-ins this month.'
                    : 'Consider upgrading for unlimited check-ins.'
                  }
                </div>
              </div>
            </AlertDescription>
          </div>
        </div>
        
        <Button
          onClick={handleUpgrade}
          size="sm"
          className="ml-4 flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Upgrade
        </Button>
      </div>
    </Alert>
  );
}