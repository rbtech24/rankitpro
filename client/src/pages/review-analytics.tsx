import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Clock,
  Mail,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";

interface ReviewMetrics {
  totalRequests: number;
  responseRate: number;
  averageRating: number;
  conversionByStep: { step: string; rate: number }[];
  ratingDistribution: { rating: number; count: number; percentage: number }[];
  methodPerformance: { method: string; sent: number; responded: number; rate: number }[];
}

export default function ReviewAnalytics() {
  const [timeRange, setTimeRange] = useState("30");
  const [selectedMethod, setSelectedMethod] = useState("all");

  const { data: reviewRequests = [] } = useQuery({
    queryKey: ['/api/review-requests'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/review-requests');
      return response.json();
    }
  });

  const { data: reviewResponses = [] } = useQuery({
    queryKey: ['/api/review-responses'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/review-responses');
      return response.json();
    }
  });

  // Calculate authentic metrics from database data
  const metrics: ReviewMetrics = React.useMemo(() => {
    const totalRequests = reviewRequests.length;
    const totalResponses = reviewResponses.length;
    const responseRate = totalRequests > 0 ? (totalResponses / totalRequests) * 100 : 0;
    
    // Calculate average rating from actual responses
    const ratingsSum = reviewResponses.reduce((sum: number, response: any) => sum + (response.rating || 0), 0);
    const averageRating = totalResponses > 0 ? ratingsSum / totalResponses : 0;

    // Calculate rating distribution from real data
    const ratingCounts = [1, 2, 3, 4, 5].map(rating => {
      const count = reviewResponses.filter((response: any) => response.rating === rating).length;
      const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
      return { rating, count, percentage };
    });

    return {
      totalRequests,
      responseRate: Math.round(responseRate * 10) / 10,
      averageRating: Math.round(averageRating * 10) / 10,
      conversionByStep: [
        { step: "Request Sent", rate: totalRequests > 0 ? 100 : 0 },
        { step: "Review Submitted", rate: responseRate },
      ],
      ratingDistribution: ratingCounts,
      methodPerformance: [], // No method tracking implemented yet
    };
  }, [reviewRequests, reviewResponses]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Analytics</h1>
            <p className="text-sm text-gray-500">Track review performance and customer feedback trends.</p>
          </div>

          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.responseRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.averageRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{reviewResponses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ratings">Rating Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Request Funnel</CardTitle>
                  <CardDescription>Conversion rates through the review process</CardDescription>
                </CardHeader>
                <CardContent>
                  {metrics.conversionByStep.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={metrics.conversionByStep}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="step" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="rate" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No conversion data yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Funnel analysis will appear once review requests are sent.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                  <CardDescription>Breakdown of customer ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  {metrics.ratingDistribution.some(r => r.count > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={metrics.ratingDistribution.filter(r => r.count > 0)}
                          dataKey="count"
                          nameKey="rating"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label={({ rating, percentage }) => `${rating} stars (${percentage.toFixed(1)}%)`}
                        >
                          {metrics.ratingDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No ratings yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Rating distribution will appear once customers submit reviews.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest customer feedback</CardDescription>
              </CardHeader>
              <CardContent>
                {reviewResponses.length > 0 ? (
                  <div className="space-y-4">
                    {reviewResponses.slice(0, 10).map((review: any, index: number) => (
                      <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{review.customerName}</p>
                          {review.feedback && (
                            <p className="text-sm text-gray-600 mt-1">{review.feedback}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(review.respondedAt || review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Customer reviews will appear here once they start responding.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Trends</CardTitle>
                  <CardDescription>Average time to customer response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No time data available</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Response time trends will appear as more data is collected.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Request Status Overview</CardTitle>
                  <CardDescription>Current status of review requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Completed</span>
                      </div>
                      <Badge variant="secondary">{reviewResponses.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Pending</span>
                      </div>
                      <Badge variant="secondary">{Math.max(0, reviewRequests.length - reviewResponses.length)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Expired</span>
                      </div>
                      <Badge variant="secondary">0</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}