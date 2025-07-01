import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/auth';

// Define notification types
export interface BaseNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  priority?: 'low' | 'normal' | 'high';
  action?: {
    label: string;
    url: string;
  };
}

export interface CheckInNotification extends BaseNotification {
  type: 'new_check_in';
  data: {
    id: number;
    jobType: string;
    createdAt: string;
    technician: {
      id: number;
      name: string;
    } | null;
  };
}

export interface ReviewNotification extends BaseNotification {
  type: 'new_review' | 'review_request_sent';
  data: {
    id: number;
    rating?: number;
    customerName: string;
    technicianId: number;
    technicianName?: string;
  };
}

export interface BlogPostNotification extends BaseNotification {
  type: 'blog_post_created' | 'blog_post_published';
  data: {
    id: number;
    title: string;
    checkInId?: number;
  };
}

export interface SystemNotification extends BaseNotification {
  type: 'system';
  data?: {
    category?: 'billing' | 'account' | 'maintenance' | 'feature';
  };
}

export type Notification = 
  | CheckInNotification 
  | ReviewNotification 
  | BlogPostNotification 
  | SystemNotification;

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  notificationPreferences: NotificationPreferences;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
}

export interface NotificationPreferences {
  enableNotifications: boolean;
  enableCheckInNotifications: boolean;
  enableReviewNotifications: boolean;
  enableBlogPostNotifications: boolean;
  enableBillingNotifications: boolean;
  enableSound: boolean;
  enablePushNotifications: boolean;
}

