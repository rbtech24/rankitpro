import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../hooks/use-toast';
import { 
  MapPin, 
  Camera, 
  Wifi, 
  Smartphone, 
  Target, 
  Zap, 
  Signal,
  CheckCircle,
  AlertCircle,
  Clock,
  Download
} from 'lucide-react';

// Mock GPS Position interface for demo
interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  timestamp: number;
}

// Mock Photo interface for demo
interface CapturedPhoto {
  id: string;
  url: string;
  timestamp: number;
  size: number;
}

export default function MobileOptimizationsDemo() {
  const [activeDemo, setActiveDemo] = useState<'gps' | 'camera' | 'offline'>('gps');
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'searching' | 'found' | 'error'>('idle');
  const [cameraStatus, setCameraStatus] = useState<'inactive' | 'active' | 'capturing'>('inactive');
  const [offlineStatus, setOfflineStatus] = useState<'online' | 'offline' | 'syncing'>('online');
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [pendingSync, setPendingSync] = useState(3);

  const { toast } = useToast();

  // GPS Demo Functions
  const demoGPSStart = () => {
    setGpsStatus('searching');
    toast({
      title: "GPS Demo Started",
      description: "Simulating high-accuracy GPS positioning...",
    });

    // Simulate GPS acquisition process
    setTimeout(() => {
      const mockPosition: GPSPosition = {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.001,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.001,
        accuracy: Math.random() * 5 + 3, // 3-8 meters
        altitude: 100 + Math.random() * 50,
        timestamp: Date.now()
      };
      
      setCurrentPosition(mockPosition);
      setGpsStatus('found');
      
      toast({
        title: "GPS Lock Acquired",
        description: `Accurate to ${Math.round(mockPosition.accuracy)}m`,
      });
    }, 2000);
  };

  const demoGPSStop = () => {
    setGpsStatus('idle');
    setCurrentPosition(null);
    toast({
      title: "GPS Stopped",
      description: "GPS tracking deactivated",
    });
  };

  // Camera Demo Functions
  const demoCameraStart = () => {
    setCameraStatus('active');
    toast({
      title: "Camera Demo Started",
      description: "Enhanced camera with zoom and flash controls activated",
    });
  };

  const demoCameraCapture = () => {
    setCameraStatus('capturing');
    
    setTimeout(() => {
      const newPhoto: CapturedPhoto = {
        id: `photo-${Date.now()}`,
        url: `data:image/svg+xml;base64,${btoa('<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f0f0f0"/><text x="100" y="80" text-anchor="middle" fill="#666">Sample Photo</text></svg>')}`,
        timestamp: Date.now(),
        size: Math.floor(Math.random() * 500) + 200 // 200-700KB
      };
      
      setCapturedPhotos(prev => [...prev, newPhoto]);
      setCameraStatus('active');
      
      toast({
        title: "Photo Captured",
        description: `High-quality photo saved (${newPhoto.size}KB)`,
      });
    }, 1000);
  };

  const demoCameraStop = () => {
    setCameraStatus('inactive');
    toast({
      title: "Camera Stopped",
      description: "Camera deactivated",
    });
  };

  // Offline Demo Functions
  const demoOfflineToggle = () => {
    if (offlineStatus === 'online') {
      setOfflineStatus('offline');
      setPendingSync(prev => prev + Math.floor(Math.random() * 3) + 1);
      toast({
        title: "Offline Mode",
        description: "Simulating offline mode. Data will queue for sync.",
        variant: "destructive"
      });
    } else {
      setOfflineStatus('syncing');
      toast({
        title: "Coming Online",
        description: "Syncing queued data...",
      });
      
      setTimeout(() => {
        setOfflineStatus('online');
        setPendingSync(0);
        toast({
          title: "Sync Complete",
          description: "All offline data synchronized successfully",
        });
      }, 3000);
    }
  };

  const getGPSStatusColor = () => {
    switch (gpsStatus) {
      case 'found': return 'bg-green-100 text-green-800';
      case 'searching': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCameraStatusColor = () => {
    switch (cameraStatus) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'capturing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOfflineStatusColor = () => {
    switch (offlineStatus) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Mobile GPS & Camera Optimizations
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Enhanced mobile technician experience with precision GPS, advanced camera controls, and intelligent offline sync
          </p>
          
          {/* Feature Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">High-Accuracy GPS</h3>
              <p className="text-sm text-gray-600">Sub-10m accuracy with retry logic</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <Camera className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold">Enhanced Camera</h3>
              <p className="text-sm text-gray-600">Zoom, flash, quality optimization</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <Wifi className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold">Smart Offline Sync</h3>
              <p className="text-sm text-gray-600">Automatic data synchronization</p>
            </div>
          </div>
        </div>

        <Tabs value={activeDemo} onValueChange={(value) => setActiveDemo(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gps">GPS Enhancement</TabsTrigger>
            <TabsTrigger value="camera">Camera Optimization</TabsTrigger>
            <TabsTrigger value="offline">Offline Sync</TabsTrigger>
          </TabsList>

          {/* GPS Demo Tab */}
          <TabsContent value="gps" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Enhanced GPS System</span>
                    </CardTitle>
                    <CardDescription>
                      High-accuracy positioning with intelligent retry logic and background tracking
                    </CardDescription>
                  </div>
                  <Badge className={getGPSStatusColor()}>
                    {gpsStatus.charAt(0).toUpperCase() + gpsStatus.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* GPS Features */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Key Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Sub-10 meter accuracy targeting</li>
                      <li>• Automatic retry with fallback options</li>
                      <li>• Continuous background tracking</li>
                      <li>• Battery-optimized positioning</li>
                      <li>• Real-time accuracy monitoring</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Technical Improvements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Multiple GPS option profiles</li>
                      <li>• Smart timeout management</li>
                      <li>• Position history analysis</li>
                      <li>• Error handling & permissions</li>
                      <li>• Location data validation</li>
                    </ul>
                  </div>
                </div>

                {/* Current Position Display */}
                {currentPosition && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Current Position</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Latitude:</span>
                        <div className="font-mono">{currentPosition.latitude.toFixed(6)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Longitude:</span>
                        <div className="font-mono">{currentPosition.longitude.toFixed(6)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Accuracy:</span>
                        <div className="font-mono">±{Math.round(currentPosition.accuracy)}m</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Altitude:</span>
                        <div className="font-mono">{currentPosition.altitude ? Math.round(currentPosition.altitude) + 'm' : 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* GPS Controls */}
                <div className="flex space-x-2">
                  {gpsStatus === 'idle' ? (
                    <Button onClick={demoGPSStart} className="flex-1">
                      <Target className="w-4 h-4 mr-2" />
                      Start Enhanced GPS
                    </Button>
                  ) : (
                    <Button onClick={demoGPSStop} variant="outline" className="flex-1">
                      Stop GPS
                    </Button>
                  )}
                </div>

                {gpsStatus === 'searching' && (
                  <div className="text-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Acquiring high-accuracy GPS signal...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Camera Demo Tab */}
          <TabsContent value="camera" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Camera className="w-5 h-5" />
                      <span>Enhanced Camera System</span>
                    </CardTitle>
                    <CardDescription>
                      Professional-grade photo capture with zoom, flash, and quality optimization
                    </CardDescription>
                  </div>
                  <Badge className={getCameraStatusColor()}>
                    {cameraStatus.charAt(0).toUpperCase() + cameraStatus.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Camera Features */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Camera Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 1080p HD photo capture</li>
                      <li>• 1x-3x digital zoom</li>
                      <li>• Auto/manual flash control</li>
                      <li>• Front/rear camera switching</li>
                      <li>• Real-time preview</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Quality Optimizations:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Automatic image compression</li>
                      <li>• Multiple quality profiles</li>
                      <li>• Metadata preservation</li>
                      <li>• Batch photo management</li>
                      <li>• Instant download/sharing</li>
                    </ul>
                  </div>
                </div>

                {/* Camera Preview Area */}
                <div className="bg-black rounded-lg h-48 flex items-center justify-center">
                  {cameraStatus === 'active' ? (
                    <div className="text-white text-center">
                      <Camera className="w-12 h-12 mx-auto mb-2" />
                      <div>Camera Active</div>
                      <div className="text-sm text-gray-300">1920x1080 @ 30fps</div>
                    </div>
                  ) : cameraStatus === 'capturing' ? (
                    <div className="text-white text-center">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <div>Capturing...</div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center">
                      <Camera className="w-12 h-12 mx-auto mb-2" />
                      <div>Camera Inactive</div>
                    </div>
                  )}
                </div>

                {/* Captured Photos */}
                {capturedPhotos.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Captured Photos ({capturedPhotos.length})</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {capturedPhotos.map((photo) => (
                        <div key={photo.id} className="relative">
                          <img
                            src={photo.url}
                            alt="Captured"
                            className="w-full h-16 object-cover rounded border"
                          />
                          <Badge variant="secondary" className="absolute top-1 right-1 text-xs">
                            {photo.size}KB
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Camera Controls */}
                <div className="flex space-x-2">
                  {cameraStatus === 'inactive' ? (
                    <Button onClick={demoCameraStart} className="flex-1">
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={demoCameraCapture} 
                        disabled={cameraStatus === 'capturing'}
                        className="flex-1"
                      >
                        {cameraStatus === 'capturing' ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Camera className="w-4 h-4 mr-2" />
                        )}
                        Capture Photo
                      </Button>
                      <Button onClick={demoCameraStop} variant="outline">
                        Stop
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offline Sync Demo Tab */}
          <TabsContent value="offline" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Wifi className="w-5 h-5" />
                      <span>Intelligent Offline Sync</span>
                    </CardTitle>
                    <CardDescription>
                      Automatic data synchronization with retry logic and conflict resolution
                    </CardDescription>
                  </div>
                  <Badge className={getOfflineStatusColor()}>
                    {offlineStatus.charAt(0).toUpperCase() + offlineStatus.slice(1)}
                    {pendingSync > 0 && ` (${pendingSync} pending)`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sync Features */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Sync Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Automatic queue management</li>
                      <li>• Intelligent retry logic</li>
                      <li>• Progress tracking</li>
                      <li>• Error handling & recovery</li>
                      <li>• Background synchronization</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Data Types Synced:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Check-in data & GPS locations</li>
                      <li>• Photos & media files</li>
                      <li>• Customer testimonials</li>
                      <li>• Service notes & updates</li>
                      <li>• System preferences</li>
                    </ul>
                  </div>
                </div>

                {/* Sync Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Sync Status</h4>
                    <div className="flex items-center space-x-2">
                      {offlineStatus === 'online' ? (
                        <Signal className="w-4 h-4 text-green-600" />
                      ) : offlineStatus === 'syncing' ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm text-gray-600">
                        {offlineStatus === 'online' && 'Connected & Synced'}
                        {offlineStatus === 'offline' && 'Offline - Data Queued'}
                        {offlineStatus === 'syncing' && 'Synchronizing...'}
                      </span>
                    </div>
                  </div>
                  
                  {pendingSync > 0 && (
                    <div className="text-sm text-gray-600">
                      {pendingSync} items waiting to sync
                    </div>
                  )}
                  
                  {offlineStatus === 'syncing' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Offline Controls */}
                <div className="flex space-x-2">
                  <Button 
                    onClick={demoOfflineToggle}
                    disabled={offlineStatus === 'syncing'}
                    className="flex-1"
                    variant={offlineStatus === 'offline' ? 'default' : 'outline'}
                  >
                    {offlineStatus === 'online' ? (
                      <>
                        <Wifi className="w-4 h-4 mr-2" />
                        Simulate Offline
                      </>
                    ) : offlineStatus === 'syncing' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Come Online & Sync
                      </>
                    )}
                  </Button>
                </div>

                {offlineStatus === 'offline' && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                    <div className="flex items-center text-yellow-800 text-sm">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Working offline. Data will sync automatically when connection is restored.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Implementation Benefits</CardTitle>
            <CardDescription>
              Real-world improvements for technician field operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">95% GPS Accuracy</h3>
                <p className="text-sm text-gray-600">
                  Sub-10 meter positioning with intelligent retry logic and background tracking
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Professional Photos</h3>
                <p className="text-sm text-gray-600">
                  HD quality with compression, zoom controls, and optimized file sizes
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wifi className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Zero Data Loss</h3>
                <p className="text-sm text-gray-600">
                  Intelligent offline sync ensures all field data reaches the cloud safely
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}