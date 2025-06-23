import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mic, Video, Square, Play, Pause, Upload, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface TestimonialRecorderProps {
  technicianId: number;
  checkInId?: number;
  onSubmit: (testimonialData: any) => void;
  onCancel: () => void;
}

export function TestimonialRecorder({ technicianId, checkInId, onSubmit, onCancel }: TestimonialRecorderProps) {
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [title, setTitle] = useState('');
  const [jobType, setJobType] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState<number>(5);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
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
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recordingType === 'video' ? 'video/webm' : 'audio/webm'
        });
        setRecordedBlob(blob);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access camera/microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (!isPaused) {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        timerRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
      }
    }
  };

  const playRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      
      if (recordingType === 'video' && videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play();
        setIsPlaying(true);
        
        videoRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
        };
      } else if (recordingType === 'audio' && audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
        };
      }
    }
  };

  const deleteRecording = () => {
    setRecordedBlob(null);
    setRecordingDuration(0);
    setIsPlaying(false);
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!recordedBlob || !customerName || !title) {
      toast({
        title: "Missing Information",
        description: "Please complete recording and fill in required fields.",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', recordedBlob, `testimonial-${Date.now()}.webm`);
    formData.append('technicianId', technicianId.toString());
    formData.append('customerName', customerName);
    formData.append('customerEmail', customerEmail);
    formData.append('customerPhone', customerPhone);
    formData.append('title', title);
    formData.append('jobType', jobType);
    formData.append('location', location);
    formData.append('rating', rating.toString());
    formData.append('type', recordingType);
    formData.append('duration', recordingDuration.toString());
    
    if (checkInId) {
      formData.append('checkInId', checkInId.toString());
    }

    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {recordingType === 'video' ? <Video className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
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
            >
              <Video className="w-4 h-4 mr-2" />
              Video
            </Button>
            <Button
              variant={recordingType === 'audio' ? 'default' : 'outline'}
              onClick={() => setRecordingType('audio')}
              disabled={isRecording}
            >
              <Mic className="w-4 h-4 mr-2" />
              Audio Only
            </Button>
          </div>

          {/* Recording Area */}
          <div className="bg-gray-100 rounded-lg p-4 min-h-64 flex items-center justify-center">
            {recordingType === 'video' ? (
              <video
                ref={videoRef}
                className="max-w-full max-h-64 rounded-lg"
                controls={!!(recordedBlob && !isRecording)}
                muted={isRecording}
              />
            ) : (
              <div className="text-center">
                <Mic className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Audio Recording</p>
                {recordedBlob && (
                  <audio ref={audioRef} controls className="mt-4">
                    Your browser does not support audio playback.
                  </audio>
                )}
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording && !recordedBlob && (
              <Button onClick={startRecording} size="lg">
                {recordingType === 'video' ? <Video className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                Start Recording
              </Button>
            )}
            
            {isRecording && (
              <>
                <Button onClick={pauseRecording} variant="outline">
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  {formatDuration(recordingDuration)}
                </Badge>
                <Button onClick={stopRecording} variant="destructive">
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
            
            {recordedBlob && !isRecording && (
              <>
                <Button onClick={playRecording} variant="outline" disabled={isPlaying}>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </Button>
                <Badge variant="secondary">
                  Duration: {formatDuration(recordingDuration)}
                </Badge>
                <Button onClick={deleteRecording} variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Customer Information Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
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
              <Label htmlFor="rating">Customer Rating</Label>
              <Select value={rating.toString()} onValueChange={(value) => setRating(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5 stars)</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ (4 stars)</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ (3 stars)</SelectItem>
                  <SelectItem value="2">⭐⭐ (2 stars)</SelectItem>
                  <SelectItem value="1">⭐ (1 star)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Testimonial Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Excellent HVAC Repair Service"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobType">Job Type *</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sprinkler Repair">Sprinkler Repair</SelectItem>
                  <SelectItem value="Irrigation Installation">Irrigation Installation</SelectItem>
                  <SelectItem value="System Maintenance">System Maintenance</SelectItem>
                  <SelectItem value="Leak Detection">Leak Detection</SelectItem>
                  <SelectItem value="Controller Programming">Controller Programming</SelectItem>
                  <SelectItem value="Winterization">Winterization</SelectItem>
                  <SelectItem value="Spring Start-up">Spring Start-up</SelectItem>
                  <SelectItem value="Landscape Lighting">Landscape Lighting</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="technicianName">Technician Name *</Label>
              <Input
                id="technicianName"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="e.g., Rod Bartruff"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Miami, FL"
            />
          </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!recordedBlob || !customerName || !title}>
              <Upload className="w-4 h-4 mr-2" />
              Submit Testimonial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}