const defaultPreferences: NotificationPreferences = {
  enableNotifications: true,
  enableCheckInNotifications: true,
  enableReviewNotifications: true,
  enableBlogPostNotifications: true,
  enableBillingNotifications: true,
  enableSound: true,
  enablePushNotifications: false,
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
  notificationPreferences: defaultPreferences,
  updateNotificationPreferences: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);
  
  // Get current user data
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: getCurrentUser,
  });
  
  // Initialize WebSocket connection when user data is available
  useEffect(() => {
    if (!userData?.user) return;
    
    // Temporarily disable WebSocket to prevent connection attempts
    console.log('WebSocket disabled for notifications - using API polling instead');
    return;
    
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 1; // Reduced from 3 to 1
    const reconnectInterval = 30000; // Increased from 5 to 30 seconds
    
    const connectWebSocket = () => {
      try {
        // Create WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connection established');
          setConnected(true);
          reconnectAttempts = 0; // Reset attempts on successful connection
          
          // Send authentication message
          const authMessage = {
            type: 'auth',
            userId: userData.user?.id,
            companyId: userData.user?.companyId,
          };
          ws.send(JSON.stringify(authMessage));
        };
        
        ws.onerror = (error) => {
          // Suppress excessive error logging
          if (reconnectAttempts === 0) {
            console.log('WebSocket connection unavailable - notifications will be disabled');
          }
        };
        
        ws.onclose = () => {
          setConnected(false);
          
          // Only attempt reconnection if we haven't exceeded max attempts
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(connectWebSocket, reconnectInterval);
          }
        };
        
        setSocket(ws);
        return ws;
      } catch (error) {
        console.log('WebSocket not available - running without real-time notifications');
        setConnected(false);
        return null;
      }
    };
    
    const ws = connectWebSocket();
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Check notification preferences before processing
        if (!notificationPreferences.enableNotifications) {
          return;
        }
        
        // Handle different notification types based on preferences
        if (message.type === 'new_check_in' && notificationPreferences.enableCheckInNotifications) {
          const techName = message.data.technician?.name || 'A technician';
          const newNotification: CheckInNotification = {
            id: Date.now(),
            type: 'new_check_in',
            title: 'New Check-In',
            message: `${techName} has submitted a new ${message.data.jobType} check-in.`,
            createdAt: new Date().toISOString(),
            data: message.data,
            read: false,
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show browser notification if enabled and supported
          if (notificationPreferences.enablePushNotifications && 
              'Notification' in window && 
              Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
            });
          }
          
          // Play sound if enabled
          if (notificationPreferences.enableSound) {
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(err => console.error('Error playing notification sound:', err));
          }
        } 
        else if ((message.type === 'new_review' || message.type === 'review_request_sent') && 
                notificationPreferences.enableReviewNotifications) {
          // Create review notification
          const title = message.type === 'new_review' ? 'New Review Received' : 'Review Request Sent';
          const msgText = message.type === 'new_review' 
            ? `${message.data.customerName} submitted a new review (${message.data.rating || 'N/A'} stars)`
            : `Review request sent to ${message.data.customerName}`;
            
          const newNotification: ReviewNotification = {
            id: Date.now(),
            type: message.type,
            title: title,
            message: msgText,
            createdAt: new Date().toISOString(),
            data: message.data,
            read: false,
            priority: message.type === 'new_review' ? 'high' : 'normal',
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Browser notification
          if (notificationPreferences.enablePushNotifications && 
              'Notification' in window && 
              Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
            });
          }
          
          // Sound
          if (notificationPreferences.enableSound) {
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(err => console.error('Error playing notification sound:', err));
          }
        }
        else if ((message.type === 'blog_post_created' || message.type === 'blog_post_published') && 
                notificationPreferences.enableBlogPostNotifications) {
          // Create blog post notification
          const newNotification: BlogPostNotification = {
            id: Date.now(),
            type: message.type,
            title: message.type === 'blog_post_created' ? 'Blog Post Created' : 'Blog Post Published',
            message: `"${message.data.title}" has been ${message.type === 'blog_post_created' ? 'created' : 'published'}`,
            createdAt: new Date().toISOString(),
            data: message.data,
            read: false,
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Browser notification
          if (notificationPreferences.enablePushNotifications && 
              'Notification' in window && 
              Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
            });
          }
          
          // Sound
          if (notificationPreferences.enableSound) {
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(err => console.error('Error playing notification sound:', err));
          }
        }
        else if (message.type === 'system') {
          // Skip billing notifications if disabled
          if (message.data?.category === 'billing' && !notificationPreferences.enableBillingNotifications) {
            return;
          }
          
          // Create system notification
          const newNotification: SystemNotification = {
            id: Date.now(),
            type: 'system',
            title: message.title || 'System Notification',
            message: message.message || 'System update',
            createdAt: new Date().toISOString(),
            data: message.data,
            read: false,
            priority: message.priority || 'normal',
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Browser notification
          if (notificationPreferences.enablePushNotifications && 
              'Notification' in window && 
              Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
            });
          }
          
          // Sound
          if (notificationPreferences.enableSound) {
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(err => console.error('Error playing notification sound:', err));
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setConnected(false);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };
    
    setSocket(ws);
    
    // Request browser notification permission if not already granted
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    // Cleanup on unmount
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [userData?.user]);
  
  // Auto-reconnect on connection loss
  useEffect(() => {
    if (!userData?.user || connected) return;
    
    const reconnectInterval = setInterval(() => {
      if (!connected && userData?.user) {
        console.log('Attempting to reconnect WebSocket...');
        
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket reconnected');
          setConnected(true);
          clearInterval(reconnectInterval);
          
          // Send authentication message
          const authMessage = {
            type: 'auth',
            userId: userData.user?.id,
            companyId: userData.user?.companyId,
          };
          ws.send(JSON.stringify(authMessage));
        };
        
        setSocket(ws);
      }
    }, 5000); // Try to reconnect every 5 seconds
    
    return () => clearInterval(reconnectInterval);
  }, [userData?.user, connected]);
  
  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  // Initialize notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(defaultPreferences);
  
  // Load saved preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('notification_preferences');
    if (savedPrefs) {
      try {
        const parsedPrefs = JSON.parse(savedPrefs);
        setNotificationPreferences({...defaultPreferences, ...parsedPrefs});
      } catch (error) {
        console.error("Failed to parse saved notification preferences", error);
      }
    }
  }, []);
  
  // Update notification preferences
  const updateNotificationPreferences = (prefs: Partial<NotificationPreferences>) => {
    const newPrefs = {...notificationPreferences, ...prefs};
    setNotificationPreferences(newPrefs);
    localStorage.setItem('notification_preferences', JSON.stringify(newPrefs));
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        notificationPreferences,
        updateNotificationPreferences,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};