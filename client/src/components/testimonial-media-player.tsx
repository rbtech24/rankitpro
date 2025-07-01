import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-react';

interface MediaPlayerProps {
  type: 'audio' | 'video';
  src: string;
  title: string;
  customerName: string;
  duration?: number;
}

export function TestimonialMediaPlayer({ type, src, title, customerName, duration }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setTotalDuration(mediaRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadMedia = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `${customerName}-testimonial.${type === 'audio' ? 'mp3' : 'mp4'}`;
    link.click();
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {type === 'video' ? (
          <div className="relative">
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              className="w-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              poster="/api/placeholder/400/225"
            >
              <source src={src} type="video/mp4" />
              <source src={src} type="video/webm" />
              Your browser does not support the video element.
            </video>
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <div className="flex items-center gap-3 text-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <div className="flex-1">
                  <div className="text-xs mb-1">{title}</div>
                  <div className="text-xs opacity-75">
                    {formatTime(currentTime)} / {formatTime(totalDuration)}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadMedia}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Volume2 className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">by {customerName}</p>
                <div className="text-xs text-gray-500 mt-1">
                  Duration: {formatTime(totalDuration)}
                </div>
              </div>
            </div>
            
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              className="w-full"
              controls
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            >
              <source src={src} type="audio/mpeg" />
              <source src={src} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={downloadMedia}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}