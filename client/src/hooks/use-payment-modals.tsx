
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

interface PaymentModalState {
  showTrialExpired: boolean;
  showPaymentFailed: boolean;
  paymentError?: string;
  attemptedPlan?: any;
}

export function usePaymentModals() {
  const [modalState, setModalState] = useState<PaymentModalState>({
    showTrialExpired: false,
    showPaymentFailed: false,
  });

  // Get current user and trial status
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const { data: trialStatus } = useQuery({
    queryKey: ['/api/trial/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/trial/status');
      return response.json();
    },
    enabled: !!user && user.role !== 'super_admin',
    refetchInterval: 15000,
  });

  const showTrialExpiredModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      showTrialExpired: true,
      showPaymentFailed: false,
    }));
  }, []);

  const showPaymentFailedModal = useCallback((error: string, attemptedPlan?: any) => {
    setModalState(prev => ({
      ...prev,
      showTrialExpired: false,
      showPaymentFailed: true,
      paymentError: error,
      attemptedPlan,
    }));
  }, []);

  const hideAllModals = useCallback(() => {
    setModalState({
      showTrialExpired: false,
      showPaymentFailed: false,
    });
  }, []);

  const isTrialExpired = trialStatus?.expired && user?.role !== 'super_admin';
  const shouldShowTrialModal = isTrialExpired && modalState.showTrialExpired;

  return {
    // State
    modalState,
    isTrialExpired,
    trialStatus,
    user,
    
    // Actions
    showTrialExpiredModal,
    showPaymentFailedModal,
    hideAllModals,
    
    // Computed
    shouldShowTrialModal,
    shouldShowPaymentFailedModal: modalState.showPaymentFailed,
  };
}
