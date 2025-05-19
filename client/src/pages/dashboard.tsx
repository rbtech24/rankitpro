import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import StatsOverview from "@/components/dashboard/stats-overview";
import RecentCheckins from "@/components/dashboard/recent-checkins";
import QuickActions from "@/components/dashboard/quick-actions";
import AIWriter from "@/components/dashboard/ai-writer";
import TechnicianPerformance from "@/components/dashboard/technician-performance";
import WebsiteIntegration from "@/components/dashboard/website-integration";
import CheckinModal from "@/components/modals/checkin-modal";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar className={`fixed inset-0 z-40 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:relative`} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back! Here's what's happening with your check-ins.</p>
            </div>
            
            <StatsOverview />
            
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
              <RecentCheckins />
              
              <div className="lg:col-span-2 space-y-6">
                <QuickActions onOpenCheckInModal={() => setCheckInModalOpen(true)} />
                <AIWriter />
              </div>
            </div>
            
            <TechnicianPerformance />
            
            <WebsiteIntegration />
          </div>
        </main>
      </div>
      
      <CheckinModal 
        isOpen={checkInModalOpen} 
        onClose={() => setCheckInModalOpen(false)} 
      />
    </div>
  );
}
