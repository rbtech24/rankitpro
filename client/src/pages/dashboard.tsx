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
import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "@/lib/auth";
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
  ChevronRight
} from "lucide-react";

export default function Dashboard() {
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  
  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  const userRole = auth?.user?.role;
  const isAdmin = userRole === "super_admin" || userRole === "company_admin";
  const isTechnician = userRole === "technician";
  const isSuperAdmin = userRole === "super_admin";
  
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
                              <TableRow>
                                <TableCell className="font-medium">Acme Plumbing</TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                                </TableCell>
                                <TableCell>15 minutes ago</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Success
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm">Configure</Button>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Elite Contractors</TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                                </TableCell>
                                <TableCell>30 minutes ago</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                    <AlertTriangle className="h-3 w-3 mr-1" /> Partial
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm">Configure</Button>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
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
        ) : (
          // Regular Admin or Technician Dashboard
          <>
            {/* Stats are shown to all users */}
            <StatsOverview />
            
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
              {/* Recent visits shown to all users */}
              <RecentVisits />
              
              <div className="lg:col-span-2 space-y-6">
                {/* Quick actions shown to all users, but with different options */}
                <QuickActions onOpenVisitModal={() => setVisitModalOpen(true)} />
                
                {/* AI Writer only shown to admins */}
                {isAdmin && <AIWriter />}
              </div>
            </div>
            
            {/* Only show technician performance to admins */}
            {isAdmin && <TechnicianPerformance />}
            
            {/* Only show website integration to admins */}
            {isAdmin && <WebsiteIntegration />}
          </>
        )}
      </div>
      
      <VisitModal 
        isOpen={visitModalOpen} 
        onClose={() => setVisitModalOpen(false)} 
      />
    </DashboardLayout>
  );
}
