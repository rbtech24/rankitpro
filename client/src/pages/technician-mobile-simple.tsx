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
  jobTypeId: z.string().min(1, "Job type is required"),
  photos: z.array(z.string()).min(1, "At least one photo is required"),
  notes: z.string().optional(),
  beforePhotos: z.array(z.string()).optional(),
  afterPhotos: z.array(z.string()).optional(),
  // Customer info only for review requests
  requestTextReview: z.boolean().default(false),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
});

// Blog post form schema
const blogPostSchema = z.object({
  jobTypeId: z.string().min(1, "Job type is required"),
  photos: z.array(z.string()).min(1, "At least one photo is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

// Review collection form schema (audio/video testimonials)
const reviewSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  jobTypeId: z.string().min(1, "Job type is required"),
  reviewType: z.enum(['audio', 'video']),
  recordingBlob: z.any().optional(),
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
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [reviewType, setReviewType] = useState<'audio' | 'video'>('audio');
  
  // Check authentication and role
  const isAuthenticated = !!auth?.user;
  const isTechnician = auth?.user?.role === 'technician';
  const user = auth?.user;
  const company = auth?.company;

  // Initialize forms
  const checkInForm = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      jobTypeId: "",
      photos: [],
      notes: "",
      beforePhotos: [],
      afterPhotos: [],
      requestTextReview: false,
      customerName: "",
      customerEmail: "",
      customerPhone: "",
    }
  });

  const reviewForm = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      customerName: "",
      jobTypeId: "",
      reviewType: 'audio',
      recordingBlob: null,
    }
  });

  const blogPostForm = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      jobTypeId: "",
      photos: [],
      description: "",
    }
  });

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
    mutationFn: async (checkInData: CheckInFormData) => {
      return apiRequest('POST', '/api/check-ins', {
        ...checkInData,
        technicianId: user?.id,
        companyId: company?.id,
        location: currentLocation,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/check-ins'] });
      checkInForm.reset();
      setActiveTab('home');
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

  // Create review
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: ReviewFormData) => {
      return apiRequest('POST', '/api/reviews', {
        ...reviewData,
        technicianId: user?.id,
        companyId: company?.id,
        source: 'technician_mobile',
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      reviewForm.reset();
      setActiveTab('home');
      toast({
        title: "Review submitted",
        description: "Customer review has been recorded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting review",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create blog post
  const createBlogPostMutation = useMutation({
    mutationFn: async (blogData: BlogPostFormData) => {
      return apiRequest('POST', '/api/blog-posts', {
        ...blogData,
        technicianId: user?.id,
        companyId: company?.id,
        status: 'draft',
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      blogPostForm.reset();
      setActiveTab('home');
      toast({
        title: "Blog post created",
        description: "Your blog post has been saved as a draft",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating blog post",
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
            <CardContent>
              <Form {...checkInForm}>
                <form onSubmit={checkInForm.handleSubmit((data) => createCheckInMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={checkInForm.control}
                    name="jobType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Sprinkler Repair, Maintenance" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={checkInForm.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Customer's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={checkInForm.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="customer@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={checkInForm.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={checkInForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-700 font-semibold">Service Address *</FormLabel>
                        <div className="space-y-2 bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                placeholder="Enter street, city, state, zip code" 
                                {...field} 
                                className="flex-1 border-blue-300"
                              />
                            </FormControl>
                            <Button 
                              type="button"
                              onClick={() => {
                                if (navigator.geolocation) {
                                  navigator.geolocation.getCurrentPosition(
                                    async (position) => {
                                      const { latitude, longitude } = position.coords;
                                      try {
                                        const response = await fetch(
                                          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
                                        );
                                        const data = await response.json();
                                        const address = data.display_name || `${latitude}, ${longitude}`;
                                        field.onChange(address);
                                      } catch (error) {
                                        field.onChange(`${latitude}, ${longitude}`);
                                      }
                                    },
                                    (error) => {
                                      console.error('Location error:', error);
                                    }
                                  );
                                }
                              }}
                              variant="outline" 
                              size="sm"
                              className="px-3 border-blue-300 text-blue-600 hover:bg-blue-100"
                            >
                              <MapPin className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={checkInForm.control}
                    name="workPerformed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Performed *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the work completed..."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={checkInForm.control}
                    name="materialsUsed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Materials Used</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List any materials or parts used..."
                            rows={2}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={checkInForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional notes or observations..."
                            rows={2}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-3">Review Request</h3>
                    
                    <FormField
                      control={checkInForm.control}
                      name="requestReview"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-4 h-4"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Send review request to customer
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    {checkInForm.watch('requestReview') && (
                      <FormField
                        control={checkInForm.control}
                        name="reviewMessage"
                        render={({ field }) => (
                          <FormItem className="mt-3">
                            <FormLabel>Review Request Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Hi [Customer Name], we'd love to hear about your experience with our service today..."
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button 
                      type="submit"
                      className="flex-1"
                      disabled={createCheckInMutation.isPending}
                    >
                      {createCheckInMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Submit Check-In
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setActiveTab('home')}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Collect Customer Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...reviewForm}>
                  <form onSubmit={reviewForm.handleSubmit((data) => createReviewMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={reviewForm.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Customer's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reviewForm.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="customer@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reviewForm.control}
                      name="jobType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Sprinkler Repair" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reviewForm.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating *</FormLabel>
                          <FormControl>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">⭐⭐⭐⭐⭐ (5 stars)</SelectItem>
                                <SelectItem value="4">⭐⭐⭐⭐ (4 stars)</SelectItem>
                                <SelectItem value="3">⭐⭐⭐ (3 stars)</SelectItem>
                                <SelectItem value="2">⭐⭐ (2 stars)</SelectItem>
                                <SelectItem value="1">⭐ (1 star)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reviewForm.control}
                      name="reviewText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Review Text *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What did the customer think about the service?"
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reviewForm.control}
                      name="workCompleted"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Completed *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief description of work performed"
                              rows={2}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reviewForm.control}
                      name="recommendToOthers"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-4 h-4"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Customer would recommend to others
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2">
                      <Button 
                        type="submit"
                        className="flex-1"
                        disabled={createReviewMutation.isPending}
                      >
                        {createReviewMutation.isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Review
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Create Blog Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...blogPostForm}>
                  <form onSubmit={blogPostForm.handleSubmit((data) => createBlogPostMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={blogPostForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Blog Post Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Successful Sprinkler Repair in Downtown" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={blogPostForm.control}
                      name="jobType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Sprinkler Repair" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={blogPostForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Downtown Dallas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={blogPostForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the work performed, challenges faced, and results achieved..."
                              rows={6}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={blogPostForm.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., sprinkler, repair, irrigation (comma-separated)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit"
                      className="w-full"
                      disabled={createBlogPostMutation.isPending}
                    >
                      {createBlogPostMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Create Blog Post
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-3 h-16">
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
            onClick={() => setActiveTab('reviews')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'reviews' ? 'text-primary bg-primary/10' : 'text-gray-600'
            }`}
          >
            <Star className="w-5 h-5" />
            <span className="text-xs">Reviews</span>
          </button>
        </div>
      </nav>
    </div>
  );
}