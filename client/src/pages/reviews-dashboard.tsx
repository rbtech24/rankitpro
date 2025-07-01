import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '../lib/queryClient';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, BarChart, PieChart } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Skeleton } from '../components/ui/skeleton';

// For chart display
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function ReviewsDashboard() {
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  
  // Get auth information from query cache
  const { data: auth } = useQuery<any>({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/auth/me');
      return response.json();
    }
  });
  const [sortOrder, setSortOrder] = useState('newest');
  const [starFilter, setStarFilter] = useState<number | null>(null);

  // Fetch review responses for the company
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['/api/review-response/company', auth?.user?.companyId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/review-response/company/${auth?.user?.companyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
    enabled: !!auth?.user?.companyId,
  });

  // Fetch review statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/review-response/stats', auth?.user?.companyId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/review-response/stats/${auth?.user?.companyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch review statistics');
      }
      return response.json();
    },
    enabled: !!auth?.user?.companyId,
  });

  // Filter and sort reviews based on current settings
  const filteredReviews = reviews?.filter((review: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'public' && review.publicDisplay) return true;
    if (activeTab === 'private' && !review.publicDisplay) return true;
    
    if (starFilter && review.rating !== starFilter) return false;
    
    return false;
  }).sort((a: any, b: any) => {
    if (sortOrder === 'newest') {
      return new Date(b.respondedAt).getTime() - new Date(a.respondedAt).getTime();
    } else if (sortOrder === 'oldest') {
      return new Date(a.respondedAt).getTime() - new Date(b.respondedAt).getTime();
    } else if (sortOrder === 'highest') {
      return b.rating - a.rating;
    } else if (sortOrder === 'lowest') {
      return a.rating - b.rating;
    }
    return 0;
  });

  // Prepare data for rating distribution chart
  const ratingChartData = stats ? Object.entries(stats.ratingDistribution).map(([rating, count]) => ({
    name: `${rating} ★`,
    value: count,
    fill: getRatingColor(parseInt(rating)),
  })) : [];

  // Colors for the pie chart
  const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884d8'];

  function getRatingColor(rating: number) {
    if (rating <= 1) return '#f87171'; // red
    if (rating <= 2) return '#fbbf24'; // amber
    if (rating <= 3) return '#fcd34d'; // yellow
    if (rating <= 4) return '#4ade80'; // green
    return '#22c55e'; // emerald
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  }
  
  function getInitials(name: string) {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Customer Reviews</h1>
              <p className="text-muted-foreground">Manage and analyze customer feedback</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setLocation('/reviews-settings')}>
                Settings
              </Button>
              <Button variant="outline" onClick={() => setLocation('/review-request')}>
                Send Review Request
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-12 w-20" />
                ) : (
                  <div className="flex items-center">
                    <span className="text-3xl font-bold">{stats?.averageRating.toFixed(1) || 0}</span>
                    <div className="flex ml-2 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-5 w-5 ${star <= Math.round(stats?.averageRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Total Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-12 w-20" />
                ) : (
                  <div className="flex items-center">
                    <span className="text-3xl font-bold">{stats?.totalResponses || 0}</span>
                    <MessageSquare className="ml-2 h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Recommendation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-12 w-24" />
                ) : (
                  <div className="flex items-center">
                    <span className="text-3xl font-bold">
                      {stats ? Math.round(((stats.ratingDistribution['4'] || 0) + (stats.ratingDistribution['5'] || 0)) / stats.totalResponses * 100) : 0}%
                    </span>
                    <ThumbsUp className="ml-2 h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>Breakdown of customer ratings</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={ratingChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Rating Percentage</CardTitle>
                <CardDescription>Distribution by percentage</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={ratingChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {ratingChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Reviews List */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>All reviews from your customers</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select defaultValue={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="highest">Highest Rating</SelectItem>
                      <SelectItem value="lowest">Lowest Rating</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    defaultValue={starFilter?.toString() || 'all'} 
                    onValueChange={(value) => setStarFilter(value === 'all' ? null : parseInt(value))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Reviews</TabsTrigger>
                  <TabsTrigger value="public">Public Only</TabsTrigger>
                  <TabsTrigger value="private">Private Only</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab}>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <div className="flex gap-4">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredReviews?.length > 0 ? (
                    <div className="space-y-4">
                      {filteredReviews.map((review: any) => (
                        <Card key={review.id}>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="flex-shrink-0">
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback>{getInitials(review.customerName)}</AvatarFallback>
                                </Avatar>
                              </div>
                              
                              <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{review.customerName}</h3>
                                    <div className="flex items-center">
                                      <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star 
                                            key={star} 
                                            className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm text-muted-foreground ml-2">
                                        {formatDate(review.respondedAt)}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Badge variant={review.publicDisplay ? "default" : "outline"}>
                                      {review.publicDisplay ? "Public" : "Private"}
                                    </Badge>
                                    
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          •••
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                        <DropdownMenuItem>
                                          {review.publicDisplay ? "Make Private" : "Make Public"}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                          Remove
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                                
                                {review.feedback && (
                                  <p className="text-sm text-gray-700">{review.feedback}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No reviews found</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {starFilter 
                          ? `No ${starFilter}-star reviews found.` 
                          : `No reviews match the current filter.`}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}