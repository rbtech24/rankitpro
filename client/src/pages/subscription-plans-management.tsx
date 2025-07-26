import React, { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useToast } from "../hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit2, Trash2, DollarSign, Users, CheckCircle, ExternalLink } from "lucide-react";

interface SubscriptionPlan {
  id: number;
  name: string;
  price: string;
  yearlyPrice?: string;
  billingPeriod: 'monthly' | 'yearly';
  maxTechnicians: number;
  maxCheckIns: number;
  features: string[];
  isActive: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
  createdAt: string;
  updatedAt: string;
  subscriberCount?: number;
}

const planFormSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  price: z.string().min(1, "Price is required"),
  yearlyPrice: z.string().optional(),
  billingPeriod: z.enum(['monthly', 'yearly']),
  maxTechnicians: z.number().min(1, "Must allow at least 1 technician"),
  maxCheckIns: z.number().min(1, "Must allow at least 1 submission"),
  features: z.string().min(1, "Features are required"),
  isActive: z.boolean().default(true),
});

type PlanFormData = z.infer<typeof planFormSchema>;

export default function SubscriptionPlansManagement() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Query for subscription plans
  const { data: plansResponse, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/billing/plans"],
    queryFn: async () => {
      const response = await apiRequest('GET', "/api/billing/plans");
      return response.json();
    }
  });

  // Ensure plans is always an array
  const plans = Array.isArray(plansResponse) ? plansResponse : [];

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (data: PlanFormData) => {
      const formattedData = {
        ...data,
        features: data.features.split('\n').filter(f => f.trim())
      };
      const response = await apiRequest('POST', '/api/billing/plans', formattedData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription plan created successfully and synced with Stripe"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing/plans"] });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription plan",
        variant: "destructive"
      });
    }
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PlanFormData> }) => {
      const formattedData = data.features ? {
        ...data,
        features: data.features.split('\n').filter(f => f.trim())
      } : data;
      const response = await apiRequest('PUT', `/api/billing/plans/${id}`, formattedData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription plan updated successfully and synced with Stripe"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing/plans"] });
      setIsEditDialogOpen(false);
      setSelectedPlan(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription plan",
        variant: "destructive"
      });
    }
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/billing/plans/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription plan deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing/plans"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subscription plan",
        variant: "destructive"
      });
    }
  });

  // Sync all plans with Stripe mutation
  const syncAllWithStripeMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/billing/plans/sync'),
    onSuccess: (data: any) => {
      const successCount = data.results?.filter((r: any) => r.success).length || 0;
      const failCount = data.results?.filter((r: any) => !r.success).length || 0;
      
      toast({
        title: "Stripe Sync Complete",
        description: `${successCount} plans synced successfully${failCount > 0 ? `, ${failCount} failed` : ''}`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/billing/plans"] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed", 
        description: error.message || "Failed to sync plans with Stripe",
        variant: "destructive"
      });
    }
  });

  const createForm = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      billingPeriod: "monthly",
      maxTechnicians: 5,
      maxCheckIns: 50,
      isActive: true
    }
  });

  const editForm = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema)
  });

  // Populate edit form when plan is selected
  React.useEffect(() => {
    if (selectedPlan && isEditDialogOpen) {
      editForm.reset({
        name: selectedPlan.name,
        price: selectedPlan.price,
        yearlyPrice: selectedPlan.yearlyPrice || "",
        billingPeriod: selectedPlan.billingPeriod,
        maxTechnicians: selectedPlan.maxTechnicians,
        maxCheckIns: selectedPlan.maxCheckIns,
        features: selectedPlan.features.join('\n'),
        isActive: selectedPlan.isActive
      });
    }
  }, [selectedPlan, isEditDialogOpen, editForm]);

  const handleCreatePlan = (data: PlanFormData) => {
    createPlanMutation.mutate(data);
  };

  const handleEditPlan = (data: PlanFormData) => {
    if (selectedPlan) {
      updatePlanMutation.mutate({ id: selectedPlan.id, data });
    }
  };

  const handleDeletePlan = (id: number) => {
    if (confirm("Are you sure you want to delete this subscription plan? This action cannot be undone.")) {
      deletePlanMutation.mutate(id);
    }
  };

  const PlanForm = ({ form, onSubmit, isLoading }: { 
    form: any; 
    onSubmit: (data: PlanFormData) => void; 
    isLoading: boolean;
  }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Professional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="billingPeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Period</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
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
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="99.00" {...field} />
                </FormControl>
                <FormDescription>Price in USD</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="yearlyPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yearly Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="999.00" {...field} />
                </FormControl>
                <FormDescription>Optional yearly pricing</FormDescription>
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
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxCheckIns"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Submissions per Month</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Includes check-ins, reviews, testimonials, and blog posts</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features</FormLabel>
              <FormControl>
                <textarea 
                  placeholder="Enter one feature per line&#10;e.g.,&#10;AI Content Generation&#10;Review Management&#10;Advanced Analytics"
                  className="min-h-[100px] w-full px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-input bg-background rounded-md"
                  {...field} 
                />
              </FormControl>
              <FormDescription>Enter one feature per line</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Plan</FormLabel>
                <FormDescription>
                  Allow new subscriptions to this plan
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : "Save Plan"}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
            <p className="text-muted-foreground">
              Manage subscription plans with automatic Stripe integration
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Subscription Plan</DialogTitle>
                <DialogDescription>
                  Create a new subscription plan that will automatically sync with Stripe
                </DialogDescription>
              </DialogHeader>
              <PlanForm 
                form={createForm} 
                onSubmit={handleCreatePlan} 
                isLoading={createPlanMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Plans Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plans?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {plans?.filter(plan => plan.isActive).length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {plans?.reduce((sum, plan) => sum + (plan.subscriberCount || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${plans?.length ? (plans.reduce((sum, plan) => sum + parseFloat(plan.price), 0) / plans.length).toFixed(0) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>
              All plans automatically sync with Stripe when created or modified
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!plans || plans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No subscription plans available.</p>
                <p className="text-sm text-muted-foreground mt-2">Create your first plan to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Limits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stripe Status</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {plan.billingPeriod}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">${plan.price}/{plan.billingPeriod === 'monthly' ? 'mo' : 'yr'}</div>
                          {plan.yearlyPrice && (
                            <div className="text-sm text-muted-foreground">${plan.yearlyPrice}/yr</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{plan.maxTechnicians} technicians</div>
                          <div className="text-muted-foreground">{plan.maxCheckIns} submissions/mo</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={plan.isActive ? "default" : "secondary"}>
                          {plan.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant={plan.stripePriceId ? "default" : "outline"}>
                            {plan.stripePriceId ? "Synced" : "Not Synced"}
                          </Badge>
                          {!plan.stripePriceId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => syncWithStripeMutation.mutate(plan.id)}
                              disabled={syncWithStripeMutation.isPending}
                            >
                              Sync
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{plan.subscriberCount || 0}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPlan(plan);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePlan(plan.id)}
                            disabled={deletePlanMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {plan.stripeProductId && (
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <a 
                                href={`https://dashboard.stripe.com/products/${plan.stripeProductId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Plan Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Subscription Plan</DialogTitle>
              <DialogDescription>
                Update the subscription plan. Changes will automatically sync with Stripe.
              </DialogDescription>
            </DialogHeader>
            <PlanForm 
              form={editForm} 
              onSubmit={handleEditPlan} 
              isLoading={updatePlanMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}