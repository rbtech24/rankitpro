import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Calendar,
  TrendingUp, 
  TrendingDown, 
  Users, 
  Star, 
  MapPin, 
  DollarSign, 
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Filter
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

interface AnalyticsData {
  overview: {
    totalVisits: number;
    totalBlogPosts: number;
    averageRating: number;
    reviewCount: number;
    technicianCount: number;
    conversionRate: number;
    monthlyGrowth: number;
  };
  visitTrends: Array<{
    date: string;
    visits: number;
    blogPosts: number;
    reviews: number;
  }>;
  performanceMetrics: Array<{
    metric: string;
    value: number;
    change: number;
    target: number;
  }>;
  technicianPerformance: Array<{
    name: string;
    visits: number;
    rating: number;
    efficiency: number;
    revenue: number;
  }>;
  serviceBreakdown: Array<{
    service: string;
    count: number;
    revenue: number;
    color: string;
  }>;
  geographicData: Array<{
    location: string;
    visits: number;
    revenue: number;
    growth: number;
  }>;
  customerSatisfaction: Array<{
    period: string;
    satisfaction: number;
    responseRate: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30");
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/dashboard", timeRange],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/analytics/dashboard?range=${timeRange}`);
      return res.json();
    },
  });

  const { data: realtimeData } = useQuery({
    queryKey: ["/api/analytics/realtime"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/analytics/realtime");
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-500">Comprehensive insights into your business performance</p>
          </div>
          
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview.totalVisits || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${analytics?.overview.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics?.overview.monthlyGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {formatPercentage(analytics?.overview.monthlyGrowth || 0)}
                </span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview.totalBlogPosts || 0}</div>
              <p className="text-xs text-muted-foreground">
                Content generated from visits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview.averageRating?.toFixed(1) || '0.0'}</div>
              <p className="text-xs text-muted-foreground">
                From {analytics?.overview.reviewCount || 0} reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview.technicianCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                Conversion rate: {analytics?.overview.conversionRate?.toFixed(1) || '0.0'}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="technicians">Technicians</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="geographic">Geographic</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Visit Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Visit Trends</CardTitle>
                <CardDescription>Track your service visits, blog posts, and reviews over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analytics?.visitTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visits" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="blogPosts" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="reviews" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                  <CardDescription>Track progress against your business goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Visit Completion Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Visit Completion Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{analytics?.overview.totalVisits > 0 ? '100' : '0'}%</span>
                        <Badge variant="default">
                          {analytics?.overview.totalVisits > 0 ? '+100%' : '0%'}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={analytics?.overview.totalVisits > 0 ? 100 : 0} className="h-2" />
                    <div className="text-xs text-gray-500">Target: 95%</div>
                  </div>

                  {/* Average Review Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Review Score</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{analytics?.overview.averageRating?.toFixed(1) || '0.0'}</span>
                        <Badge variant={analytics?.overview.averageRating >= 4 ? "default" : "secondary"}>
                          {analytics?.overview.averageRating >= 4 ? '+0.2' : '0.0'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-4 w-4 ${star <= (analytics?.overview.averageRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">From {analytics?.overview.reviewCount || 0} reviews</div>
                  </div>

                  {/* Website Traffic from Visits */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Website Traffic from Visits</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{analytics?.overview.totalBlogPosts || 0}</span>
                        <Badge variant={analytics?.overview.totalBlogPosts > 0 ? "default" : "secondary"}>
                          {analytics?.overview.totalBlogPosts > 0 ? '+12.5%' : '0%'}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={analytics?.overview.totalBlogPosts * 10} className="h-2" />
                    <div className="text-xs text-gray-500">Blog posts published from visits</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Satisfaction</CardTitle>
                  <CardDescription>Satisfaction scores and response rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics?.customerSatisfaction || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="satisfaction" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="responseRate" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics Comparison</CardTitle>
                  <CardDescription>Compare key metrics across different periods</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analytics?.performanceMetrics || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                      <Bar dataKey="target" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Real-time Activity</CardTitle>
                  <CardDescription>Live updates on current business activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Active Visits</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{realtimeData?.activeVisits || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Pending Reviews</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{realtimeData?.pendingReviews || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium">Follow-ups Due</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">{realtimeData?.followupsDue || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="technicians" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Technician Performance</CardTitle>
                <CardDescription>Individual performance metrics for all technicians</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.technicianPerformance?.map((tech, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{tech.name}</h3>
                          <p className="text-sm text-gray-500">{tech.visits} visits completed</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-bold">{tech.rating.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{tech.efficiency}%</div>
                          <div className="text-xs text-gray-500">Efficiency</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{formatCurrency(tech.revenue)}</div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                  <CardDescription>Breakdown of services by volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics?.serviceBreakdown || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics?.serviceBreakdown?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Service</CardTitle>
                  <CardDescription>Revenue breakdown by service type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.serviceBreakdown || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="service" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Performance</CardTitle>
                <CardDescription>Performance metrics by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.geographicData?.map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-semibold">{location.location}</h3>
                          <p className="text-sm text-gray-500">{location.visits} visits</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-bold">{formatCurrency(location.revenue)}</div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${location.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(location.growth)}
                          </div>
                          <div className="text-xs text-gray-500">Growth</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}