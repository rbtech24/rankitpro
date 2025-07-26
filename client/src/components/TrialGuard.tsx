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
import { TrialExpiredModal, PaymentFailedModal } from "./trial-expired-modal";
import { usePaymentModals } from "../hooks/use-payment-modals";

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
  const [location, setLocation] = useLocation();
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [blockingActive, setBlockingActive] = useState(false);
  const queryClient = useQueryClient();

  // Allow access to billing page even when trial is expired
  const isBillingPage = location === '/billing';

  // TrialGuard is specifically for company admins and technicians
  if (!user) {
    return <>{children}</>;
  }

  // Skip trial enforcement for super admins - they have system-wide access
  if (user.role === 'super_admin') {
    console.log('Super admin detected - skipping trial enforcement');
    return <>{children}</>;
  }

  // Only enforce for company admins and technicians
  if (user.role !== 'company_admin' && user.role !== 'technician') {
    console.log('Non-company role detected - skipping trial enforcement:', user.role);
    return <>{children}</>;
  }

  // Skip trial enforcement if user has no company (shouldn't happen for company roles)
  if (!user.companyId) {
    console.log('No company ID found - skipping trial enforcement');
    return <>{children}</>;
  }

  // Query trial status with frequent polling for real-time updates
  const { data: trialStatus, error } = useQuery<TrialStatus>({
    queryKey: ['/api/trial/status'],
    retry: false,
    refetchInterval: user?.role === 'super_admin' ? false : 15000, // Don't poll for super admins
    refetchOnWindowFocus: user?.role !== 'super_admin',
    refetchOnMount: user?.role !== 'super_admin',
    enabled: user?.role !== 'super_admin' && user?.role === 'company_admin' || user?.role === 'technician',
  });

  // Monitor for trial expiration
  useEffect(() => {
    if (trialStatus?.expired) {
      // Only show modal if not on billing page
      if (!isBillingPage) {
        setShowTrialModal(true);
      }
      if (enforceBlocking) {
        setBlockingActive(true);
      }
    } else {
      setShowTrialModal(false);
      setBlockingActive(false);
    }
  }, [trialStatus, enforceBlocking, isBillingPage]);

  // Global error handler for 403 trial_expired responses
  useEffect(() => {
    // Skip global fetch interception for super admins
    if (user?.role === 'super_admin') {
      return;
    }

    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      // Check for trial expiration in API responses
      if (response.status === 403) {
        try {
          const data = await response.clone().json();
          if (data.error === 'trial_expired') {
            // Only show modal if not on billing page
            if (!isBillingPage) {
              setShowTrialModal(true);
            }
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
  }, [queryClient, isBillingPage, user?.role]);

  const handleUpgrade = () => {
    console.log('Navigating to billing page...');
    // Temporarily disable blocking to allow navigation
    setBlockingActive(false);
    setShowTrialModal(false);
    // Navigate to billing page
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

  // Listen for quick payment trigger from banner
  useEffect(() => {
    const handleShowTrialModal = () => {
      setShowTrialModal(true);
    };

    window.addEventListener('show-trial-modal', handleShowTrialModal);
    return () => {
      window.removeEventListener('show-trial-modal', handleShowTrialModal);
    };
  }, []);

  // Show trial warning banner for non-expired but low days
  const showWarningBanner = trialStatus && !trialStatus.expired && 
                           !trialStatus.subscriptionActive && 
                           trialStatus.daysLeft <= 7;

  // Complete blocking mode - show modal and prevent access (except for billing page)
  if (blockingActive && trialStatus?.expired && !isBillingPage) {
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
            Your company's 14-day free trial ended on{' '}
            {trialStatus.trialEndDate ? 
              new Date(trialStatus.trialEndDate).toLocaleDateString() : 
              'recently'
            }. {user.role === 'company_admin' ? 
              'Choose a subscription plan to restore access for your team.' :
              'Please contact your company administrator to upgrade the subscription.'
            }
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
            {user.role === 'company_admin' ? (
              <Button 
                onClick={handleUpgrade}
                className="w-full"
                size="lg"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                View Subscription Plans
              </Button>
            ) : (
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-700 font-medium">
                  Please contact your company administrator to restore access.
                </p>
              </div>
            )}

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

      {/* Enhanced Trial Expired Modal */}
      <TrialExpiredModal 
        isOpen={showTrialModal}
        onClose={handleDismiss}
        trialEndDate={trialStatus?.trialEndDate}
      />

      {/* Render children */}
      {children}
    </>
  );
}