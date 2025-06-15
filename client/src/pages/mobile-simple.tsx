import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Camera,
  MapPin,
  Home,
  ClipboardCheck,
  Star,
  Mic,
  Video,
  Square,
  Play,
  Upload
} from 'lucide-react';

export default function MobileSimple() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('checkin');
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [reviewType, setReviewType] = useState<'audio' | 'video'>('audio');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get authenticated user
  const { data: currentUser, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  // Get job types for the company
  const { data: jobTypes = [], isLoading: jobTypesLoading } = useQuery({
    queryKey: ['/api/job-types'],
    enabled: !!currentUser,
    retry: false,
  });

  // Get recent check-ins
  const { data: recentCheckIns = [], isLoading: checkInsLoading } = useQuery({
    queryKey: ['/api/check-ins'],
    enabled: !!currentUser,
    retry: false,
  });

  // Show loading state while authenticating
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (userError || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please log in to access the mobile interface</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Form states
  const [checkInForm, setCheckInForm] = useState({
    jobTypeId: '',
    photos: [] as string[],
    notes: '',
    address: '',
    workPerformed: '',
    materialsUsed: ''
  });

  const [reviewForm, setReviewForm] = useState({
    customerName: '',
    jobTypeId: '',
    reviewType: 'audio' as 'audio' | 'video',
    recordingBlob: null as Blob | null
  });

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          
          // Reverse geocoding (mock implementation)
          setCurrentAddress(`${Math.floor(Math.random() * 9999)} Main St, Anytown, ST 12345`);
          
          toast({
            title: "Location Found",
            description: "GPS location detected successfully",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Could not get current location",
            variant: "destructive",
          });
        }
      );
    }
  };

  // Handle photo capture
  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPhotos.push(e.target.result as string);
            setPhotos(prev => [...prev, ...newPhotos]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Start recording (audio/video)
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
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: reviewType === 'video' ? 'video/webm' : 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        setReviewForm(prev => ({ ...prev, recordingBlob: blob }));
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      toast({
        title: "Recording Started",
        description: `${reviewType === 'video' ? 'Video' : 'Audio'} recording in progress`,
      });
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not start recording",
        variant: "destructive",
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Stop all tracks
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }

      toast({
        title: "Recording Stopped",
        description: "Recording saved successfully",
      });
    }
  };

  // Submit check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('jobTypeId', data.jobTypeId);
      formData.append('notes', data.notes || '');
      formData.append('address', data.address || currentAddress);
      formData.append('workPerformed', data.workPerformed || '');
      formData.append('materialsUsed', data.materialsUsed || '');
      
      // Add photos
      data.photos.forEach((photo: string, index: number) => {
        formData.append(`photos`, photo);
      });

      return apiRequest('POST', '/api/check-ins', formData);
    },
    onSuccess: () => {
      toast({
        title: "Check-In Submitted",
        description: "Job check-in recorded successfully",
      });
      
      // Reset form
      setCheckInForm({
        jobTypeId: '',
        photos: [],
        notes: '',
        address: '',
        workPerformed: '',
        materialsUsed: ''
      });
      setPhotos([]);
      
      // Refresh check-ins list
      queryClient.invalidateQueries({ queryKey: ['/api/check-ins'] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Could not submit check-in",
        variant: "destructive",
      });
    },
  });

  // Submit review mutation
  const reviewMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('customerName', data.customerName);
      formData.append('jobTypeId', data.jobTypeId);
      formData.append('reviewType', data.reviewType);
      
      if (data.recordingBlob) {
        formData.append('recording', data.recordingBlob, `review.${data.reviewType === 'video' ? 'webm' : 'wav'}`);
      }

      return apiRequest('POST', '/api/reviews', formData);
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Customer review recorded successfully",
      });
      
      // Reset form
      setReviewForm({
        customerName: '',
        jobTypeId: '',
        reviewType: 'audio',
        recordingBlob: null
      });
      setRecordingUrl(null);
      
      // Refresh reviews list
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Could not submit review",
        variant: "destructive",
      });
    },
  });

  // Submit handlers
  const handleCheckInSubmit = () => {
    if (!checkInForm.jobTypeId) {
      toast({
        title: "Missing Information",
        description: "Please select a job type",
        variant: "destructive",
      });
      return;
    }

    checkInMutation.mutate({
      ...checkInForm,
      photos,
      address: checkInForm.address || currentAddress
    });
  };

  const handleReviewSubmit = () => {
    if (!reviewForm.customerName || !reviewForm.jobTypeId) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer name and job type",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate(reviewForm);
  };

  // Tab navigation
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Technician Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-lg font-medium">
                    Welcome, {currentUser?.firstName || currentUser?.email || 'Technician'}!
                  </p>
                  <p className="text-muted-foreground">Ready for field work</p>
                </div>
                
                <Button 
                  onClick={getCurrentLocation}
                  className="w-full"
                  variant="outline"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Get Current Location
                </Button>
                
                {currentAddress && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Current Location:</p>
                    <p className="text-sm text-muted-foreground">{currentAddress}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {checkInsLoading ? '...' : recentCheckIns?.filter((c: any) => {
                        const today = new Date().toDateString();
                        return new Date(c.createdAt).toDateString() === today;
                      }).length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Jobs Today</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {checkInsLoading ? '...' : recentCheckIns?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'checkin':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5" />
                  Job Check-In
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Job Type</label>
                  <Select 
                    value={checkInForm.jobTypeId} 
                    onValueChange={(value) => setCheckInForm(prev => ({ ...prev, jobTypeId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    value={checkInForm.address || currentAddress}
                    onChange={(e) => setCheckInForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Job address"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Work Performed</label>
                  <Textarea
                    value={checkInForm.workPerformed}
                    onChange={(e) => setCheckInForm(prev => ({ ...prev, workPerformed: e.target.value }))}
                    placeholder="Describe work completed"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Materials Used</label>
                  <Textarea
                    value={checkInForm.materialsUsed}
                    onChange={(e) => setCheckInForm(prev => ({ ...prev, materialsUsed: e.target.value }))}
                    placeholder="List materials and parts used"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Photos</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photos ({photos.length})
                  </Button>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={checkInForm.notes}
                    onChange={(e) => setCheckInForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes"
                    rows={2}
                  />
                </div>

                <Button onClick={handleCheckInSubmit} className="w-full">
                  Submit Check-In
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Customer Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Customer Name</label>
                  <Input
                    value={reviewForm.customerName}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Customer name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Job Type</label>
                  <Select 
                    value={reviewForm.jobTypeId} 
                    onValueChange={(value) => setReviewForm(prev => ({ ...prev, jobTypeId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Review Type</label>
                  <Select 
                    value={reviewType} 
                    onValueChange={(value: 'audio' | 'video') => {
                      setReviewType(value);
                      setReviewForm(prev => ({ ...prev, reviewType: value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="audio">Audio Recording</SelectItem>
                      <SelectItem value="video">Video Recording</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {reviewType === 'video' && (
                  <video
                    ref={videoRef}
                    className="w-full h-48 bg-gray-200 rounded-lg"
                    autoPlay
                    muted
                  />
                )}

                <div className="flex gap-2">
                  {!isRecording ? (
                    <Button onClick={startRecording} className="flex-1">
                      {reviewType === 'video' ? <Video className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                      Start Recording
                    </Button>
                  ) : (
                    <Button onClick={stopRecording} variant="destructive" className="flex-1">
                      <Square className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                </div>

                {recordingUrl && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Recording Preview:</p>
                    {reviewType === 'video' ? (
                      <video src={recordingUrl} controls className="w-full max-h-32" />
                    ) : (
                      <audio src={recordingUrl} controls className="w-full" />
                    )}
                  </div>
                )}

                <Button onClick={handleReviewSubmit} className="w-full">
                  Submit Review
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-xl font-bold text-center">Field Technician</h1>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderTabContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 p-4 text-center ${
              activeTab === 'home' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <Home className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex-1 p-4 text-center ${
              activeTab === 'checkin' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <ClipboardCheck className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Check-In</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 p-4 text-center ${
              activeTab === 'reviews' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <Star className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Reviews</span>
          </button>
        </div>
      </div>
    </div>
  );
}