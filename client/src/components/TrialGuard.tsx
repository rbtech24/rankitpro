/**
 * TrialGuard Component
 * Advanced trial protection with comprehensive blocking and user guidance
 */

import { ReactNode, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { AlertTriangle, CreditCard, Clock, Shield, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

interface TrialStatus {
  expired: boolean;
  daysLeft: number;
  subscriptionActive?: boolean;
  trialEndDate?: string;
  error?: string;
}

interface TrialGuardProps {
  children: ReactNode;
  user?: {
    id: number;
    role: string;
    companyId?: number;
  };
  enforceBlocking?: boolean; // When true, completely blocks access
}

export function TrialGuard({ children, user, enforceBlocking = false }: TrialGuardProps) {
  const [, setLocation] = useLocation();
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [blockingActive, setBlockingActive] = useState(false);
  const queryClient = useQueryClient();

  // Skip trial enforcement for super admins
  if (!user || user.role === 'super_admin') {
    return <>{children}</>;
  }

  // Skip trial enforcement if user has no company
  if (!user.companyId) {
    return <>{children}</>;
  }

  // Query trial status with frequent polling for real-time updates
  const { data: trialStatus, error } = useQuery<TrialStatus>({
    queryKey: ['/api/trial/status'],
    retry: false,
    refetchInterval: 15000, // Check every 15 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Monitor for trial expiration
  useEffect(() => {
    if (trialStatus?.expired) {
      setShowTrialModal(true);
      if (enforceBlocking) {
        setBlockingActive(true);
      }
    } else {
      setShowTrialModal(false);
      setBlockingActive(false);
    }
  }, [trialStatus, enforceBlocking]);

  // Global error handler for 403 trial_expired responses
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Check for trial expiration in API responses
      if (response.status === 403) {
        try {
          const data = await response.clone().json();
          if (data.error === 'trial_expired') {
            setShowTrialModal(true);
            setBlockingActive(true);
            // Invalidate trial status to refetch
            queryClient.invalidateQueries({ queryKey: ['/api/trial/status'] });
          }
        } catch (e) {
          // Ignore JSON parsing errors
        }
      }
      
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [queryClient]);

  const handleUpgrade = () => {
    setLocation('/billing');
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  const handleDismiss = () => {
    if (!enforceBlocking) {
      setShowTrialModal(false);
    }
  };

  // Show trial warning banner for non-expired but low days
  const showWarningBanner = trialStatus && !trialStatus.expired && 
                           !trialStatus.subscriptionActive && 
                           trialStatus.daysLeft <= 7;

  // Complete blocking mode - show modal and prevent access
  if (blockingActive && trialStatus?.expired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Trial Expired
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your 14-day free trial ended on{' '}
            {trialStatus.trialEndDate ? 
              new Date(trialStatus.trialEndDate).toLocaleDateString() : 
              'recently'
            }. Choose a subscription plan to restore access to all features.
          </p>
          
          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <Shield className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="font-medium text-red-900">Access Restricted</h3>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• All platform features are now locked</li>
              <li>• Your data and settings are safely preserved</li>
              <li>• Upgrade now to restore immediate access</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleUpgrade}
              className="w-full"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              View Subscription Plans
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Trial Warning Banner */}
      {showWarningBanner && (
        <Alert className="border-yellow-500 bg-yellow-50 mb-4">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="text-yellow-800">
              <strong>Trial Ending Soon!</strong> Only {trialStatus.daysLeft} days left in your free trial.
              Upgrade now to avoid interruption.
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleUpgrade}
              className="ml-4 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Trial Expired Modal */}
      <Dialog open={showTrialModal} onOpenChange={handleDismiss}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              Free Trial Expired
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Your 14-day free trial ended on{' '}
              {trialStatus?.trialEndDate ? 
                new Date(trialStatus.trialEndDate).toLocaleDateString() : 
                'recently'
              }. Upgrade to continue using Rank It Pro.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-600" />
                What happens now?
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Choose a subscription plan to restore access</li>
                <li>• All your data and settings are preserved</li>
                <li>• Resume using all platform features immediately</li>
                <li>• No setup required - just upgrade and continue</li>
              </ul>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={handleUpgrade}
                className="w-full"
                size="lg"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                View Subscription Plans
              </Button>
              
              {!enforceBlocking && (
                <Button 
                  variant="outline" 
                  onClick={handleDismiss}
                  className="w-full"
                >
                  Continue (Limited Access)
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="w-full text-gray-500"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Render children */}
      {children}
    </>
  );
}