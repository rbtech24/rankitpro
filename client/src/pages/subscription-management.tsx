import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from '@/components/layout/sidebar-clean';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Users, 
  Calendar,
  TrendingUp,
  Package
} from 'lucide-react';

const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  price: z.number().min(0, "Price must be 0 or greater"),
  billingPeriod: z.enum(["monthly", "yearly"]),
  maxTechnicians: z.number().min(1, "Must allow at least 1 technician"),
  maxCheckIns: z.number().min(1, "Must allow at least 1 check-in per month"),
  features: z.string().min(1, "Features description is required"),
  isActive: z.boolean().default(true)
});

type PlanForm = z.infer<typeof planSchema>;

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  maxTechnicians: number;
  maxCheckIns: number;
  features: string[];
  isActive: boolean;
  subscriberCount: number;
  monthlyRevenue: number;
  createdAt: string;
  stripeProductId?: string;
  stripePriceId?: string;
}

export default function SubscriptionManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      price: 0,
      billingPeriod: "monthly",
      maxTechnicians: 1,
      maxCheckIns: 100,
      features: "",
      isActive: true
    }
  });

  // Initialize subscription plans if none exist
  const initializePlansMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/admin/initialize-plans').then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscription-plans'] });
      toast({
        title: "Success",
        description: "Subscription plans initialized successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize subscription plans",
        variant: "destructive"
      });
    }
  });

  // Fetch subscription plans
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['/api/admin/subscription-plans'],
    queryFn: () => apiRequest('GET', '/api/admin/subscription-plans').then(res => res.json())
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: (data: PlanForm) => 
      apiRequest('POST', '/api/admin/subscription-plans', {
        ...data,
        features: data.features.split('\n').filter(f => f.trim())
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscription-plans'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Subscription plan created successfully"
      });
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
    mutationFn: ({ id, data }: { id: string; data: PlanForm }) =>
      apiRequest('PUT', `/api/admin/subscription-plans/${id}`, {
        ...data,
        features: data.features.split('\n').filter(f => f.trim())
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscription-plans'] });
      setEditingPlan(null);
      form.reset();
      toast({
        title: "Success",
        description: "Subscription plan updated successfully"
      });
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
    mutationFn: (id: string) =>
      apiRequest('DELETE', `/api/admin/subscription-plans/${id}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscription-plans'] });
      toast({
        title: "Success",
        description: "Subscription plan deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subscription plan",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: PlanForm) => {
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data });
    } else {
      createPlanMutation.mutate(data);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    form.reset({
      name: plan.name,
      price: parseFloat(plan.price),
      billingPeriod: plan.billingPeriod,
      maxTechnicians: plan.maxTechnicians,
      maxCheckIns: plan.maxCheckIns,
      features: plan.features.join('\n'),
      isActive: plan.isActive
    });
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingPlan(null);
    form.reset();
  };

  const totalRevenue = plans.reduce((sum: number, plan: SubscriptionPlan) => sum + plan.monthlyRevenue, 0);
  const totalSubscribers = plans.reduce((sum: number, plan: SubscriptionPlan) => sum + plan.subscriberCount, 0);
  const activePlans = plans.filter((plan: SubscriptionPlan) => plan.isActive).length;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Subscription Management</h1>
              <p className="text-gray-600 mt-2">Manage subscription plans and pricing</p>
            </div>
            <Dialog open={isCreateDialogOpen || !!editingPlan} onOpenChange={handleCloseDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPlan ? 'Update the subscription plan details' : 'Create a new subscription plan for customers'}
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
                              <Input placeholder="e.g. Professional Plan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="maxCheckIns"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Check-ins per Month</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="features"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Features (one per line)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="GPS Check-ins&#10;AI Blog Generation&#10;Review Management&#10;WordPress Integration"
                              rows={6}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                      >
                        {editingPlan ? 'Update Plan' : 'Create Plan'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSubscribers}</div>
                <p className="text-xs text-muted-foreground">Total active subscriptions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activePlans}</div>
                <p className="text-xs text-muted-foreground">Available subscription plans</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Revenue per User</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalSubscribers > 0 ? (totalRevenue / totalSubscribers).toFixed(2) : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">Monthly ARPU</p>
              </CardContent>
            </Card>
          </div>

          {/* Plans Table */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>
                Manage pricing and features for all subscription plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Billing</TableHead>
                      <TableHead>Limits</TableHead>
                      <TableHead>Subscribers</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan: SubscriptionPlan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>${parseFloat(plan.price).toFixed(2)}</TableCell>
                        <TableCell className="capitalize">{plan.billingPeriod}</TableCell>
                        <TableCell>
                          {plan.maxTechnicians} techs, {plan.maxCheckIns} check-ins
                        </TableCell>
                        <TableCell>{plan.subscriberCount}</TableCell>
                        <TableCell>${plan.monthlyRevenue.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={plan.isActive ? "default" : "secondary"}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(plan)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deletePlanMutation.mutate(plan.id)}
                              disabled={deletePlanMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}