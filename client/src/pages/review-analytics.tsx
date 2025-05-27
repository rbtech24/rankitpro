import { useState } from "react";
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
import { Button } from "@/components/ui/button";
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  ArrowRight,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Star,
  TrendingUp,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Filter,
} from "lucide-react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface ReviewJourneyStep {
  id: string;
  label: string;
  status: "completed" | "current" | "pending" | "skipped";
  timestamp?: Date;
  method?: "email" | "sms";
  responseRate?: number;
  avgTimeToNext?: number;
}

interface CustomerJourney {
  customerId: string;
  customerName: string;
  steps: ReviewJourneyStep[];
  currentStep: number;
  finalRating?: number;
  totalDuration: number;
  touchpoints: number;
}

interface ReviewMetrics {
  totalRequests: number;
  responseRate: number;
  averageRating: number;
  conversionByStep: { step: string; rate: number }[];
  timeToResponse: { day: string; avgHours: number }[];
  methodPerformance: { method: string; sent: number; responded: number; rate: number }[];
  ratingDistribution: { rating: number; count: number; percentage: number }[];
  journeyDropoff: { step: string; entered: number; completed: number; dropoffRate: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ReviewAnalytics() {
  const [timeRange, setTimeRange] = useState("30");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [selectedTechnician, setSelectedTechnician] = useState("all");

  // API queries with filters
  const { data: metrics } = useQuery<ReviewMetrics>({
    queryKey: ["/api/review-analytics/metrics", { timeRange, selectedMethod, selectedTechnician }],
  });

  const { data: journeys = [] } = useQuery<CustomerJourney[]>({
    queryKey: ["/api/review-analytics/journeys", { timeRange, selectedMethod, selectedTechnician }],
  });

  const { data: technicians = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["/api/technicians"],
  });

  // Mock data for demonstration - this would come from your API
  const mockMetrics: ReviewMetrics = {
    totalRequests: 156,
    responseRate: 68.5,
    averageRating: 4.6,
    conversionByStep: [
      { step: "Request Sent", rate: 100 },
      { step: "Email Opened", rate: 78 },
      { step: "Link Clicked", rate: 45 },
      { step: "Review Started", rate: 32 },
      { step: "Review Submitted", rate: 28 },
    ],
    timeToResponse: [
      { day: "Day 1", avgHours: 6 },
      { day: "Day 2", avgHours: 18 },
      { day: "Day 3", avgHours: 24 },
      { day: "Day 4", avgHours: 36 },
      { day: "Day 5", avgHours: 48 },
      { day: "Day 6", avgHours: 72 },
      { day: "Day 7+", avgHours: 120 },
    ],
    methodPerformance: [
      { method: "Email", sent: 98, responded: 71, rate: 72.4 },
      { method: "SMS", sent: 58, responded: 36, rate: 62.1 },
    ],
    ratingDistribution: [
      { rating: 5, count: 45, percentage: 42.1 },
      { rating: 4, count: 32, percentage: 29.9 },
      { rating: 3, count: 18, percentage: 16.8 },
      { rating: 2, count: 8, percentage: 7.5 },
      { rating: 1, count: 4, percentage: 3.7 },
    ],
    journeyDropoff: [
      { step: "Request Sent", entered: 156, completed: 156, dropoffRate: 0 },
      { step: "Email/SMS Delivered", entered: 156, completed: 148, dropoffRate: 5.1 },
      { step: "Opened/Viewed", entered: 148, completed: 115, dropoffRate: 22.3 },
      { step: "Clicked Review Link", entered: 115, completed: 68, dropoffRate: 40.9 },
      { step: "Started Review", entered: 68, completed: 52, dropoffRate: 23.5 },
      { step: "Completed Review", entered: 52, completed: 44, dropoffRate: 15.4 },
    ],
  };

  const mockJourneys: CustomerJourney[] = [
    {
      customerId: "1",
      customerName: "Sarah Johnson",
      currentStep: 5,
      finalRating: 5,
      totalDuration: 1440, // 24 hours in minutes
      touchpoints: 1,
      steps: [
        {
          id: "sent",
          label: "Request Sent",
          status: "completed",
          timestamp: new Date(Date.now() - 1440 * 60 * 1000),
          method: "email",
        },
        {
          id: "delivered",
          label: "Email Delivered",
          status: "completed",
          timestamp: new Date(Date.now() - 1430 * 60 * 1000),
        },
        {
          id: "opened",
          label: "Email Opened",
          status: "completed",
          timestamp: new Date(Date.now() - 1200 * 60 * 1000),
        },
        {
          id: "clicked",
          label: "Review Link Clicked",
          status: "completed",
          timestamp: new Date(Date.now() - 1190 * 60 * 1000),
        },
        {
          id: "completed",
          label: "Review Completed",
          status: "completed",
          timestamp: new Date(Date.now() - 1180 * 60 * 1000),
        },
      ],
    },
    {
      customerId: "2",
      customerName: "Mike Chen",
      currentStep: 3,
      totalDuration: 2880, // 48 hours in minutes
      touchpoints: 2,
      steps: [
        {
          id: "sent",
          label: "Request Sent",
          status: "completed",
          timestamp: new Date(Date.now() - 2880 * 60 * 1000),
          method: "sms",
        },
        {
          id: "delivered",
          label: "SMS Delivered",
          status: "completed",
          timestamp: new Date(Date.now() - 2870 * 60 * 1000),
        },
        {
          id: "opened",
          label: "SMS Viewed",
          status: "completed",
          timestamp: new Date(Date.now() - 2400 * 60 * 1000),
        },
        {
          id: "clicked",
          label: "Review Link Clicked",
          status: "current",
        },
        {
          id: "completed",
          label: "Review Completed",
          status: "pending",
        },
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "current":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-gray-400" />;
      case "skipped":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
  };

  const JourneyVisualization = ({ journey }: { journey: CustomerJourney }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">{journey.customerName}</CardTitle>
            <CardDescription>
              Journey Duration: {formatDuration(journey.totalDuration)} • 
              Touchpoints: {journey.touchpoints}
              {journey.finalRating && (
                <span className="ml-2 inline-flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                  {journey.finalRating}/5
                </span>
              )}
            </CardDescription>
          </div>
          <Badge variant={journey.finalRating ? "default" : "secondary"}>
            {journey.finalRating ? "Completed" : "In Progress"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 overflow-x-auto pb-4">
          {journey.steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center min-w-[120px]">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2
                  ${step.status === "completed" ? "bg-green-100 border-green-500" :
                    step.status === "current" ? "bg-blue-100 border-blue-500" :
                    step.status === "skipped" ? "bg-red-100 border-red-500" :
                    "bg-gray-100 border-gray-300"
                  }
                `}>
                  {getStatusIcon(step.status)}
                </div>
                <div className="text-sm font-medium text-center mt-2">{step.label}</div>
                {step.timestamp && (
                  <div className="text-xs text-gray-500 text-center">
                    {format(step.timestamp, "MMM d, h:mm a")}
                  </div>
                )}
                {step.method && (
                  <div className="text-xs text-blue-600 mt-1 flex items-center">
                    {step.method === "email" ? <Mail className="h-3 w-3 mr-1" /> : <Phone className="h-3 w-3 mr-1" />}
                    {step.method.toUpperCase()}
                  </div>
                )}
              </div>
              {index < journey.steps.length - 1 && (
                <ArrowRight className={`h-4 w-4 mx-2 ${
                  step.status === "completed" ? "text-green-500" : "text-gray-300"
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Review Analytics & Customer Journey</h1>
          <div className="flex space-x-4">
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
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="sms">SMS Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{mockMetrics.totalRequests}</CardTitle>
              <CardDescription>Total Requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-600 flex items-center">
                <TrendingUp className="mr-1 h-4 w-4" />
                +12% from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{mockMetrics.responseRate}%</CardTitle>
              <CardDescription>Response Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-600 flex items-center">
                <TrendingUp className="mr-1 h-4 w-4" />
                +5.2% from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{mockMetrics.averageRating}</CardTitle>
              <CardDescription>Average Rating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(mockMetrics.averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">36h</CardTitle>
              <CardDescription>Avg. Response Time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-600 flex items-center">
                <TrendingUp className="mr-1 h-4 w-4" />
                -8h from last period
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="funnel" className="space-y-4">
          <TabsList>
            <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
            <TabsTrigger value="journeys">Customer Journeys</TabsTrigger>
            <TabsTrigger value="performance">Method Performance</TabsTrigger>
            <TabsTrigger value="ratings">Rating Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Request Funnel</CardTitle>
                  <CardDescription>Step-by-step conversion rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockMetrics.conversionByStep}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="step" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, "Conversion Rate"]} />
                      <Bar dataKey="rate" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Journey Dropoff Analysis</CardTitle>
                  <CardDescription>Where customers drop off in the process</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockMetrics.journeyDropoff.map((step, index) => (
                      <div key={step.step} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{step.step}</span>
                          <span>{step.completed}/{step.entered} ({(100 - step.dropoffRate).toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${100 - step.dropoffRate}%` }}
                          />
                        </div>
                        {step.dropoffRate > 0 && (
                          <div className="text-xs text-red-600">
                            {step.dropoffRate.toFixed(1)}% dropoff rate
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="journeys">
            <Card>
              <CardHeader>
                <CardTitle>Individual Customer Journeys</CardTitle>
                <CardDescription>
                  Visual timeline of each customer's review request experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockJourneys.map((journey) => (
                    <JourneyVisualization key={journey.customerId} journey={journey} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Method Performance Comparison</CardTitle>
                  <CardDescription>Email vs SMS effectiveness</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockMetrics.methodPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="method" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sent" fill="#8884d8" name="Sent" />
                      <Bar dataKey="responded" fill="#82ca9d" name="Responded" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Time Distribution</CardTitle>
                  <CardDescription>When customers typically respond</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockMetrics.timeToResponse}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} hours`, "Avg Response Time"]} />
                      <Area type="monotone" dataKey="avgHours" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ratings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                  <CardDescription>How customers rate your service</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockMetrics.ratingDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.rating}★ (${entry.percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {mockMetrics.ratingDistribution.map((entry, index) => (
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
                  <CardTitle>Rating Breakdown</CardTitle>
                  <CardDescription>Detailed rating statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockMetrics.ratingDistribution.reverse().map((rating) => (
                      <div key={rating.rating} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center">
                            <span className="mr-2">{rating.rating}</span>
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          </div>
                          <span>{rating.count} reviews ({rating.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${rating.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
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