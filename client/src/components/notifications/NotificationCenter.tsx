import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Bell, 
  X, 
  CreditCard, 
  UserPlus, 
  AlertTriangle, 
  CheckCircle2,
  BarChart,
  ServerOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export type NotificationType = 'company_signup' | 'billing_issue' | 'usage_alert' | 'system_alert' | 'review_milestone' | 'company_activity';

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
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/notifications');
      return response.json();
    }
  });

  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const unreadCount = localNotifications.filter(n => !n.isRead).length;

  // Update local state when API data changes
  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const markAsRead = async (id: string) => {
    try {
      await apiRequest('PATCH', `/api/notifications/${id}/read`);
      setLocalNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      // Error marking notification as read
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest('PATCH', '/api/notifications/mark-all-read');
      setLocalNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      // Error marking all notifications as read
    }
  };

  const clearNotification = async (id: string) => {
    try {
      await apiRequest('DELETE', `/api/notifications/${id}`);
      setLocalNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      // Error deleting notification
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}`,
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setLocalNotifications(prev => [newNotification, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications: localNotifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotification,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Notification icon component based on type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'company_signup':
      return <UserPlus className="h-5 w-5 text-green-600" />;
    case 'billing_issue':
      return <CreditCard className="h-5 w-5 text-red-600" />;
    case 'usage_alert':
      return <BarChart className="h-5 w-5 text-orange-600" />;
    case 'system_alert':
      return <ServerOff className="h-5 w-5 text-red-600" />;
    case 'review_milestone':
      return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
    case 'company_activity':
      return <AlertTriangle className="h-5 w-5 text-amber-600" />;
    default:
      return <Bell className="h-5 w-5 text-gray-600" />;
  }
};

// Get notification priority color
const getNotificationPriority = (type: NotificationType) => {
  switch (type) {
    case 'system_alert':
    case 'billing_issue':
      return 'border-l-red-500 bg-red-50';
    case 'usage_alert':
      return 'border-l-orange-500 bg-orange-50';
    case 'company_signup':
    case 'review_milestone':
      return 'border-l-green-500 bg-green-50';
    case 'company_activity':
      return 'border-l-blue-500 bg-blue-50';
    default:
      return 'border-l-gray-500 bg-gray-50';
  }
};

// Handle notification click actions
const handleNotificationAction = (notification: Notification) => {
  switch (notification.type) {
    case 'company_signup':
    case 'company_activity':
      if (notification.data?.companyId) {
        // Navigate to company management page
      }
      break;
    case 'billing_issue':
      // Navigate to billing management
      break;
    case 'system_alert':
      // Navigate to system status
      break;
    case 'usage_alert':
      // Navigate to usage dashboard
      break;
    case 'review_milestone':
      // Navigate to reviews page
      break;
    default:
      break;
  }
};

// Main notification center component
export default function NotificationCenter() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No notifications</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {notifications.map((notification) => (
                    <Card 
                      key={notification.id}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 border-l-4 ${getNotificationPriority(notification.type)} ${
                        !notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        handleNotificationAction(notification);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                {!notification.isRead && (
                                  <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    clearNotification(notification.id);
                                  }}
                                  className="h-6 w-6 p-0 hover:bg-gray-200"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="unread" className="p-0">
            <ScrollArea className="h-96">
              {notifications.filter(n => !n.isRead).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-400 mb-2" />
                  <p className="text-sm text-gray-500">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {notifications
                    .filter(n => !n.isRead)
                    .map((notification) => (
                      <Card 
                        key={notification.id}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 border-l-4 ${getNotificationPriority(notification.type)} bg-blue-50/50`}
                        onClick={() => {
                          markAsRead(notification.id);
                          handleNotificationAction(notification);
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      clearNotification(notification.id);
                                    }}
                                    className="h-6 w-6 p-0 hover:bg-gray-200"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="alerts" className="p-0">
            <ScrollArea className="h-96">
              {notifications.filter(
                n => n.type === 'system_alert' || n.type === 'usage_alert' || n.type === 'billing_issue'
              ).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-400 mb-2" />
                  <p className="text-sm text-gray-500">No alerts</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {notifications
                    .filter(n => n.type === 'system_alert' || n.type === 'usage_alert' || n.type === 'billing_issue')
                    .map((notification) => (
                      <Card 
                        key={notification.id}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 border-l-4 ${getNotificationPriority(notification.type)} ${
                          !notification.isRead ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => {
                          markAsRead(notification.id);
                          handleNotificationAction(notification);
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  {!notification.isRead && (
                                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      clearNotification(notification.id);
                                    }}
                                    className="h-6 w-6 p-0 hover:bg-gray-200"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}