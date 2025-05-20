import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import StatsOverview from "@/components/dashboard/stats-overview";
import RecentVisits from "@/components/dashboard/recent-visits";
import QuickActions from "@/components/dashboard/quick-actions";
import AIWriter from "@/components/dashboard/ai-writer";
import TechnicianPerformance from "@/components/dashboard/technician-performance";
import WebsiteIntegration from "@/components/dashboard/website-integration";
import AdminBusinessManagement from "@/components/dashboard/admin-business-management";
import CompaniesManagement from "@/components/dashboard/companies-management";
import BillingManagement from "@/components/dashboard/billing-management";
import VisitModal from "@/components/modals/visit-modal";
import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  
  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  const userRole = auth?.user?.role;
  const isAdmin = userRole === "super_admin" || userRole === "company_admin";
  const isTechnician = userRole === "technician";
  const isSuperAdmin = userRole === "super_admin";
  
  return (
    <DashboardLayout>
      <div className="fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {isSuperAdmin 
              ? "Super admin dashboard with system-wide business management."
              : isAdmin 
              ? "Welcome back! Here's what's happening with your company."
              : "Welcome back! Here's what's happening with your visits."}
          </p>
        </div>
        
        {/* Super Admin Business Dashboard */}
        {isSuperAdmin ? (
          <Tabs defaultValue="overview" className="mb-6">
            <TabsList className="w-full">
              <TabsTrigger value="overview">Platform Overview</TabsTrigger>
              <TabsTrigger value="companies">Companies</TabsTrigger>
              <TabsTrigger value="billing">Billing & Revenue</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
            </TabsList>
            
            {/* Platform Overview Tab */}
            <TabsContent value="overview">
              <div className="space-y-6">
                <StatsOverview />
                <AdminBusinessManagement />
              </div>
            </TabsContent>
            
            {/* Companies Management Tab */}
            <TabsContent value="companies">
              <div className="space-y-6">
                <CompaniesManagement />
              </div>
            </TabsContent>
            
            {/* Billing & Revenue Tab */}
            <TabsContent value="billing">
              <div className="space-y-6">
                <BillingManagement />
              </div>
            </TabsContent>
            
            {/* Operations Tab */}
            <TabsContent value="operations">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
                  <RecentVisits />
                  
                  <div className="lg:col-span-2 space-y-6">
                    <QuickActions onOpenVisitModal={() => setVisitModalOpen(true)} />
                    <AIWriter />
                  </div>
                </div>
                
                <TechnicianPerformance />
                <WebsiteIntegration />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // Regular Admin or Technician Dashboard
          <>
            {/* Stats are shown to all users */}
            <StatsOverview />
            
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
              {/* Recent visits shown to all users */}
              <RecentVisits />
              
              <div className="lg:col-span-2 space-y-6">
                {/* Quick actions shown to all users, but with different options */}
                <QuickActions onOpenVisitModal={() => setVisitModalOpen(true)} />
                
                {/* AI Writer only shown to admins */}
                {isAdmin && <AIWriter />}
              </div>
            </div>
            
            {/* Only show technician performance to admins */}
            {isAdmin && <TechnicianPerformance />}
            
            {/* Only show website integration to admins */}
            {isAdmin && <WebsiteIntegration />}
          </>
        )}
      </div>
      
      <VisitModal 
        isOpen={visitModalOpen} 
        onClose={() => setVisitModalOpen(false)} 
      />
    </DashboardLayout>
  );
}
