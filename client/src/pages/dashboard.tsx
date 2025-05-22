import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import StatsOverview from "@/components/dashboard/stats-overview";
import RecentVisits from "@/components/dashboard/recent-visits";
import QuickActions from "@/components/dashboard/quick-actions";
import AIWriter from "@/components/dashboard/ai-writer";
import TechnicianPerformance from "@/components/dashboard/technician-performance";
import WebsiteIntegration from "@/components/dashboard/website-integration";
import AdminBusinessManagement from "@/components/dashboard/admin-business-management";
import CompaniesManagement from "@/components/dashboard/companies-management";
import BillingManagement from "@/components/dashboard/billing-management";
import VisitModal from "@/components/modals/visit-modal";
import MobileVisitModal from "@/components/technician/mobile-visit-modal";
import TechDashboard from "@/components/technician/tech-dashboard";

import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

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
    
    return companies.filter(company => {
      if (!company.crmIntegrations) return false;
      
      try {
        const crmIntegrations = JSON.parse(company.crmIntegrations);
        return crmIntegrations && crmIntegrations.housecallpro;
      } catch (error) {
        return false;
      }
    }).map(company => {
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
  
  // Function to get sync history for a company (will be called when configuring individual company)
  const getSyncHistory = async (companyId) => {
    try {
      const response = await apiRequest('GET', `/api/admin/companies/${companyId}/crm-sync-history`);
      return response.json();
    } catch (error) {
      console.error('Error fetching sync history:', error);
      return [];
    }
  };
  
  // Function to trigger a manual sync
  const triggerSync = async (companyId) => {
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
        {companiesWithHousecallPro.map(company => (
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

export default function Dashboard() {
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [blogPostModalOpen, setBlogPostModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  const userRole = auth?.user?.role;
  const isSuperAdmin = userRole === "super_admin";
  const isCompanyAdmin = userRole === "company_admin";
  const isTechnician = userRole === "technician";
  
  // More specific role flags to prevent confusion
  const isAdmin = isSuperAdmin || isCompanyAdmin;
  
  return (
    <DashboardLayout>
      <div className="fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {isSuperAdmin 
              ? "Super admin dashboard with system-wide business management."
              : isAdmin 
              ? "Welcome back! Here's what's happening with your company."
              : "Welcome back! Here's what's happening with your visits."}
          </p>
        </div>
        
        {/* Super Admin Business Dashboard */}
        {isSuperAdmin ? (
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
              <div className="space-y-6">
                <StatsOverview />
                <AdminBusinessManagement />
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
              <div className="space-y-6">
                <Card className="border-blue-200">
                  <CardHeader className="bg-blue-50 border-b border-blue-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center">
                          <Box className="h-5 w-5 mr-2 text-blue-500" />
                          Housecall Pro Integration
                        </CardTitle>
                        <CardDescription>
                          Manage and monitor Housecall Pro integration across all companies
                        </CardDescription>
                      </div>
                      <button 
                        className="px-4 py-2 border rounded-md hover:bg-gray-100"
                        onClick={() => setLocation("/crm-integrations")}
                      >
                        Manage All Integrations
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* System-wide Integration Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Connected Companies</span>
                            <Building2 className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="text-2xl font-bold">8</div>
                        </div>
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Sync Success Rate</span>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="text-2xl font-bold">94%</div>
                        </div>
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Jobs Created</span>
                            <Clipboard className="h-4 w-4 text-purple-500" />
                          </div>
                          <div className="text-2xl font-bold">256</div>
                        </div>
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Customers Synced</span>
                            <Users className="h-4 w-4 text-amber-500" />
                          </div>
                          <div className="text-2xl font-bold">189</div>
                        </div>
                      </div>
                      
                      {/* Setup Guide */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Getting Started with Housecall Pro</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h3 className="text-lg font-medium mb-3">API Setup Process</h3>
                                <ol className="space-y-2 list-decimal list-inside">
                                  <li className="text-sm">Direct company admins to log in to their Housecall Pro account</li>
                                  <li className="text-sm">Navigate to <span className="font-medium">Settings &gt; API & Integrations</span></li>
                                  <li className="text-sm">Generate a new API key or copy their existing key</li>
                                  <li className="text-sm">Enter the API key in Rank It Pro CRM Integrations page</li>
                                  <li className="text-sm">Configure sync settings based on company needs</li>
                                </ol>
                              </div>
                              <div>
                                <h3 className="text-lg font-medium mb-3">Recommended Configuration</h3>
                                <ul className="space-y-2 list-disc list-inside">
                                  <li className="text-sm">
                                    <span className="font-medium">Enable Customer Data Sync:</span> Ensures customer details stay consistent
                                  </li>
                                  <li className="text-sm">
                                    <span className="font-medium">Create Jobs from Check-ins:</span> Automatic job creation saves time
                                  </li>
                                  <li className="text-sm">
                                    <span className="font-medium">Sync Photos:</span> Complete documentation with images
                                  </li>
                                  <li className="text-sm">
                                    <span className="font-medium">Schedule Regular Syncs:</span> Every 30 minutes recommended
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Companies with Integration */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Companies Using Housecall Pro</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {/* Add data fetching for HCP companies */}
                          <HousecallProCompaniesTable />
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Operations Tab */}
            <TabsContent value="operations">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
                  <RecentVisits />
                  
                  <div className="lg:col-span-2 space-y-6">
                    <QuickActions onOpenVisitModal={() => setVisitModalOpen(true)} />
                    <AIWriter />
                  </div>
                </div>
                
                <TechnicianPerformance />
                <WebsiteIntegration />
              </div>
            </TabsContent>
          </Tabs>
        ) : isCompanyAdmin ? (
          // Company Admin Dashboard
          <>
            {/* Stats are shown to admins */}
            <StatsOverview />
            
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
              {/* Recent visits shown to admins */}
              <RecentVisits />
              
              <div className="lg:col-span-2 space-y-6">
                {/* Quick actions for admins with different options */}
                <QuickActions onOpenVisitModal={() => setVisitModalOpen(true)} />
                
                {/* AI Writer for admins */}
                <AIWriter />
              </div>
            </div>
            
            {/* Admin-specific components */}
            <TechnicianPerformance />
            <WebsiteIntegration />
          </>
        ) : (
          <>
            {/* Mobile-optimized Technician Dashboard */}
            {/* Header - Mobile Friendly */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">Field Technician</h2>
              <p className="text-sm text-gray-600">
                Log your service visits and track your work from the field
              </p>
            </div>
            
            {/* Large Create Visit Button for easy mobile access */}
            <div className="mb-6">
              <button 
                onClick={() => setVisitModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 px-6 rounded-lg shadow-lg transition-colors flex items-center justify-center text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Check In Now
              </button>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <button 
                  onClick={() => setVisitModalOpen(true)}
                  className="w-full h-full p-4 text-center flex flex-col items-center justify-center"
                >
                  <div className="bg-green-100 p-3 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                  </div>
                  <span className="font-medium text-sm">Take Photos</span>
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <button 
                  className="w-full h-full p-4 text-center flex flex-col items-center justify-center"
                  onClick={() => window.location.href="/visits"}
                >
                  <div className="bg-blue-100 p-3 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <span className="font-medium text-sm">View History</span>
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 mb-6 text-white shadow-md">
              <h3 className="font-medium mb-3 text-white opacity-90">Your Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-sm opacity-80 mb-1">Today's Visits</div>
                  <div className="text-3xl font-bold">0</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-sm opacity-80 mb-1">This Week</div>
                  <div className="text-3xl font-bold">0</div>
                </div>
              </div>
            </div>
            
            {/* Recent Visits with Mobile-Optimized Display */}
            <div className="mb-6 bg-white p-5 rounded-xl shadow-md border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Recent Visits</h3>
                <a href="/visits" className="text-blue-600 text-sm font-medium flex items-center">
                  View All
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </a>
              </div>
              
              {/* Show empty state for technicians without visits */}
              <div className="py-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </div>
                <h4 className="text-gray-800 font-medium mb-2">No visits logged yet</h4>
                <p className="text-gray-500 text-sm mb-4 max-w-xs mx-auto">
                  Check-ins create content for your company website and can trigger customer reviews
                </p>
                <button 
                  onClick={() => setVisitModalOpen(true)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm"
                >
                  Create Your First Visit
                </button>
              </div>
            </div>
            
            {/* Quick Tips Section - Mobile Friendly */}
            <div className="bg-green-50 rounded-xl p-5 border border-green-100 shadow-sm">
              <h3 className="font-medium text-green-800 mb-3">Tips for Great Check-ins</h3>
              <ul className="text-sm text-green-800 space-y-3">
                <li className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <span>Take clear <strong>before & after</strong> photos of completed work</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <span>Include specific details about materials and techniques used</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <span>Enable location services for accurate job site recording</span>
                </li>
              </ul>
            </div>
        )}
      </div>
      
      <VisitModal 
        isOpen={visitModalOpen} 
        onClose={() => setVisitModalOpen(false)} 
      />
    </DashboardLayout>
  );
}
