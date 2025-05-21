import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface NotificationBellProps {
  count?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ count = 5 }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Sample notifications
  const notifications = [
    {
      id: 1,
      title: "New Company Sign-up",
      message: "Top HVAC Solutions has signed up for the Professional plan",
      time: "15 minutes ago"
    },
    {
      id: 2,
      title: "Payment Failed",
      message: "City Roofing Experts had a failed payment attempt",
      time: "2 hours ago"
    },
    {
      id: 3,
      title: "API Rate Limit Warning",
      message: "API rate limit for OpenAI is at 80% of daily quota",
      time: "50 minutes ago"
    }
  ];
  
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
          {count > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500"
              variant="secondary"
            >
              {count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <Card className="border-0">
          <CardContent className="p-0">
            <div className="py-2 px-4 border-b">
              <h3 className="font-medium">Notifications</h3>
            </div>
            <div className="max-h-[300px] overflow-auto">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className="p-3 border-b hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium">{notification.title}</h4>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t p-2 flex justify-center">
            <Button variant="ghost" size="sm" className="w-full text-sm">
              View All
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;