import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Camera,
  Clock,
  MapPin,
  Star,
  Home,
  User,
  LogOut,
  CheckCircle,
  Navigation,
  History
} from "lucide-react";
import { getCurrentUser, AuthState } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

export default function TechnicianMobileApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [checkInForm, setCheckInForm] = useState({
    technicianId: '',
    jobType: '',
    notes: '',
    location: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    createBlogPost: false,
    sendReviewRequest: false,
    photos: [] as File[]
  });

  const queryClient = useQueryClient();

  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });

  // Fetch job types with proper error handling
  const { data: jobTypes = [], isLoading: jobTypesLoading, error: jobTypesError } = useQuery({
    queryKey: ["/api/job-types"],
    enabled: !!auth?.user,
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/job-types");
      if (!response.ok) {
        // If no job types configured yet, return empty array so form still works
        console.log("No job types configured yet - company admin needs to add job types");
        return [];
      }
      return response.json();
    }
  });

  // Fetch check-ins with proper error handling
  const { data: checkIns = [], isLoading: checkInsLoading } = useQuery({
    queryKey: ["/api/check-ins"],
    enabled: !!auth?.user,
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/check-ins");
      if (!response.ok) {
        throw new Error("Failed to fetch check-ins");
      }
      return response.json();
    }
  });

  // Get current location and reverse geocode to get address
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setCurrentLocation({ lat, lng });
          setCheckInForm(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
          }));

          // Set location with coordinates initially
          // Use OpenStreetMap's free reverse geocoding service
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.address) {
              const addr = data.address;
              const streetName = addr.road || addr.street || '';
              const city = addr.city || addr.town || addr.village || '';
              const state = addr.state || '';
              const zip = addr.postcode || '';
              
              // Format: Street Name, City, State Zip (no house numbers for privacy)
              const formattedLocation = [streetName, city, state, zip].filter(Boolean).join(', ');
              
              setCheckInForm(prev => ({
                ...prev,
                location: formattedLocation || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
              }));
            } else {
              // Fallback to coordinates if geocoding fails
              setCheckInForm(prev => ({
                ...prev,
                location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
              }));
            }
          } catch (error) {
            console.log('Reverse geocoding failed, using coordinates');
            setCheckInForm(prev => ({
              ...prev,
              location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
            }));
          }
        },
        (error) => {
          console.log('Location error:', error);
          // Try to get location using IP geolocation as fallback
          fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => {
              if (data.city && data.region) {
                setCheckInForm(prev => ({
                  ...prev,
                  location: `${data.city}, ${data.region}`
                }));
              }
            })
            .catch(() => {
              console.log('IP geolocation also failed');
            });
        }
      );
    }
  }, []);

  // Auto-set technician ID when auth loads
  useEffect(() => {
    if (auth?.user?.id) {
      setCheckInForm(prev => ({
        ...prev,
        technicianId: auth.user?.id?.toString() || ''
      }));
    }
  }, [auth?.user?.id]);

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setCheckInForm(prev => ({
        ...prev,
        photos: [...prev.photos, ...Array.from(files)]
      }));
    }
  };

  const submitCheckInMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('technicianId', checkInForm.technicianId);
      formData.append('jobType', checkInForm.jobType);
      formData.append('notes', checkInForm.notes);
      formData.append('location', checkInForm.location);
      
      if (checkInForm.latitude) {
        formData.append('latitude', checkInForm.latitude.toString());
      }
      if (checkInForm.longitude) {
        formData.append('longitude', checkInForm.longitude.toString());
      }
      
      formData.append('createBlogPost', checkInForm.createBlogPost.toString());
      formData.append('sendReviewRequest', checkInForm.sendReviewRequest.toString());
      
      checkInForm.photos.forEach((photo) => {
        formData.append(`photos`, photo);
      });

      const response = await apiRequest('POST', '/api/check-ins', formData);
      if (!response.ok) {
        throw new Error(`Failed to submit check-in: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/check-ins"] });
      setShowCheckInModal(false);
      setCheckInForm({
        technicianId: auth?.user?.id?.toString() || '',
        jobType: '',
        notes: '',
        location: '',
        latitude: currentLocation?.lat,
        longitude: currentLocation?.lng,
        createBlogPost: false,
        sendReviewRequest: false,
        photos: []
      });
      alert('Check-in submitted successfully!');
    },
    onError: (error: Error) => {
      alert(`Failed to submit check-in: ${error.message}`);
    }
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'history':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Check-in History</h2>
              <Button 
                size="sm"
                onClick={() => setShowCheckInModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Check-in
              </Button>
            </div>
            
            {checkIns.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">No check-ins found.</p>
                  <Button 
                    onClick={() => setShowCheckInModal(true)}
                    variant="outline"
                  >
                    Create Your First Check-in
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {checkIns.map((checkIn: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm">{checkIn.jobType}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {new Date(checkIn.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      {checkIn.location && (
                        <p className="text-xs text-gray-600 mb-2">📍 {checkIn.location}</p>
                      )}
                      {checkIn.notes && (
                        <p className="text-sm text-gray-700 line-clamp-2">{checkIn.notes}</p>
                      )}
                      {checkIn.photos && checkIn.photos.length > 0 && (
                        <p className="text-xs text-blue-600 mt-2">📷 {checkIn.photos.length} photo(s)</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Profile</h2>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{auth?.user?.username}</h3>
                    <p className="text-sm text-gray-600">Field Technician</p>
                    <p className="text-xs text-gray-500">{auth?.user?.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold">{checkIns.length}</div>
                    <div className="text-xs text-gray-600">Total Check-ins</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">4.8</div>
                    <div className="text-xs text-gray-600">Avg Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <form action="/login" method="get">
                <button 
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-red-600 bg-white hover:bg-gray-50"
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Welcome back!</h2>
                <p className="text-sm text-gray-600">{auth?.user?.username}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{new Date().toLocaleDateString()}</div>
                <div className="text-xs text-gray-500">
                  {currentLocation ? '📍 Location enabled' : '📍 Enable location'}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-3">
              <Button 
                size="lg" 
                className="h-16 bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-3"
                onClick={() => setShowCheckInModal(true)}
              >
                <Plus className="w-6 h-6" />
                <span className="text-lg font-medium">Log New Check-in</span>
              </Button>
            </div>

            {/* Today's Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold">{checkIns.filter((c: any) => {
                    const today = new Date();
                    const checkInDate = new Date(c.createdAt);
                    return checkInDate.toDateString() === today.toDateString();
                  }).length}</div>
                  <div className="text-xs text-gray-600">Today</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold">{checkIns.length}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Check-ins */}
            {checkIns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Check-ins</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {checkIns.slice(0, 3).map((checkIn: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{checkIn.jobType}</p>
                        <p className="text-xs text-gray-600">{checkIn.location || 'No location'}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(checkIn.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        );
    }
  };

  if (!auth?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RP</span>
            </div>
            <div>
              <div className="text-sm font-semibold">RANK IT PRO</div>
              <div className="text-xs text-gray-500">Field Tech</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentLocation && (
              <Navigation className="w-5 h-5 text-green-500" />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {renderTabContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'history', label: 'History', icon: History },
            { id: 'profile', label: 'Profile', icon: User }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-3 text-xs font-medium",
                  isActive 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 mb-1",
                  isActive ? "text-blue-600" : "text-gray-400"
                )} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
          <div className="bg-white rounded-t-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">New Check-in</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCheckInModal(false)}>
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Location Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 pr-10 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={checkInForm.location}
                    onChange={(e) => setCheckInForm({...checkInForm, location: e.target.value})}
                    placeholder="123 Main St, Anytown, IL"
                  />
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Notes Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  value={checkInForm.notes}
                  onChange={(e) => setCheckInForm({...checkInForm, notes: e.target.value})}
                  placeholder="Describe the work performed..."
                />
              </div>

              {/* Photos Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => document.getElementById('photo-input')?.click()}
                >
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600 mb-1">Upload photos or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handlePhotoCapture}
                    className="hidden"
                    id="photo-input"
                  />
                </div>
                {checkInForm.photos.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {checkInForm.photos.length} photo(s) selected
                  </p>
                )}
              </div>

              {/* Content Generation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Generation</label>
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={checkInForm.createBlogPost ? 'blog' : checkInForm.sendReviewRequest ? 'review' : 'none'}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCheckInForm(prev => ({
                        ...prev,
                        createBlogPost: value === 'blog',
                        sendReviewRequest: value === 'review'
                      }));
                    }}
                  >
                    <option value="none">No content generation</option>
                    <option value="blog">Create full blog article</option>
                    <option value="review">Create service visit post</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Selection Indicator */}
                <div className="mt-3 space-y-2">
                  <div className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                    !checkInForm.createBlogPost && !checkInForm.sendReviewRequest 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    No content generation
                  </div>
                  {checkInForm.createBlogPost && (
                    <div className="flex items-center px-3 py-2 rounded-lg text-sm bg-blue-100 text-blue-800">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create full blog article
                    </div>
                  )}
                  {checkInForm.sendReviewRequest && (
                    <div className="flex items-center px-3 py-2 rounded-lg text-sm bg-purple-100 text-purple-800">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create service visit post
                    </div>
                  )}
                </div>
              </div>
              
              {currentLocation && checkInForm.location && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center text-sm text-green-800">
                    <Navigation className="w-4 h-4 mr-2" />
                    Location captured: {checkInForm.location}
                  </div>
                </div>
              )}
              
              <div className="pt-6">
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 text-base font-medium rounded-lg"
                  onClick={() => submitCheckInMutation.mutate()}
                  disabled={!checkInForm.notes || checkInForm.notes.length < 5 || submitCheckInMutation.isPending}
                >
                  {submitCheckInMutation.isPending ? 'Submitting...' : 'Submit Visit'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}