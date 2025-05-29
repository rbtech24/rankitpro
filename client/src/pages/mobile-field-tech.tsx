import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  Bell,
  User,
  Phone,
  Settings,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Image,
  MessageSquare
} from "lucide-react";
import { getCurrentUser, AuthState } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function MobileFieldTech() {
  const [activeTab, setActiveTab] = useState('home');
  const [showVisitModal, setShowVisitModal] = useState(false);
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

  // Get job types from company admin settings
  const { data: jobTypes = [] } = useQuery({
    queryKey: ["/api/job-types"],
    enabled: !!auth?.user
  });

  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });

  // Get check-ins for the technician
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

  const submitCheckIn = async () => {
    try {
      // Create FormData to match the company's check-in API
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
      
      // Add photos
      checkInForm.photos.forEach((photo, index) => {
        formData.append(`photos`, photo);
      });

      const res = await fetch('/api/check-ins', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (res.ok) {
        setShowVisitModal(false);
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
      } else {
        const errorText = await res.text();
        alert(`Failed to submit check-in: ${errorText}`);
      }
    } catch (error) {
      alert('Error submitting check-in. Please try again.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'visits':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Visits</h2>
              <Button 
                size="sm"
                onClick={() => setShowVisitModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Log Visit
              </Button>
            </div>
            
            {/* Today's visits */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Today - {new Date().toLocaleDateString()}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">HVAC Repair - Johnson</p>
                      <p className="text-xs text-gray-600">123 Main St - 9:30 AM</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Complete</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">AC Install - Smith</p>
                      <p className="text-xs text-gray-600">456 Oak Ave - 1:00 PM</p>
                    </div>
                  </div>
                  <Badge className="text-xs bg-blue-600">In Progress</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">Maintenance - Wilson</p>
                      <p className="text-xs text-gray-600">789 Pine St - 3:30 PM</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Upcoming</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Check-in History</h2>
              <Button 
                size="sm"
                onClick={() => setShowVisitModal(true)}
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
                    onClick={() => setShowVisitModal(true)}
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

      case 'reviews':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">My Reviews</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">4.8</div>
                    <div className="flex justify-center mb-1">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="text-xs text-gray-600">Avg Rating</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">47</div>
                    <div className="text-xs text-gray-600 mt-1">Total Reviews</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                  <p className="text-sm text-gray-700">"Excellent service! Very professional."</p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">5 days ago</span>
                  </div>
                  <p className="text-sm text-gray-700">"Fixed our heating system quickly!"</p>
                </div>
              </CardContent>
            </Card>
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
                    <div className="text-lg font-bold">24</div>
                    <div className="text-xs text-gray-600">Total Visits</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">4.8</div>
                    <div className="text-xs text-gray-600">Avg Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="w-4 h-4 mr-2" />
                Support
              </Button>
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
            <div className="grid grid-cols-2 gap-3">
              <Button 
                size="lg" 
                className="h-20 bg-blue-600 hover:bg-blue-700 flex-col"
                onClick={() => setShowVisitModal(true)}
              >
                <Plus className="w-6 h-6 mb-1" />
                Log Visit
              </Button>
              <Button size="lg" variant="outline" className="h-20 flex-col">
                <Camera className="w-6 h-6 mb-1" />
                Quick Photo
              </Button>
            </div>

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">9:30 AM - HVAC Repair</p>
                    <p className="text-xs text-gray-600">Johnson Residence</p>
                  </div>
                  <Badge className="bg-green-600 text-xs">Completed</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">1:00 PM - AC Installation</p>
                    <p className="text-xs text-gray-600">Smith Home</p>
                  </div>
                  <Badge className="bg-blue-600 text-xs">In Progress</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">3:30 PM - Maintenance</p>
                    <p className="text-xs text-gray-600">Wilson Property</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Upcoming</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold">3</div>
                  <div className="text-xs text-gray-600">Today</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold">12</div>
                  <div className="text-xs text-gray-600">This Week</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold">4.8★</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </CardContent>
              </Card>
            </div>
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
            <Bell className="w-5 h-5 text-gray-400" />
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
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'visits', label: 'Visits', icon: MapPin },
            { id: 'history', label: 'History', icon: Clock },
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
      {showVisitModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
          <div className="bg-white rounded-t-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">New Check-in</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowVisitModal(false)}>
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
              
              {/* Options matching company form */}
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
                  onClick={() => setShowVisitModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={submitCheckIn}
                  disabled={!checkInForm.jobType || !checkInForm.notes || checkInForm.notes.length < 5}
                >
                  Submit Check-in
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}