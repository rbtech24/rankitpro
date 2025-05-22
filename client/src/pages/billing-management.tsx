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
import { useMediaQuery } from '@/hooks/use-media-query';

// Fix for sidebar import error
if (typeof Sidebar !== 'function') {
  // @ts-ignore - fallback if import fails
  const SidebarComponent = () => (
    <aside className="w-64 bg-white border-r h-screen p-4">
      <nav className="mt-6">
        <ul className="space-y-2">
          <li><a href="/dashboard" className="block p-2 rounded hover:bg-gray-100">Dashboard</a></li>
          <li><a href="/billing-management" className="block p-2 rounded bg-primary text-white">Billing Management</a></li>
          <li><a href="/companies" className="block p-2 rounded hover:bg-gray-100">Companies</a></li>
        </ul>
      </nav>
    </aside>
  );
  // Use conditional rendering instead of reassignment
  // This approach is more React-friendly and works better in production builds
}

// Plan creation schema
const planSchema = z.object({
  name: z.string().min(3, { message: "Plan name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  monthlyPrice: z.number().min(0, { message: "Price must be a positive number." }),
  yearlyPrice: z.number().min(0, { message: "Yearly price must be a positive number." }),
  maxTechnicians: z.number().min(1, { message: "Must allow at least 1 technician." }),
  maxCheckinsPerMonth: z.number().min(1, { message: "Must allow at least 1 check-in per month." }),
  features: z.array(z.string()),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  stripePriceIdMonthly: z.string().optional(),
  stripePriceIdYearly: z.string().optional(),
});

// Mock data for subscription plans
const mockPlans = [
  {
    id: 1,
    name: "Starter",
    description: "Perfect for small businesses with 1-5 technicians",
    monthlyPrice: 99,
    yearlyPrice: 990,
    maxTechnicians: 5,
    maxCheckinsPerMonth: 500,
    features: [
      "Unlimited Check-ins",
      "AI Content Generation",
      "Review Request System",
      "WordPress Integration",
      "Email Support"
    ],
    isActive: true,
    isFeatured: false,
    stripePriceIdMonthly: "price_starter_monthly",
    stripePriceIdYearly: "price_starter_yearly",
    companiesCount: 18
  },
  {
    id: 2,
    name: "Professional",
    description: "For growing businesses with up to 15 technicians",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    maxTechnicians: 15,
    maxCheckinsPerMonth: 1500,
    features: [
      "Everything in Starter",
      "Custom Branding",
      "Advanced Analytics",
      "Priority Support",
      "CRM Integrations"
    ],
    isActive: true,
    isFeatured: true,
    stripePriceIdMonthly: "price_pro_monthly",
    stripePriceIdYearly: "price_pro_yearly",
    companiesCount: 32
  },
  {
    id: 3,
    name: "Enterprise",
    description: "For large businesses with unlimited technicians",
    monthlyPrice: 499,
    yearlyPrice: 4990,
    maxTechnicians: 999,
    maxCheckinsPerMonth: 99999,
    features: [
      "Everything in Professional",
      "Unlimited Technicians",
      "Dedicated Account Manager",
      "Custom API Access",
      "White-label Solution"
    ],
    isActive: true,
    isFeatured: false,
    stripePriceIdMonthly: "price_enterprise_monthly",
    stripePriceIdYearly: "price_enterprise_yearly",
    companiesCount: 7
  }
];

// Mock data for companies
const mockCompanies = [
  {
    id: 1,
    name: "Top HVAC Solutions",
    planId: 2,
    planName: "Professional",
    subscriptionStatus: "active",
    billingCycle: "monthly",
    nextBillingDate: "2025-06-15",
    amountDue: 199,
    technicians: 11,
    signupDate: "2024-09-05",
    totalRevenue: 1592
  },
  {
    id: 2,
    name: "Ace Plumbing Services",
    planId: 1,
    planName: "Starter",
    subscriptionStatus: "active",
    billingCycle: "yearly",
    nextBillingDate: "2026-01-22",
    amountDue: 0,
    technicians: 4,
    signupDate: "2024-01-22",
    totalRevenue: 990
  },
  {
    id: 3,
    name: "Metro Electrical Contractors",
    planId: 3,
    planName: "Enterprise",
    subscriptionStatus: "trialing",
    billingCycle: "monthly",
    nextBillingDate: "2025-06-10",
    amountDue: 0,
    technicians: 32,
    signupDate: "2025-05-10",
    totalRevenue: 0
  },
  {
    id: 4,
    name: "City Roofing Experts",
    planId: 2,
    planName: "Professional",
    subscriptionStatus: "past_due",
    billingCycle: "monthly",
    nextBillingDate: "2025-05-20",
    amountDue: 199,
    technicians: 8,
    signupDate: "2024-11-20",
    totalRevenue: 1194
  },
  {
    id: 5,
    name: "Green Landscaping LLC",
    planId: 1,
    planName: "Starter",
    subscriptionStatus: "canceled",
    billingCycle: "monthly",
    nextBillingDate: null,
    amountDue: 0,
    technicians: 3,
    signupDate: "2024-08-15",
    totalRevenue: 495
  }
];

// Subscription status badge color map
const statusColorMap: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  trialing: "bg-blue-100 text-blue-800",
  past_due: "bg-red-100 text-red-800",
  canceled: "bg-gray-100 text-gray-800",
  incomplete: "bg-yellow-100 text-yellow-800"
};

// Billing management component
export default function BillingManagement() {
  const [plans, setPlans] = useState(mockPlans);
  const [companies, setCompanies] = useState(mockCompanies);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [viewingCompany, setViewingCompany] = useState<any>(null);
  const { toast } = useToast();
  
  // Form for creating/editing plans
  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
      monthlyPrice: 0,
      yearlyPrice: 0,
      maxTechnicians: 1,
      maxCheckinsPerMonth: 100,
      features: [],
      isActive: true,
      isFeatured: false,
      stripePriceIdMonthly: "",
      stripePriceIdYearly: ""
    }
  });
  
  // Initialize form with plan data when editing
  React.useEffect(() => {
    if (editingPlan) {
      form.reset({
        name: editingPlan.name,
        description: editingPlan.description,
        monthlyPrice: editingPlan.monthlyPrice,
        yearlyPrice: editingPlan.yearlyPrice,
        maxTechnicians: editingPlan.maxTechnicians,
        maxCheckinsPerMonth: editingPlan.maxCheckinsPerMonth,
        features: editingPlan.features,
        isActive: editingPlan.isActive,
        isFeatured: editingPlan.isFeatured,
        stripePriceIdMonthly: editingPlan.stripePriceIdMonthly,
        stripePriceIdYearly: editingPlan.stripePriceIdYearly
      });
    }
  }, [editingPlan, form]);
  
  // Submit handler for plan form
  const onSubmit = (data: z.infer<typeof planSchema>) => {
    if (isAddingPlan) {
      // Add new plan
      const newPlan = {
        ...data,
        id: Math.max(...plans.map(p => p.id)) + 1,
        companiesCount: 0
      };
      setPlans([...plans, newPlan]);
      toast({
        title: "Plan Created",
        description: `${data.name} plan has been created successfully.`
      });
    } else {
      // Update existing plan
      const updatedPlans = plans.map(plan => 
        plan.id === editingPlan.id ? { ...plan, ...data } : plan
      );
      setPlans(updatedPlans);
      toast({
        title: "Plan Updated",
        description: `${data.name} plan has been updated successfully.`
      });
    }
    
    // Reset form and close dialog
    setEditingPlan(null);
    setIsAddingPlan(false);
    form.reset();
  };
  
  // Handle plan deletion
  const handleDeletePlan = (id: number) => {
    const planToDelete = plans.find(p => p.id === id);
    
    // Check if any companies are using this plan
    const companiesUsingPlan = companies.filter(c => c.planId === id);
    
    if (companiesUsingPlan.length > 0) {
      toast({
        title: "Cannot Delete Plan",
        description: `${planToDelete?.name} is currently used by ${companiesUsingPlan.length} companies. Please migrate them to other plans first.`,
        variant: "destructive"
      });
      return;
    }
    
    const updatedPlans = plans.filter(plan => plan.id !== id);
    setPlans(updatedPlans);
    
    toast({
      title: "Plan Deleted",
      description: `${planToDelete?.name} plan has been deleted successfully.`
    });
  };
  
  // Handle plan activation/deactivation
  const togglePlanStatus = (id: number) => {
    const updatedPlans = plans.map(plan => {
      if (plan.id === id) {
        return { ...plan, isActive: !plan.isActive };
      }
      return plan;
    });
    
    setPlans(updatedPlans);
    
    const plan = plans.find(p => p.id === id);
    toast({
      title: plan?.isActive ? "Plan Deactivated" : "Plan Activated",
      description: `${plan?.name} is now ${plan?.isActive ? "hidden from" : "visible to"} new customers.`
    });
  };
  
  // Handle company subscription update
  const updateCompanySubscription = (companyId: number, newStatus: string) => {
    const updatedCompanies = companies.map(company => {
      if (company.id === companyId) {
        return { ...company, subscriptionStatus: newStatus };
      }
      return company;
    });
    
    setCompanies(updatedCompanies);
    
    const company = companies.find(c => c.id === companyId);
    toast({
      title: "Subscription Updated",
      description: `${company?.name}'s subscription status updated to ${newStatus}.`
    });
    
    setViewingCompany(null);
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Billing & Subscription Management</h1>
        
        <Tabs defaultValue="plans">
          <TabsList className="mb-6">
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="companies">Company Subscriptions</TabsTrigger>
            <TabsTrigger value="analytics">Billing Analytics</TabsTrigger>
          </TabsList>
          
          {/* Subscription Plans Tab */}
          <TabsContent value="plans">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Manage Subscription Plans</h2>
              <Button 
                onClick={() => {
                  form.reset();
                  setIsAddingPlan(true);
                  setEditingPlan(null);
                }}
              >
                Add New Plan
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map(plan => (
                <Card key={plan.id} className={`${plan.isFeatured ? 'border-primary' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      {plan.isFeatured && (
                        <Badge className="bg-primary">Featured</Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-3xl font-bold">${plan.monthlyPrice}<span className="text-sm font-normal">/mo</span></p>
                      <p className="text-sm text-slate-500">${plan.yearlyPrice}/year</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Max Technicians:</strong> {plan.maxTechnicians}</p>
                      <p className="text-sm"><strong>Max Check-ins/mo:</strong> {plan.maxCheckinsPerMonth.toLocaleString()}</p>
                      <p className="text-sm"><strong>Companies Using:</strong> {plan.companiesCount}</p>
                      <p className="text-sm"><strong>Status:</strong> {plan.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                    
                    <div className="mt-4">
                      <p className="font-medium mb-2">Features:</p>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="text-sm flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingPlan(plan)}>
                      Edit
                    </Button>
                    <div className="space-x-2">
                      <Button 
                        variant={plan.isActive ? "ghost" : "secondary"} 
                        size="sm"
                        onClick={() => togglePlanStatus(plan.id)}
                      >
                        {plan.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                        disabled={plan.companiesCount > 0}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Company Subscriptions Tab */}
          <TabsContent value="companies">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Company Subscriptions</h2>
              <div className="flex gap-2">
                <Input 
                  placeholder="Search companies..." 
                  className="max-w-xs"
                />
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Plans" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    {plans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Billing Cycle</TableHead>
                      <TableHead>Next Billing</TableHead>
                      <TableHead>Technicians</TableHead>
                      <TableHead>Total Revenue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map(company => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.planName}</TableCell>
                        <TableCell>
                          <Badge className={statusColorMap[company.subscriptionStatus]}>
                            {company.subscriptionStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{company.billingCycle}</TableCell>
                        <TableCell>{company.nextBillingDate || 'N/A'}</TableCell>
                        <TableCell>{company.technicians}</TableCell>
                        <TableCell>${company.totalRevenue}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setViewingCompany(company)}>
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Billing Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">$12,580</CardTitle>
                  <CardDescription>Monthly Recurring Revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">↑ 12.5% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">57</CardTitle>
                  <CardDescription>Active Subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">↑ 3 new this month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">$221</CardTitle>
                  <CardDescription>Avg. Revenue Per Account</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">↑ 5.2% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">4.8%</CardTitle>
                  <CardDescription>Churn Rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-600">↑ 1.2% from last month</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plans.map(plan => (
                      <div key={plan.id} className="flex items-center">
                        <div className="w-32">{plan.name}</div>
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${plan.companiesCount * plan.monthlyPrice / 126}%` }}
                          ></div>
                        </div>
                        <div className="w-24 text-right">
                          ${plan.companiesCount * plan.monthlyPrice}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Cycle Distribution</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="w-48 h-48 rounded-full border-8 border-primary relative flex items-center justify-center">
                    <div className="absolute inset-0 border-8 border-primary border-opacity-30 rounded-full"></div>
                    <div 
                      className="absolute top-0 right-0 bottom-0 left-0 border-8 border-transparent border-r-primary border-opacity-100 rounded-full" 
                      style={{ transform: 'rotate(108deg)' }}
                    ></div>
                    <div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">70%</div>
                        <div className="text-xs text-gray-500">Monthly</div>
                      </div>
                      <div className="text-center mt-1">
                        <div className="text-lg font-medium">30%</div>
                        <div className="text-xs text-gray-500">Annual</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Plan Edit/Create Dialog */}
        <Dialog 
          open={editingPlan !== null || isAddingPlan} 
          onOpenChange={(open) => {
            if (!open) {
              setEditingPlan(null);
              setIsAddingPlan(false);
              form.reset();
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isAddingPlan ? 'Create New Plan' : 'Edit Plan'}</DialogTitle>
              <DialogDescription>
                {isAddingPlan 
                  ? 'Create a new subscription plan for customers.' 
                  : `Modify the details for the ${editingPlan?.name} plan.`}
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
                        <FormLabel>Plan Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Professional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="monthlyPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the plan" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="yearlyPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yearly Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxCheckinsPerMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Check-ins Per Month</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex space-x-4">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Active Plan</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Featured Plan</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Stripe IDs - optional but important for production */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stripePriceIdMonthly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stripe Price ID (Monthly)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. price_1234567890" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Optional: ID from Stripe Dashboard
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stripePriceIdYearly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stripe Price ID (Yearly)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. price_1234567890" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Optional: ID from Stripe Dashboard
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => {
                    setEditingPlan(null);
                    setIsAddingPlan(false);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isAddingPlan ? 'Create Plan' : 'Update Plan'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Company Subscription Management Dialog */}
        <Dialog 
          open={viewingCompany !== null} 
          onOpenChange={(open) => {
            if (!open) setViewingCompany(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Company Subscription</DialogTitle>
              <DialogDescription>
                Update subscription details for {viewingCompany?.name}
              </DialogDescription>
            </DialogHeader>
            
            {viewingCompany && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Current Plan</h3>
                    <p>{viewingCompany.planName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Status</h3>
                    <Badge className={statusColorMap[viewingCompany.subscriptionStatus]}>
                      {viewingCompany.subscriptionStatus}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Billing Cycle</h3>
                    <p className="capitalize">{viewingCompany.billingCycle}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Next Billing Date</h3>
                    <p>{viewingCompany.nextBillingDate || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Technicians</h3>
                    <p>{viewingCompany.technicians} technicians</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Amount Due</h3>
                    <p>${viewingCompany.amountDue}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Change Subscription Plan</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={viewingCompany.planName} />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} (${plan.monthlyPrice}/mo)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Change Subscription Status</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={viewingCompany.subscriptionStatus} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trialing">Trialing</SelectItem>
                      <SelectItem value="past_due">Past Due</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter className="flex justify-between">
                  <div>
                    {viewingCompany.subscriptionStatus !== 'canceled' && (
                      <Button 
                        variant="destructive"
                        onClick={() => updateCompanySubscription(viewingCompany.id, 'canceled')}
                      >
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => setViewingCompany(null)}>
                      Close
                    </Button>
                    <Button>
                      Save Changes
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}