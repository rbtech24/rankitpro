import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Star, 
  Smartphone, 
  User,
  LogOut,
  Plus,
  MapPin,
  Clock,
  Camera,
  Menu,
  X,
  HeadphonesIcon,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { getCurrentUser, AuthState } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function FieldTechDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    priority: 'medium',
    category: 'technical',
    description: '',
    location: ''
  });
  
  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      .then(() => window.location.href = "/login");
  };

  const handleNavClick = (view: string) => {
    setActiveView(view);
    setSidebarOpen(false); // Close mobile sidebar
  };

  const handleSupportSubmit = async () => {
    try {
      const ticketData = {
        ...supportForm,
        technicianId: auth?.user?.id,
        technicianName: auth?.user?.username,
        companyId: auth?.company?.id,
        status: 'open',
        createdAt: new Date().toISOString()
      };

      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(ticketData)
      });

      if (res.ok) {
        setSupportModalOpen(false);
        setSupportForm({
          subject: '',
          priority: 'medium',
          category: 'technical',
          description: '',
          location: ''
        });
        // Show success notification
        alert('Support ticket created successfully! Our team will contact you soon.');
      } else {
        alert('Failed to create support ticket. Please try again.');
      }
    } catch (error) {
      alert('Error creating support ticket. Please check your connection.');
    }
  };

  const handleQuickSupport = (type: string) => {
    const quickTickets = {
      'equipment': {
        subject: 'Equipment Issue',
        category: 'technical',
        priority: 'high',
        description: 'I need assistance with equipment malfunction or technical issues.'
      },
      'app': {
        subject: 'App Issue',
        category: 'technical',
        priority: 'medium',
        description: 'I am experiencing problems with the mobile app or dashboard.'
      },
      'customer': {
        subject: 'Customer Issue',
        category: 'customer_service',
        priority: 'medium',
        description: 'I need help with a customer-related situation or complaint.'
      }
    };

    const template = quickTickets[type as keyof typeof quickTickets];
    if (template) {
      setSupportForm({ ...supportForm, ...template });
      setSupportModalOpen(true);
    }
  };

  // Fetch visits data (try both endpoints for compatibility)
  const { data: visits = [], isLoading: visitsLoading } = useQuery({
    queryKey: ['/api/check-ins'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/check-ins', { credentials: 'include' });
        if (res.ok) {
          return await res.json();
        }
        // Fallback to visits endpoint
        const visitsRes = await fetch('/api/visits', { credentials: 'include' });
        if (visitsRes.ok) {
          return await visitsRes.json();
        }
        return [];
      } catch (error) {
        console.log('API call failed, showing empty state');
        return [];
      }
    }
  });

  // Fetch reviews data  
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['/api/reviews'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/reviews', { credentials: 'include' });
        if (res.ok) {
          return await res.json();
        }
        return [];
      } catch (error) {
        console.log('Reviews API call failed, showing empty state');
        return [];
      }
    }
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-8" />
      </div>
      
      {/* User Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {auth?.user?.username?.charAt(0).toUpperCase() || 'T'}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{auth?.user?.username || 'Technician'}</p>
            <p className="text-sm text-gray-600">Field Technician</p>
            {auth?.company && (
              <p className="text-xs text-gray-500">{auth.company.name}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => handleNavClick('overview')}
          className={cn(
            "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
            activeView === 'overview' 
              ? "bg-blue-600 text-white" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </button>
        
        <button
          onClick={() => handleNavClick('visits')}
          className={cn(
            "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
            activeView === 'visits' 
              ? "bg-blue-600 text-white" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <ClipboardList className="w-5 h-5 mr-3" />
          My Visits
        </button>
        
        <button
          onClick={() => handleNavClick('reviews')}
          className={cn(
            "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
            activeView === 'reviews' 
              ? "bg-blue-600 text-white" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <Star className="w-5 h-5 mr-3" />
          My Reviews
        </button>
        
        <button
          onClick={() => handleNavClick('mobile')}
          className={cn(
            "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
            activeView === 'mobile' 
              ? "bg-blue-600 text-white" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <Smartphone className="w-5 h-5 mr-3" />
          Mobile App
        </button>
        
        <button
          onClick={() => handleNavClick('profile')}
          className={cn(
            "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
            activeView === 'profile' 
              ? "bg-blue-600 text-white" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <User className="w-5 h-5 mr-3" />
          Profile
        </button>
      </nav>
      
      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch(activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
              <p className="text-gray-600 mt-2">Track your service visits and manage your work efficiently.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ClipboardList className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{visits.length}</p>
                      <p className="text-sm text-gray-600">Total Visits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Star className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                      <p className="text-sm text-gray-600">Customer Reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {visits.filter((v: any) => {
                          const today = new Date();
                          const visitDate = new Date(v.createdAt);
                          return visitDate.toDateString() === today.toDateString();
                        }).length}
                      </p>
                      <p className="text-sm text-gray-600">Today's Visits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button size="lg" className="h-16 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-6 h-6 mr-3" />
                    Log New Visit
                  </Button>
                  <Button size="lg" variant="outline" className="h-16">
                    <Camera className="w-6 h-6 mr-3" />
                    Quick Photo
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-16 border-orange-200 hover:bg-orange-50"
                    onClick={() => setSupportModalOpen(true)}
                  >
                    <HeadphonesIcon className="w-6 h-6 mr-3 text-orange-600" />
                    Get Support
                  </Button>
                </div>
                
                {/* Quick Support Buttons */}
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Quick Support:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => handleQuickSupport('equipment')}
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Equipment Issue
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => handleQuickSupport('app')}
                    >
                      <Smartphone className="w-3 h-3 mr-1" />
                      App Problem
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => handleQuickSupport('customer')}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Customer Help
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'visits':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Visits</h1>
                <p className="text-gray-600 mt-2">Track all your service visits and customer interactions.</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Log New Visit
              </Button>
            </div>
            
            {visitsLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : visits.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No visits yet</h3>
                  <p className="text-gray-600 mb-6">Start logging your service visits to track your work and build your history.</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Log Your First Visit
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {visits.map((visit: any) => (
                  <Card key={visit.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {visit.customerName || 'Service Visit'}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {visit.location || 'Location not specified'}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              {new Date(visit.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            {visit.jobType && (
                              <div className="flex items-center">
                                <span className="w-4 h-4 mr-2">🔧</span>
                                {visit.jobType}
                              </div>
                            )}
                          </div>
                          {visit.notes && (
                            <p className="mt-3 text-gray-700">{visit.notes}</p>
                          )}
                        </div>
                        {visit.photos && visit.photos.length > 0 && (
                          <div className="ml-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Camera className="w-4 h-4 mr-1" />
                              {visit.photos.length} photo{visit.photos.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
              <p className="text-gray-600 mt-2">View customer feedback and ratings for your work.</p>
            </div>
            
            {reviewsLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600">Complete service visits to start receiving customer reviews and feedback.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {review.customerName || 'Anonymous Customer'}
                            </h3>
                            <div className="ml-3 flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="ml-2 text-sm text-gray-600">
                                {review.rating || 0}/5
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-500 mb-3">
                            {review.createdAt && new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                            {review.jobType && ` • ${review.jobType}`}
                          </div>
                          
                          {review.comment && (
                            <p className="text-gray-700 leading-relaxed">
                              "{review.comment}"
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {review.response && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-1">Your Response:</h4>
                          <p className="text-sm text-blue-800">{review.response}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'mobile':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mobile App</h1>
              <p className="text-gray-600 mt-2">Access your field tools and log visits on the go.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <Camera className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Photo Capture</h3>
                  <p className="text-gray-600">Take before/after photos during visits with automatic GPS tagging.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <MapPin className="w-12 h-12 text-green-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">GPS Tracking</h3>
                  <p className="text-gray-600">Automatic location logging for accurate visit records.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <Clock className="w-12 h-12 text-orange-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Time Tracking</h3>
                  <p className="text-gray-600">Track time spent on each job for accurate billing.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <Smartphone className="w-12 h-12 text-purple-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Offline Mode</h3>
                  <p className="text-gray-600">Work without internet and sync when connected.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-2">Manage your account settings and preferences.</p>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-6 mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-2xl">
                      {auth?.user?.username?.charAt(0).toUpperCase() || 'T'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-gray-900">{auth?.user?.username}</h3>
                    <p className="text-gray-600">Field Technician</p>
                    {auth?.company && (
                      <p className="text-sm text-gray-500">{auth.company.name}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                    <p className="text-sm text-gray-600">Email: {auth?.user?.email || 'Not provided'}</p>
                    <p className="text-sm text-gray-600">Role: {auth?.user?.role || 'technician'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Statistics</h4>
                    <p className="text-sm text-gray-600">Total Visits: {visits.length}</p>
                    <p className="text-sm text-gray-600">Total Reviews: {reviews.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Unknown view</div>;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white shadow-lg">
        <SidebarContent />
      </div>
      
      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-8" />
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-6" />
          <div className="w-6" /> {/* Spacer */}
        </div>
        
        {/* Page Content */}
        <main className="p-6">
          {renderMainContent()}
        </main>
      </div>

      {/* Support Ticket Modal */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSupportModalOpen(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create Support Ticket</h3>
                <button onClick={() => setSupportModalOpen(false)}>
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                    placeholder="Brief description of the issue"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={supportForm.priority}
                      onChange={(e) => setSupportForm({...supportForm, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={supportForm.category}
                      onChange={(e) => setSupportForm({...supportForm, category: e.target.value})}
                    >
                      <option value="technical">Technical</option>
                      <option value="equipment">Equipment</option>
                      <option value="app">App Issue</option>
                      <option value="customer_service">Customer Service</option>
                      <option value="billing">Billing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Location (Optional)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={supportForm.location}
                    onChange={(e) => setSupportForm({...supportForm, location: e.target.value})}
                    placeholder="Where are you experiencing this issue?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-24 resize-none"
                    value={supportForm.description}
                    onChange={(e) => setSupportForm({...supportForm, description: e.target.value})}
                    placeholder="Please describe the issue in detail..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setSupportModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSupportSubmit}
                  disabled={!supportForm.subject || !supportForm.description}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <HeadphonesIcon className="w-4 h-4 mr-2" />
                  Create Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}