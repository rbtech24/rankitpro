import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { useToast } from '../../hooks/use-toast';
// Remove auth import - will use direct query
import { apiRequest, queryClient } from '../../lib/queryClient';
import {
  User,
  MapPin,
  Camera,
  CheckCircle,
  RefreshCw,
  LogOut,
  Home,
  Star,
  Mic,
  Video,
  StopCircle,
  Play,
  Upload,
  Trash2,
  FileText,
  X
} from 'lucide-react';

// Check-in form schema
const checkInSchema = z.object({
  jobTypeId: z.string().min(1, "Job type is required"),
  photos: z.array(z.string()).min(1, "At least one photo is required"),
  notes: z.string().optional(),
  // Customer info only for text review requests
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
  recordingUrl: z.string().optional(),
});

type CheckInFormData = z.infer<typeof checkInSchema>;
type BlogPostFormData = z.infer<typeof blogPostSchema>;
type ReviewFormData = z.infer<typeof reviewSchema>;

export default function TechnicianMobileField() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Authentication - simplified for now, will show interface
  const [activeTab, setActiveTab] = useState('home');
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [reviewType, setReviewType] = useState<'audio' | 'video'>('audio');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Mock user data for now - will be replaced with real auth
  const user = { id: '1', email: 'tech@testcompany.com', role: 'technician' };
  const company = { id: '1', name: 'Test Company' };
  const isAuthenticated = true;
  const isTechnician = true;
  const authLoading = false;

  // Mock job types for demo
  const jobTypes = [
    { id: '1', name: 'Sprinkler Repair' },
    { id: '2', name: 'Irrigation Installation' },
    { id: '3', name: 'System Maintenance' },
    { id: '4', name: 'Leak Detection' },
    { id: '5', name: 'Winterization' }
  ];

  // Mock recent check-ins
  const checkIns = [
    { id: '1', jobType: 'Sprinkler Repair', timestamp: '2024-01-15 10:30 AM' },
    { id: '2', jobType: 'System Maintenance', timestamp: '2024-01-14 2:15 PM' }
  ];

  // Initialize forms
  const checkInForm = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      jobTypeId: "",
      photos: [],
      notes: "",
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
      recordingUrl: "",
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

  // Get current location and address
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          
          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`
            );
            const data = await response.json();
            if (data.features && data.features[0]) {
              const place = data.features[0];
              const address = place.place_name;
              setCurrentAddress(address);
            }
          } catch (error) {
            console.error('Error getting address:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Logout function
  const performLogout = () => {
    window.location.href = '/api/logout';
  };

  // Photo capture functions
  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const photoUrl = e.target?.result as string;
          setPhotos(prev => [...prev, photoUrl]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Audio/Video recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: reviewType === 'video'
      });

      if (videoRef.current && reviewType === 'video') {
        videoRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { 
          type: reviewType === 'video' ? 'video/webm' : 'audio/webm' 
        });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access camera/microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Create check-in mutation
  const createCheckInMutation = useMutation({
    mutationFn: async (checkInData: CheckInFormData) => {
      return apiRequest('POST', '/api/check-ins', {
        ...checkInData,
        technicianId: user?.id,
        companyId: company?.id,
        location: currentLocation,
        address: currentAddress,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/check-ins'] });
      checkInForm.reset();
      setPhotos([]);
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

  // Create review mutation
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
      setRecordingUrl(null);
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

  // Create blog post mutation
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
      setPhotos([]);
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Field Tech</h1>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={performLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
        
        {/* Location Display */}
        {currentAddress && (
          <div className="mt-3 flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="truncate">{currentAddress}</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Welcome, {user?.email?.split('@')[0]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => setActiveTab('check-in')}
                    className="h-20 flex flex-col"
                  >
                    <CheckCircle className="w-6 h-6 mb-1" />
                    Check-In
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('reviews')}
                    className="h-20 flex flex-col"
                    variant="outline"
                  >
                    <Star className="w-6 h-6 mb-1" />
                    Reviews
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Check-ins */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(checkIns) && checkIns.length > 0 ? (
                  <div className="space-y-2">
                    {checkIns.slice(0, 3).map((checkIn: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{checkIn.jobType || 'Job completed'}</p>
                        <p className="text-sm text-gray-600">{checkIn.timestamp}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No recent check-ins</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Check-in Tab */}
        {activeTab === 'check-in' && (
          <Card>
            <CardHeader>
              <CardTitle>New Check-In</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...checkInForm}>
                <form onSubmit={checkInForm.handleSubmit((data) => {
                  createCheckInMutation.mutate({ ...data, photos });
                })} className="space-y-4">
                  
                  {/* Job Type Dropdown */}
                  <FormField
                    control={checkInForm.control}
                    name="jobTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.isArray(jobTypes) && jobTypes.map((jobType: any) => (
                                <SelectItem key={jobType.id} value={jobType.id.toString()}>
                                  {jobType.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Photo Capture */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Photos *</label>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photos
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        capture="environment"
                        onChange={handlePhotoCapture}
                        className="hidden"
                      />
                      
                      {/* Photo Preview Grid */}
                      {photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {photos.map((photo, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={photo} 
                                alt={`Photo ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="absolute -top-1 -right-1 w-6 h-6 rounded-full p-0"
                                onClick={() => removePhoto(index)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <FormField
                    control={checkInForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Work performed, materials used, etc."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Text Review Request Section */}
                  <div className="border-t pt-4">
                    <FormField
                      control={checkInForm.control}
                      name="requestTextReview"
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
                            Request text review from customer
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    {checkInForm.watch('requestTextReview') && (
                      <div className="mt-3 space-y-3">
                        <FormField
                          control={checkInForm.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Customer's name" {...field} />
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
                              <FormLabel>Customer Email</FormLabel>
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
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button 
                      type="submit"
                      className="flex-1"
                      disabled={createCheckInMutation.isPending || photos.length === 0}
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

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {/* Audio/Video Review Collection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Collect Customer Testimonial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...reviewForm}>
                  <form onSubmit={reviewForm.handleSubmit((data) => {
                    createReviewMutation.mutate({ ...data, recordingUrl: recordingUrl || "" });
                  })} className="space-y-4">
                    
                    <FormField
                      control={reviewForm.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Customer's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reviewForm.control}
                      name="jobTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type *</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select service type" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.isArray(jobTypes) && jobTypes.map((jobType: any) => (
                                  <SelectItem key={jobType.id} value={jobType.id.toString()}>
                                    {jobType.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Recording Type Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Recording Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={reviewType === 'audio' ? 'default' : 'outline'}
                          onClick={() => setReviewType('audio')}
                          className="flex items-center"
                        >
                          <Mic className="w-4 h-4 mr-2" />
                          Audio
                        </Button>
                        <Button
                          type="button"
                          variant={reviewType === 'video' ? 'default' : 'outline'}
                          onClick={() => setReviewType('video')}
                          className="flex items-center"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Video
                        </Button>
                      </div>
                    </div>

                    {/* Recording Interface */}
                    <div className="space-y-3">
                      {reviewType === 'video' && (
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          className="w-full h-40 bg-black rounded"
                        />
                      )}

                      <div className="flex space-x-2">
                        {!isRecording ? (
                          <Button
                            type="button"
                            onClick={startRecording}
                            className="flex-1"
                          >
                            {reviewType === 'video' ? (
                              <Video className="w-4 h-4 mr-2" />
                            ) : (
                              <Mic className="w-4 h-4 mr-2" />
                            )}
                            Start Recording
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={stopRecording}
                            variant="destructive"
                            className="flex-1"
                          >
                            <StopCircle className="w-4 h-4 mr-2" />
                            Stop Recording
                          </Button>
                        )}
                      </div>

                      {recordingUrl && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700 mb-2">Recording completed!</p>
                          {reviewType === 'video' ? (
                            <video controls className="w-full h-32">
                              <source src={recordingUrl} type="video/webm" />
                            </video>
                          ) : (
                            <audio controls className="w-full">
                              <source src={recordingUrl} type="audio/webm" />
                            </audio>
                          )}
                        </div>
                      )}
                    </div>

                    <Button 
                      type="submit"
                      className="w-full"
                      disabled={createReviewMutation.isPending || !recordingUrl}
                    >
                      {createReviewMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Review
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Blog Post Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Create Blog Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...blogPostForm}>
                  <form onSubmit={blogPostForm.handleSubmit((data) => {
                    createBlogPostMutation.mutate({ ...data, photos });
                  })} className="space-y-4">
                    
                    <FormField
                      control={blogPostForm.control}
                      name="jobTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type *</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select service type" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.isArray(jobTypes) && jobTypes.map((jobType: any) => (
                                  <SelectItem key={jobType.id} value={jobType.id.toString()}>
                                    {jobType.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Photo Capture for Blog */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Photos *</label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Add Photos
                      </Button>
                      
                      {photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {photos.map((photo, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={photo} 
                                alt={`Photo ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="absolute -top-1 -right-1 w-6 h-6 rounded-full p-0"
                                onClick={() => removePhoto(index)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <FormField
                      control={blogPostForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the work performed, challenges, and results..."
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit"
                      className="w-full"
                      disabled={createBlogPostMutation.isPending || photos.length === 0}
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