import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

interface EnhancedGPSProps {
  onLocationUpdate: (position: GPSPosition) => void;
  onLocationError: (error: string) => void;
  requiredAccuracy?: number;
  enableHighAccuracy?: boolean;
  enableBackground?: boolean;
}

const EnhancedGPS: React.FC<EnhancedGPSProps> = ({
  onLocationUpdate,
  onLocationError,
  requiredAccuracy = 10, // meters
  enableHighAccuracy = true,
  enableBackground = true
}) => {
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'error'>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [locationHistory, setLocationHistory] = useState<GPSPosition[]>([]);
  
  const watchIdRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Enhanced GPS options for maximum accuracy
  const gpsOptions: PositionOptions = {
    enableHighAccuracy: enableHighAccuracy,
    timeout: 30000, // 30 seconds
    maximumAge: 60000 // 1 minute cache
  };

  // High accuracy options for precise positioning
  const highAccuracyOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 45000,
    maximumAge: 0 // No cache for high accuracy
  };

  // Start GPS tracking with enhanced accuracy
  const startTracking = () => {
    if (!navigator.geolocation) {
      const error = 'GPS not supported on this device';
      setStatus('error');
      onLocationError(error);
      toast({
        title: "GPS Error",
        description: error,
        variant: "destructive"
      });
      return;
    }

    setIsTracking(true);
    setStatus('searching');
    setRetryCount(0);

    // Start with high accuracy positioning
    getCurrentPosition();
    
    // Set up continuous tracking if background mode enabled
    if (enableBackground) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        handlePositionError,
        gpsOptions
      );
    }
  };

  // Get current position with retry logic
  const getCurrentPosition = () => {
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      (error) => {
        // Retry with different options if first attempt fails
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            navigator.geolocation.getCurrentPosition(
              handlePositionSuccess,
              handlePositionError,
              retryCount === 1 ? gpsOptions : highAccuracyOptions
            );
          }, 2000);
        } else {
          handlePositionError(error);
        }
      },
      highAccuracyOptions
    );
  };

  // Handle successful position acquisition
  const handlePositionSuccess = (position: GeolocationPosition) => {
    const newPosition: GPSPosition = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude || undefined,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined,
      timestamp: position.timestamp
    };

    setCurrentPosition(newPosition);
    setAccuracy(position.coords.accuracy);
    
    // Add to location history for accuracy analysis
    setLocationHistory(prev => [...prev.slice(-9), newPosition]);

    // Check if accuracy meets requirements
    if (position.coords.accuracy <= requiredAccuracy) {
      setStatus('found');
      onLocationUpdate(newPosition);
      
      toast({
        title: "GPS Lock Acquired",
        description: `Accurate to ${Math.round(position.coords.accuracy)}m`,
      });
    } else {
      setStatus('searching');
      toast({
        title: "Improving Accuracy",
        description: `Current accuracy: ${Math.round(position.coords.accuracy)}m, target: ${requiredAccuracy}m`,
      });
      
      // Continue trying to get better accuracy
      if (retryCount < 5) {
        setTimeout(getCurrentPosition, 3000);
        setRetryCount(prev => prev + 1);
      }
    }
  };

  // Handle GPS errors
  const handlePositionError = (error: GeolocationPositionError) => {
    let errorMessage = 'Unknown GPS error';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'GPS permission denied. Please enable location access.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'GPS position unavailable. Please check GPS settings.';
        break;
      case error.TIMEOUT:
        errorMessage = 'GPS timeout. Please try again in an open area.';
        break;
    }

    setStatus('error');
    onLocationError(errorMessage);
    
    toast({
      title: "GPS Error",
      description: errorMessage,
      variant: "destructive"
    });
  };

  // Stop GPS tracking
  const stopTracking = () => {
    setIsTracking(false);
    setStatus('idle');
    
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Get accuracy status color
  const getAccuracyColor = () => {
    if (!accuracy) return 'gray';
    if (accuracy <= 5) return 'green';
    if (accuracy <= 10) return 'yellow';
    if (accuracy <= 20) return 'orange';
    return 'red';
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'searching':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'found':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium">GPS Location</span>
        </div>
        
        {accuracy && (
          <Badge variant="outline" className={`border-${getAccuracyColor()}-500`}>
            ±{Math.round(accuracy)}m
          </Badge>
        )}
      </div>

      {currentPosition && (
        <div className="bg-gray-50 p-3 rounded mb-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-600">Latitude:</span>
              <div className="font-mono">{currentPosition.latitude.toFixed(6)}</div>
            </div>
            <div>
              <span className="text-gray-600">Longitude:</span>
              <div className="font-mono">{currentPosition.longitude.toFixed(6)}</div>
            </div>
          </div>
          
          {currentPosition.altitude && (
            <div className="mt-2">
              <span className="text-gray-600">Altitude:</span>
              <span className="ml-2 font-mono">{Math.round(currentPosition.altitude)}m</span>
            </div>
          )}
        </div>
      )}

      <div className="flex space-x-2">
        {!isTracking ? (
          <Button 
            onClick={startTracking}
            className="flex-1"
            size="sm"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Start GPS
          </Button>
        ) : (
          <Button 
            onClick={stopTracking}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            Stop GPS
          </Button>
        )}
        
        <Button 
          onClick={getCurrentPosition}
          variant="outline"
          size="sm"
          disabled={!isTracking}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {status === 'searching' && (
        <div className="mt-3 text-sm text-gray-600 text-center">
          Acquiring GPS signal... (Attempt {retryCount + 1}/5)
        </div>
      )}

      {status === 'error' && (
        <div className="mt-3 text-sm text-red-600 text-center">
          GPS error occurred. Check location permissions.
        </div>
      )}
    </div>
  );
};

export default EnhancedGPS;