import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Sidebar from '@/components/layout/sidebar';
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Users, Briefcase, UserPlus, FileText, Star, BarChart2, Settings2, Mail, AlertTriangle, Check, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Company creation/edit schema
const companySchema = z.object({
  name: z.string().min(3, { message: "Company name must be at least 3 characters." }),
  email: z.string().email({ message: "Must be a valid email address." }),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  website: z.string().url({ message: "Must be a valid URL." }).optional().or(z.literal('')),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  state: z.string().min(2, { message: "State must be at least 2 characters." }),
  zipCode: z.string().min(5, { message: "Zip code must be at least 5 characters." }),
  industry: z.string().min(3, { message: "Industry must be at least 3 characters." }),
  planId: z.string(),
  isActive: z.boolean(),
  notes: z.string().optional(),
  maxTechnicians: z.number().min(1, { message: "Must allow at least 1 technician." }),
  featuresEnabled: z.array(z.string()),
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
  stats?: {
    totalCheckIns: number;
    totalTechnicians: number;
    totalBlogPosts: number;
    totalReviews: number;
    avgRating: number;
  };
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

// Subscription plans data
const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 99,
    features: ["Up to 5 technicians", "AI content generation", "Basic review management"]
  },
  {
    id: "professional", 
    name: "Professional",
    price: 199,
    features: ["Up to 15 technicians", "WordPress integration", "Advanced analytics", "CRM integration"]
  },
  {
    id: "enterprise",
    name: "Enterprise", 
    price: 499,
    features: ["Unlimited technicians", "Custom branding", "API access", "Priority support"]
  }
];

// Available features
const availableFeatures = [
  { id: "ai_content", name: "AI Content Generation" },
  { id: "wordpress_integration", name: "WordPress Integration" },
  { id: "crm_integration", name: "CRM Integration" },
  { id: "review_requests", name: "Review Requests" },
  { id: "custom_branding", name: "Custom Branding" },
  { id: "api_access", name: "API Access" },
  { id: "white_label", name: "White Labeling" },
  { id: "priority_support", name: "Priority Support" }
];

// Industries for dropdown
const industries = [
  "HVAC",
  "Plumbing",
  "Electrical",
  "Roofing",
  "Landscaping",
  "Cleaning",
  "Construction",
  "Pest Control",
  "Locksmith",
  "Garage Door",
  "Painting",
  "Appliance Repair",
  "Window Cleaning",
  "Handyman",
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
  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/billing/plans'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/billing/plans');
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
      const res = await apiRequest('PUT', `/api/companies/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Company Updated",
        description: "Company has been updated successfully."
      });
      setSelectedCompany(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company",
        variant: "destructive"
      });
    }
  });

  // Toggle company status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      const res = await apiRequest('PUT', `/api/companies/${id}/status`, { isActive });
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
  
  // Company details form
  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      website: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      industry: "",
      planId: "1",
      isActive: true,
      notes: "",
      maxTechnicians: 5,
      featuresEnabled: ["ai_content", "review_requests"]
    }
  });
  
  // Initialize form with company data when editing
  React.useEffect(() => {
    if (selectedCompany) {
      form.reset({
        name: selectedCompany.name,
        email: selectedCompany.email,
        phoneNumber: selectedCompany.phoneNumber,
        website: selectedCompany.website || "",
        address: selectedCompany.address,
        city: selectedCompany.city,
        state: selectedCompany.state,
        zipCode: selectedCompany.zipCode,
        industry: selectedCompany.industry,
        planId: selectedCompany.planId,
        isActive: selectedCompany.isActive,
        notes: selectedCompany.notes || "",
        maxTechnicians: selectedCompany.maxTechnicians,
        featuresEnabled: selectedCompany.featuresEnabled
      });
    }
  }, [selectedCompany, form]);
  
  // Submit handler for company form
  const onSubmit = (data: z.infer<typeof companySchema>) => {
    if (isAddingCompany) {
      createCompanyMutation.mutate(data);
    } else {
      updateCompanyMutation.mutate({ id: selectedCompany.id, data });
    }
  };
  
  // Toggle company status
  const toggleCompanyStatus = (id: number) => {
    const company = companies?.find(c => c.id === id);
    if (company) {
      toggleStatusMutation.mutate({ id, isActive: !company.isEmailVerified });
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
  const filteredCompanies = companies?.filter(company => {
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
  
  // Mock technicians for selected company
  const mockTechnicians = selectedCompany ? Array.from({ length: selectedCompany.currentTechnicians }).map((_, index) => ({
    id: index + 1,
    name: `Technician ${index + 1}`,
    email: `tech${index + 1}@${selectedCompany.name.toLowerCase().replace(/\s+/g, '')}.com`,
    phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: ["Service Technician", "Senior Technician", "Lead Technician", "Field Supervisor"][Math.floor(Math.random() * 4)],
    joinedDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    lastCheckInDate: Math.random() > 0.1 ? new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString() : null,
    checkInsCount: Math.floor(Math.random() * 50) + 1,
    reviewsCount: Math.floor(Math.random() * 30),
    rating: (3.5 + Math.random() * 1.5).toFixed(1),
    status: Math.random() > 0.1 ? "active" : "inactive"
  })) : [];
  
  // Mock check-ins for selected company
  const mockCheckIns = selectedCompany ? Array.from({ length: 10 }).map((_, index) => ({
    id: index + 1,
    jobType: ["Repair", "Installation", "Maintenance", "Inspection", "Emergency"][Math.floor(Math.random() * 5)],
    technicianName: `Technician ${Math.floor(Math.random() * selectedCompany.currentTechnicians) + 1}`,
    location: `${["123 Main St", "456 Oak Ave", "789 Pine Rd", "321 Elm Blvd", "654 Maple Ln"][Math.floor(Math.random() * 5)]}, ${selectedCompany.city}, ${selectedCompany.state}`,
    dateCompleted: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
    photosCount: Math.floor(Math.random() * 6) + 1,
    noteLength: Math.floor(Math.random() * 300) + 50,
    hasBlogPost: Math.random() > 0.3,
    hasReviewRequest: Math.random() > 0.2,
    reviewStatus: Math.random() > 0.5 ? (Math.random() > 0.7 ? "completed" : "pending") : "none"
  })) : [];
  
  // Mock reviews for selected company
  const mockReviews = selectedCompany ? Array.from({ length: 10 }).map((_, index) => ({
    id: index + 1,
    customerName: `Customer ${index + 1}`,
    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
    reviewText: "Great service! The technician was professional, on time, and fixed our issue quickly. Would definitely recommend!",
    technicianName: `Technician ${Math.floor(Math.random() * selectedCompany.currentTechnicians) + 1}`,
    jobType: ["Repair", "Installation", "Maintenance", "Inspection", "Emergency"][Math.floor(Math.random() * 5)],
    reviewDate: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
    platform: ["Google", "Facebook", "Yelp", "Website"][Math.floor(Math.random() * 4)],
    responseStatus: Math.random() > 0.2 ? "responded" : "pending"
  })) : [];
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto p-6">
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
                  <CardTitle className="text-2xl">{companies.length}</CardTitle>
                  <CardDescription>Total Companies</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">
                    {companies.filter(c => c.isActive).length} active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">
                    {companies.reduce((sum, company) => sum + company.currentTechnicians, 0)}
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
                    {companies.reduce((sum, company) => sum + company.stats.totalCheckIns, 0)}
                  </CardTitle>
                  <CardDescription>Total Check-ins</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">
                    {companies.reduce((sum, company) => sum + company.stats.activeCheckInsLast30Days, 0)} in last 30 days
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">
                    {(companies.reduce((sum, company) => sum + (company.stats.avgRating * company.stats.totalReviews), 0) / 
                     companies.reduce((sum, company) => sum + company.stats.totalReviews, 0)).toFixed(1)}
                  </CardTitle>
                  <CardDescription>Average Rating</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    {companies.reduce((sum, company) => sum + company.stats.totalReviews, 0)} total reviews
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
                    {mockPlans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
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
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No companies found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCompanies.map(company => (
                        <TableRow key={company.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{company.name}</div>
                              <div className="text-sm text-gray-500">{company.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{company.industry}</TableCell>
                          <TableCell>{company.planName}</TableCell>
                          <TableCell>{company.currentTechnicians} / {company.maxTechnicians}</TableCell>
                          <TableCell>{company.stats.totalCheckIns}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="mr-1">{company.stats.avgRating}</span>
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={company.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {company.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedCompany(company)}>
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setViewCompanyStats(company)}>
                                Stats
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
                        <p>{selectedCompany.currentTechnicians} used of {selectedCompany.maxTechnicians}</p>
                        <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(selectedCompany.currentTechnicians / selectedCompany.maxTechnicians) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Enabled Features</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedCompany.featuresEnabled.map(featureId => (
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
                        <p className="text-2xl font-bold">{selectedCompany.stats.totalCheckIns}</p>
                        <p className="text-sm text-gray-500">{selectedCompany.stats.activeCheckInsLast30Days} in the last 30 days</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Blog Posts Generated</h3>
                        <p className="text-2xl font-bold">{selectedCompany.stats.totalBlogPosts}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Reviews Collected</h3>
                        <div className="flex items-center">
                          <span className="text-2xl font-bold mr-2">{selectedCompany.stats.totalReviews}</span>
                          <div className="flex items-center">
                            <span className="mr-1">Avg {selectedCompany.stats.avgRating}</span>
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
                        .filter(industry => companies.some(c => c.industry === industry))
                        .map(industry => {
                          const count = companies.filter(c => c.industry === industry).length;
                          const percentage = (count / companies.length) * 100;
                          
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
                      {mockPlans.map(plan => {
                        const count = companies.filter(c => c.planId === plan.id).length;
                        const percentage = (count / companies.length) * 100;
                        
                        return (
                          <div key={plan.id} className="flex items-center">
                            <div className="w-28">{plan.name}</div>
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
                      {companies
                        .sort((a, b) => b.stats.activeCheckInsLast30Days - a.stats.activeCheckInsLast30Days)
                        .map(company => (
                          <TableRow key={company.id}>
                            <TableCell className="font-medium">{company.name}</TableCell>
                            <TableCell>{company.planName}</TableCell>
                            <TableCell>{company.stats.activeCheckInsLast30Days}</TableCell>
                            <TableCell>{company.stats.totalCheckIns}</TableCell>
                            <TableCell>{company.stats.totalBlogPosts}</TableCell>
                            <TableCell>{company.stats.totalReviews}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span>{company.stats.avgRating}</span>
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
                        {companies
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
                        {companies
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
          <DialogContent className="max-w-3xl">
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
                            {mockPlans.map(plan => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name} - ${plan.monthlyPrice}/mo
                              </SelectItem>
                            ))}
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
                            checked={field.value}
                            onCheckedChange={field.onChange}
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
                                      checked={field.value?.includes(feature.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, feature.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== feature.id
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
                        <p className="text-2xl font-bold">{viewCompanyStats.stats.totalCheckIns}</p>
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
                              style={{ width: `${(viewCompanyStats.stats.activeCheckInsLast30Days / (viewCompanyStats.stats.totalCheckIns * 0.25)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Blog Post Conversion Rate</span>
                            <span className="text-sm">{Math.round((viewCompanyStats.stats.totalBlogPosts / viewCompanyStats.stats.totalCheckIns) * 100)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${(viewCompanyStats.stats.totalBlogPosts / viewCompanyStats.stats.totalCheckIns) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Review Conversion Rate</span>
                            <span className="text-sm">{Math.round((viewCompanyStats.stats.totalReviews / viewCompanyStats.stats.totalCheckIns) * 100)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${(viewCompanyStats.stats.totalReviews / viewCompanyStats.stats.totalCheckIns) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Check-ins Per Technician</span>
                            <span className="text-sm">{Math.round(viewCompanyStats.stats.totalCheckIns / viewCompanyStats.currentTechnicians)}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${Math.min((viewCompanyStats.stats.totalCheckIns / viewCompanyStats.currentTechnicians) / 50 * 100, 100)}%` }}
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
                        {viewCompanyStats.featuresEnabled.map(featureId => {
                          const feature = availableFeatures.find(f => f.id === featureId);
                          if (!feature) return null;
                          
                          // Generate a random usage percentage for demo purposes
                          const usagePercentage = Math.floor(Math.random() * 70) + 30;
                          
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
                          .filter(f => !viewCompanyStats.featuresEnabled.includes(f.id))
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
                All technicians for {selectedCompany?.name} ({mockTechnicians.length} of {selectedCompany?.maxTechnicians} available slots used)
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
                {mockTechnicians.map(technician => (
                  <TableRow key={technician.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(technician.name)}&background=random`} />
                          <AvatarFallback>{technician.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                ))}
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
                {mockCheckIns.map(checkIn => (
                  <TableRow key={checkIn.id}>
                    <TableCell>{checkIn.jobType}</TableCell>
                    <TableCell>{checkIn.technicianName}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{checkIn.location}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(checkIn.dateCompleted))} ago</TableCell>
                    <TableCell>{checkIn.photosCount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={checkIn.hasBlogPost ? "bg-green-50" : "bg-gray-50"}>
                        {checkIn.hasBlogPost ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                        Blog Post
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          checkIn.reviewStatus === 'completed' 
                            ? "bg-green-100 text-green-800" 
                            : checkIn.reviewStatus === 'pending' 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {checkIn.reviewStatus === 'completed' 
                          ? "Reviewed" 
                          : checkIn.reviewStatus === 'pending' 
                            ? "Pending" 
                            : "No Request"}
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
    </div>
  );
}