import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/auth';

// Define notification types
export interface CheckInNotification {
  id: number;
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
  read: boolean;
}

type Notification = CheckInNotification;

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
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
    
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      setConnected(true);
      
      // Send authentication message
      const authMessage = {
        type: 'auth',
        userId: userData.user?.id,
        companyId: userData.user?.companyId,
      };
      ws.send(JSON.stringify(authMessage));
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Handle new check-in notifications
        if (message.type === 'new_check_in') {
          const newNotification: Notification = {
            id: Date.now(), // Generate a unique ID for the notification
            type: 'new_check_in',
            data: message.data,
            read: false,
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            const techName = message.data.technician?.name || 'A technician';
            new Notification('New Check-In', {
              body: `${techName} has submitted a new ${message.data.jobType} check-in.`,
              icon: '/favicon.ico',
            });
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
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};