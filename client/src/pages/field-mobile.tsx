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
  ClipboardCheck,
  FileText,
  Mic,
  Video,
  Square,
  Play
} from 'lucide-react';

export default function FieldMobile() {
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
    jobType: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    workPerformed: '',
    materialsUsed: '',
    problemDescription: '',
    notes: '',
    requestWrittenReview: false,
    reviewMessage: ''
  });

  const [blogForm, setBlogForm] = useState({
    jobType: '',
    workDescription: '',
    address: '',
    specialNotes: '',
    targetKeywords: ''
  });

  const [reviewForm, setReviewForm] = useState({
    customerName: '',
    jobType: '',
    address: '',
    reviewType: 'audio' as 'audio' | 'video',
    recordingBlob: null as Blob | null
  });

  // Get current location with reverse geocoding
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          
          try {
            // Use free Nominatim API for reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.address) {
              const addr = data.address;
              const houseNumber = addr.house_number || '';
              const street = addr.road || addr.street || '';
              const city = addr.city || addr.town || addr.village || '';
              const state = addr.state || '';
              const zip = addr.postcode || '';
              
              const streetAddress = houseNumber && street ? `${houseNumber} ${street}` : street;
              setCurrentAddress(`${streetAddress}, ${city}, ${state} ${zip}`.replace(/,\s*,/g, ',').trim());
            } else {
              // Use coordinates if no address found
              setCurrentAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            }
          } catch (error) {
            // Use coordinates if API fails
            setCurrentAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
          
          toast({
            title: "Location Found",
            description: "GPS location detected successfully",
          });
        },
        (error) => {
          toast({
            title: "Location Error", 
            description: "Could not get current location. Please enable location services.",
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your device doesn't support location services",
        variant: "destructive",
      });
    }
  };

  // Handle photo capture
  const handlePhotoCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPhotos(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: reviewType === 'video'
      });

      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: reviewType === 'video' ? 'video/webm' : 'audio/wav' });
        setReviewForm(prev => ({ ...prev, recordingBlob: blob }));
        setRecordingUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);

      if (reviewType === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not start recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Submit check-in with AI generation mutation
  const checkInMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('jobType', data.jobType);
      formData.append('customerName', data.customerName || '');
      formData.append('customerEmail', data.customerEmail || '');
      formData.append('customerPhone', data.customerPhone || '');
      formData.append('workPerformed', data.workPerformed || '');
      formData.append('materialsUsed', data.materialsUsed || '');
      formData.append('problemDescription', data.problemDescription || '');
      formData.append('notes', data.notes || '');
      formData.append('requestWrittenReview', data.requestWrittenReview.toString());
      formData.append('reviewMessage', data.reviewMessage || '');
      formData.append('address', data.address || currentAddress);
      formData.append('generateAIContent', 'true');
      
      if (currentLocation) {
        formData.append('latitude', currentLocation.latitude.toString());
        formData.append('longitude', currentLocation.longitude.toString());
      }
      
      photos.forEach((photo, index) => {
        formData.append(`photos`, photo);
      });

      return apiRequest('POST', '/api/check-ins', formData);
    },
    onSuccess: () => {
      toast({
        title: "Check-In Submitted",
        description: "Job check-in recorded with AI-generated content",
      });
      
      setCheckInForm({
        jobType: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        address: '',
        workPerformed: '',
        materialsUsed: '',
        problemDescription: '',
        notes: '',
        requestWrittenReview: false,
        reviewMessage: ''
      });
      setPhotos([]);
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Could not submit check-in",
        variant: "destructive",
      });
    },
  });

  // Submit blog post with AI generation mutation
  const blogMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('jobType', data.jobType);
      formData.append('workDescription', data.workDescription);
      formData.append('location', data.location || currentAddress);
      formData.append('specialNotes', data.specialNotes || '');
      formData.append('targetKeywords', data.targetKeywords || '');
      formData.append('generateAIContent', 'true');
      
      if (currentLocation) {
        formData.append('latitude', currentLocation.latitude.toString());
        formData.append('longitude', currentLocation.longitude.toString());
      }
      
      photos.forEach((photo, index) => {
        formData.append(`photos`, photo);
      });

      return apiRequest('POST', '/api/blog-posts', formData);
    },
    onSuccess: () => {
      toast({
        title: "Blog Post Created",
        description: "AI-generated blog post submitted successfully",
      });
      
      setBlogForm({
        jobType: '',
        workDescription: '',
        address: '',
        specialNotes: '',
        targetKeywords: ''
      });
      setPhotos([]);
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Could not create blog post",
        variant: "destructive",
      });
    },
  });

  // Submit review mutation
  const reviewMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('customerName', data.customerName);
      formData.append('jobType', data.jobType);
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
      
      setReviewForm({
        customerName: '',
        jobType: '',
        address: '',
        reviewType: 'audio',
        recordingBlob: null
      });
      setRecordingUrl(null);
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
    if (!checkInForm.jobType) {
      toast({
        title: "Missing Information",
        description: "Please select a job type",
        variant: "destructive",
      });
      return;
    }

    checkInMutation.mutate(checkInForm);
  };

  const handleBlogSubmit = () => {
    if (!blogForm.jobType || !blogForm.workDescription) {
      toast({
        title: "Missing Information",
        description: "Please select job type and describe the work",
        variant: "destructive",
      });
      return;
    }

    blogMutation.mutate(blogForm);
  };

  const handleReviewSubmit = () => {
    if (!reviewForm.customerName || !reviewForm.jobType) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer name and job type",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate(reviewForm);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'checkin':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Job Check-In (AI Enhanced)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={getCurrentLocation} variant="outline" size="sm" className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                Get Location
              </Button>

              {currentAddress && (
                <div className="p-2 bg-green-50 rounded text-sm text-center">
                  <p className="text-green-600 font-medium">📍 {currentAddress}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Job Type *</label>
                <Select value={checkInForm.jobType} onValueChange={(value) => setCheckInForm({...checkInForm, jobType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(jobTypes) && jobTypes.map((type: any) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Customer name"
                value={checkInForm.customerName}
                onChange={(e) => setCheckInForm({...checkInForm, customerName: e.target.value})}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={checkInForm.customerEmail}
                  onChange={(e) => setCheckInForm({...checkInForm, customerEmail: e.target.value})}
                />
                <Input
                  type="tel"
                  placeholder="Phone"
                  value={checkInForm.customerPhone}
                  onChange={(e) => setCheckInForm({...checkInForm, customerPhone: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Service address (street, city, state, zip)"
                    value={checkInForm.address || currentAddress}
                    onChange={(e) => setCheckInForm({...checkInForm, address: e.target.value})}
                    className="flex-1"
                  />
                  <Button 
                    onClick={getCurrentLocation} 
                    variant="outline" 
                    size="sm"
                    className="px-3"
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Textarea
                placeholder="Work performed..."
                value={checkInForm.workPerformed}
                onChange={(e) => setCheckInForm({...checkInForm, workPerformed: e.target.value})}
                rows={2}
              />

              <Textarea
                placeholder="Materials used..."
                value={checkInForm.materialsUsed}
                onChange={(e) => setCheckInForm({...checkInForm, materialsUsed: e.target.value})}
                rows={2}
              />

              <Textarea
                placeholder="Problem & solution notes..."
                value={checkInForm.problemDescription}
                onChange={(e) => setCheckInForm({...checkInForm, problemDescription: e.target.value})}
                rows={2}
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requestReview"
                  checked={checkInForm.requestWrittenReview}
                  onChange={(e) => setCheckInForm({...checkInForm, requestWrittenReview: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="requestReview" className="text-sm">
                  Request written review from customer
                </label>
              </div>

              <Button onClick={handlePhotoCapture} variant="outline" className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Add Photos ({photos.length})
              </Button>

              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.slice(0, 6).map((photo, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                      <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={handleCheckInSubmit}
                className="w-full"
                disabled={checkInMutation.isPending || !checkInForm.jobType}
              >
                {checkInMutation.isPending ? 'Submitting...' : 'Submit Check-In (AI Enhanced)'}
              </Button>
            </CardContent>
          </Card>
        );

      case 'blog':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Create Blog Post (AI Generated)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Job Type *</label>
                <Select value={blogForm.jobType} onValueChange={(value) => setBlogForm({...blogForm, jobType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(jobTypes) && jobTypes.map((type: any) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                placeholder="Describe the work completed (AI will expand this)..."
                value={blogForm.workDescription}
                onChange={(e) => setBlogForm({...blogForm, workDescription: e.target.value})}
                rows={3}
              />

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Service address (street, city, state, zip)"
                    value={blogForm.address || currentAddress}
                    onChange={(e) => setBlogForm({...blogForm, address: e.target.value})}
                    className="flex-1"
                  />
                  <Button 
                    onClick={getCurrentLocation} 
                    variant="outline" 
                    size="sm"
                    className="px-3"
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Textarea
                placeholder="Special techniques, challenges, or tips..."
                value={blogForm.specialNotes}
                onChange={(e) => setBlogForm({...blogForm, specialNotes: e.target.value})}
                rows={2}
              />

              <Input
                placeholder="Target keywords (comma separated)"
                value={blogForm.targetKeywords}
                onChange={(e) => setBlogForm({...blogForm, targetKeywords: e.target.value})}
              />

              <Button onClick={handlePhotoCapture} variant="outline" className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Add Photos for Blog ({photos.length})
              </Button>

              <Button
                onClick={handleBlogSubmit}
                className="w-full"
                disabled={blogMutation.isPending || !blogForm.jobType || !blogForm.workDescription}
              >
                {blogMutation.isPending ? 'Creating...' : 'Generate AI Blog Post'}
              </Button>
            </CardContent>
          </Card>
        );

      case 'audio':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Audio Review Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Customer name"
                value={reviewForm.customerName}
                onChange={(e) => setReviewForm({...reviewForm, customerName: e.target.value})}
              />

              <div>
                <label className="text-sm font-medium">Job Type</label>
                <Select value={reviewForm.jobType} onValueChange={(value) => setReviewForm({...reviewForm, jobType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(jobTypes) && jobTypes.map((type: any) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Service address (street, city, state, zip)"
                    value={reviewForm.address || currentAddress}
                    onChange={(e) => setReviewForm({...reviewForm, address: e.target.value})}
                    className="flex-1"
                  />
                  <Button 
                    onClick={getCurrentLocation} 
                    variant="outline" 
                    size="sm"
                    className="px-3"
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center space-y-4">
                {!isRecording && !recordingUrl && (
                  <Button
                    onClick={() => {
                      setReviewType('audio');
                      startRecording();
                    }}
                    className="w-full"
                    size="lg"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Start Audio Recording
                  </Button>
                )}

                {isRecording && (
                  <div className="space-y-4">
                    <div className="animate-pulse text-red-600 font-medium">
                      🔴 Recording Audio...
                    </div>
                    <Button onClick={stopRecording} variant="destructive" size="lg">
                      <Square className="w-5 h-5 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                )}

                {recordingUrl && (
                  <div className="space-y-4">
                    <audio controls src={recordingUrl} className="w-full" />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setRecordingUrl(null);
                          setReviewForm({...reviewForm, recordingBlob: null});
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Re-record
                      </Button>
                      <Button
                        onClick={handleReviewSubmit}
                        className="flex-1"
                        disabled={reviewMutation.isPending}
                      >
                        {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'video':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Review Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Customer name"
                value={reviewForm.customerName}
                onChange={(e) => setReviewForm({...reviewForm, customerName: e.target.value})}
              />

              <div>
                <label className="text-sm font-medium">Job Type</label>
                <Select value={reviewForm.jobType} onValueChange={(value) => setReviewForm({...reviewForm, jobType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(jobTypes) && jobTypes.map((type: any) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-center space-y-4">
                {isRecording && reviewType === 'video' && (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full max-w-sm mx-auto rounded-lg"
                  />
                )}

                {recordingUrl && reviewType === 'video' && (
                  <video
                    controls
                    src={recordingUrl}
                    className="w-full max-w-sm mx-auto rounded-lg"
                  />
                )}

                {!isRecording && !recordingUrl && (
                  <Button
                    onClick={() => {
                      setReviewType('video');
                      startRecording();
                    }}
                    className="w-full"
                    size="lg"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Start Video Recording
                  </Button>
                )}

                {isRecording && (
                  <div className="space-y-4">
                    <div className="animate-pulse text-red-600 font-medium">
                      🔴 Recording Video...
                    </div>
                    <Button onClick={stopRecording} variant="destructive" size="lg">
                      <Square className="w-5 h-5 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                )}

                {recordingUrl && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setRecordingUrl(null);
                        setReviewForm({...reviewForm, recordingBlob: null});
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Re-record
                    </Button>
                    <Button
                      onClick={handleReviewSubmit}
                      className="flex-1"
                      disabled={reviewMutation.isPending}
                    >
                      {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div className="container mx-auto p-4 max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center mb-4">Field Technician App</h1>
          
          {/* Tab Navigation */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-gray-200 rounded-lg">
            <button
              onClick={() => setActiveTab('checkin')}
              className={`p-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'checkin' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
              }`}
            >
              Check-In
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`p-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'blog' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
              }`}
            >
              Blog Post
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`p-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'audio' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
              }`}
            >
              Audio Review
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`p-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'video' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
              }`}
            >
              Video Review
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}