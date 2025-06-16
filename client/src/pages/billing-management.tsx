import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Trash2, Plus, DollarSign, Users, CreditCard, TrendingUp } from "lucide-react";
import * as z from "zod";
import SidebarComponent from '@/components/layout/sidebar';

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

// Subscription status badge color map
const statusColorMap: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  trialing: "bg-blue-100 text-blue-800",
  past_due: "bg-red-100 text-red-800",
  canceled: "bg-gray-100 text-gray-800",
  incomplete: "bg-yellow-100 text-yellow-800"
};

export default function BillingManagement() {
  // Real subscription plans from database
  const { data: subscriptionPlans = [] } = useQuery({
    queryKey: ['/api/subscription-plans'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/subscription-plans');
      return response.json();
    }
  });

  // Real companies with billing data from database
  const { data: companiesWithBilling = [] } = useQuery({
    queryKey: ['/api/companies/billing'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/companies/billing');
      return response.json();
    }
  });

  // Real billing analytics from database
  const { data: billingAnalytics = {} } = useQuery({
    queryKey: ['/api/billing/analytics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/billing/analytics');
      return response.json();
    }
  });

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

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (data: z.infer<typeof planSchema>) => {
      const response = await apiRequest('POST', '/api/subscription-plans', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      toast({
        title: "Plan Created",
        description: "Subscription plan has been created successfully."
      });
      setIsAddingPlan(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create plan",
        variant: "destructive"
      });
    }
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: z.infer<typeof planSchema> }) => {
      const response = await apiRequest('PUT', `/api/subscription-plans/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      toast({
        title: "Plan Updated",
        description: "Subscription plan has been updated successfully."
      });
      setEditingPlan(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update plan",
        variant: "destructive"
      });
    }
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/subscription-plans/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      toast({
        title: "Plan Deleted",
        description: "Subscription plan has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan",
        variant: "destructive"
      });
    }
  });

  // Initialize form with plan data when editing
  useEffect(() => {
    if (editingPlan) {
      form.reset({
        name: editingPlan.name,
        description: editingPlan.description,
        monthlyPrice: editingPlan.monthlyPrice,
        yearlyPrice: editingPlan.yearlyPrice,
        maxTechnicians: editingPlan.maxTechnicians,
        maxCheckinsPerMonth: editingPlan.maxCheckinsPerMonth,
        features: editingPlan.features || [],
        isActive: editingPlan.isActive,
        isFeatured: editingPlan.isFeatured,
        stripePriceIdMonthly: editingPlan.stripePriceIdMonthly || "",
        stripePriceIdYearly: editingPlan.stripePriceIdYearly || ""
      });
    }
  }, [editingPlan, form]);
  
  // Submit handler for plan form
  const onSubmit = (data: z.infer<typeof planSchema>) => {
    if (isAddingPlan) {
      createPlanMutation.mutate(data);
    } else if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data });
    }
  };
  
  // Handle plan deletion
  const handleDeletePlan = (id: number) => {
    const planToDelete = subscriptionPlans.find((p: any) => p.id === id);
    
    // Check if any companies are using this plan
    const companiesUsingPlan = companiesWithBilling.filter((c: any) => c.planId === id);
    
    if (companiesUsingPlan.length > 0) {
      toast({
        title: "Cannot Delete Plan",
        description: `${companiesUsingPlan.length} companies are currently using this plan. Please migrate them to another plan first.`,
        variant: "destructive"
      });
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the "${planToDelete?.name}" plan? This action cannot be undone.`)) {
      deletePlanMutation.mutate(id);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarComponent />
      
      <div className="flex-1 overflow-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Billing Management</h1>
        
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="companies">Company Billing</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">
                      ${billingAnalytics.totalRevenue || 0}
                    </CardTitle>
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <CardDescription>Total Revenue</CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">
                      {billingAnalytics.activeSubscriptions || 0}
                    </CardTitle>
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardDescription>Active Subscriptions</CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">
                      ${billingAnalytics.monthlyRecurringRevenue || 0}
                    </CardTitle>
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardDescription>Monthly Recurring Revenue</CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">
                      {subscriptionPlans.length}
                    </CardTitle>
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardDescription>Subscription Plans</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>
          
          {/* Subscription Plans Tab */}
          <TabsContent value="plans">
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Subscription Plans</h2>
                <Dialog open={isAddingPlan} onOpenChange={setIsAddingPlan}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Plan</DialogTitle>
                      <DialogDescription>
                        Create a new subscription plan for your customers.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Plan Name</Label>
                          <Input {...form.register('name')} placeholder="Enter plan name" />
                          {form.formState.errors.name && (
                            <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                          <Input 
                            {...form.register('monthlyPrice', { valueAsNumber: true })} 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input {...form.register('description')} placeholder="Plan description" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="yearlyPrice">Yearly Price ($)</Label>
                          <Input 
                            {...form.register('yearlyPrice', { valueAsNumber: true })} 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxTechnicians">Max Technicians</Label>
                          <Input 
                            {...form.register('maxTechnicians', { valueAsNumber: true })} 
                            type="number" 
                            placeholder="1" 
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddingPlan(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createPlanMutation.isPending}>
                          {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan: any) => (
                <Card key={plan.id} className={`relative ${plan.isFeatured ? 'ring-2 ring-blue-500' : ''}`}>
                  {plan.isFeatured && (
                    <Badge className="absolute -top-2 left-4 bg-blue-500">Featured</Badge>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription className="mt-1">{plan.description}</CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPlan(plan)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">${plan.monthlyPrice}/month</div>
                      <div className="text-sm text-gray-600">${plan.yearlyPrice}/year</div>
                      <div className="text-sm">Up to {plan.maxTechnicians} technicians</div>
                      <div className="text-sm">{plan.maxCheckinsPerMonth} check-ins/month</div>
                      <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Company Billing Tab */}
          <TabsContent value="companies">
            <Card>
              <CardHeader>
                <CardTitle>Company Billing Status</CardTitle>
                <CardDescription>
                  Monitor subscription status and billing for all companies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Billing</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Technicians</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companiesWithBilling.map((company: any) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.planName || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={statusColorMap[company.subscriptionStatus] || statusColorMap.incomplete}>
                            {company.subscriptionStatus || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {company.nextBillingDate ? new Date(company.nextBillingDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>${company.totalRevenue || 0}</TableCell>
                        <TableCell>{company.technicianCount || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Edit Plan Dialog */}
        <Dialog open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Plan</DialogTitle>
              <DialogDescription>
                Update the subscription plan details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plan Name</Label>
                  <Input {...form.register('name')} placeholder="Enter plan name" />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                  <Input 
                    {...form.register('monthlyPrice', { valueAsNumber: true })} 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input {...form.register('description')} placeholder="Plan description" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yearlyPrice">Yearly Price ($)</Label>
                  <Input 
                    {...form.register('yearlyPrice', { valueAsNumber: true })} 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                  />
                </div>
                <div>
                  <Label htmlFor="maxTechnicians">Max Technicians</Label>
                  <Input 
                    {...form.register('maxTechnicians', { valueAsNumber: true })} 
                    type="number" 
                    placeholder="1" 
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingPlan(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePlanMutation.isPending}>
                  {updatePlanMutation.isPending ? 'Updating...' : 'Update Plan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}