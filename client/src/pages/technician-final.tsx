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

export default function TechnicianFinal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      .then(() => window.location.href = "/login");
  };

  // Visits data
  const { data: visits = [], isLoading: visitsLoading } = useQuery({
    queryKey: ['/api/visits'],
    enabled: activeTab === 'visits',
    queryFn: async () => {
      const res = await fetch('/api/visits', { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Reviews data  
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['/api/reviews'],
    enabled: activeTab === 'reviews',
    queryFn: async () => {
      const res = await fetch('/api/reviews', { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    }
  });

  const TabButton = ({ id, icon: Icon, children, onClick }: any) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-8" />
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Technician Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {auth?.user?.username || 'Technician'}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-4 mb-8">
          <TabButton id="dashboard" icon={LayoutDashboard} onClick={setActiveTab}>
            Dashboard
          </TabButton>
          <TabButton id="visits" icon={ClipboardList} onClick={setActiveTab}>
            My Visits
          </TabButton>
          <TabButton id="reviews" icon={Star} onClick={setActiveTab}>
            My Reviews  
          </TabButton>
          <TabButton id="mobile" icon={Smartphone} onClick={setActiveTab}>
            Mobile App
          </TabButton>
          <TabButton id="profile" icon={User} onClick={setActiveTab}>
            Profile
          </TabButton>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome Back!</h2>
                <p className="text-gray-600 mb-6">Track your service visits and manage your work.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-gray-600">Total Visits</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">This Week</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-orange-600">0</div>
                      <div className="text-sm text-gray-600">Today</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-5 h-5 mr-2" />
                  Log New Visit
                </Button>
              </div>
            )}

            {activeTab === 'visits' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Visits</h2>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Log New Visit
                  </Button>
                </div>
                
                {visitsLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
                    ))}
                  </div>
                ) : visits.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No visits yet</h3>
                    <p className="text-gray-600 mb-4">Start logging your service visits to track your work.</p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Log Your First Visit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visits.map((visit: any) => (
                      <Card key={visit.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
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
                                  {new Date(visit.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              {visit.notes && (
                                <p className="mt-2 text-gray-700">{visit.notes}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Reviews</h2>
                
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-600">Complete visits to start receiving customer reviews.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">
                                {review.customerName || 'Customer Review'}
                              </h3>
                              <div className="flex items-center mb-2">
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
                              {review.comment && (
                                <p className="text-gray-700">"{review.comment}"</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'mobile' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mobile App</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <Camera className="w-12 h-12 text-blue-600 mb-4" />
                      <h3 className="font-semibold mb-2">Photo Capture</h3>
                      <p className="text-gray-600">Take before/after photos during visits</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <MapPin className="w-12 h-12 text-green-600 mb-4" />
                      <h3 className="font-semibold mb-2">GPS Tracking</h3>
                      <p className="text-gray-600">Automatic location logging</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-xl">
                          {auth?.user?.username?.charAt(0).toUpperCase() || 'T'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{auth?.user?.username}</h3>
                        <p className="text-gray-600">Field Technician</p>
                        {auth?.company && (
                          <p className="text-sm text-gray-500">{auth.company.name}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600">Profile management features coming soon.</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}