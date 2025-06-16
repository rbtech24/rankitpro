import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Camera, FileText, MessageSquare, Mic, Upload, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCurrentLocation, type LocationData } from '@/lib/locationService';
import { apiRequest } from '@/lib/queryClient';

// Types
interface JobType {
  id: string;
  name: string;
  description?: string;
}

interface CheckInFormData {
  jobTypeId: string;
  description: string;
  photos: File[];
  beforePhotos: File[];
  afterPhotos: File[];
}

interface BlogFormData {
  title: string;
  content: string;
  tags: string;
}

interface ReviewFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reviewRequest: string;
}

interface AudioReviewFormData {
  customerName: string;
  audioFile: File | null;
  videoFile: File | null;
}

export default function FieldMobile() {
  // Location state
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [locationLoading, setLocationLoading] = useState(true);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'checkin' | 'blog' | 'review' | 'audio'>('checkin');

  // Form states
  const [checkInForm, setCheckInForm] = useState<CheckInFormData>({
    jobTypeId: '',
    description: '',
    photos: [],
    beforePhotos: [],
    afterPhotos: []
  });

  const [blogForm, setBlogForm] = useState<BlogFormData>({
    title: '',
    content: '',
    tags: ''
  });

  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    reviewRequest: ''
  });

  const [audioReviewForm, setAudioReviewForm] = useState<AudioReviewFormData>({
    customerName: '',
    audioFile: null,
    videoFile: null
  });

  // Job types and loading states
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  // Initialize location detection
  useEffect(() => {
    const detectLocation = async () => {
      try {
        setLocationLoading(true);
        setLocationError('');
        
        const location = await getCurrentLocation();
        setCurrentLocation(location);
        
        console.log('🗺️ GPS Location Detected:', {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: `${location.accuracy}m`,
          timestamp: new Date().toISOString(),
          source: 'Device GPS Hardware'
        });
        
      } catch (error) {
        console.error('Location detection failed:', error);
        setLocationError('Unable to detect location. Please enable GPS and refresh.');
      } finally {
        setLocationLoading(false);
      }
    };

    detectLocation();
  }, []);

  // Load job types
  useEffect(() => {
    const loadJobTypes = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', '/api/job-types');
        const data = await response.json();
        setJobTypes(data);
      } catch (error) {
        console.error('Failed to load job types:', error);
        toast({
          title: "Error",
          description: "Failed to load job types",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadJobTypes();
  }, [toast]);

  // Location display component
  const LocationDisplay = () => {
    if (locationLoading) {
      return (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-blue-800">Detecting location...</span>
          </div>
        </div>
      );
    }

    if (locationError) {
      return (
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="text-red-800">Location Error</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{locationError}</p>
        </div>
      );
    }

    if (currentLocation) {
      return (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">Current Location</span>
          </div>
          <div className="text-sm text-blue-700">
            <p className="font-medium">{currentLocation.streetName}</p>
            <p>{currentLocation.city}, {currentLocation.state} {currentLocation.zipCode}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  // File upload handlers
  const handleFileUpload = (files: FileList | null, type: 'photos' | 'beforePhotos' | 'afterPhotos') => {
    if (files) {
      const fileArray = Array.from(files);
      setCheckInForm(prev => ({
        ...prev,
        [type]: [...prev[type], ...fileArray]
      }));
    }
  };

  // Submit handlers
  const handleCheckInSubmit = async () => {
    if (!currentLocation) {
      toast({
        title: "Location Required",
        description: "Please wait for location detection to complete",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('jobTypeId', checkInForm.jobTypeId);
      formData.append('description', checkInForm.description);
      formData.append('latitude', currentLocation.latitude.toString());
      formData.append('longitude', currentLocation.longitude.toString());
      formData.append('address', `${currentLocation.streetName}, ${currentLocation.city}, ${currentLocation.state} ${currentLocation.zipCode}`);

      checkInForm.photos.forEach((photo, index) => {
        formData.append(`photos`, photo);
      });

      checkInForm.beforePhotos.forEach((photo, index) => {
        formData.append(`beforePhotos`, photo);
      });

      checkInForm.afterPhotos.forEach((photo, index) => {
        formData.append(`afterPhotos`, photo);
      });

      const response = await fetch('/api/check-ins', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Check-in submitted successfully with AI content generation",
      });

      // Reset form
      setCheckInForm({
        jobTypeId: '',
        description: '',
        photos: [],
        beforePhotos: [],
        afterPhotos: []
      });

    } catch (error) {
      console.error('Check-in submission failed:', error);
      toast({
        title: "Error",
        description: "Failed to submit check-in",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlogSubmit = async () => {
    if (!currentLocation) {
      toast({
        title: "Location Required",
        description: "Please wait for location detection to complete",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      await apiRequest('POST', '/api/blog-posts', {
        ...blogForm,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: `${currentLocation.streetName}, ${currentLocation.city}, ${currentLocation.state} ${currentLocation.zipCode}`
      });

      toast({
        title: "Success",
        description: "Blog post created and published automatically",
      });

      setBlogForm({ title: '', content: '', tags: '' });

    } catch (error) {
      console.error('Blog submission failed:', error);
      toast({
        title: "Error",
        description: "Failed to create blog post",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!currentLocation) {
      toast({
        title: "Location Required",
        description: "Please wait for location detection to complete",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      await apiRequest('POST', '/api/review-requests', {
        ...reviewForm,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: `${currentLocation.streetName}, ${currentLocation.city}, ${currentLocation.state} ${currentLocation.zipCode}`
      });

      toast({
        title: "Success",
        description: "Review request sent to customer",
      });

      setReviewForm({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        reviewRequest: ''
      });

    } catch (error) {
      console.error('Review request failed:', error);
      toast({
        title: "Error",
        description: "Failed to send review request",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAudioReviewSubmit = async () => {
    if (!currentLocation) {
      toast({
        title: "Location Required",
        description: "Please wait for location detection to complete",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('customerName', audioReviewForm.customerName);
      formData.append('latitude', currentLocation.latitude.toString());
      formData.append('longitude', currentLocation.longitude.toString());
      formData.append('address', `${currentLocation.streetName}, ${currentLocation.city}, ${currentLocation.state} ${currentLocation.zipCode}`);

      if (audioReviewForm.audioFile) {
        formData.append('audioFile', audioReviewForm.audioFile);
      }

      if (audioReviewForm.videoFile) {
        formData.append('videoFile', audioReviewForm.videoFile);
      }

      await apiRequest('/api/review-responses', {
        method: 'POST',
        body: formData,
      });

      toast({
        title: "Success",
        description: "Audio/video review submitted successfully",
      });

      setAudioReviewForm({
        customerName: '',
        audioFile: null,
        videoFile: null
      });

    } catch (error) {
      console.error('Audio review submission failed:', error);
      toast({
        title: "Error",
        description: "Failed to submit audio/video review",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Tab content renderers
  const renderCheckInTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Basic Check-In
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LocationDisplay />

        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Job Details</h3>
          
          <Select
            value={checkInForm.jobTypeId}
            onValueChange={(value) => setCheckInForm(prev => ({ ...prev, jobTypeId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              {jobTypes.map((jobType) => (
                <SelectItem key={jobType.id} value={jobType.id}>
                  {jobType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Job description and notes..."
            value={checkInForm.description}
            onChange={(e) => setCheckInForm(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
          />
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Photo Documentation</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">General Photos</label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e.target.files, 'photos')}
            />
            {checkInForm.photos.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">{checkInForm.photos.length} photos selected</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Before Photos</label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e.target.files, 'beforePhotos')}
            />
            {checkInForm.beforePhotos.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">{checkInForm.beforePhotos.length} before photos selected</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">After Photos</label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e.target.files, 'afterPhotos')}
            />
            {checkInForm.afterPhotos.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">{checkInForm.afterPhotos.length} after photos selected</p>
            )}
          </div>
        </div>

        <Button 
          onClick={handleCheckInSubmit}
          disabled={submitting || !checkInForm.jobTypeId || !currentLocation}
          className="w-full"
        >
          {submitting ? 'Submitting...' : 'Submit Check-In & Generate AI Content'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderBlogTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-600" />
          Blog Post Creation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LocationDisplay />

        <Input
          placeholder="Blog post title"
          value={blogForm.title}
          onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
        />

        <Textarea
          placeholder="Blog content or key points for AI generation..."
          value={blogForm.content}
          onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
          rows={6}
        />

        <Input
          placeholder="Tags (comma separated)"
          value={blogForm.tags}
          onChange={(e) => setBlogForm(prev => ({ ...prev, tags: e.target.value }))}
        />

        <Button 
          onClick={handleBlogSubmit}
          disabled={submitting || !blogForm.title || !currentLocation}
          className="w-full"
        >
          {submitting ? 'Creating...' : 'Create & Publish Blog Post'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderReviewTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Written Review Request
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

        <Input
          placeholder="Customer Phone"
          type="tel"
          value={reviewForm.customerPhone}
          onChange={(e) => setReviewForm(prev => ({ ...prev, customerPhone: e.target.value }))}
        />

        <Textarea
          placeholder="Custom review request message..."
          value={reviewForm.reviewRequest}
          onChange={(e) => setReviewForm(prev => ({ ...prev, reviewRequest: e.target.value }))}
          rows={4}
        />

        <Button 
          onClick={handleReviewSubmit}
          disabled={submitting || !reviewForm.customerName || !reviewForm.customerEmail || !currentLocation}
          className="w-full"
        >
          {submitting ? 'Sending...' : 'Send Review Request'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderAudioTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-purple-600" />
          Audio/Video Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LocationDisplay />

        <Input
          placeholder="Customer Name"
          value={audioReviewForm.customerName}
          onChange={(e) => setAudioReviewForm(prev => ({ ...prev, customerName: e.target.value }))}
        />

        <div>
          <label className="block text-sm font-medium mb-2">Audio Recording</label>
          <Input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioReviewForm(prev => ({ 
              ...prev, 
              audioFile: e.target.files?.[0] || null 
            }))}
          />
          {audioReviewForm.audioFile && (
            <p className="text-sm text-gray-600 mt-1">Audio file selected: {audioReviewForm.audioFile.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Video Recording</label>
          <Input
            type="file"
            accept="video/*"
            onChange={(e) => setAudioReviewForm(prev => ({ 
              ...prev, 
              videoFile: e.target.files?.[0] || null 
            }))}
          />
          {audioReviewForm.videoFile && (
            <p className="text-sm text-gray-600 mt-1">Video file selected: {audioReviewForm.videoFile.name}</p>
          )}
        </div>

        <Button 
          onClick={handleAudioReviewSubmit}
          disabled={submitting || !audioReviewForm.customerName || (!audioReviewForm.audioFile && !audioReviewForm.videoFile) || !currentLocation}
          className="w-full"
        >
          {submitting ? 'Uploading...' : 'Submit Audio/Video Review'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'checkin':
        return renderCheckInTab();
      case 'blog':
        return renderBlogTab();
      case 'review':
        return renderReviewTab();
      case 'audio':
        return renderAudioTab();
      default:
        return renderCheckInTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Mobile Field App</h1>
          <p className="text-sm text-gray-600">Complete job tasks and collect reviews</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {renderTabContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab('checkin')}
              className={`flex-1 p-4 text-center ${activeTab === 'checkin' ? 'text-green-600 bg-green-50' : 'text-gray-600'}`}
            >
              <CheckCircle className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">Check-In</span>
            </button>
            
            <button
              onClick={() => setActiveTab('blog')}
              className={`flex-1 p-4 text-center ${activeTab === 'blog' ? 'text-orange-600 bg-orange-50' : 'text-gray-600'}`}
            >
              <FileText className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">Blog</span>
            </button>
            
            <button
              onClick={() => setActiveTab('review')}
              className={`flex-1 p-4 text-center ${activeTab === 'review' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
            >
              <MessageSquare className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">Review</span>
            </button>
            
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex-1 p-4 text-center ${activeTab === 'audio' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'}`}
            >
              <Mic className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-medium">Audio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}