import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Card,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'wouter';

interface NotificationBellProps {
  count?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };
  
  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
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
      <PopoverContent className="w-80" align="end">
        <Card>
          <CardContent className="p-0">
            <div className="p-3 border-b">
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="max-h-[300px] overflow-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-xs mt-1">You'll see updates about visits, reviews, and system activity here</p>
                </div>
              ) : (
                notifications.slice(0, 5).map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-3 border-b hover:bg-slate-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <span className="text-xs text-gray-500">{formatTimeAgo(notification.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t p-2 flex justify-center">
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="w-full text-sm" onClick={() => setIsOpen(false)}>
                View All
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;