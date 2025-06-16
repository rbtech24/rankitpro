import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import StatsOverview from "@/components/dashboard/stats-overview";
import RecentVisits from "@/components/dashboard/recent-visits";
import QuickActions from "@/components/dashboard/quick-actions";
import AIWriter from "@/components/dashboard/ai-writer";
import TechnicianPerformance from "@/components/dashboard/technician-performance";
import WebsiteIntegration from "@/components/dashboard/website-integration";
import SuperAdminDashboard from "@/components/dashboard/super-admin-dashboard";
import VisitModal from "@/components/modals/visit-modal";
import MobileVisitModal from "@/components/technician/mobile-visit-modal";
import TechDashboard from "@/components/technician/tech-dashboard";

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
  
  const isAdmin = isSuperAdmin || isCompanyAdmin;

  // Redirect super admins to system overview
  useEffect(() => {
    if (isSuperAdmin) {
      setLocation("/system-overview");
    }
  }, [isSuperAdmin, setLocation]);
  
  return (
    <DashboardLayout>
      <div className="fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {isSuperAdmin 
              ? "System administration dashboard for managing the entire platform."
              : isAdmin 
              ? "Welcome back! Here's what's happening with your company."
              : "Welcome back! Here's what's happening with your visits."}
          </p>
        </div>
        
        {/* Super Admin System Dashboard */}
        {isSuperAdmin ? (
          <SuperAdminDashboard />
        ) : isAdmin ? (
          <>
            {/* Company Admin Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <StatsOverview />
              </div>
              <div className="lg:col-span-1">
                <QuickActions onOpenVisitModal={() => setVisitModalOpen(true)} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="lg:col-span-1">
                <RecentVisits />
              </div>
              <div className="lg:col-span-1">
                <AIWriter />
              </div>
            </div>
            
            <TechnicianPerformance />
            <WebsiteIntegration />
          </>
        ) : (
          <TechDashboard onNewVisit={() => setVisitModalOpen(true)} />
        )}
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