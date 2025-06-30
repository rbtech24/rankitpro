import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bell, X, Building2, AlertTriangle, DollarSign, Activity, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';

// Notification types
export type NotificationType = 'company_signup' | 'billing_issue' | 'usage_alert' | 'system_alert' | 'review_milestone' | 'company_activity';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: {
    companyId?: number;
    companyName?: string;
    issueType?: string;
    thresholdType?: string;
    currentValue?: number;
    limitValue?: number;
    errorCode?: string;
    reviewCount?: number;
    activityType?: string;
  };
}

// Context for notifications
type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

// Real notifications are fetched from API - no mock data
const initialNotifications: Notification[] = [];

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Load real notifications from API
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/notifications');
        const data = await response.json();
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
        // Start with empty array - no fallback mock data
      }
    };

    loadNotifications();
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotification,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'company_signup':
      return <Building2 className="h-4 w-4" />;
    case 'billing_issue':
      return <DollarSign className="h-4 w-4" />;
    case 'usage_alert':
      return <AlertTriangle className="h-4 w-4" />;
    case 'system_alert':
      return <AlertCircle className="h-4 w-4" />;
    case 'review_milestone':
      return <TrendingUp className="h-4 w-4" />;
    case 'company_activity':
      return <Activity className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

export const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="px-2 py-1 text-xs">
              {unreadCount}
            </Badge>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <NotificationList
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              onClearNotification={clearNotification}
            />
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onClearNotification: (id: string) => void;
}

const NotificationList = ({ notifications, onNotificationClick, onClearNotification }: NotificationListProps) => {
  return (
    <div className="divide-y">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
            !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
          }`}
          onClick={() => onNotificationClick(notification)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className={`mt-1 ${!notification.isRead ? 'text-blue-600' : 'text-gray-500'}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {format(new Date(notification.timestamp), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClearNotification(notification.id);
              }}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};