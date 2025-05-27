import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Calendar, Star, Newspaper, RefreshCw, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
  // Fetch real visits data
  const { data: visits, isLoading: visitsLoading } = useQuery({
    queryKey: ["/api/visits"],
  });

  // Fetch real blog posts
  const { data: blogPosts, isLoading: blogLoading } = useQuery({
    queryKey: ["/api/blog-posts"],
  });

  // Fetch real review responses
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/review-responses"],
  });

  // Fetch technicians for names
  const { data: technicians } = useQuery({
    queryKey: ["/api/technicians"],
  });

  const isLoading = visitsLoading || blogLoading || reviewsLoading;

  // Convert real data to activity format
  const activities: Activity[] = React.useMemo(() => {
    const allActivities: Activity[] = [];

    // Add recent visits
    if (visits) {
      visits.slice(0, 3).forEach((visit: any) => {
        const technician = technicians?.find((t: any) => t.id === visit.technicianId);
        allActivities.push({
          id: `visit-${visit.id}`,
          type: 'visit_added',
          content: `New visit: ${visit.jobType} ${visit.address ? `at ${visit.address}` : ''}`.trim(),
          author: { 
            name: technician?.name || 'Technician', 
            role: 'Technician' 
          },
          timestamp: new Date(visit.createdAt)
        });
      });
    }

    // Add recent blog posts
    if (blogPosts) {
      blogPosts.slice(0, 2).forEach((post: any) => {
        allActivities.push({
          id: `blog-${post.id}`,
          type: 'blog_post',
          content: `New blog post published: "${post.title}"`,
          author: { name: 'System', role: 'AI Content' },
          timestamp: new Date(post.createdAt)
        });
      });
    }

    // Add recent reviews
    if (reviews) {
      reviews.slice(0, 3).forEach((review: any) => {
        const stars = '★'.repeat(review.rating);
        allActivities.push({
          id: `review-${review.id}`,
          type: 'review',
          content: `New ${review.rating}-star review from ${review.customerName} ${stars}`,
          author: { name: 'Customer', role: 'Review' },
          timestamp: new Date(review.respondedAt)
        });
      });
    }

    // Sort by most recent first
    return allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8); // Show only the 8 most recent activities
  }, [visits, blogPosts, reviews, technicians]);
  
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
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-600">Loading activities...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Bell className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">No recent activity</p>
            <p className="text-xs text-gray-400 mt-1">
              Activity will appear here when you have visits, reviews, or blog posts
            </p>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityTimeline;