import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { AuthState, getCurrentUser } from '../../lib/auth';
import TechNavigation from '../../components/layout/tech-navigation';
import TechDashboard from '../../components/technician/tech-dashboard';
import MobileVisitModal from '../../components/technician/mobile-visit-modal';
import { Button } from '../../components/ui/button';
import NotificationBell from '../../components/notifications/NotificationBell';

export default function TechDashboardPage() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  
  const { data: auth, isLoading } = useQuery<AuthState>({
    queryKey: ['/api/auth/me'],
    queryFn: getCurrentUser
  });
  
  const handleLogout = () => {
    import('../../lib/logout').then(({ performImmediateLogout }) => {
      performImmediateLogout();
    });
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
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0">
        <TechNavigation className="h-full" onLogout={handleLogout} />
      </div>
      
      {/* Mobile menu */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 flex-shrink-0 bg-white shadow-sm md:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-10" />
            </div>
            <div className="flex items-center space-x-2">
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
              <div className="flex items-center justify-between px-4">
                <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-10" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </Button>
              </div>
              <div className="flex-1 h-0 overflow-y-auto">
                <nav className="px-2 pt-2">
                  <Link href="/dashboard">
                    <a className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                        <rect width="7" height="9" x="3" y="3" rx="1"/>
                        <rect width="7" height="5" x="14" y="3" rx="1"/>
                        <rect width="7" height="9" x="14" y="12" rx="1"/>
                        <rect width="7" height="5" x="3" y="16" rx="1"/>
                      </svg>
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/check-ins">
                    <a className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                        <path d="M9 11l3 3l8-8"/>
                        <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>
                      </svg>
                      Check-Ins
                    </a>
                  </Link>
                  <Link href="/blog-posts">
                    <a className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" x2="8" y1="13" y2="13"/>
                        <line x1="16" x2="8" y1="17" y2="17"/>
                        <line x1="10" x2="8" y1="9" y2="9"/>
                      </svg>
                      Blog Posts
                    </a>
                  </Link>
                  <Link href="/reviews">
                    <a className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      Reviews
                    </a>
                  </Link>
                  <Link href="/review-requests">
                    <a className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      Review Requests
                    </a>
                  </Link>
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100 w-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" x2="9" y1="12" y2="12"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                </nav>
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
      <MobileVisitModal isOpen={showVisitModal} onClose={() => setShowVisitModal(false)} />
    </div>
  );
}