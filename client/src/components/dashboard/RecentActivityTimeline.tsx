import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Calendar, Star, Newspaper, RefreshCw } from "lucide-react";

interface Activity {
  id: number;
  type: 'visit_added' | 'review' | 'blog_post' | 'integration' | string;
  content: string;
  author: {
    name: string;
    role: string;
  };
  timestamp: Date;
}

// Activity timeline for recent events
const RecentActivityTimeline = () => {
  // Mock data - this would be fetched from the API in a real scenario
  const activities: Activity[] = [
    { 
      id: 1, 
      type: 'visit_added', 
      content: 'New visit added: Plumbing repair at 123 Main St',
      author: { name: 'John Smith', role: 'Technician' },
      timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    { 
      id: 2, 
      type: 'review', 
      content: 'New 5-star review from Mark Wilson', 
      author: { name: 'System', role: 'Automation' },
      timestamp: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
    },
    { 
      id: 3, 
      type: 'blog_post', 
      content: 'New blog post published: "5 Signs You Need a New Water Heater"', 
      author: { name: 'Sarah Parker', role: 'Admin' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
    },
    { 
      id: 4, 
      type: 'integration', 
      content: 'Housecall Pro integration successfully synced', 
      author: { name: 'System', role: 'Automation' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 hours ago
    },
    { 
      id: 5, 
      type: 'visit_added', 
      content: 'New visit added: HVAC maintenance at 456 Oak Ave', 
      author: { name: 'Mike Johnson', role: 'Technician' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    }
  ];
  
  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'visit_added':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'review':
        return <Star className="h-5 w-5 text-amber-500" />;
      case 'blog_post':
        return <Newspaper className="h-5 w-5 text-purple-500" />;
      case 'integration':
        return <RefreshCw className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-medium">
          <Bell className="h-5 w-5 mr-2 text-blue-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative pl-8">
                {/* Timeline connector */}
                {index < activities.length - 1 && (
                  <div className="absolute left-[1.15rem] top-[1.75rem] bottom-0 w-[2px] bg-gray-200"></div>
                )}
                
                {/* Activity dot */}
                <div className="absolute left-0 top-1 bg-white p-1 rounded-full border-2 border-gray-200">
                  {getActivityIcon(activity.type)}
                </div>
                
                {/* Activity content */}
                <div className="pl-3">
                  <p className="text-sm font-medium">{activity.content}</p>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span className="mr-2">{activity.author.name}</span>
                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                      {activity.author.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentActivityTimeline;