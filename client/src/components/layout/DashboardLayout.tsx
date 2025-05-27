import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Logo } from '@/components/ui/logo';
import { 
  Home, 
  ClipboardList, 
  FileText, 
  Star, 
  MessageSquare,
  Users, 
  UserCog,
  Link as LinkIcon, 
  Settings, 
  CreditCard, 
  BrainCircuit,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import Sidebar from './sidebar-clean';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      window.location.href = '/login';
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { label: 'Check-Ins', path: '/check-ins', icon: <ClipboardList className="h-5 w-5" /> },
    { label: 'Blog Posts', path: '/blog-posts', icon: <FileText className="h-5 w-5" /> },
    { label: 'Reviews', path: '/reviews', icon: <Star className="h-5 w-5" /> },
    { label: 'Review Requests', path: '/review-requests', icon: <MessageSquare className="h-5 w-5" /> },
    { label: 'Technicians', path: '/technicians', icon: <Users className="h-5 w-5" /> },
    { label: 'Users', path: '/users', icon: <UserCog className="h-5 w-5" /> },
    { label: 'Integrations', path: '/integrations', icon: <LinkIcon className="h-5 w-5" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
    { label: 'Billing', path: '/billing', icon: <CreditCard className="h-5 w-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200">
          <div className="px-4 pb-4 border-b border-gray-200">
            <div className="flex items-center">
              <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-12" />
            </div>
          </div>
          
          <div className="mt-5 flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location === item.path ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile header */}
      <div className="md:pl-64 flex flex-col flex-1">
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
            
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
              <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-200">
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
              
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {navItems.map((item) => (
                    <Link 
                      key={item.path} 
                      href={item.path}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        location === item.path ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </Button>
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
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}