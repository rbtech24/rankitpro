/**
 * Trial Enforcement Wrapper
 * Wraps authenticated routes with trial expiration detection and blocking
 */

import { ReactNode, useEffect } from 'react';
import { useTrialEnforcement } from '../hooks/use-trial-enforcement';
import { TrialStatusBanner } from './trial-status-banner';
import { TrialExpiredModal } from './trial-expired-modal';
import { useQuery } from '@tanstack/react-query';

interface TrialEnforcementWrapperProps {
  children: ReactNode;
  user?: {
    id: number;
    role: string;
    companyId?: number;
  };
}

export function TrialEnforcementWrapper({ children, user }: TrialEnforcementWrapperProps) {
  const {
    trialStatus,
    isTrialExpiredModalOpen,
    setIsTrialExpiredModalOpen,
    isTrialExpired,
    daysLeft,
    hasSubscription
  } = useTrialEnforcement();

  // Skip trial enforcement for super admins
  if (!user || user.role === 'super_admin') {
    return <>{children}</>;
  }

  // Skip trial enforcement if user has no company
  if (!user.companyId) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Show trial status banner */}
      {!hasSubscription && (
        <TrialStatusBanner />
      )}

      {/* Show trial expired modal if trial is expired */}
      <TrialExpiredModal 
        isOpen={isTrialExpiredModalOpen}
        trialEndDate={trialStatus?.trialEndDate}
      />

      {/* Render children - note that API calls will be blocked by middleware */}
      {children}
    </>
  );
}