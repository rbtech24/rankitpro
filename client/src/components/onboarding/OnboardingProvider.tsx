import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../lib/auth';
import { OnboardingWalkthrough } from './OnboardingWalkthrough';

interface OnboardingContextType {
  showWalkthrough: boolean;
  setShowWalkthrough: (show: boolean) => void;
  hasSeenWalkthrough: boolean;
  startWalkthrough: () => void;
  completeWalkthrough: () => void;
  resetWalkthrough: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [hasSeenWalkthrough, setHasSeenWalkthrough] = useState(false);
  const [shouldAutoStart, setShouldAutoStart] = useState(false);

  // Get current user and company info
  const { data: auth } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: getCurrentUser,
  });

  const { data: company } = useQuery({
    queryKey: ['/api/companies/current'],
    enabled: !!auth?.user,
  });

  const { data: onboardingData } = useQuery({
    queryKey: ['/api/onboarding/progress'],
    enabled: !!auth?.user,
  });

  // Determine if user should see walkthrough
  useEffect(() => {
    if (auth?.user && onboardingData !== undefined) {
      const hasCompletedWalkthrough = onboardingData?.hasSeenWalkthrough || false;
      setHasSeenWalkthrough(hasCompletedWalkthrough);

      // Auto-start for new users
      if (!hasCompletedWalkthrough && !showWalkthrough) {
        // Check if this is a new user (account created within last 24 hours)
        const userCreatedAt = new Date(auth.user.createdAt || 0);
        const now = new Date();
        const hoursSinceCreation = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceCreation < 24) {
          setShouldAutoStart(true);
        }
      }
    }
  }, [auth, onboardingData, showWalkthrough]);

  // Auto-start walkthrough for new users after a short delay
  useEffect(() => {
    if (shouldAutoStart && !showWalkthrough) {
      const timer = setTimeout(() => {
        setShowWalkthrough(true);
        setShouldAutoStart(false);
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [shouldAutoStart, showWalkthrough]);

  const startWalkthrough = () => {
    setShowWalkthrough(true);
  };

  const completeWalkthrough = () => {
    setShowWalkthrough(false);
    setHasSeenWalkthrough(true);
  };

  const resetWalkthrough = () => {
    setShowWalkthrough(false);
    setHasSeenWalkthrough(false);
    setShouldAutoStart(false);
  };

  const contextValue: OnboardingContextType = {
    showWalkthrough,
    setShowWalkthrough,
    hasSeenWalkthrough,
    startWalkthrough,
    completeWalkthrough,
    resetWalkthrough,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
      
      {/* Render walkthrough if conditions are met */}
      {auth?.user && company && showWalkthrough && (
        <OnboardingWalkthrough
          userRole={auth.user.role}
          businessType={company.businessType || 'field_service'}
          isOpen={showWalkthrough}
          onClose={() => setShowWalkthrough(false)}
          onComplete={completeWalkthrough}
          autoStart={shouldAutoStart}
        />
      )}
    </OnboardingContext.Provider>
  );
}