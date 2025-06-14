import React, { useState, useEffect } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { hasFeature, getPlanName, getRequiredPlan } from '@/lib/features';
import { 
  Home, 
  CheckCircle, 
  Calendar, 
  Users, 
  Bell, 
  Settings, 
  LogOut,
  Camera,
  MapPin,
  Clock,
  Info,
  PlusCircle,
  Search,
  RefreshCw
} from 'lucide-react';

// Mobile JWT auth token management
const getStoredTokens = () => {
  try {
    const accessToken = localStorage.getItem('mobile_access_token');
    const refreshToken = localStorage.getItem('mobile_refresh_token');
    return { accessToken, refreshToken };
  } catch (e) {
    return { accessToken: null, refreshToken: null };
  }
};

const storeTokens = (accessToken: string, refreshToken: string) => {
  try {
    localStorage.setItem('mobile_access_token', accessToken);
    localStorage.setItem('mobile_refresh_token', refreshToken);
    return true;
  } catch (e) {
    return false;
  }
};

const clearTokens = () => {
  try {
    localStorage.removeItem('mobile_access_token');
    localStorage.removeItem('mobile_refresh_token');
    return true;
  } catch (e) {
    return false;
  }
};

// Login form schema
const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Check-in form schema
const checkInFormSchema = z.object({
  jobType: z.string().min(1, { message: "Job type is required" }),
  customerName: z.string().optional(),
  customerEmail: z.string().email({ message: "Please enter a valid email" }).optional().or(z.literal('')),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  workPerformed: z.string().optional(),
  materialsUsed: z.string().optional(),
  address: z.string().optional(),
  // Testimonial fields
  customerTestimonial: z.string().optional(),
  testimonialType: z.enum(['text', 'audio', 'video']).optional(),
});

