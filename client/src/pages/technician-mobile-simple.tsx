import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, AuthState } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Home, 
  CheckCircle, 
  Calendar, 
  Users, 
  Bell, 
  Settings, 
  LogOut,
  Camera,
  MapPin,
  Clock,
  PlusCircle,
  RefreshCw,
  Send,
  Star,
  MessageSquare,
  FileText
} from 'lucide-react';

// Check-in form schema
const checkInSchema = z.object({
  jobType: z.string().min(1, "Job type is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email required"),
  customerPhone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  workPerformed: z.string().min(1, "Work performed description is required"),
  materialsUsed: z.string().optional(),
  notes: z.string().optional(),
  requestReview: z.boolean().default(true),
  reviewMessage: z.string().optional(),
});

// Blog post form schema
const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  jobType: z.string().min(1, "Job type is required"),
  customerName: z.string().optional(),
  location: z.string().optional(),
  tags: z.string().optional(),
});

// Review collection form schema
const reviewSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email required"),
  jobType: z.string().min(1, "Job type is required"),
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(10, "Review must be at least 10 characters"),
  workCompleted: z.string().min(1, "Work completed description is required"),
  recommendToOthers: z.boolean().default(true),
});

type CheckInFormData = z.infer<typeof checkInSchema>;
type BlogPostFormData = z.infer<typeof blogPostSchema>;
type ReviewFormData = z.infer<typeof reviewSchema>;

export default function TechnicianMobile() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use shared authentication state
  const { data: auth, isLoading: authLoading, error: authError } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 0
  });

  const [activeTab, setActiveTab] = useState('home');
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  
  // Check authentication and role
  const isAuthenticated = !!auth?.user;
  const isTechnician = auth?.user?.role === 'technician';
  const user = auth?.user;
  const company = auth?.company;

  // Redirect if not authenticated or not a technician
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isTechnician)) {
      setLocation('/login');
    }
  }, [authLoading, isAuthenticated, isTechnician, setLocation]);

  // Fetch check-ins data
  const { data: checkIns = [], isLoading: checkInsLoading } = useQuery({
    queryKey: ['/api/check-ins'],
    enabled: isAuthenticated && isTechnician,
    retry: false
  });

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Location access denied or unavailable');
        }
      );
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    import('@/lib/logout').then(({ performImmediateLogout }) => {
      performImmediateLogout();
    });
  };

  // Create new check-in
  const createCheckInMutation = useMutation({
    mutationFn: async (checkInData: any) => {
      return apiRequest('POST', '/api/check-ins', checkInData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/check-ins'] });
      toast({
        title: "Check-in created",
        description: "Your check-in has been recorded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating check-in",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Show loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show error if auth failed
  if (authError || !isAuthenticated || !isTechnician) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">You need technician access to view this page.</p>
            <Button onClick={() => setLocation('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Rank It Pro</h1>
            <p className="text-sm opacity-90">Mobile Technician Portal</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Hi, {user?.username}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-20">
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{checkIns.length}</p>
                  <p className="text-sm text-gray-600">Total Check-ins</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-600">Today's Jobs</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => setActiveTab('check-in')}
                  disabled={createCheckInMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  New Check-In
                </Button>
                <Button variant="outline" className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </CardContent>
            </Card>

            {/* Recent Check-ins */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                {checkInsLoading ? (
                  <div className="flex justify-center py-4">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                ) : checkIns.length > 0 ? (
                  <div className="space-y-3">
                    {checkIns.slice(0, 3).map((checkIn: any) => (
                      <div key={checkIn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{checkIn.jobType}</p>
                          <p className="text-sm text-gray-600">{checkIn.customerName || 'Unknown Customer'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(checkIn.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No check-ins yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'check-in' && (
          <Card>
            <CardHeader>
              <CardTitle>New Check-In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Job Type</label>
                <Input placeholder="e.g., Sprinkler Repair" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Customer Name</label>
                <Input placeholder="Customer name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea 
                  className="w-full p-3 border rounded-md"
                  rows={4}
                  placeholder="Work performed, materials used, etc."
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  className="flex-1"
                  disabled={createCheckInMutation.isPending}
                >
                  Submit Check-In
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('home')}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'home' ? 'text-primary bg-primary/10' : 'text-gray-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('check-in')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'check-in' ? 'text-primary bg-primary/10' : 'text-gray-600'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-xs">Check-In</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'schedule' ? 'text-primary bg-primary/10' : 'text-gray-600'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Schedule</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'profile' ? 'text-primary bg-primary/10' : 'text-gray-600'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}