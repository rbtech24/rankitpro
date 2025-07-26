import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { 
  Check, 
  X, 
  ArrowUpRight, 
  BarChart3,
  Building2, 
  Users,
  CreditCard,
  Search,
  Power,
  PowerOff,
  Edit
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

// Mock subscription statuses with associated colors
const SUBSCRIPTION_STATUS = {
  active: { label: "Active", color: "bg-green-100 text-green-800" },
  trial: { label: "Trial", color: "bg-blue-100 text-blue-800" },
  pastDue: { label: "Past Due", color: "bg-amber-100 text-amber-800" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800" },
};

const CompaniesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch companies data
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/companies');
      return response.json();
    },
  });

  // Company status toggle mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (companyId: number) => {
      const response = await apiRequest('PATCH', `/api/companies/${companyId}/status`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update company status",
        variant: "destructive",
      });
    },
  });
  
  // Filter companies based on search term and use real data
  const filteredCompanies = searchTerm 
    ? companies.filter((company: any) => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : companies;
    
  // Get company by ID
  const getCompanyById = (id: number) => {
    return filteredCompanies.find(company => company.id === id);
  };
  
  // Handle company detail click
  const handleCompanyDetail = (companyId: number) => {
    setSelectedCompanyId(companyId);
    setDetailDialogOpen(true);
  };
  
  // Selected company details
  const selectedCompany = selectedCompanyId ? getCompanyById(selectedCompanyId) : null;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-blue-500" />
              Companies Management
            </CardTitle>
            <CardDescription>
              Manage all registered companies in the system
            </CardDescription>
          </div>
          <Button>Add New Company</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search companies..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading companies...</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500">
              {searchTerm ? "No companies found matching your search." : "No companies have been added yet."}
            </p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Subscription Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => {
                  // Get actual subscription status based on company data
                  const getSubscriptionStatus = (company: any) => {
                    if (company.stripeSubscriptionId) {
                      return SUBSCRIPTION_STATUS.active;
                    } else if (company.isTrialActive) {
                      return SUBSCRIPTION_STATUS.trial;
                    } else {
                      return SUBSCRIPTION_STATUS.cancelled;
                    }
                  };
                  
                  const status = getSubscriptionStatus(company);
                  
                  return (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {company.plan || "starter"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={company.isActive ? "default" : "secondary"}
                          className={company.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {company.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{company.userCount || 0}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleStatusMutation.mutate(company.id)}
                            disabled={toggleStatusMutation.isPending}
                            title={company.isActive ? "Deactivate Company" : "Activate Company"}
                          >
                            {company.isActive ? (
                              <PowerOff className="h-4 w-4 text-red-500" />
                            ) : (
                              <Power className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCompanyDetail(company.id)}
                            title="View Details"
                          >
                            <ArrowUpRight className="h-4 w-4" /> 
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Company Details Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-500" />
                {selectedCompany ? selectedCompany.name : "Company Details"}
              </DialogTitle>
            </DialogHeader>
            
            {selectedCompany && (
              <Tabs defaultValue="overview">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                  <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
                  <TabsTrigger value="billing" className="flex-1">Billing</TabsTrigger>
                  <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Check-ins</span>
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold">127</div>
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Users</span>
                        <Users className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="text-2xl font-bold">{selectedCompany?.userCount || 0}</div>
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Plan</span>
                        <Building2 className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold capitalize">{selectedCompany?.plan || "starter"}</div>
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Monthly Fee</span>
                        <CreditCard className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="text-2xl font-bold">
                        ${selectedCompany?.plan === "agency" ? 249 : selectedCompany?.plan === "pro" ? 99 : 49}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="text-md font-medium mb-2">Company Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Name:</span>
                          <span className="text-sm font-medium">{selectedCompany.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Created:</span>
                          <span className="text-sm font-medium">
                            {selectedCompany.createdAt ? new Date(selectedCompany.createdAt).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Usage Limit:</span>
                          <span className="text-sm font-medium">{selectedCompany.usageLimit || "Unlimited"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="text-md font-medium mb-2">Integration Status</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">WordPress:</span>
                          {selectedCompany.wordpressConfig ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Check className="h-3 w-3 mr-1" /> Configured
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              <X className="h-3 w-3 mr-1" /> Not Configured
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">JavaScript Embed:</span>
                          {selectedCompany.javaScriptEmbedConfig ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Check className="h-3 w-3 mr-1" /> Configured
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              <X className="h-3 w-3 mr-1" /> Not Configured
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">CRM Integration:</span>
                          {selectedCompany.crmIntegrations ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Check className="h-3 w-3 mr-1" /> Configured
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              <X className="h-3 w-3 mr-1" /> Not Configured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Company Status:</span>
                      <Badge 
                        variant={selectedCompany.isActive ? "default" : "secondary"}
                        className={selectedCompany.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {selectedCompany.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Company
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => toggleStatusMutation.mutate(selectedCompany.id)}
                        disabled={toggleStatusMutation.isPending}
                        className={selectedCompany.isActive ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                      >
                        {selectedCompany.isActive ? (
                          <>
                            <PowerOff className="h-4 w-4 mr-2" />
                            Deactivate Company
                          </>
                        ) : (
                          <>
                            <Power className="h-4 w-4 mr-2" />
                            Activate Company
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="users">
                  <div className="py-4 text-center text-gray-500">
                    <p>User management section for {selectedCompany.name}</p>
                    <p className="text-sm">This section will show all users of this company and allow managing their permissions.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="billing">
                  <div className="py-4 text-center text-gray-500">
                    <p>Billing management for {selectedCompany.name}</p>
                    <p className="text-sm">This section will show billing history, invoices, and subscription options.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings">
                  <div className="py-4 text-center text-gray-500">
                    <p>Company settings for {selectedCompany.name}</p>
                    <p className="text-sm">This section will show configuration options for the company.</p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CompaniesManagement;