/**
 * Trial Enforcement Hook
 * Handles trial expiration detection and user blocking
 */

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface TrialStatus {
  expired: boolean;
  daysLeft: number;
  subscriptionActive?: boolean;
  trialEndDate?: string;
  error?: string;
}

export function useTrialEnforcement() {
  const [isTrialExpiredModalOpen, setIsTrialExpiredModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Query trial status
  const { data: trialStatus, error } = useQuery<TrialStatus>({
    queryKey: ['/api/trial/status'],
    retry: false,
    refetchInterval: 30000, // Check every 30 seconds
    refetchOnWindowFocus: true,
  });

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
            setIsTrialExpiredModalOpen(true);
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

  // Check trial status from query
  useEffect(() => {
    if (trialStatus?.expired) {
      setIsTrialExpiredModalOpen(true);
    }
  }, [trialStatus]);

  return {
    trialStatus,
    isTrialExpiredModalOpen,
    setIsTrialExpiredModalOpen,
    isTrialExpired: trialStatus?.expired || false,
    daysLeft: trialStatus?.daysLeft || 0,
    hasSubscription: trialStatus?.subscriptionActive || false
  };
}