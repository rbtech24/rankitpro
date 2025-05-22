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
  
  // Function to get sync history for a company (will be called when configuring individual company)
  const getSyncHistory = async (companyId: number) => {
    try {
      const response = await apiRequest('GET', `/api/admin/companies/${companyId}/crm-sync-history`);
      return response.json();
    } catch (error) {
      console.error('Error fetching sync history:', error);
      return [];
    }
  };
  
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
                      
                      {/* Companies with Housecall Pro */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Connected Companies</h3>
                        <HousecallProCompaniesTable />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Operations Tab */}
            <TabsContent value="operations">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Operations</CardTitle>
                    <CardDescription>
                      Manage global platform settings and operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Health Monitoring</h3>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg">
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
                          
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Database Status</span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Healthy
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              Average query time: 48ms, No errors detected in last 24 hours
                            </div>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">API Services</span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Healthy
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              All API endpoints responding normally, Avg response time: 125ms
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">System Maintenance</h3>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg bg-gray-50">
                            <h4 className="font-medium mb-2">Scheduled Maintenance</h4>
                            <p className="text-sm text-gray-600 mb-3">
                              Next maintenance window: May 29, 2025, 02:00 - 04:00 UTC
                            </p>
                            <Button variant="outline" size="sm">
                              View Maintenance Schedule
                            </Button>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Latest Backup</h4>
                            <p className="text-sm text-gray-600 mb-3">
                              Last full backup completed: May 21, 2025, 23:45 UTC
                            </p>
                            <div className="flex space-x-3">
                              <Button variant="outline" size="sm">
                                Backup Now
                              </Button>
                              <Button variant="ghost" size="sm">
                                View Backup History
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : isCompanyAdmin ? (
          <>
            {/* Company Admin Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatsOverview />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2">
                <RecentVisits />
              </div>
              <div className="md:col-span-1">
                <QuickActions onOpenVisitModal={() => setVisitModalOpen(true)} />
              </div>
            </div>
            
            {/* Admin-specific components */}
            <TechnicianPerformance />
            <WebsiteIntegration />
          </>
        ) : (
          <TechDashboard onNewVisit={() => setVisitModalOpen(true)} />
        )}
      </div>
      
      {isTechnician ? (
        <MobileVisitModal 
          isOpen={visitModalOpen} 
          onClose={() => setVisitModalOpen(false)} 
        />
      ) : (
        <VisitModal 
          isOpen={visitModalOpen} 
          onClose={() => setVisitModalOpen(false)} 
        />
      )}
    </DashboardLayout>
  );
}
