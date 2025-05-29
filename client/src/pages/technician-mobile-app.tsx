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

  const { data: jobTypes = [] } = useQuery({
    queryKey: ["/api/job-types"],
    enabled: !!auth?.user
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["/api/check-ins"],
    enabled: !!auth?.user
  });

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setCheckInForm(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => console.log('Location error:', error)
      );
    }
  }, []);

  // Auto-set technician ID when auth loads
  useEffect(() => {
    if (auth?.user?.id) {
      setCheckInForm(prev => ({
        ...prev,
        technicianId: auth.user.id.toString()
      }));
    }
  }, [auth?.user?.id]);

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      .then(() => window.location.href = "/login");
  };

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

      const res = await fetch('/api/check-ins', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      return res.json();
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
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
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
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Type *</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                  value={checkInForm.jobType}
                  onChange={(e) => setCheckInForm({...checkInForm, jobType: e.target.value})}
                >
                  <option value="">Select job type</option>
                  {jobTypes.map((jobType: any) => (
                    <option key={jobType.id} value={jobType.name}>{jobType.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notes *</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-24 resize-none"
                  value={checkInForm.notes}
                  onChange={(e) => setCheckInForm({...checkInForm, notes: e.target.value})}
                  placeholder="Please add detailed notes about the work performed (minimum 5 characters)..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={checkInForm.location}
                  onChange={(e) => setCheckInForm({...checkInForm, location: e.target.value})}
                  placeholder="Service address or location details"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Additional Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="createBlogPost"
                      checked={checkInForm.createBlogPost}
                      onChange={(e) => setCheckInForm({...checkInForm, createBlogPost: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="createBlogPost" className="text-sm font-medium text-gray-700">
                      Create blog post from this check-in
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="sendReviewRequest"
                      checked={checkInForm.sendReviewRequest}
                      onChange={(e) => setCheckInForm({...checkInForm, sendReviewRequest: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="sendReviewRequest" className="text-sm font-medium text-gray-700">
                      Send review request to customer
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Photos</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handlePhotoCapture}
                    className="hidden"
                    id="photo-input"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('photo-input')?.click()}
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Take Photos
                  </Button>
                  {checkInForm.photos.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {checkInForm.photos.length} photo(s) selected
                    </span>
                  )}
                </div>
              </div>
              
              {currentLocation && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center text-sm text-green-800">
                    <Navigation className="w-4 h-4 mr-2" />
                    Location captured: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCheckInModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => submitCheckInMutation.mutate()}
                  disabled={!checkInForm.jobType || !checkInForm.notes || checkInForm.notes.length < 5 || submitCheckInMutation.isPending}
                >
                  {submitCheckInMutation.isPending ? 'Submitting...' : 'Submit Check-in'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}