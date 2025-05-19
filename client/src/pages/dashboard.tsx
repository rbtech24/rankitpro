import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import StatsOverview from "@/components/dashboard/stats-overview";
import RecentVisits from "@/components/dashboard/recent-visits";
import QuickActions from "@/components/dashboard/quick-actions";
import AIWriter from "@/components/dashboard/ai-writer";
import TechnicianPerformance from "@/components/dashboard/technician-performance";
import WebsiteIntegration from "@/components/dashboard/website-integration";
import VisitModal from "@/components/modals/visit-modal";
import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// Will implement company overview later
// import CompanyOverview from "@/components/dashboard/company-overview";

export default function Dashboard() {
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  
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
              ? "Super admin dashboard with system-wide overview."
              : isAdmin 
              ? "Welcome back! Here's what's happening with your company."
              : "Welcome back! Here's what's happening with your visits."}
          </p>
        </div>
        
        {/* Stats are shown to all users */}
        <StatsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
          {/* Recent check-ins shown to all users */}
          <RecentCheckins />
          
          <div className="lg:col-span-2 space-y-6">
            {/* Quick actions shown to all users, but with different options */}
            <QuickActions onOpenCheckInModal={() => setCheckInModalOpen(true)} />
            
            {/* AI Writer only shown to admins */}
            {isAdmin && <AIWriter />}
          </div>
        </div>
        
        {/* Only show technician performance to admins */}
        {isAdmin && <TechnicianPerformance />}
        
        {/* Only show website integration to admins */}
        {isAdmin && <WebsiteIntegration />}
        
        {/* Super admin specific section - to be implemented */}
        {isSuperAdmin && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Companies Overview</CardTitle>
              <CardDescription>Super admin view of all registered companies</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Companies overview will be displayed here</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <CheckinModal 
        isOpen={checkInModalOpen} 
        onClose={() => setCheckInModalOpen(false)} 
      />
    </DashboardLayout>
  );
}
