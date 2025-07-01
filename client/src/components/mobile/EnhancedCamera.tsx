import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, RotateCcw, Zap, ZapOff, ZoomIn, ZoomOut, Download, Trash2, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';

interface CapturedPhoto {
  id: string;
  blob: Blob;
  url: string;
  timestamp: number;
  metadata?: {
    width: number;
    height: number;
    size: number;
    type: string;
  };
}

interface EnhancedCameraProps {
  onPhotoCapture: (photos: CapturedPhoto[]) => void;
  maxPhotos?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  enableFlash?: boolean;
  enableZoom?: boolean;
}

const EnhancedCamera: React.FC<EnhancedCameraProps> = ({
  onPhotoCapture,
  maxPhotos = 10,
  quality = 0.8,
  maxWidth = 1920,
  maxHeight = 1080,
  enableFlash = true,
  enableZoom = true
}) => {
  const [isActive, setIsActive] = useState(false);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashMode, setFlashMode] = useState<'auto' | 'on' | 'off'>('auto');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Camera constraints for optimal quality
  const getConstraints = useCallback((): MediaStreamConstraints => {
    return {
      video: {
        facingMode: facingMode,
        width: { ideal: maxWidth, max: maxWidth },
        height: { ideal: maxHeight, max: maxHeight },
        aspectRatio: { ideal: 16/9 },
        frameRate: { ideal: 30 },
        // Advanced constraints for better quality (where supported)
        ...(enableZoom && { zoom: { min: 1, max: 3, ideal: zoomLevel } })
      },
      audio: false
    };
  }, [facingMode, maxWidth, maxHeight, zoomLevel, enableZoom]);

  // Start camera with enhanced settings
  const startCamera = async () => {
    try {
      setError(null);
      
      // Request camera permissions first
      const constraints = getConstraints();
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsActive(true);
      
      toast({
        title: "Camera Ready",
        description: "Camera activated successfully",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Camera access failed';
      setError(errorMessage);
      setIsActive(false);
      
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Stop camera and cleanup
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsActive(false);
  };

  // Capture photo with optimization
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Canvas context not available');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob with specified quality
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create image blob'));
          },
          'image/jpeg',
          quality
        );
      });

      // Create photo object
      const photo: CapturedPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        blob,
        url: URL.createObjectURL(blob),
        timestamp: Date.now(),
        metadata: {
          width: canvas.width,
          height: canvas.height,
          size: blob.size,
          type: blob.type
        }
      };

      // Add to photos array
      const updatedPhotos = [...photos, photo];
      setPhotos(updatedPhotos);
      onPhotoCapture(updatedPhotos);

      toast({
        title: "Photo Captured",
        description: `Photo ${updatedPhotos.length}/${maxPhotos} captured successfully`,
      });

      // Auto-stop if max photos reached
      if (updatedPhotos.length >= maxPhotos) {
        stopCamera();
        toast({
          title: "Photo Limit Reached",
          description: `Maximum ${maxPhotos} photos captured`,
        });
      }
    } catch (error) {
      toast({
        title: "Capture Failed",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
    }
  };

  // Switch camera (front/back)
  const switchCamera = async () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);
    
    if (isActive) {
      stopCamera();
      // Small delay to ensure camera is fully stopped
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  };

  // Toggle flash mode
  const toggleFlash = () => {
    const modes: Array<'auto' | 'on' | 'off'> = ['auto', 'on', 'off'];
    const currentIndex = modes.indexOf(flashMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setFlashMode(modes[nextIndex]);
  };

  // Adjust zoom level
  const adjustZoom = (direction: 'in' | 'out') => {
    if (!enableZoom) return;
    
    const step = 0.2;
    const newZoom = direction === 'in' 
      ? Math.min(3, zoomLevel + step)
      : Math.max(1, zoomLevel - step);
    
    setZoomLevel(newZoom);
    
    // Apply zoom if camera is active
    if (stream && videoRef.current) {
      const track = stream.getVideoTracks()[0];
      if (track && 'applyConstraints' in track) {
        track.applyConstraints({
          advanced: [{ zoom: newZoom } as any]
        }).catch(console.warn);
      }
    }
  };

  // Delete photo
  const deletePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    setPhotos(updatedPhotos);
    onPhotoCapture(updatedPhotos);
    
    // Cleanup URL
    const photo = photos.find(p => p.id === photoId);
    if (photo) {
      URL.revokeObjectURL(photo.url);
    }
  };

  // Download photo
  const downloadPhoto = (photo: CapturedPhoto) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `photo-${new Date(photo.timestamp).toISOString()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      photos.forEach(photo => URL.revokeObjectURL(photo.url));
    };
  }, []);

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Camera Controls */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span className="font-medium">Enhanced Camera</span>
            <Badge variant="outline">
              {photos.length}/{maxPhotos}
            </Badge>
          </div>
          
          {isActive && (
            <div className="flex items-center space-x-2">
              {enableZoom && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustZoom('out')}
                    disabled={zoomLevel <= 1}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">{zoomLevel.toFixed(1)}x</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustZoom('in')}
                    disabled={zoomLevel >= 3}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </>
              )}
              
              {enableFlash && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFlash}
                >
                  {flashMode === 'on' ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={switchCamera}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {!isActive ? (
            <Button onClick={startCamera} className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button 
                onClick={capturePhoto}
                disabled={isCapturing || photos.length >= maxPhotos}
                className="flex-1"
              >
                {isCapturing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Camera className="w-4 h-4 mr-2" />
                )}
                Capture Photo
              </Button>
              
              <Button 
                onClick={stopCamera}
                variant="outline"
              >
                Stop
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Camera Preview */}
      {isActive && (
        <div className="relative bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-h-64 object-cover"
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {isCapturing && (
            <div className="absolute inset-0 bg-white bg-opacity-20 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Captured Photos */}
      {photos.length > 0 && (
        <div className="p-4">
          <h4 className="font-medium mb-3">Captured Photos ({photos.length})</h4>
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt={`Captured ${new Date(photo.timestamp).toLocaleTimeString()}`}
                  className="w-full h-24 object-cover rounded border"
                />
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadPhoto(photo)}
                      className="bg-white"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deletePhoto(photo.id)}
                      className="bg-white text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="absolute top-1 right-1">
                  <Badge variant="secondary" className="text-xs">
                    {photo.metadata && Math.round(photo.metadata.size / 1024)}KB
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCamera;