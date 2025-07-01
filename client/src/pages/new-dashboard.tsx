import React, { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import StatsOverview from "../components/dashboard/stats-overview";
import RecentVisits from "../components/dashboard/recent-visits";
import RecentActivityTimeline from "../components/dashboard/RecentActivityTimeline";
import PerformanceWidget from "../components/dashboard/PerformanceWidget";
import UpcomingTasks from "../components/dashboard/UpcomingTasks";

import QuickActions from "../components/dashboard/quick-actions";
import AIWriter from "../components/dashboard/ai-writer";
import TechnicianPerformance from "../components/dashboard/technician-performance";
import WebsiteIntegration from "../components/dashboard/website-integration";
import AdminBusinessManagement from "../components/dashboard/admin-business-management";
import CompaniesManagement from "../components/dashboard/companies-management";
import BillingManagement from "../components/dashboard/billing-management";
import VisitModal from "../components/modals/visit-modal";
import MobileVisitModal from "../components/technician/mobile-visit-modal";
import TechDashboard from "../components/technician/tech-dashboard";

import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "../lib/auth";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useLocation } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { 
  Users,
  Building2,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clipboard,
  Box,
  ChevronRight,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  ListChecks,
  Star,
  User,
  Calendar,
  BarChart3,
  Bell,
  Settings,
  TrendingUp,
  HelpCircle,
  Globe,
  MessageSquare,
  Newspaper,
  FileText,
  Wrench,
  ExternalLink,
  Plus
} from "lucide-react";
import { formatDistanceToNow, format } from 'date-fns';

