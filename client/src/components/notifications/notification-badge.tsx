import React, { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '../../components/ui/popover';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Button } from '../../components/ui/button';
import { AuthState } from '../../lib/auth';

interface Notification {
  id: string;
  type: 'check-in' | 'review' | 'blog' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationBadgeProps {
  auth: AuthState | undefined;
}

export default function NotificationBadge({ auth }: NotificationBadgeProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Connect to WebSocket
  useEffect(() => {
    // Only connect if user is logged in
    if (!auth?.user) return;
    
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 2;
    
    const connectWebSocket = () => {
      try {
        // Create WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          setIsConnected(true);
          reconnectAttempts = 0;
          
          // Send authentication message with user ID
          ws.send(JSON.stringify({ 
            type: 'authenticate', 
            userId: auth.user?.id,
            companyId: auth.user?.companyId || null
          }));
        };
        
        ws.onerror = () => {
          // Silent handling of connection errors
          setIsConnected(false);
        };
        
        ws.onclose = () => {
          setIsConnected(false);
          // Limited reconnection attempts
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(connectWebSocket, 3000);
          }
        };
        
        setSocket(ws);
        return ws;
      } catch (error) {
        setIsConnected(false);
        return null;
      }
    };
    
    const ws = connectWebSocket();
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'notification') {
          // Add new notification to state
          const newNotification: Notification = {
            id: data.id || `notification-${Date.now()}`,
            type: data.notificationType || 'system',
            title: data.title || 'New Notification',
            message: data.message,
            timestamp: new Date(data.timestamp || Date.now()),
            read: false,
            data: data.data
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          updateUnreadCount();
          
          // Show browser notification if supported
          if (Notification && Notification.permission === 'granted') {
            new Notification(newNotification.title, { 
              body: newNotification.message 
            });
          }
        }
      } catch (error) {
        // Error processing WebSocket message, skip this message
      }
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (auth?.user) {
          // The effect cleanup will run, and the effect will run again
          setSocket(null);
        }
      }, 5000);
    };
    
    ws.onerror = (error) => {
      // WebSocket error occurred
    };
    
    setSocket(ws);
    
    // Cleanup on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [auth?.user, socket]);
  
  // Update unread count whenever notifications change
  const updateUnreadCount = () => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  };
  
  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    updateUnreadCount();
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };
  
  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if (Notification) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Notification permission granted
        }
      } catch (error) {
        // Error requesting notification permission
      }
    }
  };
  
  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);
  
  // Format timestamp to relative time (e.g., "2 minutes ago")
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {isConnected ? <Bell /> : <Bell className="text-muted-foreground" />}
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.5rem] h-5 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Notifications</h3>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <BellRing className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-xs mt-1">
                {isConnected ? 'Connected to notifications' : 'Connecting...'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-muted transition-colors cursor-pointer ${notification.read ? 'opacity-70' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">
                      {notification.title}
                      {!notification.read && (
                        <span className="ml-2 h-2 w-2 rounded-full bg-primary inline-block"></span>
                      )}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}