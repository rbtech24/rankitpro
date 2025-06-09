import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Video, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Upload,
  X,
  Camera,
  MicIcon
} from 'lucide-react';

interface TestimonialRecorderProps {
  checkInId?: number;
  onTestimonialCreated?: (testimonial: any) => void;
}

export default function TestimonialRecorder({ 
  checkInId, 
  onTestimonialCreated 
}: TestimonialRecorderProps) {
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [jobType, setJobType] = useState('');
  const [location, setLocation] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: recordingType === 'video' 
          ? 'video/webm;codecs=vp9,opus' 
          : 'audio/webm;codecs=opus'
      });

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { 
          type: recordingType === 'video' ? 'video/webm' : 'audio/webm' 
        });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: `${recordingType === 'video' ? 'Video' : 'Audio'} recording has begun`,
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check camera/microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && 
        (mediaRecorderRef.current.state === 'recording' || 
         mediaRecorderRef.current.state === 'paused')) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const playRecording = () => {
    if (recordingType === 'video' && videoRef.current && recordedUrl) {
      videoRef.current.src = recordedUrl;
      videoRef.current.play();
      setIsPlaying(true);
    } else if (recordingType === 'audio' && audioRef.current && recordedUrl) {
      audioRef.current.src = recordedUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    if (recordingType === 'video' && videoRef.current) {
      videoRef.current.pause();
    } else if (recordingType === 'audio' && audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setRecordedUrl(null);
    setIsPlaying(false);
    setDuration(0);
    
    if (videoRef.current) {
      videoRef.current.src = '';
    }
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  const uploadTestimonial = async () => {
    if (!recordedBlob || !customerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide customer name and record a testimonial",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      const fileExtension = recordingType === 'video' ? 'webm' : 'webm';
      const fileName = `testimonial_${Date.now()}.${fileExtension}`;
      
      formData.append('file', recordedBlob, fileName);
      formData.append('type', recordingType);
      formData.append('customerName', customerName);
      formData.append('customerEmail', customerEmail);
      formData.append('customerPhone', customerPhone);
      formData.append('jobType', jobType);
      formData.append('location', location);
      formData.append('duration', duration.toString());
      
      if (checkInId) {
        formData.append('checkInId', checkInId.toString());
      }

      const response = await fetch('/api/testimonials', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload testimonial');
      }

      const testimonial = await response.json();

      toast({
        title: "Testimonial Uploaded",
        description: "Customer testimonial has been successfully saved",
      });

      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setJobType('');
      setLocation('');
      resetRecording();

      if (onTestimonialCreated) {
        onTestimonialCreated(testimonial);
      }

    } catch (error) {
      console.error('Error uploading testimonial:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload testimonial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {recordingType === 'video' ? <Video className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          Record Customer Testimonial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recording Type Selection */}
        <div className="flex gap-4">
          <Button
            variant={recordingType === 'video' ? 'default' : 'outline'}
            onClick={() => setRecordingType('video')}
            disabled={isRecording}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Video
          </Button>
          <Button
            variant={recordingType === 'audio' ? 'default' : 'outline'}
            onClick={() => setRecordingType('audio')}
            disabled={isRecording}
            className="flex items-center gap-2"
          >
            <MicIcon className="h-4 w-4" />
            Audio
          </Button>
        </div>

        {/* Recording Preview */}
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
          {recordingType === 'video' ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted={isRecording}
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MicIcon className="h-16 w-16 text-gray-400" />
              <audio
                ref={audioRef}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          )}

          {/* Recording Timer */}
          {isRecording && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {isPaused ? 'PAUSED' : 'REC'} {formatTime(duration)}
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex justify-center gap-3">
          {!isRecording && !recordedBlob && (
            <Button onClick={startRecording} className="flex items-center gap-2">
              {recordingType === 'video' ? <Video className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              Start Recording
            </Button>
          )}

          {isRecording && (
            <>
              {!isPaused ? (
                <Button onClick={pauseRecording} variant="outline" className="flex items-center gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              ) : (
                <Button onClick={resumeRecording} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
              )}
              <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </>
          )}

          {recordedBlob && (
            <>
              {!isPlaying ? (
                <Button onClick={playRecording} variant="outline" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Play
                </Button>
              ) : (
                <Button onClick={pausePlayback} variant="outline" className="flex items-center gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button onClick={resetRecording} variant="outline" className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Reset
              </Button>
            </>
          )}
        </div>

        {/* Customer Information Form */}
        {recordedBlob && (
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Customer Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <Label htmlFor="jobType">Job Type</Label>
                <Input
                  id="jobType"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  placeholder="e.g., Plumbing repair"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Service location address"
              />
            </div>

            <Button 
              onClick={uploadTestimonial} 
              disabled={isUploading || !customerName.trim()}
              className="w-full flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Save Testimonial'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}