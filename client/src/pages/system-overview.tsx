import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import Sidebar from '@/components/layout/sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NotificationBell from '@/components/notifications/NotificationBell';
import { 
  Gauge, 
  RefreshCw, 
  Users, 
  Building, 
  CheckSquare, 
  Star, 
  Cpu, 
  Database, 
  Clock, 
  BarChart2, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  ServerOff
} from 'lucide-react';

// Sample system overview data
const systemStats = {
  totalCompanies: 287,
  activeCompanies: 254,
  totalUsers: 1893,
  totalTechnicians: 1438,
  totalCheckIns: 42857,
  totalReviews: 16243,
  avgRating: 4.7,
  
  // Server stats
  cpuUsage: 32,
  memoryUsage: 47,
  diskUsage: 29,
  activeConnections: 124,
  requestsPerMinute: 428,
  avgResponseTime: 120, // ms
  errorRate: 0.3, // %
  
  // API stats
  openaiUsageToday: 2843,
  openaiQuota: 10000,
  anthropicUsageToday: 892,
  anthropicQuota: 5000,
  xaiUsageToday: 215,
  xaiQuota: 2000,
  stripeRequestsToday: 384,
  activeSessions: 342
};

// Sample chart data - Daily check-ins over time
const checkInsData = [
  { date: '5/14', count: 154 },
  { date: '5/15', count: 163 },
  { date: '5/16', count: 142 },
  { date: '5/17', count: 178 },
  { date: '5/18', count: 156 },
  { date: '5/19', count: 129 },
  { date: '5/20', count: 189 },
  { date: '5/21', count: 167 },
];

// Sample chart data - Daily reviews over time
const reviewsData = [
  { date: '5/14', count: 62 },
  { date: '5/15', count: 71 },
  { date: '5/16', count: 59 },
  { date: '5/17', count: 82 },
  { date: '5/18', count: 65 },
  { date: '5/19', count: 58 },
  { date: '5/20', count: 79 },
  { date: '5/21', count: 74 },
];

// Sample chart data - Users by role
const usersByRoleData = [
  { name: 'Super Admins', value: 5 },
  { name: 'Company Admins', value: 450 },
  { name: 'Users', value: 1438 },
];

// Sample chart data - Companies by industry
const companiesByIndustryData = [
  { name: 'HVAC', value: 94 },
  { name: 'Plumbing', value: 78 },
  { name: 'Electrical', value: 62 },
  { name: 'Roofing', value: 24 },
  { name: 'Landscaping', value: 16 },
  { name: 'Other', value: 13 },
];

// Sample chart data - API usage over time
const apiUsageData = [
  { date: '5/14', openai: 2100, anthropic: 750, xai: 180 },
  { date: '5/15', openai: 2400, anthropic: 820, xai: 190 },
  { date: '5/16', openai: 2200, anthropic: 780, xai: 210 },
  { date: '5/17', openai: 2800, anthropic: 900, xai: 260 },
  { date: '5/18', openai: 2500, anthropic: 830, xai: 240 },
  { date: '5/19', openai: 2100, anthropic: 760, xai: 200 },
  { date: '5/20', openai: 2600, anthropic: 850, xai: 220 },
  { date: '5/21', openai: 2843, anthropic: 892, xai: 215 },
];

// Sample system alerts
const systemAlerts = [
  {
    id: 1,
    type: 'warning',
    title: 'OpenAI API Usage at 85%',
    message: 'Current usage is approaching daily quota',
    time: '28 minutes ago'
  },
  {
    id: 2,
    type: 'error',
    title: 'Database Connection Spike',
    message: 'Unusual number of database connections detected',
    time: '1 hour ago'
  },
  {
    id: 3,
    type: 'info',
    title: 'New Company Signup',
    message: 'Metro Electrical Contractors joined on Enterprise plan',
    time: '2 hours ago'
  },
  {
    id: 4,
    type: 'success',
    title: 'System Update Complete',
    message: 'All services updated to latest versions',
    time: '5 hours ago'
  }
];

// Colors for charts
const COLORS = {
  primary: '#0088d2',
  secondary: '#00b05c',
  tertiary: '#f59e0b',
  quaternary: '#ef4444',
  light: '#e5e7eb',
  dark: '#2e3538',
  openai: '#74aa9c',
  anthropic: '#5436da',
  xai: '#ff6b6b'
};

