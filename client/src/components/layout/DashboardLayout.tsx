import React, { ReactNode, useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Menu,
  X,
} from 'lucide-react';
import NotificationBell from '../../components/notifications/NotificationBell';
import Sidebar from './sidebar-clean';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile header */}
      <div className="flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 md:hidden">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 flex justify-between px-4">
            <div className="flex-1 flex items-center">
              <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-10" />
            </div>
            <div className="flex items-center">
              <NotificationBell />
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 flex z-40 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
            
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-10" />
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <Sidebar className="w-full border-none" />
              </div>
            </div>
            
            <div className="flex-shrink-0 w-14" />
          </div>
        )}
        
        {/* Desktop header */}
        <div className="hidden md:flex md:justify-end md:p-4">
          <NotificationBell />
        </div>
        
        {/* Main content */}
        <main className="flex-1">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}