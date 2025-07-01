import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "layout/DashboardLayout";
import StatsOverview from "dashboard/stats-overview";
import RecentVisits from "dashboard/recent-visits";
import QuickActions from "dashboard/quick-actions";
import AIWriter from "dashboard/ai-writer";
import TechnicianPerformance from "dashboard/technician-performance";
import WebsiteIntegration from "dashboard/website-integration";
import SuperAdminDashboard from "dashboard/super-admin-dashboard";
import TestimonialsSection from "dashboard/testimonials-section";
import CustomerReviewsSection from "dashboard/customer-reviews-section";
import VisitModal from "modals/visit-modal";
import MobileVisitModal from "technician/mobile-visit-modal";
import TechDashboard from "technician/tech-dashboard";

import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "auth";

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
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-1">
                <TechnicianPerformance />
              </div>
              <div className="lg:col-span-1">
                {auth?.user?.companyId && (
                  <CustomerReviewsSection companyId={auth.user.companyId} />
                )}
              </div>
              <div className="lg:col-span-1">
                {auth?.user?.companyId && (
                  <TestimonialsSection companyId={auth.user.companyId} />
                )}
              </div>
            </div>
            
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