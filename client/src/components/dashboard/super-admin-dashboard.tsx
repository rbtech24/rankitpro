import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { useLocation } from "wouter";
import { 
  Users, 
  Building2, 
  CreditCard, 
  Settings,
  BarChart3,
  Shield,
  Database,
  Server,
  Activity,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Package
} from "lucide-react";

interface Company {
  id: number;
  name: string;
  plan: string;
  usageLimit: number;
  currentUsage: number;
  active: boolean;
  createdAt: string;
  userCount: number;
}

interface SystemStats {
  totalCompanies: number;
  totalUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export default function SuperAdminDashboard() {
  const [, setLocation] = useLocation();

  // Fetch comprehensive analytics dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/admin/analytics/dashboard'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/analytics/dashboard');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch companies data with detailed metrics
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/admin/companies/detailed'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/companies/detailed');
      return response.json();
    }
  });

  // Extract data from the comprehensive dashboard response
  const systemStats = dashboardData?.systemStats;
  const financialMetrics = dashboardData?.financialMetrics;
  const recentActivities = dashboardData?.recentActivities || [];
  const chartData = dashboardData?.chartData || {};
  const subscriptionBreakdown = dashboardData?.subscriptionBreakdown || [];
  const systemHealth = dashboardData?.systemHealth;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const SystemOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold">{systemStats?.totalCompanies || 0}</p>
              <p className="text-xs text-gray-500">
                {systemStats?.activeCompanies || 0} active
              </p>
            </div>
            <Building2 className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{systemStats?.totalUsers || 0}</p>
              <p className="text-xs text-gray-500">
                {systemStats?.totalTechnicians || 0} technicians
              </p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold">
                ${(financialMetrics?.monthlyRecurringRevenue || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                ${(financialMetrics?.totalRevenue || 0).toLocaleString()} total
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <div className="flex items-center gap-2">
                {systemHealth?.status === 'healthy' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : systemHealth?.status === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  systemHealth?.status === 'healthy' ? 'text-green-600' :
                  systemHealth?.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {systemHealth?.status || 'Unknown'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {systemHealth?.memoryUsage || 'N/A'} memory
              </p>
            </div>
            <Server className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const CompaniesTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Company Management</CardTitle>
        <CardDescription>
          Manage all companies and their subscription status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>
                  <Badge variant={company.plan === 'agency' ? 'default' : 'secondary'}>
                    {company.plan}
                  </Badge>
                </TableCell>
                <TableCell>{company.userCount || 0}</TableCell>
                <TableCell>
                  <Badge variant={company.active ? 'default' : 'destructive'}>
                    {company.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(company.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation(`/admin/companies/${company.id}`)}
                  >
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const SubscriptionPlansCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Subscription Plans Management
        </CardTitle>
        <CardDescription>
          Configure and manage subscription plans for all companies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Starter Plan</h3>
              <p className="text-2xl font-bold mb-1">$29/month</p>
              <p className="text-sm text-gray-500 mb-3">Up to 3 technicians, 100 check-ins</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setLocation("/admin/subscription-plans/starter")}
              >
                Configure
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Professional Plan</h3>
              <p className="text-2xl font-bold mb-1">$79/month</p>
              <p className="text-sm text-gray-500 mb-3">Up to 10 technicians, 500 check-ins</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setLocation("/admin/subscription-plans/professional")}
              >
                Configure
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Agency Plan</h3>
              <p className="text-2xl font-bold mb-1">$199/month</p>
              <p className="text-sm text-gray-500 mb-3">Unlimited technicians, unlimited check-ins</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setLocation("/admin/subscription-plans/agency")}
              >
                Configure
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              onClick={() => setLocation("/admin/subscription-plans")}
              className="w-full"
            >
              Manage All Subscription Plans
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SystemHealthCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Database</p>
                <p className="text-sm text-gray-500">PostgreSQL Connection</p>
              </div>
            </div>
            <Badge variant="default">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Healthy
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">API Services</p>
                <p className="text-sm text-gray-500">All endpoints responding</p>
              </div>
            </div>
            <Badge variant="default">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Healthy
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">Security</p>
                <p className="text-sm text-gray-500">Authentication & Authorization</p>
              </div>
            </div>
            <Badge variant="default">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-600">Manage companies, users, and platform operations</p>
        </div>
        <Button onClick={() => setLocation("/admin/settings")}>
          <Settings className="h-4 w-4 mr-2" />
          System Settings
        </Button>
      </div>

      <SystemOverviewCards />

      <Tabs defaultValue="companies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <CompaniesTable />
        </TabsContent>

        <TabsContent value="health">
          <SystemHealthCard />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Platform Analytics
              </CardTitle>
              <CardDescription>
                System-wide usage and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-500 mb-4">
                  View comprehensive analytics and reporting
                </p>
                <Button onClick={() => setLocation("/admin/analytics")}>
                  View Full Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}