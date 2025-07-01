import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthState, getCurrentUser } from '@/lib/auth';
import TechDashboard from '@/components/technician/tech-dashboard';
import MobileVisitModal from '@/components/technician/mobile-visit-modal';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechnicianDashboardPage() {
  const [showVisitModal, setShowVisitModal] = useState(false);
  
  const { data: auth, isLoading } = useQuery<AuthState>({
    queryKey: ['/api/auth/me'],
    queryFn: getCurrentUser
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!auth?.user) {
    return null;
  }

  return (
    <DashboardLayout>
      <TechDashboard onNewVisit={() => setShowVisitModal(true)} />
      
      {/* Visit Modal */}
      {showVisitModal && (
        <MobileVisitModal
          isOpen={showVisitModal}
          onClose={() => setShowVisitModal(false)}
        />
      )}
    </DashboardLayout>
  );
}