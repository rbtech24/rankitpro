import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TestimonialRecorder } from '@/components/testimonial-recorder';
import { apiRequest } from '@/lib/queryClient';
import { 
  Video, 
  Mic, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Code, 
  Star,
  Calendar,
  User,
  MapPin,
  Plus
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Testimonial {
  id: number;
  title: string;
  customerName: string;
  customerEmail?: string;
  type: 'audio' | 'video';
  status: 'pending' | 'approved' | 'published' | 'rejected';
  rating?: number;
  location?: string;
  jobType?: string;
  duration?: number;
  storageUrl: string;
  isPublic: boolean;
  showOnWebsite: boolean;
  createdAt: string;
  approvedAt?: string;
}

export default function TestimonialsPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showRecorder, setShowRecorder] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch testimonials
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['/api/testimonials', statusFilter, typeFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      return apiRequest('GET', `/api/testimonials?${params}`);
    }
  });

  // Update testimonial status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) =>
      apiRequest('PATCH', `/api/testimonials/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      toast({ title: "Testimonial status updated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update testimonial status",
        variant: "destructive"
      });
    }
  });

  // Generate shortcode query
  const { data: shortcodeData } = useQuery({
    queryKey: ['/api/testimonials/shortcode'],
    queryFn: () => apiRequest('GET', '/api/testimonials/shortcode'),
    enabled: activeTab === 'embed'
  });

  const handleSubmitTestimonial = async (formData: FormData) => {
    try {
      await apiRequest('POST', '/api/testimonials', formData, {
        'Content-Type': 'multipart/form-data'
      });
      
      toast({ title: "Testimonial uploaded successfully" });
      setShowRecorder(false);
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload testimonial",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'outline',
      approved: 'default',
      published: 'default',
      rejected: 'destructive'
    } as const;
    
    const colors = {
      pending: 'text-yellow-600',
      approved: 'text-green-600', 
      published: 'text-blue-600',
      rejected: 'text-red-600'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
        {status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === 'published' && <Eye className="w-3 h-3 mr-1" />}
        {status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showRecorder) {
    return (
      <TestimonialRecorder
        technicianId={1} // This would be passed from context/props
        onSubmit={handleSubmitTestimonial}
        onCancel={() => setShowRecorder(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customer Testimonials</h1>
          <p className="text-gray-600 mt-2">Collect and manage video and audio testimonials from your customers</p>
        </div>
        <Button onClick={() => setShowRecorder(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Record New Testimonial
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Testimonials</TabsTrigger>
          <TabsTrigger value="embed">Embed Code</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Testimonials Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No testimonials yet</h3>
                <p className="text-gray-600 mb-6">Start collecting video and audio testimonials from your customers</p>
                <Button onClick={() => setShowRecorder(true)}>
                  Record First Testimonial
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial: Testimonial) => (
                <Card key={testimonial.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {testimonial.type === 'video' ? 
                          <Video className="w-4 h-4 text-blue-600" /> : 
                          <Mic className="w-4 h-4 text-green-600" />
                        }
                        <span className="text-sm font-medium capitalize">{testimonial.type}</span>
                      </div>
                      {getStatusBadge(testimonial.status)}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{testimonial.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Media Preview */}
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-32">
                      {testimonial.type === 'video' ? (
                        <video
                          src={testimonial.storageUrl}
                          className="max-w-full max-h-full rounded"
                          controls={false}
                          poster=""
                        />
                      ) : (
                        <div className="text-center">
                          <Mic className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Audio Testimonial</p>
                        </div>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{testimonial.customerName}</span>
                        {testimonial.rating && (
                          <div className="flex items-center gap-1 ml-auto">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{testimonial.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      {testimonial.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{testimonial.location}</span>
                        </div>
                      )}
                      
                      {testimonial.duration && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(testimonial.duration)}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(testimonial.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {testimonial.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ id: testimonial.id, status: 'approved' })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ id: testimonial.id, status: 'rejected' })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {testimonial.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: testimonial.id, status: 'published' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Publish
                        </Button>
                      )}
                      
                      {testimonial.status === 'published' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ id: testimonial.id, status: 'approved' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <EyeOff className="w-4 h-4 mr-1" />
                          Unpublish
                        </Button>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{testimonial.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {testimonial.type === 'video' ? (
                              <video
                                src={testimonial.storageUrl}
                                controls
                                className="w-full rounded-lg"
                              />
                            ) : (
                              <audio
                                src={testimonial.storageUrl}
                                controls
                                className="w-full"
                              />
                            )}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Customer:</span> {testimonial.customerName}
                              </div>
                              {testimonial.rating && (
                                <div>
                                  <span className="font-medium">Rating:</span> {'⭐'.repeat(testimonial.rating)}
                                </div>
                              )}
                              {testimonial.location && (
                                <div>
                                  <span className="font-medium">Location:</span> {testimonial.location}
                                </div>
                              )}
                              {testimonial.jobType && (
                                <div>
                                  <span className="font-medium">Service:</span> {testimonial.jobType}
                                </div>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="embed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                WordPress Shortcode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Copy and paste this shortcode into any WordPress post or page to display your testimonials.
              </p>
              {shortcodeData && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <code className="text-sm break-all">
                    {shortcodeData.wordpress_shortcode}
                  </code>
                </div>
              )}
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Available parameters:</p>
                <ul className="space-y-1">
                  <li>• <code>location="Miami"</code> - Filter by location</li>
                  <li>• <code>service="HVAC"</code> - Filter by service type</li>
                  <li>• <code>type="video"</code> - Show only video or audio</li>
                  <li>• <code>limit="3"</code> - Maximum number to display</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>JavaScript Embed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                For non-WordPress websites, use this JavaScript code to embed testimonials.
              </p>
              {shortcodeData && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    <code>{shortcodeData.javascript_embed}</code>
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Testimonials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{testimonials.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {testimonials.filter((t: Testimonial) => t.status === 'published').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {testimonials.filter((t: Testimonial) => t.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testimonials
                  .sort((a: Testimonial, b: Testimonial) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((testimonial: Testimonial) => (
                    <div key={testimonial.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        {testimonial.type === 'video' ? 
                          <Video className="w-4 h-4 text-blue-600" /> : 
                          <Mic className="w-4 h-4 text-green-600" />
                        }
                        <div>
                          <p className="font-medium">{testimonial.title}</p>
                          <p className="text-sm text-gray-600">by {testimonial.customerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(testimonial.status)}
                        <span className="text-sm text-gray-500">
                          {new Date(testimonial.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}