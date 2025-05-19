import React, { useState } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { 
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Bell, X, CheckCircle2, Settings, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

export function NotificationCenter() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications,
    notificationPreferences,
    updateNotificationPreferences
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('notifications');

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md p-0 overflow-hidden flex flex-col">
        <SheetHeader className="px-4 py-4 border-b">
          <div className="flex justify-between items-center">
            <SheetTitle>Notifications</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-2 px-4 py-2">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <div className="text-sm text-muted-foreground">
                {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-8">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearNotifications} className="text-xs h-8">
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification} 
                      onMarkAsRead={markAsRead} 
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                  <Bell className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-center">No notifications to display</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-auto">
            <div className="p-4 space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">General Settings</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableNotifications" className="flex-1">
                    Enable notifications
                  </Label>
                  <Switch 
                    id="enableNotifications" 
                    checked={notificationPreferences.enableNotifications}
                    onCheckedChange={(checked) => 
                      updateNotificationPreferences({ enableNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableSound" className="flex-1">
                    Notification sounds
                  </Label>
                  <Switch 
                    id="enableSound" 
                    checked={notificationPreferences.enableSound}
                    onCheckedChange={(checked) => 
                      updateNotificationPreferences({ enableSound: checked })
                    }
                    disabled={!notificationPreferences.enableNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enablePushNotifications" className="flex-1">
                    Browser notifications
                  </Label>
                  <Switch 
                    id="enablePushNotifications" 
                    checked={notificationPreferences.enablePushNotifications}
                    onCheckedChange={(checked) => {
                      updateNotificationPreferences({ enablePushNotifications: checked });
                      if (checked && 'Notification' in window && Notification.permission !== 'granted') {
                        Notification.requestPermission();
                      }
                    }}
                    disabled={!notificationPreferences.enableNotifications}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Notification Types</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableCheckInNotifications" className="flex-1">
                    Check-in notifications
                  </Label>
                  <Switch 
                    id="enableCheckInNotifications" 
                    checked={notificationPreferences.enableCheckInNotifications}
                    onCheckedChange={(checked) => 
                      updateNotificationPreferences({ enableCheckInNotifications: checked })
                    }
                    disabled={!notificationPreferences.enableNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableReviewNotifications" className="flex-1">
                    Review notifications
                  </Label>
                  <Switch 
                    id="enableReviewNotifications" 
                    checked={notificationPreferences.enableReviewNotifications}
                    onCheckedChange={(checked) => 
                      updateNotificationPreferences({ enableReviewNotifications: checked })
                    }
                    disabled={!notificationPreferences.enableNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableBlogPostNotifications" className="flex-1">
                    Blog post notifications
                  </Label>
                  <Switch 
                    id="enableBlogPostNotifications" 
                    checked={notificationPreferences.enableBlogPostNotifications}
                    onCheckedChange={(checked) => 
                      updateNotificationPreferences({ enableBlogPostNotifications: checked })
                    }
                    disabled={!notificationPreferences.enableNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableBillingNotifications" className="flex-1">
                    Billing notifications
                  </Label>
                  <Switch 
                    id="enableBillingNotifications" 
                    checked={notificationPreferences.enableBillingNotifications}
                    onCheckedChange={(checked) => 
                      updateNotificationPreferences({ enableBillingNotifications: checked })
                    }
                    disabled={!notificationPreferences.enableNotifications}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: number) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 dark:bg-red-950/30';
      case 'low':
        return 'bg-gray-50 dark:bg-gray-950/30';
      default:
        return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_check_in':
        return <div className="bg-blue-500 text-white p-2 rounded-full"><CheckCircle2 className="h-4 w-4" /></div>;
      case 'new_review':
      case 'review_request_sent':
        return <div className="bg-yellow-500 text-white p-2 rounded-full"><CheckCircle2 className="h-4 w-4" /></div>;
      case 'blog_post_created':
      case 'blog_post_published':
        return <div className="bg-green-500 text-white p-2 rounded-full"><CheckCircle2 className="h-4 w-4" /></div>;
      case 'system':
        return <div className="bg-purple-500 text-white p-2 rounded-full"><Settings className="h-4 w-4" /></div>;
      default:
        return <div className="bg-gray-500 text-white p-2 rounded-full"><Bell className="h-4 w-4" /></div>;
    }
  };

  // Format the date: if today, show time, otherwise show date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'h:mm a');
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  return (
    <div 
      className={cn(
        "p-4 hover:bg-muted/50 transition-colors",
        notification.read ? "opacity-70" : "bg-muted/20", 
        getPriorityColor(notification.priority)
      )}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {getTypeIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
              {formatDate(notification.createdAt)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {notification.message}
          </p>
          {notification.action && (
            <Button 
              variant="link" 
              className="h-6 p-0 text-xs mt-1" 
              asChild
            >
              <a href={notification.action.url}>{notification.action.label}</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}