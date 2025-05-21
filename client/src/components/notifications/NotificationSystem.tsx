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
  CardFooter,
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
type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

// Mock notification data
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'company_signup',
    title: 'New Company Sign-up',
    message: 'Top HVAC Solutions has signed up for the Professional plan',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    isRead: false,
    data: {
      companyId: 1,
      companyName: 'Top HVAC Solutions'
    }
  },
  {
    id: '2',
    type: 'billing_issue',
    title: 'Payment Failed',
    message: 'City Roofing Experts had a failed payment attempt',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: false,
    data: {
      companyId: 4,
      companyName: 'City Roofing Experts',
      issueType: 'payment_failed'
    }
  },
  {
    id: '3',
    type: 'usage_alert',
    title: 'Technician Limit Reached',
    message: 'Metro Electrical Contractors has reached 90% of their technician limit',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    isRead: true,
    data: {
      companyId: 3,
      companyName: 'Metro Electrical Contractors',
      thresholdType: 'technicians',
      currentValue: 45,
      limitValue: 50
    }
  },
  {
    id: '4',
    type: 'system_alert',
    title: 'High Database Load',
    message: 'Database server is experiencing high load (85% CPU utilization)',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 minutes ago
    isRead: false,
    data: {
      errorCode: 'DB_HIGH_LOAD'
    }
  },
  {
    id: '5',
    type: 'review_milestone',
    title: 'Review Milestone Reached',
    message: 'Ace Plumbing Services has reached 50 reviews with a 4.9 average rating',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    isRead: false,
    data: {
      companyId: 2,
      companyName: 'Ace Plumbing Services',
      reviewCount: 50
    }
  },
  {
    id: '6',
    type: 'company_activity',
    title: 'Unusual Activity Detected',
    message: 'Green Landscaping LLC has had a 200% increase in check-ins today',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    isRead: true,
    data: {
      companyId: 5,
      companyName: 'Green Landscaping LLC',
      activityType: 'checkin_spike'
    }
  },
  {
    id: '7',
    type: 'system_alert',
    title: 'API Rate Limit Warning',
    message: 'API rate limit for OpenAI is at 80% of daily quota',
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(), // 50 minutes ago
    isRead: false,
    data: {
      errorCode: 'API_RATE_LIMIT',
      thresholdType: 'openai_api'
    }
  },
  {
    id: '8',
    type: 'billing_issue',
    title: 'Subscription Canceled',
    message: 'City Roofing Experts has canceled their subscription',
    timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
    isRead: true,
    data: {
      companyId: 4,
      companyName: 'City Roofing Experts',
      issueType: 'subscription_canceled'
    }
  },
  {
    id: '9',
    type: 'company_signup',
    title: 'Plan Upgrade',
    message: 'Ace Plumbing Services has upgraded to the Professional plan',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    isRead: true,
    data: {
      companyId: 2,
      companyName: 'Ace Plumbing Services'
    }
  },
  {
    id: '10',
    type: 'usage_alert',
    title: 'Check-in Limit Warning',
    message: 'Ace Plumbing Services is at 85% of their monthly check-in limit',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    isRead: false,
    data: {
      companyId: 2,
      companyName: 'Ace Plumbing Services',
      thresholdType: 'check_ins',
      currentValue: 425,
      limitValue: 500
    }
  }
];

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  // Function to mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };
  
  // Function to mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, isRead: true }))
    );
  };
  
  // Function to clear a notification
  const clearNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  
  // Function to add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}`,
      isRead: false,
      timestamp: new Date().toISOString()
    };
    
    setNotifications([newNotification, ...notifications]);
  };
  
  // In a real implementation, we would fetch notifications from the API here
  // useEffect(() => {
  //   const fetchNotifications = async () => {
  //     try {
  //       const response = await apiRequest('GET', '/api/notifications');
  //       const data = await response.json();
  //       setNotifications(data);
  //     } catch (error) {
  //       console.error('Failed to fetch notifications:', error);
  //     }
  //   };
  //
  //   fetchNotifications();
  //   
  //   // Set up a websocket or polling mechanism to receive real-time notifications
  // }, []);
  
  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        clearNotification,
        addNotification 
      }}
    >
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

// Helper function to get icon based on notification type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'company_signup':
      return <UserPlus className="h-5 w-5 text-green-500" />;
    case 'billing_issue':
      return <CreditCard className="h-5 w-5 text-red-500" />;
    case 'usage_alert':
      return <BarChart className="h-5 w-5 text-yellow-500" />;
    case 'system_alert':
      return <ServerOff className="h-5 w-5 text-red-500" />;
    case 'review_milestone':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'company_activity':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    default:
      return <Bell className="h-5 w-5 text-primary" />;
  }
};

// The actual notification bell component
export const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  
  // Function to handle when a notification is clicked
  const handleNotificationClick = (notification: Notification) => {
    // Mark the notification as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Handle navigation or actions based on notification type
    // For example, navigate to the company details page for company-related notifications
    switch (notification.type) {
      case 'company_signup':
      case 'company_activity':
        if (notification.data?.companyId) {
          // Example: navigate to company details
          console.log(`Navigate to company ${notification.data.companyId}`);
        }
        break;
      case 'billing_issue':
        // Navigate to billing management
        console.log('Navigate to billing management');
        window.location.href = '/billing-management';
        break;
      case 'system_alert':
        // Navigate to system status page
        console.log('Navigate to system status');
        break;
      default:
        break;
    }
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500"
              variant="secondary"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <Card className="border-0">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                >
                  Mark all as read
                </Button>
              )}
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-3 p-2 border-b">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="p-0">
              <NotificationList 
                notifications={notifications} 
                onNotificationClick={handleNotificationClick}
                onClearNotification={clearNotification}
              />
            </TabsContent>
            
            <TabsContent value="unread" className="p-0">
              <NotificationList 
                notifications={notifications.filter(n => !n.isRead)} 
                onNotificationClick={handleNotificationClick}
                onClearNotification={clearNotification}
              />
            </TabsContent>
            
            <TabsContent value="alerts" className="p-0">
              <NotificationList 
                notifications={notifications.filter(n => 
                  n.type === 'system_alert' || n.type === 'usage_alert' || n.type === 'billing_issue'
                )} 
                onNotificationClick={handleNotificationClick}
                onClearNotification={clearNotification}
              />
            </TabsContent>
          </Tabs>
          
          <CardFooter className="border-t p-3 flex justify-center">
            <Button variant="ghost" size="sm" className="w-full text-sm">
              View All Notifications
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onClearNotification: (id: string) => void;
}

const NotificationList = ({ notifications, onNotificationClick, onClearNotification }: NotificationListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center text-center">
        <Bell className="h-10 w-10 text-gray-300 mb-4" />
        <p className="text-gray-500">No notifications</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[320px]">
      <div className="divide-y">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`flex items-start p-4 hover:bg-gray-50 cursor-pointer relative group ${
              notification.isRead ? 'opacity-70' : ''
            }`}
            onClick={() => onNotificationClick(notification)}
          >
            <div className="flex-shrink-0 mr-3 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className={`text-sm font-medium ${notification.isRead ? '' : 'font-semibold'}`}>
                  {notification.title}
                </p>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute top-4 right-4 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onClearNotification(notification.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
            
            {!notification.isRead && (
              <div className="w-2 h-2 rounded-full bg-blue-500 absolute top-4 right-4 group-hover:opacity-0"></div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};