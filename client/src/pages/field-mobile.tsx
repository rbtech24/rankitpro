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
  CheckCircle,
  MessageSquare,
  Video,
  Square,
  Play,
  Send,
  Star
} from 'lucide-react';
import { Link } from 'wouter';

export default function FieldMobile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('checkin');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('audio');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Location state
  const [currentLocation, setCurrentLocation] = useState({
    streetName: '',
    city: '',
    state: '',
    zipCode: '',
    fullAddress: ''
  });

  // Form states
  const [checkInForm, setCheckInForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    jobTypeId: '',
    address: '',
    workPerformed: '',
    materialsUsed: '',
    notes: '',
    photos: [] as File[],
    beforePhotos: [] as File[],
    afterPhotos: [] as File[],
    requestTextReview: false
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

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  // Fetch job types
  const { data: jobTypes } = useQuery({
    queryKey: ['/api/job-types'],
    enabled: !!user,
  });

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Use reverse geocoding to get address details
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                const result = data.results[0];
                const components = result.components;
                
                setCurrentLocation({
                  streetName: `${components.house_number || ''} ${components.road || ''}`.trim(),
                  city: components.city || components.town || components.village || '',
                  state: components.state_code || components.state || '',
                  zipCode: components.postcode || '',
                  fullAddress: result.formatted
                });
                
                // Auto-fill address in forms
                setCheckInForm(prev => ({
                  ...prev,
                  address: result.formatted
                }));
              }
            }
          } catch (error) {
            console.error('Error getting location details:', error);
            // Fallback to basic coordinates
            setCurrentLocation({
              streetName: `Lat: ${latitude.toFixed(4)}`,
              city: `Lng: ${longitude.toFixed(4)}`,
              state: '',
              zipCode: '',
              fullAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Access",
            description: "Unable to get your current location. Please enter the address manually.",
            variant: "destructive",
          });
        }
      );
    }
  }, [toast]);

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'photos' || key === 'beforePhotos' || key === 'afterPhotos') {
          (value as File[]).forEach((file, index) => {
            formData.append(`${key}[${index}]`, file);
          });
        } else {
          formData.append(key, String(value));
        }
      });
      
      return apiRequest('POST', '/api/checkins', formData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Check-in submitted successfully!",
      });
      
      // Reset form
      setCheckInForm({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        jobTypeId: '',
        address: currentLocation.fullAddress,
        workPerformed: '',
        materialsUsed: '',
        notes: '',
        photos: [],
        beforePhotos: [],
        afterPhotos: [],
        requestTextReview: false
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit check-in",
        variant: "destructive",
      });
    },
  });

  // Written review mutation
  const reviewMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/reviews', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review submitted successfully!",
      });
      
      // Reset form
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
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  // Audio/Video review mutation
  const audioReviewMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('customerName', data.customerName);
      formData.append('reviewType', data.reviewType);
      formData.append('jobTypeId', data.jobTypeId);
      if (data.recordingBlob) {
        formData.append('recording', data.recordingBlob, `review.${data.reviewType === 'video' ? 'webm' : 'wav'}`);
      }
      
      return apiRequest('POST', '/api/reviews/audio-video', formData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Audio/Video review submitted successfully!",
      });
      
      // Reset form
      setAudioReviewForm({
        customerName: '',
        reviewType: 'audio',
        recordingBlob: null,
        jobTypeId: ''
      });
      setRecordedBlob(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit audio/video review",
        variant: "destructive",
      });
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
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { 
          type: recordingType === 'video' ? 'video/webm' : 'audio/wav' 
        });
        setRecordedBlob(blob);
        setAudioReviewForm(prev => ({ ...prev, recordingBlob: blob }));
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Unable to access microphone/camera",
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
        streamRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // File upload handlers
  const handleFileUpload = (files: FileList | null, field: string) => {
    if (files) {
      const fileArray = Array.from(files);
      setCheckInForm(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as File[]), ...fileArray]
      }));
    }
  };

  const removeFile = (index: number, field: string) => {
    setCheckInForm(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as File[]).filter((_, i) => i !== index)
    }));
  };

  const renderCheckInTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Job Check-In
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Display */}
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

        {/* Customer Information */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Customer Information</h3>
          
          <Input
            placeholder="Customer Name"
            value={checkInForm.customerName}
            onChange={(e) => setCheckInForm(prev => ({ ...prev, customerName: e.target.value }))}
          />
          
          <Input
            placeholder="Customer Email"
            type="email"
            value={checkInForm.customerEmail}
            onChange={(e) => setCheckInForm(prev => ({ ...prev, customerEmail: e.target.value }))}
          />
          
          <Input
            placeholder="Customer Phone"
            type="tel"
            value={checkInForm.customerPhone}
            onChange={(e) => setCheckInForm(prev => ({ ...prev, customerPhone: e.target.value }))}
          />
        </div>

        {/* Job Information */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Job Details</h3>
          
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
          
          <Input
            placeholder="Job Address"
            value={checkInForm.address}
            onChange={(e) => setCheckInForm(prev => ({ ...prev, address: e.target.value }))}
          />
          
          <Textarea
            placeholder="Work Performed"
            value={checkInForm.workPerformed}
            onChange={(e) => setCheckInForm(prev => ({ ...prev, workPerformed: e.target.value }))}
            rows={3}
          />
          
          <Textarea
            placeholder="Materials Used"
            value={checkInForm.materialsUsed}
            onChange={(e) => setCheckInForm(prev => ({ ...prev, materialsUsed: e.target.value }))}
            rows={2}
          />
          
          <Textarea
            placeholder="Additional Notes"
            value={checkInForm.notes}
            onChange={(e) => setCheckInForm(prev => ({ ...prev, notes: e.target.value }))}
            rows={2}
          />
        </div>

        {/* Photo Upload */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Photos</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Before Photos
              </label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files, 'beforePhotos')}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"
              />
              {checkInForm.beforePhotos.length > 0 && (
                <div className="mt-2 space-y-1">
                  {checkInForm.beforePhotos.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>{file.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(index, 'beforePhotos')}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                After Photos
              </label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files, 'afterPhotos')}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-green-50 file:text-green-700"
              />
              {checkInForm.afterPhotos.length > 0 && (
                <div className="mt-2 space-y-1">
                  {checkInForm.afterPhotos.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>{file.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(index, 'afterPhotos')}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Request */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="requestReview"
            checked={checkInForm.requestTextReview}
            onChange={(e) => setCheckInForm(prev => ({ ...prev, requestTextReview: e.target.checked }))}
            className="rounded border-gray-300"
          />
          <label htmlFor="requestReview" className="text-sm text-gray-700">
            Request written review from customer
          </label>
        </div>

        <Button 
          onClick={() => checkInMutation.mutate(checkInForm)}
          disabled={checkInMutation.isPending || !checkInForm.customerName || !checkInForm.jobTypeId}
          className="w-full"
        >
          {checkInMutation.isPending ? 'Submitting...' : 'Submit Check-In'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderWrittenReviewTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Written Review Request
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating: {reviewForm.rating} stars
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                className={`p-1 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
          </div>
        </div>

        <Textarea
          placeholder="Review Text"
          value={reviewForm.reviewText}
          onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
          rows={4}
        />

        <Textarea
          placeholder="Work Completed Description"
          value={reviewForm.workCompleted}
          onChange={(e) => setReviewForm(prev => ({ ...prev, workCompleted: e.target.value }))}
          rows={3}
        />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="recommend"
            checked={reviewForm.recommendToOthers}
            onChange={(e) => setReviewForm(prev => ({ ...prev, recommendToOthers: e.target.checked }))}
            className="rounded border-gray-300"
          />
          <label htmlFor="recommend" className="text-sm text-gray-700">
            Would recommend to others
          </label>
        </div>

        <Button 
          onClick={() => reviewMutation.mutate(reviewForm)}
          disabled={reviewMutation.isPending || !reviewForm.customerName || !reviewForm.reviewText}
          className="w-full"
        >
          {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderAudioVideoTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-purple-600" />
          Audio/Video Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Recording Type</label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={recordingType === 'audio' ? 'default' : 'outline'}
              onClick={() => setRecordingType('audio')}
              size="sm"
            >
              <Mic className="w-4 h-4 mr-1" />
              Audio
            </Button>
            <Button
              type="button"
              variant={recordingType === 'video' ? 'default' : 'outline'}
              onClick={() => setRecordingType('video')}
              size="sm"
            >
              <Video className="w-4 h-4 mr-1" />
              Video
            </Button>
          </div>
        </div>

        {/* Video Preview */}
        {recordingType === 'video' && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-48 bg-gray-100 rounded-lg"
              style={{ display: isRecording ? 'block' : 'none' }}
            />
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex gap-2 justify-center">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              className="bg-red-600 hover:bg-red-700"
            >
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="outline"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>

        {recordedBlob && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 mb-2">Recording ready!</p>
            {recordingType === 'audio' ? (
              <audio controls className="w-full">
                <source src={URL.createObjectURL(recordedBlob)} type="audio/wav" />
              </audio>
            ) : (
              <video controls className="w-full max-h-32">
                <source src={URL.createObjectURL(recordedBlob)} type="video/webm" />
              </video>
            )}
          </div>
        )}

        <Button 
          onClick={() => audioReviewMutation.mutate(audioReviewForm)}
          disabled={audioReviewMutation.isPending || !audioReviewForm.customerName || !recordedBlob}
          className="w-full"
        >
          {audioReviewMutation.isPending ? 'Submitting...' : 'Submit Audio/Video Review'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'checkin':
        return renderCheckInTab();
      case 'written':
        return renderWrittenReviewTab();
      case 'audio':
        return renderAudioVideoTab();
      default:
        return renderCheckInTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto p-4 max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center mb-4">Field Technician App</h1>
          
          {/* Tab Navigation */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-gray-200 rounded-lg">
            <button
              onClick={() => setActiveTab('checkin')}
              className={`p-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'checkin' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
              }`}
            >
              Check-In
            </button>
            <button
              onClick={() => setActiveTab('written')}
              className={`p-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'written' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
              }`}
            >
              Written Review
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`p-2 text-xs font-medium rounded transition-colors ${
                activeTab === 'audio' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
              }`}
            >
              Audio/Video
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === 'checkin' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <CheckCircle className="w-5 h-5 mb-1" />
            <span className="text-xs">Check-In</span>
          </button>
          
          <Link href="/mobile-blogs">
            <a className="flex flex-col items-center p-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50">
              <FileText className="w-5 h-5 mb-1" />
              <span className="text-xs">Blog</span>
            </a>
          </Link>
          
          <button
            onClick={() => setActiveTab('written')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === 'written' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-1" />
            <span className="text-xs">Review</span>
          </button>
          
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              activeTab === 'audio' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <Mic className="w-5 h-5 mb-1" />
            <span className="text-xs">Audio/Video</span>
          </button>
        </div>
      </div>
    </div>
  );
}