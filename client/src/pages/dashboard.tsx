import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import StatsOverview from "../components/dashboard/stats-overview";
import RecentVisits from "../components/dashboard/recent-visits";
import QuickActions from "../components/dashboard/quick-actions";
import TechnicianPerformance from "../components/dashboard/technician-performance";
import WebsiteIntegration from "../components/dashboard/website-integration";
import SuperAdminDashboard from "../components/dashboard/super-admin-dashboard";
import VisitModal from "../components/modals/visit-modal";
import MobileVisitModal from "../components/technician/mobile-visit-modal";
import TechDashboard from "../components/technician/tech-dashboard";
import UsageWarningBanner from "../components/usage-warning-banner";
import { FieldServiceDashboard } from "../components/dashboards/FieldServiceDashboard";
import { MarketingDashboard } from "../components/dashboards/MarketingDashboard";
import { BusinessTypeSelector } from "../components/BusinessTypeSelector";

import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "../lib/auth";

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
  
  // Get company from auth response - it includes business_type
  const company = auth?.company;
  const businessType = company?.businessType || company?.business_type;
  
  // Business type determines dashboard version

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
            


            {/* Business Type Based Dashboard Routing */}
            {!businessType ? (
              // Show business type selector if not set
              <div className="max-w-4xl mx-auto">
                <BusinessTypeSelector 
                  onSelect={async (type) => {
                    try {
                      // Update company business type via API
                      await fetch(`/api/companies/${company?.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ businessType: type })
                      });
                      // Refresh the page to show new dashboard
                      window.location.reload();
                    } catch (error) {
                      console.error('Failed to update business type:', error);
                    }
                  }}
                />
              </div>
            ) : businessType === 'field_service' ? (
              // Field Service Dashboard
              <FieldServiceDashboard 
                company={company} 
                user={auth?.user} 
              />
            ) : businessType === 'marketing_focused' ? (
              // Marketing Dashboard
              <MarketingDashboard 
                company={company} 
                user={auth?.user} 
              />
            ) : (
              // Fallback to field service dashboard if business type is unknown
              <FieldServiceDashboard 
                company={company} 
                user={auth?.user} 
              />
            )}
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