// Pie chart colors
const PIE_COLORS = ['#0088d2', '#00b05c', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const SystemOverview = () => {
  // Ordinarily we would fetch this data from the API
  // const { data: systemStats, isLoading } = useQuery({ 
  //   queryKey: ['/api/system-stats'], 
  //   staleTime: 1000 * 60, // 1 minute
  // });
  
  const lastRefreshed = new Date().toLocaleTimeString();
  
  const statusColor = (value: number, thresholds: { warning: number, critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-500';
    if (value >= thresholds.warning) return 'text-amber-500';
    return 'text-green-500';
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">System Overview</h1>
          
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">Last updated: {lastRefreshed}</p>
            <Button size="sm" variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <NotificationBell count={3} />
          </div>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart2 className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="server" className="flex items-center">
              <Cpu className="mr-2 h-4 w-4" />
              Server Performance
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center">
              <Database className="mr-2 h-4 w-4" />
              API Usage
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              System Alerts
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Building className="mx-auto h-8 w-8 text-primary" />
                    <h3 className="mt-2 font-medium text-sm">Total Companies</h3>
                    <p className="text-2xl font-bold">{systemStats.totalCompanies}</p>
                    <p className="text-xs text-green-600">{systemStats.activeCompanies} active</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Users className="mx-auto h-8 w-8 text-primary" />
                    <h3 className="mt-2 font-medium text-sm">Total Technicians</h3>
                    <p className="text-2xl font-bold">{systemStats.totalTechnicians}</p>
                    <p className="text-xs text-gray-500">{systemStats.totalUsers} total users</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckSquare className="mx-auto h-8 w-8 text-primary" />
                    <h3 className="mt-2 font-medium text-sm">Total Check-ins</h3>
                    <p className="text-2xl font-bold">{systemStats.totalCheckIns.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{checkInsData[checkInsData.length - 1].count} today</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Star className="mx-auto h-8 w-8 text-primary" />
                    <h3 className="mt-2 font-medium text-sm">Reviews</h3>
                    <div className="flex items-center justify-center">
                      <p className="text-2xl font-bold mr-2">{systemStats.avgRating}</p>
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    </div>
                    <p className="text-xs text-gray-500">{systemStats.totalReviews.toLocaleString()} total reviews</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Check-ins</CardTitle>
                  <CardDescription>Last 7 days activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={checkInsData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Check-ins" fill={COLORS.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Daily Reviews</CardTitle>
                  <CardDescription>Last 7 days activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={reviewsData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Reviews" fill={COLORS.secondary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Users by Role</CardTitle>
                  <CardDescription>Distribution of user accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={usersByRoleData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {usersByRoleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Companies by Industry</CardTitle>
                  <CardDescription>Business sector distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={companiesByIndustryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {companiesByIndustryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} companies`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Server Performance Tab */}
          <TabsContent value="server">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 relative">
                      <Gauge className="h-16 w-16 text-gray-200" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-lg font-bold ${statusColor(systemStats.cpuUsage, { warning: 70, critical: 90 })}`}>{systemStats.cpuUsage}%</span>
                      </div>
                    </div>
                    <h3 className="mt-3 font-medium text-sm">CPU Usage</h3>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 relative">
                      <Gauge className="h-16 w-16 text-gray-200" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-lg font-bold ${statusColor(systemStats.memoryUsage, { warning: 70, critical: 90 })}`}>{systemStats.memoryUsage}%</span>
                      </div>
                    </div>
                    <h3 className="mt-3 font-medium text-sm">Memory Usage</h3>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 relative">
                      <Gauge className="h-16 w-16 text-gray-200" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-lg font-bold ${statusColor(systemStats.diskUsage, { warning: 70, critical: 90 })}`}>{systemStats.diskUsage}%</span>
                      </div>
                    </div>
                    <h3 className="mt-3 font-medium text-sm">Disk Usage</h3>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 relative">
                      <Gauge className="h-16 w-16 text-gray-200" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-lg font-bold ${statusColor(systemStats.errorRate * 100, { warning: 1, critical: 5 })}`}>{systemStats.errorRate}%</span>
                      </div>
                    </div>
                    <h3 className="mt-3 font-medium text-sm">Error Rate</h3>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Sessions</CardTitle>
                  <CardDescription>Active connections and session information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                        <Users className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-2xl font-bold">{systemStats.activeSessions}</h3>
                        <p className="text-sm text-gray-500">Active Sessions</p>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                        <Database className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-2xl font-bold">{systemStats.activeConnections}</h3>
                        <p className="text-sm text-gray-500">DB Connections</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Recent Sessions by User Type</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User Type</TableHead>
                            <TableHead>Sessions</TableHead>
                            <TableHead>Avg Duration</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Super Admins</TableCell>
                            <TableCell>3</TableCell>
                            <TableCell>24 min</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Company Admins</TableCell>
                            <TableCell>47</TableCell>
                            <TableCell>18 min</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Technicians</TableCell>
                            <TableCell>292</TableCell>
                            <TableCell>12 min</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Server Performance</CardTitle>
                  <CardDescription>Response times and request volumes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                        <Activity className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-2xl font-bold">{systemStats.requestsPerMinute}</h3>
                        <p className="text-sm text-gray-500">Requests / Min</p>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                        <Clock className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-2xl font-bold">{systemStats.avgResponseTime} ms</h3>
                        <p className="text-sm text-gray-500">Avg Response Time</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Recent Response Times by Endpoint</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Endpoint</TableHead>
                            <TableHead>Avg Time (ms)</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>/api/check-ins</TableCell>
                            <TableCell>87</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-600">Healthy</Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>/api/companies</TableCell>
                            <TableCell>102</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-600">Healthy</Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>/api/analytics</TableCell>
                            <TableCell>245</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-600">Slow</Badge>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Historical Server Metrics</CardTitle>
                <CardDescription>CPU, Memory and Request Volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { time: '00:00', cpu: 25, memory: 42, requests: 250 },
                        { time: '04:00', cpu: 18, memory: 38, requests: 120 },
                        { time: '08:00', cpu: 27, memory: 43, requests: 380 },
                        { time: '12:00', cpu: 38, memory: 52, requests: 480 },
                        { time: '16:00', cpu: 35, memory: 49, requests: 460 },
                        { time: '20:00', cpu: 32, memory: 47, requests: 428 }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="cpu" name="CPU %" stroke={COLORS.primary} />
                      <Line yAxisId="left" type="monotone" dataKey="memory" name="Memory %" stroke={COLORS.secondary} />
                      <Line yAxisId="right" type="monotone" dataKey="requests" name="Requests/min" stroke={COLORS.tertiary} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* API Usage Tab */}
          <TabsContent value="api">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    OpenAI API
                    <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div 
                        className={`h-4 rounded-full ${
                          (systemStats.openaiUsageToday / systemStats.openaiQuota) > 0.85 
                            ? 'bg-red-500' 
                            : (systemStats.openaiUsageToday / systemStats.openaiQuota) > 0.7 
                              ? 'bg-amber-500' 
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${(systemStats.openaiUsageToday / systemStats.openaiQuota) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-center mt-1">
                      <p className="text-sm font-medium">
                        {Math.round((systemStats.openaiUsageToday / systemStats.openaiQuota) * 100)}% of daily quota used
                      </p>
                      <p className="text-xs text-gray-500">
                        {systemStats.openaiUsageToday.toLocaleString()} / {systemStats.openaiQuota.toLocaleString()} requests
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Model: GPT-4o
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    Anthropic API
                    <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div 
                        className="h-4 rounded-full bg-green-500"
                        style={{ width: `${(systemStats.anthropicUsageToday / systemStats.anthropicQuota) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-center mt-1">
                      <p className="text-sm font-medium">
                        {Math.round((systemStats.anthropicUsageToday / systemStats.anthropicQuota) * 100)}% of daily quota used
                      </p>
                      <p className="text-xs text-gray-500">
                        {systemStats.anthropicUsageToday.toLocaleString()} / {systemStats.anthropicQuota.toLocaleString()} requests
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Model: Claude 3.7 Sonnet
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    xAI API
                    <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div 
                        className="h-4 rounded-full bg-green-500"
                        style={{ width: `${(systemStats.xaiUsageToday / systemStats.xaiQuota) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-center mt-1">
                      <p className="text-sm font-medium">
                        {Math.round((systemStats.xaiUsageToday / systemStats.xaiQuota) * 100)}% of daily quota used
                      </p>
                      <p className="text-xs text-gray-500">
                        {systemStats.xaiUsageToday.toLocaleString()} / {systemStats.xaiQuota.toLocaleString()} requests
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Model: Grok-2
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Usage Trends</CardTitle>
                  <CardDescription>Daily usage across providers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={apiUsageData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="openai" name="OpenAI" stackId="1" stroke={COLORS.openai} fill={COLORS.openai} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="anthropic" name="Anthropic" stackId="1" stroke={COLORS.anthropic} fill={COLORS.anthropic} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="xai" name="xAI" stackId="1" stroke={COLORS.xai} fill={COLORS.xai} fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Status</CardTitle>
                  <CardDescription>Current status of all external API services</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Response Time</TableHead>
                        <TableHead>Last Check</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">OpenAI API</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-600">Operational</Badge>
                        </TableCell>
                        <TableCell>245ms</TableCell>
                        <TableCell>2 min ago</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Anthropic API</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-600">Operational</Badge>
                        </TableCell>
                        <TableCell>312ms</TableCell>
                        <TableCell>2 min ago</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">xAI API</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-600">Operational</Badge>
                        </TableCell>
                        <TableCell>278ms</TableCell>
                        <TableCell>2 min ago</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Stripe API</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-600">Operational</Badge>
                        </TableCell>
                        <TableCell>187ms</TableCell>
                        <TableCell>2 min ago</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">SendGrid API</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-600">Operational</Badge>
                        </TableCell>
                        <TableCell>203ms</TableCell>
                        <TableCell>2 min ago</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>API Usage by Company</CardTitle>
                  <CardDescription>Top AI content consuming companies</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Requests (30d)</TableHead>
                        <TableHead>Primary Model</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Metro Electrical</TableCell>
                        <TableCell>3,487</TableCell>
                        <TableCell>GPT-4o</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-600">Normal</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Ace Plumbing</TableCell>
                        <TableCell>2,854</TableCell>
                        <TableCell>Claude 3.7</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-600">Normal</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Top HVAC</TableCell>
                        <TableCell>2,316</TableCell>
                        <TableCell>GPT-4o</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-600">Normal</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">City Roofing</TableCell>
                        <TableCell>1,982</TableCell>
                        <TableCell>Grok-2</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-600">High Usage</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Green Landscaping</TableCell>
                        <TableCell>1,548</TableCell>
                        <TableCell>GPT-4o</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-600">Normal</Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* System Alerts Tab */}
          <TabsContent value="alerts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>Recent system alerts and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemAlerts.map(alert => (
                      <div key={alert.id} className="flex items-start p-3 rounded-lg border">
                        <div className="flex-shrink-0 mr-3">
                          {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                          {alert.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                          {alert.type === 'info' && <Activity className="h-5 w-5 text-blue-500" />}
                          {alert.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium">{alert.title}</h4>
                            <span className="text-xs text-gray-500">{alert.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Alert Statistics</CardTitle>
                  <CardDescription>Alert frequency and resolution metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                        <AlertTriangle className="h-7 w-7 text-amber-500 mb-2" />
                        <h3 className="text-xl font-bold">13</h3>
                        <p className="text-sm text-gray-500">Alerts Today</p>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                        <CheckCircle2 className="h-7 w-7 text-green-500 mb-2" />
                        <h3 className="text-xl font-bold">8</h3>
                        <p className="text-sm text-gray-500">Resolved Today</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Alert Types (Last 30 Days)</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">API Rate Limits</span>
                            <span className="text-sm">41%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '41%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Database Performance</span>
                            <span className="text-sm">28%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Server Load</span>
                            <span className="text-sm">18%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Other</span>
                            <span className="text-sm">13%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '13%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current status of all system components</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uptime</TableHead>
                      <TableHead>Last Incident</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Web Application</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Operational
                        </div>
                      </TableCell>
                      <TableCell>99.99%</TableCell>
                      <TableCell>15 days ago</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Database</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Operational
                        </div>
                      </TableCell>
                      <TableCell>99.97%</TableCell>
                      <TableCell>3 days ago</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">API Services</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Operational
                        </div>
                      </TableCell>
                      <TableCell>100%</TableCell>
                      <TableCell>None</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Email Service</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Operational
                        </div>
                      </TableCell>
                      <TableCell>99.98%</TableCell>
                      <TableCell>7 days ago</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">File Storage</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Operational
                        </div>
                      </TableCell>
                      <TableCell>100%</TableCell>
                      <TableCell>None</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Content Delivery Network</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Operational
                        </div>
                      </TableCell>
                      <TableCell>99.99%</TableCell>
                      <TableCell>30 days ago</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemOverview;