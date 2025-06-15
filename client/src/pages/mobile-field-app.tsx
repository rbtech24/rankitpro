import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { getCurrentLocation, checkLocationPermission, getFallbackLocation, formatLocationDisplay } from '@/lib/locationService';
import type { LocationData } from '@/lib/locationService';
import {
  Camera,
  MapPin,
  ClipboardCheck,
  FileText,
  Mic,
  Video,
  Square,
  Play,
  Send,
  Star,
  Sparkles,
  User,
  Loader2,
  CheckCircle,
  MessageSquare
} from 'lucide-react';

export default function MobileFieldApp() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Tab navigation
  const [activeTab, setActiveTab] = useState('checkin');
  
  // Location state
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationDebug, setLocationDebug] = useState<string>('Detecting location...');
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Audio/Video recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('audio');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Form states for 4 core functions
  const [checkInForm, setCheckInForm] = useState({
    jobTypeId: '',
    workPerformed: '',
    materialsUsed: '',
    notes: '',
    photos: [] as File[]
  });

  const [blogForm, setBlogForm] = useState({
    title: '',
    jobTypeId: '',
    description: '',
    photos: [] as File[]
  });

  const [reviewForm, setReviewForm] = useState({
    customerName: '',
    customerEmail: '',
    jobTypeId: '',
    rating: 5,
    reviewText: '',
    workCompleted: '',
    recommendToOthers: true
  });

  const [audioReviewForm, setAudioReviewForm] = useState({
    customerName: '',
    reviewType: 'audio' as 'audio' | 'video',
    recordingBlob: null as Blob | null,
    jobTypeId: ''
  });

  // Get user authentication
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  // Get job types
  const { data: jobTypes } = useQuery({
    queryKey: ['/api/job-types'],
    enabled: !!user,
  });

  // Initialize GPS location detection
  useEffect(() => {
    const initializeLocation = async () => {
      setLocationLoading(true);
      
      try {
        const permission = await checkLocationPermission();
        
        if (permission.denied) {
          toast({
            title: "Location Access Required",
            description: "Please enable GPS access in your browser settings to automatically detect your work location.",
            variant: "default",
          });
          
          const fallback = getFallbackLocation();
          setCurrentLocation(fallback);
          setLocationDebug('Location access denied - manual entry required');
          return;
        }

        const location = await getCurrentLocation();
        setCurrentLocation(location);
        setLocationDebug(`${location.source}: ±${Math.round(location.accuracy)}m accuracy`);
        
        if (!location.isReliable) {
          toast({
            title: "Location Quality Warning", 
            description: "Location may not be accurate. You can manually edit addresses as needed.",
            variant: "destructive",
          });
        }
        
      } catch (error) {
        console.error('Location detection failed:', error);
        
        const fallback = getFallbackLocation();
        setCurrentLocation(fallback);
        setLocationDebug('Location detection failed - using manual entry');
        
        toast({
          title: "Location Detection",
          description: "Unable to detect GPS location automatically. You can enter addresses manually.",
          variant: "default",
        });
      } finally {
        setLocationLoading(false);
      }
    };

    initializeLocation();
  }, [toast]);

  // AI content generation for check-ins
  const generateCheckInContent = useMutation({
    mutationFn: async (data: { jobTypeId: string; workPerformed: string; materialsUsed: string }) => {
      return apiRequest('/api/ai/generate-checkin-content', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setCheckInForm(prev => ({ ...prev, notes: data.generatedContent }));
      toast({
        title: "AI Content Generated",
        description: "Professional work summary has been generated automatically.",
      });
    },
  });

  // Submit check-in (Core Function 1)
  const submitCheckIn = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('jobTypeId', checkInForm.jobTypeId);
      formData.append('workPerformed', checkInForm.workPerformed);
      formData.append('materialsUsed', checkInForm.materialsUsed);
      formData.append('notes', checkInForm.notes);
      formData.append('address', currentLocation ? formatLocationDisplay(currentLocation) : 'Location not detected');
      
      checkInForm.photos.forEach((photo, index) => {
        formData.append(`photos`, photo);
      });
      
      return apiRequest('/api/check-ins', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Check-in Completed",
        description: "Work documentation has been submitted successfully.",
      });
      setCheckInForm({
        jobTypeId: '',
        workPerformed: '',
        materialsUsed: '',
        notes: '',
        photos: []
      });
      queryClient.invalidateQueries({ queryKey: ['/api/check-ins'] });
    },
  });

  // Create blog post (Core Function 2)
  const createBlogPost = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('title', blogForm.title);
      formData.append('jobTypeId', blogForm.jobTypeId);
      formData.append('description', blogForm.description);
      formData.append('location', currentLocation ? formatLocationDisplay(currentLocation) : 'Location not specified');
      
      blogForm.photos.forEach((photo) => {
        formData.append('photos', photo);
      });
      
      return apiRequest('/api/blog-posts', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Blog Post Created",
        description: "Content has been generated and posted automatically.",
      });
      setBlogForm({
        title: '',
        jobTypeId: '',
        description: '',
        photos: []
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
    },
  });

  // Submit written review request (Core Function 3)
  const submitReviewRequest = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/reviews/request', {
        method: 'POST',
        body: JSON.stringify({
          ...reviewForm,
          address: currentLocation ? formatLocationDisplay(currentLocation) : 'Location not detected',
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Review Request Sent",
        description: "Customer review request has been submitted successfully.",
      });
      setReviewForm({
        customerName: '',
        customerEmail: '',
        jobTypeId: '',
        rating: 5,
        reviewText: '',
        workCompleted: '',
        recommendToOthers: true
      });
    },
  });

  // Submit audio/video review (Core Function 4)
  const submitAudioReview = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('customerName', audioReviewForm.customerName);
      formData.append('reviewType', audioReviewForm.reviewType);
      formData.append('jobTypeId', audioReviewForm.jobTypeId);
      formData.append('address', currentLocation ? formatLocationDisplay(currentLocation) : 'Location not detected');
      
      if (recordedBlob) {
        formData.append('recording', recordedBlob, `review.${audioReviewForm.reviewType === 'video' ? 'webm' : 'wav'}`);
      }
      
      return apiRequest('/api/reviews/audio', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Audio Review Submitted",
        description: "Customer testimonial has been recorded and saved successfully.",
      });
      setAudioReviewForm({
        customerName: '',
        reviewType: 'audio',
        recordingBlob: null,
        jobTypeId: ''
      });
      setRecordedBlob(null);
    },
  });

  // Recording functions
  const startRecording = async () => {
    try {
      const constraints = recordingType === 'video' 
        ? { video: true, audio: true }
        : { audio: true };
        
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (recordingType === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: recordingType === 'video' ? 'video/webm' : 'audio/wav' });
        setRecordedBlob(blob);
        setAudioReviewForm(prev => ({ ...prev, recordingBlob: blob }));
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Unable to access camera/microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Photo handling
  const handlePhotoUpload = (files: FileList | null, formType: 'checkin' | 'blog') => {
    if (files) {
      const newPhotos = Array.from(files);
      if (formType === 'checkin') {
        setCheckInForm(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
      } else {
        setBlogForm(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
      }
    }
  };

  // Location display component
  const LocationDisplay = () => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-green-600" />
        <span className="font-medium text-green-800">Work Location</span>
        {locationLoading && <Loader2 className="w-4 h-4 animate-spin text-green-600" />}
      </div>
      <div className="text-sm text-green-700">
        {currentLocation ? (
          <>
            <p className="font-medium">{currentLocation.streetName}</p>
            <p>{currentLocation.city}, {currentLocation.state} {currentLocation.zipCode}</p>
            <p className="text-xs mt-1">{locationDebug}</p>
          </>
        ) : (
          <p>Detecting GPS location...</p>
        )}
      </div>
    </div>
  );

  // Tab 1: Basic Check-In with AI Content Generation
  const renderCheckInTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-green-600" />
          Job Check-In
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LocationDisplay />
        
        <Select
          value={checkInForm.jobTypeId}
          onValueChange={(value) => setCheckInForm(prev => ({ ...prev, jobTypeId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Job Type" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(jobTypes) && jobTypes.map((type: any) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Work performed..."
          value={checkInForm.workPerformed}
          onChange={(e) => setCheckInForm(prev => ({ ...prev, workPerformed: e.target.value }))}
          rows={3}
        />

        <Textarea
          placeholder="Materials used..."
          value={checkInForm.materialsUsed}
          onChange={(e) => setCheckInForm(prev => ({ ...prev, materialsUsed: e.target.value }))}
          rows={3}
        />

        <div>
          <label className="block text-sm font-medium mb-2">Work Photos</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handlePhotoUpload(e.target.files, 'checkin')}
            className="w-full p-2 border rounded"
          />
          {checkInForm.photos.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">{checkInForm.photos.length} photos selected</p>
          )}
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => generateCheckInContent.mutate({
              jobTypeId: checkInForm.jobTypeId,
              workPerformed: checkInForm.workPerformed,
              materialsUsed: checkInForm.materialsUsed
            })}
            disabled={!checkInForm.jobTypeId || !checkInForm.workPerformed || generateCheckInContent.isPending}
            className="w-full"
            variant="outline"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generateCheckInContent.isPending ? 'Generating...' : 'Generate AI Content'}
          </Button>

          <Textarea
            placeholder="AI-generated summary will appear here..."
            value={checkInForm.notes}
            onChange={(e) => setCheckInForm(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
          />
        </div>

        <Button
          onClick={() => submitCheckIn.mutate()}
          disabled={!checkInForm.jobTypeId || !checkInForm.workPerformed || submitCheckIn.isPending}
          className="w-full"
        >
          {submitCheckIn.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
          Submit Check-In
        </Button>
      </CardContent>
    </Card>
  );

  // Tab 2: Blog Post Creation
  const renderBlogTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Create Blog Post
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LocationDisplay />

        <Input
          placeholder="Blog post title..."
          value={blogForm.title}
          onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
        />

        <Select
          value={blogForm.jobTypeId}
          onValueChange={(value) => setBlogForm(prev => ({ ...prev, jobTypeId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Job Type" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(jobTypes) && jobTypes.map((type: any) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Describe the work and results..."
          value={blogForm.description}
          onChange={(e) => setBlogForm(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
        />

        <div>
          <label className="block text-sm font-medium mb-2">Blog Photos</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handlePhotoUpload(e.target.files, 'blog')}
            className="w-full p-2 border rounded"
          />
          {blogForm.photos.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">{blogForm.photos.length} photos selected</p>
          )}
        </div>

        <Button
          onClick={() => createBlogPost.mutate()}
          disabled={!blogForm.title || !blogForm.description || createBlogPost.isPending}
          className="w-full"
        >
          {createBlogPost.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Create & Publish Blog Post
        </Button>
      </CardContent>
    </Card>
  );

  // Tab 3: Written Review Request
  const renderReviewTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          Request Written Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LocationDisplay />

        <Input
          placeholder="Customer Name"
          value={reviewForm.customerName}
          onChange={(e) => setReviewForm(prev => ({ ...prev, customerName: e.target.value }))}
        />
        
        <Input
          placeholder="Customer Email"
          type="email"
          value={reviewForm.customerEmail}
          onChange={(e) => setReviewForm(prev => ({ ...prev, customerEmail: e.target.value }))}
        />

        <Select
          value={reviewForm.jobTypeId}
          onValueChange={(value) => setReviewForm(prev => ({ ...prev, jobTypeId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Job Type" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(jobTypes) && jobTypes.map((type: any) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div>
          <label className="block text-sm font-medium mb-2">Service Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 cursor-pointer ${star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
              />
            ))}
          </div>
        </div>

        <Textarea
          placeholder="Work completed summary..."
          value={reviewForm.workCompleted}
          onChange={(e) => setReviewForm(prev => ({ ...prev, workCompleted: e.target.value }))}
          rows={3}
        />

        <Button
          onClick={() => submitReviewRequest.mutate()}
          disabled={!reviewForm.customerName || !reviewForm.customerEmail || submitReviewRequest.isPending}
          className="w-full"
        >
          {submitReviewRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Send Review Request
        </Button>
      </CardContent>
    </Card>
  );

  // Tab 4: Audio/Video Review Collection
  const renderAudioReviewTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-red-600" />
          Record Customer Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LocationDisplay />

        <Input
          placeholder="Customer Name"
          value={audioReviewForm.customerName}
          onChange={(e) => setAudioReviewForm(prev => ({ ...prev, customerName: e.target.value }))}
        />

        <Select
          value={audioReviewForm.jobTypeId}
          onValueChange={(value) => setAudioReviewForm(prev => ({ ...prev, jobTypeId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Job Type" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(jobTypes) && jobTypes.map((type: any) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={recordingType === 'audio' ? 'default' : 'outline'}
            onClick={() => setRecordingType('audio')}
            className="flex-1"
          >
            <Mic className="w-4 h-4 mr-2" />
            Audio
          </Button>
          <Button
            variant={recordingType === 'video' ? 'default' : 'outline'}
            onClick={() => setRecordingType('video')}
            className="flex-1"
          >
            <Video className="w-4 h-4 mr-2" />
            Video
          </Button>
        </div>

        {recordingType === 'video' && (
          <video
            ref={videoRef}
            className="w-full h-48 bg-black rounded"
            muted
            playsInline
          />
        )}

        <div className="flex gap-2">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "default"}
            className="flex-1"
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
        </div>

        {recordedBlob && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-sm text-green-700">Recording completed successfully!</p>
          </div>
        )}

        <Button
          onClick={() => submitAudioReview.mutate()}
          disabled={!audioReviewForm.customerName || !recordedBlob || submitAudioReview.isPending}
          className="w-full"
        >
          {submitAudioReview.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Submit Review
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Mobile Field App</h1>
          <p className="text-sm text-gray-600">Professional service management tools</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="flex overflow-x-auto">
          {[
            { id: 'checkin', label: 'Check-In', icon: ClipboardCheck },
            { id: 'blog', label: 'Blog Post', icon: FileText },
            { id: 'review', label: 'Review', icon: MessageSquare },
            { id: 'audio', label: 'Record', icon: Mic }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'checkin' && renderCheckInTab()}
        {activeTab === 'blog' && renderBlogTab()}
        {activeTab === 'review' && renderReviewTab()}
        {activeTab === 'audio' && renderAudioReviewTab()}
      </div>
    </div>
  );
}