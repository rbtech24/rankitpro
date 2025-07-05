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
  
  // Debug logging
  console.log('=== DASHBOARD DEBUG ===');
  console.log('Company data:', company);
  console.log('Business type:', businessType);
  console.log('Is company admin:', isCompanyAdmin);
  console.log('Should show switcher:', isCompanyAdmin && businessType);
  console.log('========================');
  
  // TEMPORARY: Force switcher to show for testing
  const showSwitcher = true;

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
            
            {/* Temporary Dashboard Switcher - TODO: Remove after testing */}
            {(showSwitcher && isCompanyAdmin) && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-yellow-800">
                      Current: {businessType === 'field_service' ? 'Field Service Edition' : 'Marketing Edition'}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      const newType = businessType === 'field_service' ? 'marketing_focused' : 'field_service';
                      try {
                        await fetch(`/api/companies/${company?.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ businessType: newType })
                        });
                        window.location.reload();
                      } catch (error) {
                        console.error('Failed to switch dashboard:', error);
                      }
                    }}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                  >
                    Switch to {businessType === 'field_service' ? 'Marketing' : 'Field Service'}
                  </button>
                </div>
              </div>
            )}

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
              // Fallback to original dashboard if business type is unknown
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatsOverview />
              </div>
            )}
            
            {/* Enhanced Business Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-900">This Month's Growth</h3>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">New customers:</span>
                    <span className="font-medium text-blue-900">+23%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Reviews generated:</span>
                    <span className="font-medium text-blue-900">+47%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Revenue growth:</span>
                    <span className="font-medium text-blue-900">+31%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-900">AI Performance</h3>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Blog posts created:</span>
                    <span className="font-medium text-green-900">142 this month</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">SEO score avg:</span>
                    <span className="font-medium text-green-900">87/100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Content quality:</span>
                    <span className="font-medium text-green-900">Excellent</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-900">Team Efficiency</h3>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">Avg. job completion:</span>
                    <span className="font-medium text-purple-900">2.3 hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">Customer satisfaction:</span>
                    <span className="font-medium text-purple-900">4.8/5.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">Response time:</span>
                    <span className="font-medium text-purple-900">12 minutes</span>
                  </div>
                </div>
              </div>
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