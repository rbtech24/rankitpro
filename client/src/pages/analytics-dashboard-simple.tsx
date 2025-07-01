import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "ui/card";
import { Button } from "ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "ui/tabs";
import { Badge } from "ui/badge";
import { Progress } from "ui/progress";
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
  TrendingUp, 
  TrendingDown, 
  Users, 
  Star, 
  MapPin, 
  Activity,
  CheckCircle,
  AlertCircle,
  Download,
  Filter
} from "lucide-react";
import { getCurrentUser, AuthState } from "auth";

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30");
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });

  const { data: visits } = useQuery({
    queryKey: ["/api/check-ins"],
  });

  const { data: blogPosts } = useQuery({
    queryKey: ["/api/blog-posts"],
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/reviews"],
  });

  const { data: technicians } = useQuery({
    queryKey: ["/api/technicians"],
  });

  // Calculate metrics from real data
  const totalVisits = visits?.length || 0;
  const totalBlogPosts = blogPosts?.length || 0;
  const totalReviews = reviews?.length || 0;
  const totalTechnicians = technicians?.length || 0;

  const averageRating = totalReviews > 0 
    ? (reviews?.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const conversionRate = totalVisits > 0 
    ? ((totalReviews / totalVisits) * 100).toFixed(1)
    : "0.0";

  // Generate trend data from real visits
  const generateTrendData = () => {
    const data = [];
    const days = parseInt(timeRange);
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayVisits = visits?.filter(v => 
        v.createdAt?.startsWith(dateStr)
      ).length || 0;
      
      const dayBlogPosts = blogPosts?.filter(b => 
        b.createdAt?.startsWith(dateStr)
      ).length || 0;
      
      const dayReviews = reviews?.filter(r => 
        r.createdAt?.startsWith(dateStr)
      ).length || 0;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        visits: dayVisits,
        blogPosts: dayBlogPosts,
        reviews: dayReviews
      });
    }
    
    return data;
  };

  const trendData = generateTrendData();

  // Performance metrics from real data
  const performanceMetrics = [
    {
      metric: "Visit Completion Rate",
      value: visits?.length > 0 ? Math.round((visits.filter(v => v.summary).length / visits.length) * 100) : 0,
      target: 95,
      color: "bg-blue-500"
    },
    {
      metric: "Blog Generation Rate", 
      value: totalVisits > 0 ? Math.round((totalBlogPosts / totalVisits) * 100) : 0,
      target: 75,
      color: "bg-green-500"
    },
    {
      metric: "Review Response Rate",
      value: Math.round(parseFloat(conversionRate)),
      target: 20,
      color: "bg-yellow-500"
    },
    {
      metric: "Customer Satisfaction",
      value: Math.round((parseFloat(averageRating) / 5) * 100),
      target: 90,
      color: "bg-purple-500"
    }
  ];

  // Service breakdown from job types
  const serviceBreakdown = visits?.reduce((acc, visit) => {
    const jobType = visit.jobType || "General Service";
    acc[jobType] = (acc[jobType] || 0) + 1;
    return acc;
  }, {}) || {};

  const serviceData = Object.entries(serviceBreakdown).map(([service, count], index) => ({
    service,
    count,
    revenue: count * 150,
    color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]
  }));

  // Technician performance from real data
  const technicianPerformance = technicians?.map(tech => {
    const techVisits = visits?.filter(v => v.technicianId === tech.id) || [];
    const techReviews = reviews?.filter(r => {
      const visit = visits?.find(v => v.id === r.visitId);
      return visit && visit.technicianId === tech.id;
    }) || [];
    
    const rating = techReviews.length > 0 
      ? techReviews.reduce((sum, r) => sum + r.rating, 0) / techReviews.length 
      : 0;
    
    return {
      name: tech.name || tech.username,
      visits: techVisits.length,
      rating: rating.toFixed(1),
      efficiency: techVisits.length > 0 ? Math.round((techVisits.filter(v => v.summary).length / techVisits.length) * 100) : 0,
      revenue: techVisits.length * 150
    };
  }) || [];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getChangeIcon = (change) => {
    return change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const getChangeColor = (change) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-500">Real-time insights into your business performance</p>
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
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
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
              <div className="text-2xl font-bold">{totalVisits}</div>
              <p className="text-xs text-muted-foreground">
                Active service visits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBlogPosts}</div>
              <p className="text-xs text-muted-foreground">
                Generated from visits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating}</div>
              <p className="text-xs text-muted-foreground">
                From {totalReviews} reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Technicians</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTechnicians}</div>
              <p className="text-xs text-muted-foreground">
                Review rate: {conversionRate}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="technicians">Technicians</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Visit Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Trends</CardTitle>
                <CardDescription>Track your visits, blog posts, and reviews over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visits" stroke="#0088d2" strokeWidth={2} name="Visits" />
                    <Line type="monotone" dataKey="blogPosts" stroke="#00b05c" strokeWidth={2} name="Blog Posts" />
                    <Line type="monotone" dataKey="reviews" stroke="#ffc658" strokeWidth={2} name="Reviews" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key business indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <span className="text-sm font-bold">{metric.value}%</span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                      <div className="text-xs text-gray-500">Target: {metric.target}%</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest business activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Completed Visits</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {visits?.filter(v => v.summary).length || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Blog Posts Created</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{totalBlogPosts}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium">Reviews Received</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">{totalReviews}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics Comparison</CardTitle>
                <CardDescription>Track your progress against targets</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#0088d2" name="Current" />
                    <Bar dataKey="target" fill="#00b05c" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technicians" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Technician Performance</CardTitle>
                <CardDescription>Individual performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {technicianPerformance.map((tech, index) => (
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
                          <div className="text-lg font-bold">{tech.rating}</div>
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
                  <CardDescription>Breakdown by service type</CardDescription>
                </CardHeader>
                <CardContent>
                  {serviceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={serviceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ service, percent }) => `${service} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {serviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      No service data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Service</CardTitle>
                  <CardDescription>Revenue breakdown by service type</CardDescription>
                </CardHeader>
                <CardContent>
                  {serviceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={serviceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="service" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="revenue" fill="#0088d2" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      No revenue data available yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}