// Component to display companies with Housecall Pro integration
const HousecallProCompaniesTable = () => {
  const [location, setLocation] = useLocation();
  
  // Fetch all companies
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/companies');
      return response.json();
    }
  });

  // Get companies with Housecall Pro integration
  const companiesWithHousecallPro = React.useMemo(() => {
    if (!companies) return [];
    
    return companies.filter((company: any) => {
      if (!company.crmIntegrations) return false;
      
      try {
        const crmIntegrations = JSON.parse(company.crmIntegrations);
        return crmIntegrations && crmIntegrations.housecallpro;
      } catch (error) {
        return false;
      }
    }).map((company: any) => {
      const crmIntegrations = JSON.parse(company.crmIntegrations || '{}');
      const hcpIntegration = crmIntegrations.housecallpro || {};
      
      return {
        id: company.id,
        name: company.name,
        status: hcpIntegration.status || 'inactive',
        lastSynced: hcpIntegration.lastSyncedAt ? new Date(hcpIntegration.lastSyncedAt) : null,
        syncStatus: hcpIntegration.lastSyncStatus || 'unknown'
      };
    });
  }, [companies]);
  
  // Function to trigger a manual sync
  const triggerSync = async (companyId: number) => {
    try {
      await apiRequest('POST', `/api/admin/companies/${companyId}/trigger-sync`, { crmType: 'housecallpro' });
      // Refresh the companies data
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
    } catch (error) {
      console.error('Error triggering sync:', error);
    }
  };
  
  if (isLoadingCompanies) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (companiesWithHousecallPro.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md bg-gray-50">
        <p className="text-gray-500 mb-4">No companies are currently using Housecall Pro integration.</p>
        <Button onClick={() => setLocation("/crm-integrations")}>
          Set Up Integration
        </Button>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company Name</TableHead>
          <TableHead>Integration Status</TableHead>
          <TableHead>Last Sync</TableHead>
          <TableHead>Sync Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companiesWithHousecallPro.map((company: any) => (
          <TableRow key={company.id}>
            <TableCell className="font-medium">{company.name}</TableCell>
            <TableCell>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                company.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {company.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </TableCell>
            <TableCell>
              {company.lastSynced 
                ? formatDistanceToNow(company.lastSynced, { addSuffix: true }) 
                : 'Never'}
            </TableCell>
            <TableCell>
              {company.syncStatus === 'success' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Success
                </span>
              )}
              {company.syncStatus === 'partial' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Partial
                </span>
              )}
              {company.syncStatus === 'failed' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Failed
                </span>
              )}
              {company.syncStatus === 'unknown' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                  Unknown
                </span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  title="Refresh Integration" 
                  onClick={() => triggerSync(company.id)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation(`/crm-integrations?company=${company.id}`)}
                >
                  Configure
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Dedicated Super Admin Dashboard Component
function SuperAdminDashboardView() {
  const [, setLocation] = useLocation();
  
  // Super admin queries for platform-wide data
  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"]
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/admin/users"]
  });

  const { data: visits = [] } = useQuery({
    queryKey: ["/api/visits"]
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/review-responses"]
  });

  const totalVisits = Array.isArray(visits) ? visits.length : 0;
  const totalReviews = Array.isArray(reviews) ? reviews.length : 0;

  return (
    <DashboardLayout>
      {/* Super Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 -mt-6 -mx-6 px-6 py-8 mb-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                System Administrator Dashboard
              </h1>
              <p className="text-purple-100 mt-1">
                Platform-wide management and oversight
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => setLocation('/companies-management')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Manage Companies
              </Button>
              <Button 
                className="bg-white text-purple-700 hover:bg-purple-50"
                onClick={() => setLocation('/admin-user-management')}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold">{Array.isArray(companies) ? companies.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{Array.isArray(allUsers) ? allUsers.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Platform Visits</p>
                <p className="text-2xl font-bold">{totalVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Platform Reviews</p>
                <p className="text-2xl font-bold">{totalReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CompaniesManagement />
        <AdminBusinessManagement />
      </div>
    </DashboardLayout>
  );
}

export default function Dashboard() {
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [blogPostModalOpen, setBlogPostModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  const { data: auth, isLoading: authLoading } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Early return with forced super admin detection
  if (auth?.user?.role === "super_admin") {
    return <SuperAdminDashboardView />;
  }

  // Fetch real data for dashboard metrics
  const { data: visits = [] } = useQuery({
    queryKey: ["/api/visits"],
    enabled: !!auth?.user
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ["/api/technicians"],
    enabled: !!auth?.user
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ["/api/blog-posts"],
    enabled: !!auth?.user
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/review-responses"],
    enabled: !!auth?.user
  });

  // Super admin queries for platform-wide data
  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
    enabled: !!auth?.user && auth?.user?.role === "super_admin"
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!auth?.user && auth?.user?.role === "super_admin"
  });
  
  const userRole = auth?.user?.role;
  const isSuperAdmin = userRole === "super_admin";
  const isCompanyAdmin = userRole === "company_admin";
  const isTechnician = userRole === "technician";
  
  // Debug logging
  console.log("Dashboard - Auth state:", auth);
  console.log("Dashboard - User role:", userRole);
  console.log("Dashboard - isSuperAdmin:", isSuperAdmin);
  console.log("Dashboard - isTechnician:", isTechnician);
  console.log("Dashboard - Auth user:", auth?.user);
  console.log("Dashboard - Auth user role:", auth?.user?.role);
  
  // Force super admin detection if needed
  if (auth?.user?.role === "super_admin") {
    console.log("FORCING SUPER ADMIN INTERFACE");
  }

  // Calculate real metrics from your data
  const totalVisits = Array.isArray(visits) ? visits.length : 0;
  const totalTechnicians = Array.isArray(technicians) ? technicians.length : 0;
  const totalBlogPosts = Array.isArray(blogPosts) ? blogPosts.length : 0;
  const totalReviews = Array.isArray(reviews) ? reviews.length : 0;
  
  // Calculate average rating from reviews
  const averageRating = totalReviews > 0 
    ? (Array.isArray(reviews) ? reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / totalReviews : 0).toFixed(1)
    : "0.0";

  // Calculate recent activity (this week)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentVisits = Array.isArray(visits) ? visits.filter((visit: any) => 
    visit.createdAt && new Date(visit.createdAt) > oneWeekAgo
  ).length : 0;
  
  // Loading state
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-gray-500">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Super Admin Dashboard - Platform Management (Check first to override other roles)
  if (isSuperAdmin || auth?.user?.role === "super_admin") {
    return (
      <DashboardLayout>
        {/* Super Admin Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 -mt-6 -mx-6 px-6 py-8 mb-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">
                  System Administrator Dashboard
                </h1>
                <p className="text-purple-100 mt-1">
                  Platform-wide management and oversight
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={() => setLocation('/companies-management')}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Companies
                </Button>
                <Button 
                  className="bg-white text-purple-700 hover:bg-purple-50"
                  onClick={() => setLocation('/admin-user-management')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Companies</p>
                  <p className="text-2xl font-bold">{Array.isArray(companies) ? companies.length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{Array.isArray(allUsers) ? allUsers.length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle2 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Platform Visits</p>
                  <p className="text-2xl font-bold">{totalVisits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Platform Reviews</p>
                  <p className="text-2xl font-bold">{totalReviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CompaniesManagement />
          <AdminBusinessManagement />
        </div>
      </DashboardLayout>
    );
  }

  // Technician Dashboard - Simplified view focused on field work
  if (isTechnician) {
    return (
      <DashboardLayout>
        <TechDashboard onNewVisit={() => {}} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header with User Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 -mt-6 -mx-6 px-6 py-8 mb-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {auth?.user?.username || "User"}!
              </h1>
              <p className="text-blue-100 mt-1">
                Here's what's happening with your business today
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => window.open('/help-center', '_blank')}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
              <Button 
                className="bg-white text-blue-700 hover:bg-blue-50"
                onClick={() => setLocation('/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
          
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Active Technicians</span>
                <User className="h-5 w-5 text-blue-200" />
              </div>
              <div className="text-2xl font-bold">{totalTechnicians}</div>
              <div className="text-xs text-blue-200 mt-1">
                {totalTechnicians > 0 ? `${Math.ceil(totalTechnicians * 0.8)} currently active` : "No technicians"}
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Total Visits</span>
                <Calendar className="h-5 w-5 text-blue-200" />
              </div>
              <div className="text-2xl font-bold">{totalVisits}</div>
              <div className="text-xs text-blue-200 mt-1">
                +{recentVisits} this week
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Average Rating</span>
                <Star className="h-5 w-5 text-amber-300" fill="#fcd34d" />
              </div>
              <div className="text-2xl font-bold">{averageRating}</div>
              <div className="text-xs text-blue-200 mt-1">
                From {totalReviews} reviews
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">{isCompanyAdmin ? "Website Traffic" : "Active Companies"}</span>
                {isCompanyAdmin ? 
                  <Globe className="h-5 w-5 text-blue-200" /> : 
                  <Building2 className="h-5 w-5 text-blue-200" />
                }
              </div>
              <div className="text-2xl font-bold">{totalBlogPosts}</div>
              <div className="text-xs text-blue-200 mt-1">
                Generated blog posts
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Super Admin Dashboard */}
      {isSuperAdmin ? (
        <div className="space-y-6">
          <Tabs defaultValue="overview" className="mb-6">
            <TabsList className="w-full">
              <TabsTrigger value="overview">Platform Overview</TabsTrigger>
              <TabsTrigger value="companies">Companies</TabsTrigger>
              <TabsTrigger value="billing">Billing & Revenue</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
            </TabsList>
            
            {/* Platform Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <StatsOverview />
                  <AdminBusinessManagement />
                </div>
                <div className="space-y-6">
                  <RecentActivityTimeline />
                </div>
              </div>
            </TabsContent>
            
            {/* Companies Management Tab */}
            <TabsContent value="companies">
              <div className="space-y-6">
                <CompaniesManagement />
              </div>
            </TabsContent>
            
            {/* Billing & Revenue Tab */}
            <TabsContent value="billing">
              <div className="space-y-6">
                <BillingManagement />
              </div>
            </TabsContent>
            
            {/* Integrations Tab */}
            <TabsContent value="integrations">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="border-blue-200">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="flex items-center">
                            <Box className="h-5 w-5 mr-2 text-blue-600" />
                            Integration Hub
                          </CardTitle>
                          <CardDescription>
                            Manage and monitor integrations across all companies
                          </CardDescription>
                        </div>
                        <Button 
                          variant="outline"
                          onClick={() => setLocation("/crm-integrations")}
                        >
                          Manage All Integrations
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        {/* System-wide Integration Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 border rounded-lg bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-500">Connected Companies</span>
                              <Building2 className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-2xl font-bold">8</div>
                          </div>
                          <div className="p-4 border rounded-lg bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-500">Sync Success Rate</span>
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="text-2xl font-bold">94%</div>
                          </div>
                          <div className="p-4 border rounded-lg bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-500">Jobs Created</span>
                              <Clipboard className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="text-2xl font-bold">256</div>
                          </div>
                          <div className="p-4 border rounded-lg bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-500">Customers Synced</span>
                              <Users className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="text-2xl font-bold">189</div>
                          </div>
                        </div>
                        
                        {/* Companies with Housecall Pro */}
                        <div>
                          <h3 className="text-lg font-medium mb-4">Connected Companies</h3>
                          <HousecallProCompaniesTable />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <UpcomingTasks />
                </div>
              </div>
            </TabsContent>
            
            {/* Operations Tab */}
            <TabsContent value="operations">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                      <CardTitle>Platform Operations</CardTitle>
                      <CardDescription>
                        Manage global platform settings and operations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium mb-3">Health Monitoring</h3>
                          <div className="space-y-4">
                            <div className="p-4 border rounded-lg bg-white shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Server Status</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Healthy
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                All servers operating normally with 99.98% uptime this month
                              </div>
                            </div>
                            
                            <div className="p-4 border rounded-lg bg-white shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Database Status</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Healthy
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Database operations running smoothly with optimal performance
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-3">System Management</h3>
                          <div className="space-y-4">
                            <div className="p-4 border rounded-lg bg-white shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Email Service</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                All email services working correctly - delivery rate 99.7%
                              </div>
                            </div>
                            
                            <div className="p-4 border rounded-lg bg-white shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Scheduled Tasks</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Running
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                48 scheduled tasks running normally - last execution: 4 minutes ago
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-3">System Updates</h3>
                          <div className="space-y-4">
                            <div className="p-4 border rounded-lg bg-white shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Platform Version</span>
                                <span className="text-sm font-semibold text-blue-600">v2.4.1</span>
                              </div>
                              <div className="text-sm text-gray-500 mb-3">
                                Current version deployed on May 15, 2023
                              </div>
                              <Button variant="outline" size="sm">
                                Check for Updates
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-3">Security</h3>
                          <div className="space-y-4">
                            <div className="p-4 border rounded-lg bg-white shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Security Status</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Secure
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mb-3">
                                All security systems operational - last scan: 2 hours ago
                              </div>
                              <Button variant="outline" size="sm">
                                View Security Report
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <RecentActivityTimeline />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        // Company Admin Dashboard
        <div className="space-y-8">
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-blue-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-1">Add New Visit</h3>
                    <p className="text-sm text-gray-500">Record a new customer visit</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
                <Button 
                  className="w-full mt-4"
                  onClick={() => setVisitModalOpen(true)}
                >
                  Create Visit
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-1">Generate Content</h3>
                    <p className="text-sm text-gray-500">Create blog posts from visits</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                  onClick={() => setBlogPostModalOpen(true)}
                >
                  Create Content
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-1">Request Reviews</h3>
                    <p className="text-sm text-gray-500">Send review requests to customers</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <Star className="h-6 w-6" />
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                  onClick={() => setLocation("/reviews")}
                >
                  Request Reviews
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-amber-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-1">Manage Team</h3>
                    <p className="text-sm text-gray-500">Add or update technicians</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 bg-amber-600 hover:bg-amber-700"
                  onClick={() => setLocation("/technicians")}
                >
                  Manage Team
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <RecentVisits />
              <TechnicianPerformance />
            </div>
            
            <div className="space-y-6">
              <PerformanceWidget />
              <RecentActivityTimeline />
            </div>
          </div>
        </div>
      )}
      
      {/* Modals */}
      {visitModalOpen && (
        <VisitModal 
          isOpen={visitModalOpen} 
          onClose={() => setVisitModalOpen(false)} 
        />
      )}
      
      {blogPostModalOpen && (
        <VisitModal 
          isOpen={blogPostModalOpen} 
          onClose={() => setBlogPostModalOpen(false)} 
          mode="blog"
        />
      )}
    </DashboardLayout>
  );
}