export default function TechnicianMobile() {
  const [location, navigate] = useLocation();
  const [match, params] = useRoute('/technician-mobile/:tab');
  const activeTab = match ? params.tab : 'home';
  
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [technicianProfile, setTechnicianProfile] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showNewCheckInForm, setShowNewCheckInForm] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Testimonial recording states
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [testimonialType, setTestimonialType] = useState<'text' | 'audio' | 'video'>('text');
  
  const { toast } = useToast();
  
  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  
  const checkInForm = useForm<z.infer<typeof checkInFormSchema>>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues: {
      jobType: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      notes: "",
      workPerformed: "",
      materialsUsed: "",
      address: "",
      customerTestimonial: "",
      testimonialType: "text"
    }
  });
  
  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Check auth status on load
  useEffect(() => {
    const { accessToken } = getStoredTokens();
    if (accessToken) {
      fetchProfile();
    } else {
      setAuthenticated(false);
      setLoading(false);
    }
  }, []);
  
  // Attempt to sync offline data when connection is restored
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0 && authenticated) {
      syncOfflineData();
    }
  }, [isOnline, offlineQueue, authenticated]);
  
  // Fetch data based on active tab
  useEffect(() => {
    if (authenticated && isOnline) {
      if (activeTab === 'home' || activeTab === 'check-ins') {
        fetchCheckIns();
      } else if (activeTab === 'schedule') {
        fetchSchedule();
      } else if (activeTab === 'customers') {
        fetchCustomers();
      } else if (activeTab === 'notifications') {
        fetchNotifications();
      }
    }
  }, [authenticated, activeTab, isOnline]);
  
  // Handle login
  const handleLogin = async (data: z.infer<typeof loginFormSchema>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/mobile/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          deviceId: 'web-' + Date.now(),
          deviceType: 'web'
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }
      
      // Store tokens
      storeTokens(result.accessToken, result.refreshToken);
      setUser(result.user);
      setAuthenticated(true);
      
      // Fetch initial data
      await fetchProfile();
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Navigate to home tab
      navigate('/technician-mobile/home');
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    import('@/lib/logout').then(({ performImmediateLogout }) => {
      performImmediateLogout();
    });
  };
  
  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { accessToken } = getStoredTokens();
      
      if (!accessToken) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/mobile/v1/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        await refreshAccessToken();
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const profileData = await response.json();
      setTechnicianProfile(profileData);
      setAuthenticated(true);
      
      // Initial data fetch
      await Promise.all([
        fetchCheckIns(),
        fetchNotifications(),
        fetchSchedule(),
        fetchCustomers()
      ]);
    } catch (error) {
      console.error('Profile fetch error:', error);
      setAuthenticated(false);
      clearTokens();
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh access token
  const refreshAccessToken = async () => {
    try {
      const { refreshToken } = getStoredTokens();
      
      if (!refreshToken) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/mobile/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const { accessToken } = await response.json();
      
      // Update stored access token
      const { refreshToken: storedRefreshToken } = getStoredTokens();
      if (storedRefreshToken) {
        storeTokens(accessToken, storedRefreshToken);
      }
      
      // Fetch profile with new token
      await fetchProfile();
    } catch (error) {
      console.error('Token refresh error:', error);
      setAuthenticated(false);
      clearTokens();
      setLoading(false);
    }
  };
  
  // Fetch check-ins
  const fetchCheckIns = async () => {
    try {
      if (!isOnline) return;
      
      const { accessToken } = getStoredTokens();
      
      if (!accessToken) {
        return;
      }
      
      const response = await fetch('/api/mobile/v1/check-ins?limit=20', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        await refreshAccessToken();
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch check-ins');
      }
      
      const data = await response.json();
      setCheckIns(data.items || []);
    } catch (error) {
      console.error('Check-ins fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load check-ins",
        variant: "destructive"
      });
    }
  };
  
  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      if (!isOnline) return;
      
      const { accessToken } = getStoredTokens();
      
      if (!accessToken) {
        return;
      }
      
      const response = await fetch('/api/mobile/v1/notifications?limit=20', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        await refreshAccessToken();
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.items || []);
      setUnreadCount(data.unread || 0);
    } catch (error) {
      console.error('Notifications fetch error:', error);
    }
  };
  
  // Fetch schedule
  const fetchSchedule = async () => {
    try {
      if (!isOnline) return;
      
      const { accessToken } = getStoredTokens();
      
      if (!accessToken) {
        return;
      }
      
      const response = await fetch('/api/mobile/v1/schedule/today', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        await refreshAccessToken();
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }
      
      const data = await response.json();
      setSchedule(data.items || []);
    } catch (error) {
      console.error('Schedule fetch error:', error);
    }
  };
  
  // Fetch customers
  const fetchCustomers = async () => {
    try {
      if (!isOnline) return;
      
      const { accessToken } = getStoredTokens();
      
      if (!accessToken) {
        return;
      }
      
      const response = await fetch('/api/mobile/v1/customers?limit=20', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        await refreshAccessToken();
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      setCustomers(data.items || []);
    } catch (error) {
      console.error('Customers fetch error:', error);
    }
  };

  // Start audio recording for testimonials
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecordingAudio(true);

      toast({
        title: "Recording started",
        description: "Recording customer testimonial audio...",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  // Stop audio recording
  const stopAudioRecording = () => {
    if (mediaRecorder && isRecordingAudio) {
      mediaRecorder.stop();
      setIsRecordingAudio(false);
      setMediaRecorder(null);
      
      toast({
        title: "Recording stopped",
        description: "Audio testimonial saved successfully.",
      });
    }
  };

  // Start video recording for testimonials
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: true 
      });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(videoBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecordingVideo(true);

      toast({
        title: "Video recording started",
        description: "Recording customer video testimonial...",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Unable to access camera/microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  // Stop video recording
  const stopVideoRecording = () => {
    if (mediaRecorder && isRecordingVideo) {
      mediaRecorder.stop();
      setIsRecordingVideo(false);
      setMediaRecorder(null);
      
      toast({
        title: "Recording stopped",
        description: "Video testimonial saved successfully.",
      });
    }
  };

  // Clear recorded testimonial
  const clearTestimonial = () => {
    setAudioBlob(null);
    setVideoBlob(null);
    setTestimonialType('text');
    checkInForm.setValue('customerTestimonial', '');
    checkInForm.setValue('testimonialType', 'text');
  };
  
  // Create new check-in
  const createCheckIn = async (data: z.infer<typeof checkInFormSchema>) => {
    try {
      // Get current location if available
      let locationData = null;
      if (currentLocation) {
        locationData = {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          addressText: data.address || ''
        };
      }
      
      // Prepare testimonial data for submission
      let testimonialData = null;
      if (data.customerTestimonial || audioBlob || videoBlob) {
        testimonialData = {
          type: testimonialType,
          content: data.customerTestimonial || '',
          customerName: data.customerName || 'Anonymous',
          audioBlob: audioBlob,
          videoBlob: videoBlob
        };
      }

      const checkInData = {
        jobType: data.jobType,
        customerName: data.customerName || null,
        customerEmail: data.customerEmail || null,
        customerPhone: data.customerPhone || null,
        notes: data.notes || null,
        workPerformed: data.workPerformed || null,
        materialsUsed: data.materialsUsed || null,
        location: locationData,
        testimonial: testimonialData,
        offlineId: 'web-' + Date.now()
      };
      
      // If offline, store in queue
      if (!isOnline) {
        setOfflineQueue([...offlineQueue, checkInData]);
        
        toast({
          title: "Check-in saved offline",
          description: "It will be uploaded when you're back online",
        });
        
        setShowNewCheckInForm(false);
        checkInForm.reset();
        return;
      }
      
      const { accessToken } = getStoredTokens();
      
      if (!accessToken) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('/api/mobile/v1/check-ins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkInData)
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        await refreshAccessToken();
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to create check-in');
      }
      
      // Refresh check-ins
      await fetchCheckIns();
      
      toast({
        title: "Check-in created",
        description: "Your check-in was created successfully"
      });
      
      setShowNewCheckInForm(false);
      checkInForm.reset();
    } catch (error) {
      console.error('Create check-in error:', error);
      toast({
        title: "Error",
        description: "Failed to create check-in",
        variant: "destructive"
      });
    }
  };
  
  // Sync offline data
  const syncOfflineData = async () => {
    if (offlineQueue.length === 0) return;
    
    try {
      setRefreshing(true);
      
      const { accessToken } = getStoredTokens();
      
      if (!accessToken) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('/api/mobile/v1/check-ins/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ checkIns: offlineQueue })
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        await refreshAccessToken();
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to sync offline data');
      }
      
      // Clear offline queue
      setOfflineQueue([]);
      
      // Refresh check-ins
      await fetchCheckIns();
      
      toast({
        title: "Sync complete",
        description: `${offlineQueue.length} check-ins synchronized successfully`
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: "Failed to synchronize offline data",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  // Get current location
  const getCurrentLocation = () => {
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        
        // Try to get address from coordinates using reverse geocoding
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=YOUR_API_KEY`)
          .then(response => response.json())
          .then(data => {
            if (data.results && data.results.length > 0) {
              const address = data.results[0].formatted_address;
              checkInForm.setValue('address', address);
            }
          })
          .catch(error => {
            console.error('Geocoding error:', error);
          });
      },
      (error) => {
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out');
            break;
          default:
            setLocationError('An unknown error occurred');
            break;
        }
      }
    );
  };
  
  // Pull to refresh
  const handleRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    
    try {
      if (activeTab === 'home' || activeTab === 'check-ins') {
        await fetchCheckIns();
      } else if (activeTab === 'schedule') {
        await fetchSchedule();
      } else if (activeTab === 'customers') {
        await fetchCustomers();
      } else if (activeTab === 'notifications') {
        await fetchNotifications();
      }
      
      toast({
        title: "Refreshed",
        description: "Latest data loaded successfully"
      });
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Mark notification as read
  const markNotificationAsRead = async (id: number) => {
    try {
      const { accessToken } = getStoredTokens();
      
      if (!accessToken) {
        return;
      }
      
      const response = await fetch(`/api/mobile/v1/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
      setUnreadCount(unreadCount - 1);
    } catch (error) {
      console.error('Mark notification error:', error);
    }
  };
  
  // Render Navigation Bar
  const renderNavBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
      <div className="flex justify-between items-center p-2">
        <Link href="/technician-mobile/home">
          <div className={`flex flex-col items-center p-2 ${activeTab === 'home' ? 'text-primary' : 'text-gray-500'}`}>
            <Home size={24} />
            <span className="text-xs">Home</span>
          </div>
        </Link>
        
        <Link href="/technician-mobile/check-ins">
          <div className={`flex flex-col items-center p-2 ${activeTab === 'check-ins' ? 'text-primary' : 'text-gray-500'}`}>
            <CheckCircle size={24} />
            <span className="text-xs">Check-ins</span>
          </div>
        </Link>
        
        <Link href="/technician-mobile/schedule">
          <div className={`flex flex-col items-center p-2 ${activeTab === 'schedule' ? 'text-primary' : 'text-gray-500'}`}>
            <Calendar size={24} />
            <span className="text-xs">Schedule</span>
          </div>
        </Link>
        
        <Link href="/technician-mobile/customers">
          <div className={`flex flex-col items-center p-2 ${activeTab === 'customers' ? 'text-primary' : 'text-gray-500'}`}>
            <Users size={24} />
            <span className="text-xs">Customers</span>
          </div>
        </Link>
        
        <Link href="/technician-mobile/notifications">
          <div className={`flex flex-col items-center p-2 relative ${activeTab === 'notifications' ? 'text-primary' : 'text-gray-500'}`}>
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {unreadCount}
              </span>
            )}
            <span className="text-xs">Alerts</span>
          </div>
        </Link>
      </div>
    </div>
  );
  
  // Render Header
  const renderHeader = () => (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-10">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center">
          <span className="font-bold text-lg">Rank It Pro</span>
          {!isOnline && (
            <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
              Offline
            </span>
          )}
        </div>
        
        <div className="flex items-center">
          {refreshing && (
            <RefreshCw size={18} className="animate-spin mr-4" />
          )}
          
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings size={20} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                  Manage your account settings and preferences
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Theme</h4>
                    <p className="text-sm text-gray-500">Choose your display theme</p>
                  </div>
                  <select className="border rounded p-1">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifications</h4>
                    <p className="text-sm text-gray-500">Enable notifications</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Location Services</h4>
                    <p className="text-sm text-gray-500">Auto-capture job locations</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto Sync</h4>
                    <p className="text-sm text-gray-500">Sync data automatically</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
              
              <div className="mt-4">
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Tab title */}
      <div className="px-4 pb-2">
        <h1 className="text-xl font-semibold">
          {activeTab === 'home' && 'Dashboard'}
          {activeTab === 'check-ins' && 'Check-ins'}
          {activeTab === 'schedule' && 'Today\'s Schedule'}
          {activeTab === 'customers' && 'Customers'}
          {activeTab === 'notifications' && 'Notifications'}
        </h1>
        {technicianProfile && (
          <p className="text-sm text-gray-500">{technicianProfile.name}</p>
        )}
      </div>
    </div>
  );
  
  // Render Login Screen
  const renderLoginScreen = () => (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Rank It Pro</h1>
          <p className="text-gray-600 mt-2">Mobile Technician Portal</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="your.email@example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-gray-500">
              Having trouble? Contact your administrator
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
  
  // Render Home Dashboard
  const renderHomeDashboard = () => (
    <div className="space-y-6">
      {/* Profile card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarFallback>{technicianProfile?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{technicianProfile?.name}</h2>
              <p className="text-gray-500">{technicianProfile?.company?.name}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{technicianProfile?.stats?.totalCheckIns || 0}</p>
              <p className="text-sm text-gray-500">Total Check-ins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{technicianProfile?.stats?.thisMonth || 0}</p>
              <p className="text-sm text-gray-500">This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{technicianProfile?.stats?.rating?.toFixed(1) || 'N/A'}</p>
              <p className="text-sm text-gray-500">Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          className="h-auto py-4 flex flex-col"
          onClick={() => {
            getCurrentLocation();
            setShowNewCheckInForm(true);
          }}
        >
          <PlusCircle className="h-8 w-8 mb-2" />
          <span>New Check-in</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col"
          onClick={() => navigate('/technician-mobile/schedule')}
        >
          <Calendar className="h-8 w-8 mb-2" />
          <span>View Schedule</span>
        </Button>
      </div>
      
      {/* Recent activity */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Check-ins</h3>
        {checkIns.length > 0 ? (
          <div className="space-y-4">
            {checkIns.slice(0, 3).map((checkIn) => (
              <Card key={checkIn.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{checkIn.jobType}</h4>
                      <p className="text-sm text-gray-500">
                        {checkIn.customerName || 'No customer name'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(checkIn.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {checkIn.completedAt ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Completed
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        In Progress
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No check-ins yet</h3>
            <p className="text-gray-500 mt-2">Create your first check-in to see it here</p>
          </div>
        )}
      </div>
      
      {/* Today's schedule preview */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
        {schedule.length > 0 ? (
          <div className="space-y-4">
            {schedule.slice(0, 2).map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.location}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No appointments today</h3>
            <p className="text-gray-500 mt-2">Your schedule is clear for today</p>
          </div>
        )}
      </div>
      
      {/* Offline sync indicator */}
      {offlineQueue.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">Offline Data Pending</h4>
                <p className="text-sm text-gray-600">
                  {offlineQueue.length} item(s) waiting to be synced
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={syncOfflineData}
                disabled={!isOnline || refreshing}
              >
                Sync Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
  
  // Render Check-ins List
  const renderCheckInsList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Input
            type="search"
            placeholder="Search check-ins..."
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        
        <Button
          size="sm"
          onClick={() => {
            getCurrentLocation();
            setShowNewCheckInForm(true);
          }}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New
        </Button>
      </div>
      
      {checkIns.length > 0 ? (
        <div className="space-y-4">
          {checkIns.map((checkIn) => (
            <Card key={checkIn.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{checkIn.jobType}</h4>
                    <p className="text-sm text-gray-500">
                      {checkIn.customerName || 'No customer name'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(checkIn.createdAt).toLocaleDateString()}
                    </p>
                    {checkIn.notes && (
                      <p className="text-sm mt-2 line-clamp-2">{checkIn.notes}</p>
                    )}
                  </div>
                  {checkIn.completedAt ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Completed
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      In Progress
                    </span>
                  )}
                </div>
                
                {checkIn.photos && checkIn.photos.length > 0 && (
                  <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
                    {checkIn.photos.map((photo: { url: string }, index: number) => (
                      <img
                        key={index}
                        src={photo.url}
                        alt={`Check-in photo ${index + 1}`}
                        className="h-20 w-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
                
                <div className="mt-4 flex justify-between">
                  <div className="flex space-x-2">
                    {checkIn.address && (
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[150px]">{checkIn.address}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button size="sm" variant="ghost">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No check-ins yet</h3>
          <p className="text-gray-500 mt-2">Create your first check-in to get started</p>
          <Button 
            className="mt-4"
            onClick={() => {
              getCurrentLocation();
              setShowNewCheckInForm(true);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Check-in
          </Button>
        </div>
      )}
    </div>
  );
  
  // Render Schedule
  const renderSchedule = () => (
    <div className="space-y-4">
      {schedule.length > 0 ? (
        <div className="space-y-4">
          {schedule.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {item.endTime && ` - ${new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {item.location}
                    </div>
                    {item.customerName && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Users className="h-4 w-4 mr-1" />
                        {item.customerName}
                      </div>
                    )}
                    {item.description && (
                      <p className="text-sm mt-2 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'completed' ? 'bg-green-100 text-green-800' :
                    item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-2">
                  {item.status === 'scheduled' && (
                    <Button size="sm" variant="outline">
                      Start Job
                    </Button>
                  )}
                  {item.status === 'in_progress' && (
                    <Button size="sm">
                      Complete
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No appointments today</h3>
          <p className="text-gray-500 mt-2">Your schedule is clear for today</p>
        </div>
      )}
    </div>
  );
  
  // Render Customers
  const renderCustomers = () => (
    <div className="space-y-4">
      <div className="relative w-full">
        <Input
          type="search"
          placeholder="Search customers..."
          className="pl-10"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>
      
      {customers.length > 0 ? (
        <div className="space-y-4">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-4">
                <div>
                  <h4 className="font-semibold">{customer.name}</h4>
                  {customer.email && (
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  )}
                  {customer.phone && (
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                  )}
                  {customer.address && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-500">Last service: </span>
                    <span>{customer.checkInCount > 0 ? '2 weeks ago' : 'Never'}</span>
                  </div>
                  
                  <Button size="sm" variant="ghost">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No customers yet</h3>
          <p className="text-gray-500 mt-2">Customer records will appear here</p>
        </div>
      )}
    </div>
  );
  
  // Render Notifications
  const renderNotifications = () => (
    <div className="space-y-4">
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`${notification.read ? 'bg-white' : 'bg-blue-50'}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{notification.title}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm mt-2">{notification.message}</p>
                  </div>
                  <div className={`p-1 rounded-full ${
                    notification.type === 'success' ? 'bg-green-100 text-green-800' :
                    notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    notification.type === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    <div className="h-6 w-6 flex items-center justify-center">
                      {notification.type === 'success' && <CheckCircle size={16} />}
                      {notification.type === 'warning' && <Info size={16} />}
                      {notification.type === 'error' && <Info size={16} />}
                      {notification.type === 'info' && <Info size={16} />}
                    </div>
                  </div>
                </div>
                
                {!notification.read && (
                  <div className="mt-4 flex justify-end">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      Mark as Read
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
          <p className="text-gray-500 mt-2">You're all caught up!</p>
        </div>
      )}
    </div>
  );
  
  // New Check-in Form
  const renderNewCheckInForm = () => (
    <Dialog open={showNewCheckInForm} onOpenChange={setShowNewCheckInForm}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Check-in</DialogTitle>
          <DialogDescription>
            Create a new service check-in record
          </DialogDescription>
        </DialogHeader>
        
        <Form {...checkInForm}>
          <form onSubmit={checkInForm.handleSubmit(createCheckIn)} className="space-y-4">
            <FormField
              control={checkInForm.control}
              name="jobType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Type*</FormLabel>
                  <FormControl>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="">Select job type</option>
                      <option value="Installation">Installation</option>
                      <option value="Repair">Repair</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Inspection">Inspection</option>
                      <option value="Consultation">Consultation</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={checkInForm.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={checkInForm.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={checkInForm.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={checkInForm.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter notes about the job"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={checkInForm.control}
              name="workPerformed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Performed</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={checkInForm.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input {...field} placeholder="Address" />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={getCurrentLocation}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  {locationError && (
                    <p className="text-sm text-red-500 mt-1">{locationError}</p>
                  )}
                  {currentLocation && !locationError && (
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates captured: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Customer Testimonial Collection Section */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">🎤</span>
                Customer Testimonial
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Collect feedback from your customer to build trust and improve your business reputation.
              </p>
              
              {/* Testimonial Type Selection with Plan Restrictions */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Testimonial Type</label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={testimonialType === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTestimonialType('text')}
                  >
                    Text
                  </Button>
                  
                  {/* Audio Testimonials - Pro+ Feature */}
                  {company && hasFeature(company.plan, 'audioTestimonials') ? (
                    <Button
                      type="button"
                      variant={testimonialType === 'audio' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTestimonialType('audio')}
                    >
                      Audio
                    </Button>
                  ) : (
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled
                        className="opacity-50"
                      >
                        Audio
                      </Button>
                      <div className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded opacity-75">
                        {getPlanName(getRequiredPlan('audioTestimonials'))}+ Feature
                      </div>
                    </div>
                  )}
                  
                  {/* Video Testimonials - Agency Feature */}
                  {company && hasFeature(company.plan, 'videoTestimonials') ? (
                    <Button
                      type="button"
                      variant={testimonialType === 'video' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTestimonialType('video')}
                    >
                      Video
                    </Button>
                  ) : (
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled
                        className="opacity-50"
                      >
                        Video
                      </Button>
                      <div className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded opacity-75">
                        {getPlanName(getRequiredPlan('videoTestimonials'))}+ Feature
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Plan Upgrade Notice */}
                {company && !hasFeature(company.plan, 'audioTestimonials') && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <p className="font-medium text-blue-800">Upgrade for Enhanced Testimonials</p>
                        <p className="text-blue-600">
                          Audio and video testimonials are available on {getPlanName('pro')} and {getPlanName('agency')} plans.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Testimonial */}
              {testimonialType === 'text' && (
                <FormField
                  control={checkInForm.control}
                  name="customerTestimonial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Feedback</FormLabel>
                      <FormControl>
                        <textarea 
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter customer's testimonial or feedback here..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Audio Testimonial */}
              {testimonialType === 'audio' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {!isRecordingAudio && !audioBlob && (
                      <Button
                        type="button"
                        onClick={startAudioRecording}
                        className="flex items-center space-x-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-red-500"></span>
                        <span>Start Recording</span>
                      </Button>
                    )}
                    
                    {isRecordingAudio && (
                      <Button
                        type="button"
                        onClick={stopAudioRecording}
                        variant="destructive"
                        className="flex items-center space-x-2 animate-pulse"
                      >
                        <span className="w-4 h-4 rounded-full bg-white"></span>
                        <span>Stop Recording</span>
                      </Button>
                    )}
                    
                    {audioBlob && (
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Audio recorded
                        </div>
                        <Button
                          type="button"
                          onClick={clearTestimonial}
                          variant="outline"
                          size="sm"
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {audioBlob && (
                    <audio controls className="w-full">
                      <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
                      Your browser does not support audio playback.
                    </audio>
                  )}
                </div>
              )}

              {/* Video Testimonial */}
              {testimonialType === 'video' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {!isRecordingVideo && !videoBlob && (
                      <Button
                        type="button"
                        onClick={startVideoRecording}
                        className="flex items-center space-x-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Start Video Recording</span>
                      </Button>
                    )}
                    
                    {isRecordingVideo && (
                      <Button
                        type="button"
                        onClick={stopVideoRecording}
                        variant="destructive"
                        className="flex items-center space-x-2 animate-pulse"
                      >
                        <span className="w-4 h-4 rounded-full bg-white"></span>
                        <span>Stop Recording</span>
                      </Button>
                    )}
                    
                    {videoBlob && (
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Video recorded
                        </div>
                        <Button
                          type="button"
                          onClick={clearTestimonial}
                          variant="outline"
                          size="sm"
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {videoBlob && (
                    <video controls className="w-full max-h-64 rounded-md">
                      <source src={URL.createObjectURL(videoBlob)} type="video/webm" />
                      Your browser does not support video playback.
                    </video>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNewCheckInForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Check-in</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
  
  // Render Loading Screen
  const renderLoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Rank It Pro...</p>
      </div>
    </div>
  );
  
  // Main render function
  if (loading) {
    return renderLoadingScreen();
  }
  
  if (!authenticated) {
    return renderLoginScreen();
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16 pt-32">
      {renderHeader()}
      
      <div className="container px-4 mx-auto">
        {activeTab === 'home' && renderHomeDashboard()}
        {activeTab === 'check-ins' && renderCheckInsList()}
        {activeTab === 'schedule' && renderSchedule()}
        {activeTab === 'customers' && renderCustomers()}
        {activeTab === 'notifications' && renderNotifications()}
      </div>
      
      {renderNavBar()}
      {renderNewCheckInForm()}
    </div>
  );
}