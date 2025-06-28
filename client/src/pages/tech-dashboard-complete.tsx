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
  CheckCircle,
  Camera,
  MapPin,
  Clock
} from "lucide-react";
import { getCurrentUser, AuthState } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function TechDashboardComplete() {
  const [activeSection, setActiveSection] = useState('dashboard');
  
  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      .then(() => {
        window.location.href = "/login";
      });
  };

  const handleSectionChange = (section: string) => {
    console.log('Switching to section:', section); // Debug log
    setActiveSection(section);
  };

  const renderContent = () => {
    console.log('Rendering content for section:', activeSection); // Debug log
    switch(activeSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'visits':
        return <VisitsContent />;
      case 'reviews':
        return <ReviewsContent />;
      case 'mobile':
        return <MobileContent />;
      case 'profile':
        return <ProfileContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b">
          <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-10 mx-auto" />
        </div>
        
        {/* User Info */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {auth?.user?.username?.charAt(0).toUpperCase() || 'T'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{auth?.user?.username || "Technician"}</p>
              <p className="text-xs text-gray-500">Field Technician</p>
            </div>
          </div>
          {auth?.company && (
            <div className="mt-2">
              <div className="text-xs font-semibold uppercase text-gray-500">
                {auth.company.name}
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            <button
              onClick={() => handleSectionChange('dashboard')}
              className={cn(
                "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeSection === 'dashboard' 
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <LayoutDashboard className="mr-3 h-4 w-4" />
              Dashboard
            </button>
            
            <button
              onClick={() => handleSectionChange('visits')}
              className={cn(
                "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeSection === 'visits' 
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <ClipboardList className="mr-3 h-4 w-4" />
              My Visits
            </button>
            
            <button
              onClick={() => handleSectionChange('reviews')}
              className={cn(
                "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeSection === 'reviews' 
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Star className="mr-3 h-4 w-4" />
              My Reviews
            </button>
            
            <button
              onClick={() => handleSectionChange('mobile')}
              className={cn(
                "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeSection === 'mobile' 
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Smartphone className="mr-3 h-4 w-4" />
              Mobile App
            </button>
          </div>
          
          {/* Account Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-1">
              <button
                onClick={() => handleSectionChange('profile')}
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeSection === 'profile' 
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <User className="mr-3 h-4 w-4" />
                My Profile
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// Dashboard Content Component
function DashboardContent() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Field Technician Dashboard</h1>
        <p className="text-gray-600">Welcome back, testtechnician! Log your service visits and track your work.</p>
      </div>
      
      {/* Action Button */}
      <div className="mb-6">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg">
          <Plus className="mr-2 h-5 w-5" />
          Log New Visit
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Visits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No visits yet</h3>
            <p className="text-gray-500 mb-4">Get started by logging your first service visit.</p>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Log First Visit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Visits Content Component
function VisitsContent() {
  const { data: visits = [], isLoading, error } = useQuery({
    queryKey: ['/api/visits'],
    queryFn: async () => {
      const res = await fetch('/api/visits', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Please log in to view your visits');
        }
        throw new Error('Failed to fetch visits');
      }
      return res.json();
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Visits</h1>
          <p className="text-gray-600">Loading your visit history...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Visits</h1>
          <p className="text-gray-600">Track all your service visits and customer interactions.</p>
        </div>
        
        <div className="mb-6">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Log New Visit
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Visit History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load visits</h3>
              <p className="text-gray-500 mb-4">{error.message}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Visits</h1>
        <p className="text-gray-600">Track all your service visits and customer interactions.</p>
      </div>
      
      <div className="mb-6">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Log New Visit
        </Button>
      </div>
      
      {visits.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Visit History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No visits logged yet</h3>
              <p className="text-gray-500 mb-4">Start logging your service visits to build your history.</p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Log Your First Visit
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visits.map((visit: any) => (
            <Card key={visit.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {visit.customerName || 'Customer Visit'}
                      </h3>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        visit.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {visit.status || 'In Progress'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {visit.location || 'No location specified'}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatDate(visit.createdAt)}
                      </div>
                      {visit.jobType && (
                        <div className="flex items-center">
                          <span className="h-4 w-4 mr-2">🔧</span>
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
                        <Camera className="h-4 w-4 mr-1" />
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
}

// Reviews Content Component
function ReviewsContent() {
  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ['/api/reviews'],
    queryFn: async () => {
      const res = await fetch('/api/reviews', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Please log in to view your reviews');
        }
        throw new Error('Failed to fetch reviews');
      }
      return res.json();
    }
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600">Loading your customer reviews...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600">View customer feedback and ratings for your work.</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load reviews</h3>
              <p className="text-gray-500 mb-4">{error.message}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
        <p className="text-gray-600">View customer feedback and ratings for your work.</p>
      </div>
      
      {reviews.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500">Complete service visits to start receiving customer reviews.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {review.customerName || 'Anonymous Customer'}
                      </h3>
                      <div className="ml-3 flex items-center">
                        {renderStars(review.rating || 0)}
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
}

// Mobile Content Component
function MobileContent() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mobile App</h1>
        <p className="text-gray-600">Access your field tools and log visits on the go.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Mobile Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center p-4 border rounded-lg">
            <Camera className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <h3 className="font-medium">Photo Capture</h3>
              <p className="text-sm text-gray-600">Take before/after photos during visits</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 border rounded-lg">
            <MapPin className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <h3 className="font-medium">GPS Tracking</h3>
              <p className="text-sm text-gray-600">Automatic location logging for visits</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 border rounded-lg">
            <Clock className="h-8 w-8 text-orange-600 mr-4" />
            <div>
              <h3 className="font-medium">Time Tracking</h3>
              <p className="text-sm text-gray-600">Track time spent on each job</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Profile Content Component
function ProfileContent() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Profile management features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}