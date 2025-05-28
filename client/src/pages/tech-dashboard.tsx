import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { AuthState, getCurrentUser, logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MobileVisitModal from '@/components/technician/mobile-visit-modal';
import NotificationBell from '@/components/notifications/NotificationBell';
import logoPath from '@assets/rank it pro logo.png';
import { 
  MapPin, 
  Camera, 
  CheckCircle, 
  Plus,
  Menu,
  X,
  Home,
  ClipboardList,
  Smartphone,
  LogOut,
  Star
} from 'lucide-react';

export default function TechDashboardPage() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  
  const { data: auth, isLoading } = useQuery<AuthState>({
    queryKey: ['/api/auth/me'],
    queryFn: getCurrentUser
  });

  // Get visits for technician
  const { data: visits = [] } = useQuery({
    queryKey: ['/api/visits'],
    queryFn: async () => {
      const res = await fetch('/api/visits', { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    }
  });
  
  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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

  // Navigation items for technicians
  const navigation = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'My Visits', path: '/visits', icon: ClipboardList },
    { label: 'My Reviews', path: '/tech-reviews', icon: CheckCircle },
    { label: 'Mobile App', path: '/tech-app', icon: Smartphone },
  ];

  const isActive = (path: string) => location === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white shadow-md">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b">
          <div className="flex items-center">
            <img src={logoPath} alt="Rank It Pro" className="h-10 w-auto" />
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 pt-4">
          <div className="mb-4">
            <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Field Technician</div>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link href={item.path} key={item.path}>
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
                    isActive(item.path) 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}>
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </div>
          
          {/* Account Section */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 w-full"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 flex-shrink-0 bg-white shadow-sm md:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <img src={logoPath} alt="Rank It Pro" className="h-8 w-auto" />
            </div>
            <div className="flex items-center space-x-2">
              <NotificationBell />
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
        
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center">
                  <img src={logoPath} alt="Rank It Pro" className="h-8 w-auto" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex-1 h-0 overflow-y-auto">
                <nav className="px-2 pt-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link href={item.path} key={item.path}>
                        <a 
                          className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100 mb-1"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {item.label}
                        </a>
                      </Link>
                    );
                  })}
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100 w-full"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Logout
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Field Technician Dashboard</h1>
                <p className="mt-2 text-gray-600">
                  Welcome back, {auth.user.username}! Log your service visits and track your work.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <Button 
                  onClick={() => setShowVisitModal(true)}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transition-colors flex items-center justify-center text-lg"
                >
                  <Plus className="mr-3 h-6 w-6" />
                  Log New Visit
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Visits</p>
                        <p className="text-2xl font-bold text-gray-900">{visits.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Camera className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">This Week</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {visits.filter(v => {
                            const visitDate = new Date(v.createdAt);
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            return visitDate >= weekAgo;
                          }).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MapPin className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Today</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {visits.filter(v => {
                            const visitDate = new Date(v.createdAt);
                            const today = new Date();
                            return visitDate.toDateString() === today.toDateString();
                          }).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Visits */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Visits</CardTitle>
                </CardHeader>
                <CardContent>
                  {visits.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No visits yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by logging your first service visit.</p>
                      <div className="mt-6">
                        <Button onClick={() => setShowVisitModal(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Log First Visit
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {visits.slice(0, 5).map((visit: any) => (
                        <div key={visit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <MapPin className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{visit.jobType}</p>
                              <p className="text-sm text-gray-500">{visit.location || 'No location'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(visit.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {visits.length > 5 && (
                        <div className="text-center pt-4">
                          <Link href="/visits">
                            <a className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              View all visits →
                            </a>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Quick Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start space-x-3">
                      <Camera className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Take Photos</h4>
                        <p className="text-sm text-gray-500">Document your work with before, during, and after photos</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Enable Location</h4>
                        <p className="text-sm text-gray-500">Use GPS for accurate job site recording</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Detailed Notes</h4>
                        <p className="text-sm text-gray-500">Include specific details about materials and techniques</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </main>
      </div>
      
      {/* Visit Modal */}
      <MobileVisitModal open={showVisitModal} onClose={() => setShowVisitModal(false)} />
    </div>
  );
}