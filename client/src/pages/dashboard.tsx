import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import StatsOverview from "@/components/dashboard/stats-overview";
import RecentVisits from "@/components/dashboard/recent-visits";
import QuickActions from "@/components/dashboard/quick-actions";
import TechnicianPerformance from "@/components/dashboard/technician-performance";
import WebsiteIntegration from "@/components/dashboard/website-integration";
import SuperAdminDashboard from "@/components/dashboard/super-admin-dashboard";
import VisitModal from "@/components/modals/visit-modal";
import MobileVisitModal from "@/components/technician/mobile-visit-modal";
import TechDashboard from "@/components/technician/tech-dashboard";
import UsageWarningBanner from "@/components/usage-warning-banner";

import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "@/lib/auth";

export default function Dashboard() {
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  const userRole = auth?.user?.role;
  const isSuperAdmin = userRole === "super_admin";
  const isCompanyAdmin = userRole === "company_admin";
  const isTechnician = userRole === "technician";

  // Redirect technicians to enhanced mobile field app
  useEffect(() => {
    if (isTechnician) {
      setTimeout(() => {
        setLocation("/mobile-field-app");
      }, 1000); // Short delay to show the loading message
    }
  }, [isTechnician, setLocation]);
  
  return (
    <DashboardLayout>
      <div className="fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {isSuperAdmin 
              ? "System administration dashboard for managing the entire platform."
              : isCompanyAdmin 
              ? "Welcome back! Here's what's happening with your company."
              : "Welcome back! Here's what's happening with your visits."}
          </p>
        </div>
        
        {/* Super Admin System Dashboard */}
        {isSuperAdmin ? (
          <SuperAdminDashboard />
        ) : isCompanyAdmin ? (
          <>
            {/* Usage Warning Banner for Company Admins */}
            <UsageWarningBanner />
            
            {/* Company Admin Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatsOverview />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2">
                <RecentVisits />
              </div>
              <div className="md:col-span-1">
                <QuickActions onOpenVisitModal={() => setVisitModalOpen(true)} />
              </div>
            </div>
            
            {/* Admin-specific components */}
            <TechnicianPerformance />
            <WebsiteIntegration />
          </>
        ) : isTechnician ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Redirecting to Mobile Field App...</p>
          </div>
        ) : null}
      </div>
      
      {isTechnician ? (
        <MobileVisitModal 
          isOpen={visitModalOpen} 
          onClose={() => setVisitModalOpen(false)} 
        />
      ) : (
        <VisitModal 
          isOpen={visitModalOpen} 
          onClose={() => setVisitModalOpen(false)} 
        />
      )}
    </DashboardLayout>
  );
}