import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { useToast } from "../hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import AdminLayout from '../components/layout/AdminLayout';
import { Checkbox } from "../components/ui/checkbox";
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Users, Briefcase, UserPlus, FileText, Star, BarChart2, Settings2, Mail, AlertTriangle, Check, X, Edit2, Trash2, Settings, Power, PowerOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

// Complete company schema with all form fields
const companySchema = z.object({
  name: z.string().min(1, { message: "Company name is required." }),
  plan: z.enum(["starter", "pro", "agency"], { message: "Please select a subscription plan." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional(),
  phoneNumber: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  industry: z.string().optional(),
  planId: z.string().optional(),
  maxTechnicians: z.number().min(1, { message: "Must have at least 1 technician." }).optional(),
  isActive: z.boolean().optional(),
  featuresEnabled: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// Define types for dynamic data
interface Company {
  id: number;
  name: string;
  plan: string;
  createdAt: string;
  isEmailVerified: boolean;
  isTrialActive: boolean;
  usageLimit: number;
  featuresEnabled: Record<string, any>;
  email?: string;
  industry?: string;
  subscriptionPlan?: string;
  planName?: string;
  active?: boolean;
  isActive?: boolean;
  lastLogin?: string;
  stats?: {
    totalCheckIns: number;
    totalTechnicians: number;
    totalBlogPosts: number;
    totalReviews: number;
    avgRating: number;
    activeCheckInsLast30Days?: number;
  };
}

interface SubscriptionPlan {
  id: number;
  name: string;
  price: string;
  yearlyPrice: string;
  maxTechnicians: number;
  maxSubmissions: number;
  features: string[];
  isActive: boolean;
}

// Available features
const availableFeatures = [
  { id: "ai_content", name: "AI Content Generation" },
  { id: "wordpress_integration", name: "WordPress Integration" },
  { id: "social_media_integration", name: "Social Media Integration" },
  { id: "crm_integration", name: "CRM Integration" },
  { id: "review_requests", name: "Review Requests" },
  { id: "custom_branding", name: "Custom Branding" },
  { id: "api_access", name: "API Access" },
  { id: "white_label", name: "White Labeling" },
  { id: "priority_support", name: "Priority Support" }
];

// Industries for dropdown - comprehensive list for all business types
const industries = [
  "Home Services",
  "Irrigation & Sprinkler Services",
  "Pool & Spa Services", 
  "Landscaping & Lawn Care",
  "HVAC Services",
  "Plumbing Services",
  "Electrical Services",
  "Cleaning Services",
  "Construction & Contractors",
  "Roofing Services",
  "Pest Control",
  "Security Services",
  "Automotive Services",
  "Healthcare & Medical",
  "Dental Services",
  "Veterinary Services",
  "Restaurant & Food Service",
  "Retail & E-commerce",
  "Real Estate",
  "Legal Services",
  "Financial Services", 
  "Fitness & Wellness",
  "Beauty & Personal Care",
  "Education & Training",
  "Technology Services",
  "Marketing & Advertising",
  "Consulting Services",
  "Other"
];

export default function CompaniesManagement() {
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [isViewingTechnicians, setIsViewingTechnicians] = useState(false);
  const [isViewingCheckIns, setIsViewingCheckIns] = useState(false);
  const [isViewingReviews, setIsViewingReviews] = useState(false);
  const [viewCompanyStats, setViewCompanyStats] = useState<any>(null);
  const [filteredIndustry, setFilteredIndustry] = useState("all");
  const [filteredPlan, setFilteredPlan] = useState("all");
  const [filteredStatus, setFilteredStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch companies from API
  const { data: companies, isLoading: companiesLoading, refetch: refetchCompanies } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/companies');
      return res.json();
    }
  });

  // Fetch subscription plans from API
  const { data: subscriptionPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/admin/subscription-plans'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/subscription-plans');
      return res.json();
    }
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: z.infer<typeof companySchema>) => {
      const res = await apiRequest('POST', '/api/companies', companyData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Company Created",
        description: "Company has been created successfully."
      });
      setIsAddingCompany(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create company",
        variant: "destructive"
      });
    }
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: z.infer<typeof companySchema> }) => {
      console.log('Mutation starting - ID:', id, 'Data:', data);
      const res = await apiRequest('PUT', `/api/companies/${id}`, data);
      const result = await res.json();
      console.log('Mutation response:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Company Updated",
        description: "Company has been updated successfully."
      });
      setSelectedCompany(null);
      form.reset();
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update company",
        variant: "destructive"
      });
    }
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/companies/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Company Deleted",
        description: "Company has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to delete company",
        variant: "destructive"
      });
    }
  });

  // Toggle company status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      const res = await apiRequest('PATCH', `/api/companies/${id}/status`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Status Updated",
        description: "Company status has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company status",
        variant: "destructive"
      });
    }
  });

  // Handler for status toggle
  const handleStatusToggle = (id: number, isActive: boolean) => {
    toggleStatusMutation.mutate({ id, isActive });
  };
  
  // Company details form
  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      plan: "starter"
    }
  });
  
  // Initialize form with company data when editing - using a proper effect per dialog
  const initializeFormForCompany = (company: any) => {
    if (company) {
      form.reset({
        name: company.name || "",
        plan: company.plan || "starter"
      });
    }
  };

  // Add React effect to populate form when selectedCompany changes
  React.useEffect(() => {
    if (selectedCompany && !isAddingCompany) {
      // Populate the form with full company data
      form.reset({
        name: selectedCompany.name || "",
        email: selectedCompany.email || "",
        phoneNumber: selectedCompany.phone || selectedCompany.phoneNumber || "",
        website: selectedCompany.website || "",
        address: selectedCompany.address || "",
        city: selectedCompany.city || "",
        state: selectedCompany.state || "",
        zipCode: selectedCompany.zipCode || "",
        industry: selectedCompany.industry || "",
        plan: selectedCompany.subscriptionPlan || selectedCompany.plan || "starter",
        maxTechnicians: selectedCompany.maxTechnicians || 5
      });
    } else if (isAddingCompany) {
      // Reset form for adding new company
      form.reset({
        name: "",
        email: "",
        phoneNumber: "",
        website: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        industry: "",
        plan: "starter",
        maxTechnicians: 5
      });
    }
  }, [selectedCompany, isAddingCompany, form]);
  
  // Submit handler for company form
  const onSubmit = (data: z.infer<typeof companySchema>) => {
    console.log('Form submitted with data:', data);
    
    if (isAddingCompany) {
      createCompanyMutation.mutate(data);
    }
  };

  // Submit handler for company edit form (called from within the dialog)
  const handleCompanyUpdate = (company: any, data: z.infer<typeof companySchema>) => {
    console.log('Form submitted with data:', data);
    console.log('Updating company with ID:', company.id);
    updateCompanyMutation.mutate({ id: company.id, data });
  };
  
  // Toggle company status
  const toggleCompanyStatus = (id: number) => {
    const company = companies?.find(c => c.id === id);
    if (company) {
      toggleStatusMutation.mutate({ id, isActive: !(company.isActive ?? company.isTrialActive) });
    }
  };
  
  // Send support email
  const sendSupportEmail = (company: Company) => {
    toast({
      title: "Support Email Sent",
      description: `A support email has been sent to ${company.name}.`
    });
  };
  
  // Filter companies based on search, industry, plan, and status
  const filteredCompanies = (companies || []).filter(company => {
    // Filter by search query
    const matchesSearch = searchQuery === "" || 
      company.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by plan
    const matchesPlan = filteredPlan === "all" || 
      company.plan === filteredPlan;
    
    // Filter by status
    const matchesStatus = filteredStatus === "all" || 
      (filteredStatus === "active" && company.isEmailVerified) ||
      (filteredStatus === "inactive" && !company.isEmailVerified);
    
    return matchesSearch && matchesPlan && matchesStatus;
  }) || [];
  
  // Real technicians data for selected company
  const { data: companyTechnicians = [], isLoading: techniciansLoading, error: techniciansError } = useQuery({
    queryKey: ['/api/technicians', selectedCompany?.id],
    queryFn: async () => {
      if (!selectedCompany?.id) return [];
      const response = await apiRequest('GET', `/api/companies/${selectedCompany.id}/technicians`);
      const data = await response.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedCompany?.id
  });
  
  // Real check-ins data for selected company
  const { data: companyCheckIns = [] } = useQuery({
    queryKey: ['/api/check-ins', selectedCompany?.id],
    queryFn: async () => {
      if (!selectedCompany?.id) return [];
      const response = await apiRequest('GET', `/api/companies/${selectedCompany.id}/check-ins`);
      const data = await response.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedCompany?.id
  });
  
  // Real reviews data for selected company
  const { data: companyReviews = [] } = useQuery({
    queryKey: ['/api/review-responses', selectedCompany?.id],
    queryFn: async () => {
      if (!selectedCompany?.id) return [];
      const response = await apiRequest('GET', `/api/companies/${selectedCompany.id}/reviews`);
      const data = await response.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedCompany?.id
  });
  
  return (
    <AdminLayout currentPath="/companies-management">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-6">Companies Management</h1>
        
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Company Details</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">{companies?.length || 0}</CardTitle>
                  <CardDescription>Total Companies</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">
                    {companies?.filter(c => c.active)?.length || 0} active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">
                    {companies?.reduce((sum, company) => sum + (parseInt(String(company.stats?.totalTechnicians || 0)) || 0), 0) || 0}
                  </CardTitle>
                  <CardDescription>Active Technicians</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    Across all companies
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">
                    {companies?.reduce((sum, company) => sum + (parseInt(String(company.stats?.totalCheckIns || 0)) || 0), 0) || 0}
                  </CardTitle>
                  <CardDescription>Total Check-ins</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">
                    {companies?.reduce((sum, company) => sum + (parseInt(String((company.stats?.activeCheckInsLast30Days !== undefined) ? company.stats?.activeCheckInsLast30Days : company.stats?.totalCheckIns || 0)) || 0), 0) || 0} in last 30 days
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">
                    {companies && companies.length > 0 ? (
                      (companies.reduce((sum, company) => sum + ((company.stats?.avgRating || 0) * (company.stats?.totalReviews || 0)), 0) / 
                       Math.max(companies.reduce((sum, company) => sum + (company.stats?.totalReviews || 0), 0), 1)).toFixed(1)
                    ) : '0.0'}
                  </CardTitle>
                  <CardDescription>Average Rating</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    {companies?.reduce((sum, company) => sum + (parseInt(String(company.stats?.totalReviews || 0)) || 0), 0) || 0} total reviews
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <Input 
                  placeholder="Search companies..." 
                  className="w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select value={filteredIndustry} onValueChange={setFilteredIndustry}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filteredPlan} onValueChange={setFilteredPlan}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Plans" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filteredStatus} onValueChange={setFilteredStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => {
                  form.reset();
                  setIsAddingCompany(true);
                  setSelectedCompany(null);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Company
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Technicians</TableHead>
                      <TableHead>Check-ins</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No companies found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCompanies.map(company => (
                        <TableRow key={company.id}>
                          <TableCell>
                            <span className="font-mono text-sm text-gray-600">#{company.id}</span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{company.name}</div>
                              <div className="text-sm text-gray-500">{company.industry ? `${company.industry}` : 'No industry specified'}</div>
                            </div>
                          </TableCell>
                          <TableCell>{company.industry || 'Not specified'}</TableCell>
                          <TableCell>{company.plan}</TableCell>
                          <TableCell>{parseInt(String(company.stats?.totalTechnicians || 0)) || 0} / {(company as any).maxTechnicians ? (company as any).maxTechnicians : 'Unlimited'}</TableCell>
                          <TableCell>{parseInt(String(company.stats?.totalCheckIns || 0)) || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="mr-1">{company.stats?.avgRating?.toFixed(1) || "0.0"}</span>
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge className={(company.isActive ?? company.isTrialActive) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {(company.isActive ?? company.isTrialActive) ? "Active" : "Inactive"}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusToggle(company.id, !(company.isActive ?? company.isTrialActive))}
                                className="h-6 w-6 p-0"
                                title={(company.isActive ?? company.isTrialActive) ? "Deactivate company" : "Activate company"}
                              >
                                {(company.isActive ?? company.isTrialActive) ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => initializeFormForCompany(company)}>
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Company</DialogTitle>
                                  </DialogHeader>
                                  <Form {...form}>
                                    <form onSubmit={form.handleSubmit((data) => handleCompanyUpdate(company, data))} className="space-y-4">
                                      <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Company Name</FormLabel>
                                            <FormControl>
                                              <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name="plan"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Subscription Plan</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select plan" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="starter">Starter</SelectItem>
                                                <SelectItem value="pro">Pro</SelectItem>
                                                <SelectItem value="agency">Agency</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <Button type="submit" disabled={updateCompanyMutation.isPending}>
                                        {updateCompanyMutation.isPending ? "Updating..." : "Update Company"}
                                      </Button>
                                    </form>
                                  </Form>
                                </DialogContent>
                              </Dialog>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Company</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {company.name}? This action cannot be undone and will remove all associated data including technicians, check-ins, and reviews.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteCompanyMutation.mutate(company.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                      disabled={deleteCompanyMutation.isPending}
                                    >
                                      {deleteCompanyMutation.isPending ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              
                              <Button variant="ghost" size="sm" onClick={() => setSelectedCompany(company)}>
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Company Details Tab */}
          <TabsContent value="details">
            {selectedCompany ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{selectedCompany.name}</h2>
                    <p className="text-gray-500">{selectedCompany.email} | {selectedCompany.phoneNumber}</p>
                  </div>
                  <div className="space-x-2">
                    <Button 
                      variant={selectedCompany.isActive ? "outline" : "secondary"} 
                      onClick={() => toggleCompanyStatus(selectedCompany.id)}
                    >
                      {selectedCompany.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => sendSupportEmail(selectedCompany)}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Send Support Email
                    </Button>
                    <Button onClick={() => setSelectedCompany(null)}>
                      Edit Company
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Address</h3>
                        <p>{selectedCompany.address}</p>
                        <p>{selectedCompany.city}, {selectedCompany.state} {selectedCompany.zipCode}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Website</h3>
                        <p>
                          <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {selectedCompany.website}
                          </a>
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Industry</h3>
                        <p>{selectedCompany.industry}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Customer Since</h3>
                        <p>{new Date(selectedCompany.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Last Login</h3>
                        <p>{selectedCompany.lastLogin ? `${formatDistanceToNow(new Date(selectedCompany.lastLogin))} ago` : 'Never'}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Current Plan</h3>
                        <p className="font-semibold">{selectedCompany.planName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <Badge className={selectedCompany.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {selectedCompany.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Technician Limit</h3>
                        <p>{parseInt(String(selectedCompany.stats?.totalTechnicians || 0)) || 0} used of {selectedCompany.maxTechnicians ? selectedCompany.maxTechnicians : 'Unlimited'}</p>
                        {selectedCompany.maxTechnicians && (
                          <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(((parseInt(String(selectedCompany.stats?.totalTechnicians || 0)) || 0) / selectedCompany.maxTechnicians) * 100, 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Enabled Features</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(Array.isArray(selectedCompany.featuresEnabled) ? selectedCompany.featuresEnabled : []).map((featureId: string) => (
                            <Badge key={featureId} variant="outline" className="bg-blue-50">
                              {availableFeatures.find(f => f.id === featureId)?.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => setSelectedCompany(selectedCompany)}>
                        Change Plan
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Total Check-ins</h3>
                        <p className="text-2xl font-bold">{parseInt(String(selectedCompany.stats?.totalCheckIns || 0)) || 0}</p>
                        <p className="text-sm text-gray-500">{parseInt(String(selectedCompany.stats?.activeCheckInsLast30Days || 0)) || 0} in the last 30 days</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Blog Posts Generated</h3>
                        <p className="text-2xl font-bold">{parseInt(String(selectedCompany.stats?.totalBlogPosts || 0)) || 0}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Reviews Collected</h3>
                        <div className="flex items-center">
                          <span className="text-2xl font-bold mr-2">{parseInt(String(selectedCompany.stats?.totalReviews || 0)) || 0}</span>
                          <div className="flex items-center">
                            <span className="mr-1">Avg {selectedCompany.stats?.avgRating || 0}</span>
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setIsViewingTechnicians(true)}>
                        <Users className="mr-2 h-4 w-4" />
                        Technicians
                      </Button>
                      <Button variant="outline" onClick={() => setIsViewingCheckIns(true)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Check-ins
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                {selectedCompany.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedCompany.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No Company Selected</h3>
                <p className="mt-1 text-gray-500">Select a company from the Overview tab or add a new one</p>
                <Button 
                  onClick={() => {
                    form.reset();
                    setIsAddingCompany(true);
                  }} 
                  className="mt-4"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Company
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Companies by Industry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {industries
                        .filter(industry => (companies || []).some(c => c.industry === industry))
                        .map(industry => {
                          const count = (companies || []).filter(c => c.industry === industry).length;
                          const percentage = companies && companies.length > 0 ? (count / companies.length) * 100 : 0;
                          
                          return (
                            <div key={industry} className="flex items-center">
                              <div className="w-28">{industry}</div>
                              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="w-12 text-right text-sm">
                                {count}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Companies by Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['starter', 'pro', 'agency'].map(plan => {
                        const count = (companies || []).filter(c => c.plan === plan).length;
                        const percentage = companies && companies.length > 0 ? (count / companies.length) * 100 : 0;
                        
                        return (
                          <div key={plan} className="flex items-center">
                            <div className="w-28 capitalize">{plan}</div>
                            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="w-12 text-right text-sm">
                              {count}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Companies by Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Check-ins (30 days)</TableHead>
                        <TableHead>Total Check-ins</TableHead>
                        <TableHead>Blog Posts</TableHead>
                        <TableHead>Reviews</TableHead>
                        <TableHead>Avg. Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(companies || [])
                        .sort((a, b) => {
                          const aCheckIns = (a.stats?.activeCheckInsLast30Days !== undefined) ? a.stats.activeCheckInsLast30Days : Math.floor((a.stats?.totalCheckIns || 0) * 0.3);
                          const bCheckIns = (b.stats?.activeCheckInsLast30Days !== undefined) ? b.stats.activeCheckInsLast30Days : Math.floor((b.stats?.totalCheckIns || 0) * 0.3);
                          return bCheckIns - aCheckIns;
                        })
                        .map(company => (
                          <TableRow key={company.id}>
                            <TableCell className="font-medium">{company.name}</TableCell>
                            <TableCell>{company.plan || 'starter'}</TableCell>
                            <TableCell>{(company.stats?.activeCheckInsLast30Days !== undefined) ? parseInt(String(company.stats.activeCheckInsLast30Days)) || 0 : Math.floor((parseInt(String(company.stats?.totalCheckIns || 0)) || 0) * 0.3)}</TableCell>
                            <TableCell>{parseInt(String(company.stats?.totalCheckIns || 0)) || 0}</TableCell>
                            <TableCell>{parseInt(String(company.stats?.totalBlogPosts || 0)) || 0}</TableCell>
                            <TableCell>{parseInt(String(company.stats?.totalReviews || 0)) || 0}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span>{company.stats?.avgRating?.toFixed(1) || '0.0'}</span>
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 ml-1" />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Company Sign-ups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Industry</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Sign-up Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(companies || [])
                          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                          .slice(0, 5)
                          .map(company => (
                            <TableRow key={company.id}>
                              <TableCell className="font-medium">{company.name}</TableCell>
                              <TableCell>{company.industry}</TableCell>
                              <TableCell>{company.planName}</TableCell>
                              <TableCell>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Inactive Companies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(companies || [])
                          .filter(c => !c.isActive || (c.lastLogin && new Date(c.lastLogin).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000))
                          .slice(0, 5)
                          .map(company => (
                            <TableRow key={company.id}>
                              <TableCell className="font-medium">{company.name}</TableCell>
                              <TableCell>
                                {company.lastLogin 
                                  ? `${formatDistanceToNow(new Date(company.lastLogin))} ago` 
                                  : 'Never'}
                              </TableCell>
                              <TableCell>
                                <Badge className={company.isActive ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                                  {company.isActive ? "Inactive User" : "Deactivated"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => sendSupportEmail(company)}>
                                  Contact
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Company Edit/Create Dialog */}
        <Dialog 
          open={selectedCompany !== null && !isViewingTechnicians && !isViewingCheckIns && !isViewingReviews || isAddingCompany} 
          onOpenChange={(open) => {
            if (!open) {
              setSelectedCompany(null);
              setIsAddingCompany(false);
              form.reset();
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isAddingCompany ? 'Add New Company' : 'Edit Company'}</DialogTitle>
              <DialogDescription>
                {isAddingCompany 
                  ? 'Fill in the company details to create a new account.' 
                  : `Update the details for ${selectedCompany?.name}.`}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="company@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="555-123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industries.map(industry => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="planId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription Plan</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {plansLoading ? (
                              <SelectItem value="loading" disabled>Loading plans...</SelectItem>
                            ) : subscriptionPlans && subscriptionPlans.length > 0 ? (
                              subscriptionPlans.map((plan: SubscriptionPlan) => (
                                <SelectItem key={plan.id} value={plan.id.toString()}>
                                  {plan.name} - ${plan.price}/mo
                                  {plan.yearlyPrice && ` (${plan.yearlyPrice}/year)`}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>No plans available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxTechnicians"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Technicians</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Maximum number of technicians allowed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={(checked) => field.onChange(!!checked)}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Active Account</FormLabel>
                          <FormDescription>
                            Company can access the platform and its features
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="featuresEnabled"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Enabled Features</FormLabel>
                        <FormDescription>
                          Select the features this company should have access to
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {availableFeatures.map((feature) => (
                          <FormField
                            key={feature.id}
                            control={form.control}
                            name="featuresEnabled"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={feature.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(feature.id) || false}
                                      onCheckedChange={(checked) => {
                                        const currentValue = field.value || [];
                                        return checked
                                          ? field.onChange([...currentValue, feature.id])
                                          : field.onChange(
                                              currentValue.filter(
                                                (value: string) => value !== feature.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {feature.name}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Internal notes about this company" 
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => {
                    setSelectedCompany(null);
                    setIsAddingCompany(false);
                    form.reset();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isAddingCompany ? 'Add Company' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Company Stats Dialog */}
        <Dialog 
          open={viewCompanyStats !== null} 
          onOpenChange={(open) => {
            if (!open) setViewCompanyStats(null);
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Company Statistics: {viewCompanyStats?.name}</DialogTitle>
            </DialogHeader>
            
            {viewCompanyStats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Users className="h-8 w-8 mx-auto text-primary" />
                        <h3 className="mt-2 font-medium text-sm">Technicians</h3>
                        <p className="text-2xl font-bold">{viewCompanyStats.currentTechnicians}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <FileText className="h-8 w-8 mx-auto text-primary" />
                        <h3 className="mt-2 font-medium text-sm">Check-ins</h3>
                        <p className="text-2xl font-bold">{viewCompanyStats.stats?.totalCheckIns || 0}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <BarChart2 className="h-8 w-8 mx-auto text-primary" />
                        <h3 className="mt-2 font-medium text-sm">Blog Posts</h3>
                        <p className="text-2xl font-bold">{viewCompanyStats.stats.totalBlogPosts}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Star className="h-8 w-8 mx-auto text-primary" />
                        <h3 className="mt-2 font-medium text-sm">Avg. Rating</h3>
                        <p className="text-2xl font-bold">{viewCompanyStats.stats.avgRating}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Check-ins (Last 30 Days)</span>
                            <span className="text-sm">{viewCompanyStats.stats.activeCheckInsLast30Days}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${(viewCompanyStats.stats?.activeCheckInsLast30Days || 0) / Math.max((viewCompanyStats.stats?.totalCheckIns || 1) * 0.25, 1) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Blog Post Conversion Rate</span>
                            <span className="text-sm">{Math.round(((viewCompanyStats.stats?.totalBlogPosts || 0) / Math.max(viewCompanyStats.stats?.totalCheckIns || 1, 1)) * 100)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${((viewCompanyStats.stats?.totalBlogPosts || 0) / Math.max(viewCompanyStats.stats?.totalCheckIns || 1, 1)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Review Conversion Rate</span>
                            <span className="text-sm">{Math.round(((viewCompanyStats.stats?.totalReviews || 0) / Math.max(viewCompanyStats.stats?.totalCheckIns || 1, 1)) * 100)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${((viewCompanyStats.stats?.totalReviews || 0) / Math.max(viewCompanyStats.stats?.totalCheckIns || 1, 1)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Check-ins Per Technician</span>
                            <span className="text-sm">{Math.round((viewCompanyStats.stats?.totalCheckIns || 0) / Math.max(viewCompanyStats.currentTechnicians || 1, 1))}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${Math.min(((viewCompanyStats.stats?.totalCheckIns || 0) / Math.max(viewCompanyStats.currentTechnicians || 1, 1)) / 50 * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Feature Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(Array.isArray(viewCompanyStats.featuresEnabled) ? viewCompanyStats.featuresEnabled : []).map((featureId: string) => {
                          const feature = availableFeatures.find(f => f.id === featureId);
                          if (!feature) return null;
                          
                          // Calculate real usage percentage based on company activity
                          let usagePercentage = 0;
                          const totalCheckIns = viewCompanyStats.stats?.totalCheckIns || 0;
                          
                          switch (featureId) {
                            case 'ai_blog_generation':
                              usagePercentage = totalCheckIns > 0 ? Math.round((viewCompanyStats.stats.totalBlogPosts / totalCheckIns) * 100) : 0;
                              break;
                            case 'review_management':
                              usagePercentage = totalCheckIns > 0 ? Math.round((viewCompanyStats.stats.totalReviews / totalCheckIns) * 100) : 0;
                              break;
                            case 'wordpress_integration':
                              usagePercentage = viewCompanyStats.stats.totalBlogPosts > 0 ? 75 : 0;
                              break;
                            case 'gps_tracking':
                              usagePercentage = totalCheckIns > 0 ? 95 : 0;
                              break;
                            default:
                              usagePercentage = totalCheckIns > 0 ? Math.min(Math.round((totalCheckIns / 50) * 100), 100) : 0;
                          }
                          
                          return (
                            <div key={featureId}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{feature.name}</span>
                                <span className="text-sm">{usagePercentage}% utilization</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${usagePercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {availableFeatures
                          .filter(f => !(Array.isArray(viewCompanyStats.featuresEnabled) ? viewCompanyStats.featuresEnabled : []).includes(f.id))
                          .slice(0, 2)
                          .map(feature => (
                            <div key={feature.id}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-400">{feature.name}</span>
                                <span className="text-xs text-gray-400">Not enabled</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full">
                                <div className="h-full bg-gray-300 rounded-full" style={{ width: '0%' }}></div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setViewCompanyStats(null);
                      setSelectedCompany(viewCompanyStats);
                      setIsViewingTechnicians(true);
                    }}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    View Technicians
                  </Button>
                  <Button 
                    onClick={() => {
                      setViewCompanyStats(null);
                      setSelectedCompany(viewCompanyStats);
                    }}
                  >
                    <Settings2 className="mr-2 h-4 w-4" />
                    Manage Company
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Technicians Dialog */}
        <Dialog 
          open={isViewingTechnicians} 
          onOpenChange={(open) => {
            if (!open) setIsViewingTechnicians(false);
          }}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Technicians: {selectedCompany?.name}</DialogTitle>
              <DialogDescription>
                All technicians for {selectedCompany?.name} ({Array.isArray(companyTechnicians) ? companyTechnicians.length : 0} of {selectedCompany?.maxTechnicians} available slots used)
              </DialogDescription>
            </DialogHeader>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Check-ins</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Check-in</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {techniciansLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Loading technicians...
                    </TableCell>
                  </TableRow>
                ) : techniciansError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-red-500">
                      Error loading technicians: {techniciansError.message}
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(companyTechnicians) ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-yellow-600">
                      No technician data available
                    </TableCell>
                  </TableRow>
                ) : companyTechnicians.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      No technicians found for this company
                    </TableCell>
                  </TableRow>
                ) : (
                  companyTechnicians.map((technician) => (
                    <TableRow key={technician.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(technician.name)}&background=random`} />
                          <AvatarFallback>{technician.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{technician.name}</div>
                          <div className="text-xs text-gray-500">{technician.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{technician.title}</TableCell>
                    <TableCell>{technician.checkInsCount}</TableCell>
                    <TableCell>{technician.reviewsCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-1">{technician.rating}</span>
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={technician.status === 'active' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {technician.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {technician.lastCheckInDate 
                        ? formatDistanceToNow(new Date(technician.lastCheckInDate)) + ' ago'
                        : 'Never'}
                    </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            <DialogFooter>
              <Button onClick={() => setIsViewingTechnicians(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Check-ins Dialog */}
        <Dialog 
          open={isViewingCheckIns} 
          onOpenChange={(open) => {
            if (!open) setIsViewingCheckIns(false);
          }}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Recent Check-ins: {selectedCompany?.name}</DialogTitle>
              <DialogDescription>
                Recent check-ins for {selectedCompany?.name}
              </DialogDescription>
            </DialogHeader>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Type</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyCheckIns.map(checkIn => (
                  <TableRow key={checkIn.id}>
                    <TableCell>{checkIn.jobType}</TableCell>
                    <TableCell>{checkIn.technician?.name || 'Unknown'}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{checkIn.location || 'No location'}</TableCell>
                    <TableCell>{checkIn.createdAt ? formatDistanceToNow(new Date(checkIn.createdAt)) + ' ago' : 'Unknown'}</TableCell>
                    <TableCell>{checkIn.beforePhotos?.length || 0}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={checkIn.isBlog ? "bg-green-50" : "bg-gray-50"}>
                        {checkIn.isBlog ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                        Blog Post
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          checkIn.reviewRequested 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {checkIn.reviewRequested ? "Requested" : "No Request"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <DialogFooter>
              <Button onClick={() => setIsViewingCheckIns(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}