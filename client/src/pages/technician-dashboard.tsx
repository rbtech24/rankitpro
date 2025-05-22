import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { AuthState, getCurrentUser, logout } from '@/lib/auth';
import TechDashboard from '@/components/technician/tech-dashboard';
import MobileVisitModal from '@/components/technician/mobile-visit-modal';
import { Button } from '@/components/ui/button';
import {
  Home,
  ClipboardList,
  FileText,
  Star,
  MessageSquare,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export default function TechnicianDashboardPage() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  
  const { data: auth, isLoading } = useQuery<AuthState>({
    queryKey: ['/api/auth/me'],
    queryFn: getCurrentUser
  });
  
  // Tech-only navigation items
  const techNavigation = [
    { label: 'Dashboard', path: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { label: 'Check-Ins', path: '/check-ins', icon: <ClipboardList className="h-5 w-5" /> },
    { label: 'Blog Posts', path: '/blog-posts', icon: <FileText className="h-5 w-5" /> },
    { label: 'Reviews', path: '/reviews', icon: <Star className="h-5 w-5" /> },
    { label: 'Review Requests', path: '/review-requests', icon: <MessageSquare className="h-5 w-5" /> }
  ];
  
  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!auth?.user || auth.user.role !== 'technician') {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <p className="text-lg">You need to be logged in as a technician to view this page.</p>
        <Button onClick={() => setLocation('/login')}>Go to Login</Button>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-10" />
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto pt-5 px-4">
          <nav className="space-y-1">
            {techNavigation.map((item) => (
              <Link href={item.path} key={item.path}>
                <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
                  location === item.path ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                  <span className="mr-3 text-gray-500">{item.icon}</span>
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto pt-4 border-t border-gray-200 fixed bottom-0 left-0 w-64 bg-white p-4">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 w-full"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-500" />
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 bg-white shadow-sm md:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-10" />
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
              <div className="flex items-center justify-between px-4 pb-2">
                <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-10" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="mt-5 flex-1 overflow-y-auto px-2">
                <nav className="space-y-1 px-2">
                  {techNavigation.map((item) => (
                    <Link href={item.path} key={item.path}>
                      <a className={`flex items-center px-3 py-2 text-base font-medium rounded-md mb-1 ${
                        location === item.path ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                      }`} onClick={() => setMobileMenuOpen(false)}>
                        <span className="mr-3 text-gray-500">{item.icon}</span>
                        {item.label}
                      </a>
                    </Link>
                  ))}
                </nav>
                
                <div className="mt-10 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-100 w-full"
                  >
                    <LogOut className="mr-3 h-5 w-5 text-gray-500" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <TechDashboard onNewVisit={() => setShowVisitModal(true)} />
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Visit Modal */}
      <MobileVisitModal open={showVisitModal} onClose={() => setShowVisitModal(false)} />
    </div>
  );
}