import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Mic, Video, MessageSquare, Star } from 'lucide-react';

interface Testimonial {
  id: number;
  customer_name: string;
  customer_email: string;
  content: string;
  type: 'audio' | 'video' | 'text';
  media_url?: string;
  status: string;
  created_at: string;
}

export default function TestimonialsList() {
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials/company/16'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/testimonials/company/16');
      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }
      return response.json();
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Mic className="w-5 h-5 text-blue-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-600" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      audio: 'bg-blue-100 text-blue-800',
      video: 'bg-purple-100 text-purple-800',
      text: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.text;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-6">Customer Testimonials</h1>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Customer Testimonials</h1>
          <Badge variant="secondary">{testimonials.length} total</Badge>
        </div>

        {testimonials.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No testimonials yet</h3>
              <p className="text-gray-500">
                Customer testimonials will appear here once they submit feedback.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(testimonial.type)}
                      <div>
                        <CardTitle className="text-lg">{testimonial.customer_name}</CardTitle>
                        <p className="text-sm text-gray-600">{testimonial.customer_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeBadge(testimonial.type)}>
                        {testimonial.type}
                      </Badge>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {testimonial.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <blockquote className="text-gray-700 italic leading-relaxed mb-4">
                    "{testimonial.content}"
                  </blockquote>
                  
                  {(testimonial.type === 'audio' || testimonial.type === 'video') && (
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                      {testimonial.type === 'audio' ? (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Mic className="w-4 h-4" />
                          <span className="text-sm">Audio testimonial available</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-purple-600">
                          <Video className="w-4 h-4" />
                          <span className="text-sm">Video testimonial available</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-500">
                      {new Date(testimonial.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className="w-4 h-4 text-yellow-400 fill-yellow-400" 
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}