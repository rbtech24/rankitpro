import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mic, Video, MessageSquare, Star, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Testimonial {
  id: number;
  customer_name: string;
  customer_email: string;
  type: 'text' | 'audio' | 'video';
  content: string;
  rating?: number;
  status: string;
  created_at: string;
  media_url?: string;
}

interface TestimonialsSectionProps {
  companyId: number;
}

export default function TestimonialsSection({ companyId }: TestimonialsSectionProps) {
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials/company', companyId],
    queryFn: async () => {
      console.log('Dashboard: Fetching testimonials for company:', companyId);
      const response = await apiRequest('GET', `/api/testimonials/company/${companyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }
      const data = await response.json();
      console.log('Dashboard: Received testimonials:', data);
      return data;
    },
    enabled: !!companyId,
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Mic className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'audio':
        return 'bg-blue-100 text-blue-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Customer Testimonials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Customer Testimonials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No testimonials yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Collect audio, video, and text testimonials from your customers
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Customer Testimonials
          </div>
          <Badge variant="secondary">{testimonials.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testimonials.slice(0, 5).map((testimonial) => (
            <div key={testimonial.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(testimonial.type)}
                    <span className="font-semibold text-gray-900">
                      {testimonial.customer_name}
                    </span>
                  </div>
                  <Badge className={getTypeBadgeColor(testimonial.type)}>
                    {testimonial.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {testimonial.rating && (
                    <>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= testimonial.rating! 
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
              
              <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                "{testimonial.content}"
              </p>
              
              {(testimonial.type === 'audio' || testimonial.type === 'video') && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Play className="w-4 h-4" />
                  <span>
                    {testimonial.type === 'audio' ? 'Audio' : 'Video'} testimonial available
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-gray-500">
                  {new Date(testimonial.created_at).toLocaleDateString()}
                </span>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {testimonials.length > 5 && (
          <div className="mt-4 text-center">
            <Button variant="outline">
              View All Testimonials ({testimonials.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}