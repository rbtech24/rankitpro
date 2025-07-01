import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../../lib/queryClient';
import Sidebar from '../../components/layout/sidebar-clean';
import Header from '../../components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
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
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import {
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react";

interface SubscriptionPlan {
  id: number;
  name: string;
  price: string;
  billingPeriod: string;
  maxTechnicians: number;
  maxCheckIns: number;
  features: string[];
  isActive: boolean;
  subscriberCount: number;
  revenue: number;
}

export default function SubscriptionManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    billingPeriod: 'monthly',
    maxTechnicians: 0,
    maxCheckIns: 0,
    features: [] as string[],
  });
  const [featureInput, setFeatureInput] = useState('');

  // Fetch subscription plans
  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/billing/plans'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/billing/plans');
      return res.json();
    }
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const res = await apiRequest('POST', '/api/billing/plans', planData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/plans'] });
      toast({
        title: "Success",
        description: "Subscription plan created successfully",
      });
      setIsCreateDialogOpen(false);
      resetNewPlan();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription plan",
        variant: "destructive",
      });
    }
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest('PUT', `/api/billing/plans/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/plans'] });
      toast({
        title: "Success",
        description: "Subscription plan updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedPlan(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription plan",
        variant: "destructive",
      });
    }
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      const res = await apiRequest('DELETE', `/api/billing/plans/${planId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/plans'] });
      toast({
        title: "Success",
        description: "Subscription plan deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subscription plan",
        variant: "destructive",
      });
    }
  });

  const resetNewPlan = () => {
    setNewPlan({
      name: '',
      price: '',
      billingPeriod: 'monthly',
      maxTechnicians: 0,
      maxCheckIns: 0,
      features: [],
    });
    setFeatureInput('');
  };

  const addFeature = () => {
    if (featureInput.trim() && !newPlan.features.includes(featureInput.trim())) {
      setNewPlan(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setNewPlan(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  const handleCreatePlan = () => {
    if (!newPlan.name || !newPlan.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createPlanMutation.mutate(newPlan);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setNewPlan({
      name: plan.name,
      price: plan.price,
      billingPeriod: plan.billingPeriod,
      maxTechnicians: plan.maxTechnicians,
      maxCheckIns: plan.maxCheckIns,
      features: [...plan.features],
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlan = () => {
    if (!selectedPlan || !newPlan.name || !newPlan.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    updatePlanMutation.mutate({ id: selectedPlan.id, data: newPlan });
  };

  const handleDeletePlan = (planId: number) => {
    deletePlanMutation.mutate(planId);
  };

  const totalRevenue = plans?.reduce((sum, plan) => sum + plan.revenue, 0) || 0;
  const totalSubscribers = plans?.reduce((sum, plan) => sum + plan.subscriberCount, 0) || 0;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <div className="container mx-auto p-6 space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
                  <p className="text-muted-foreground">
                    Manage subscription plans, pricing, and features
                  </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Plan
                    </Button>
                  </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Subscription Plan</DialogTitle>
                <DialogDescription>
                  Add a new subscription plan with custom features and pricing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="plan-name">Plan Name</Label>
                  <Input
                    id="plan-name"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Enterprise"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plan-price">Price ($)</Label>
                    <Input
                      id="plan-price"
                      type="number"
                      value={newPlan.price}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="99.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing-period">Billing Period</Label>
                    <select
                      id="billing-period"
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      value={newPlan.billingPeriod}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, billingPeriod: e.target.value }))}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-technicians">Max Technicians (-1 for unlimited)</Label>
                    <Input
                      id="max-technicians"
                      type="number"
                      value={newPlan.maxTechnicians}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, maxTechnicians: parseInt(e.target.value) || 0 }))}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-checkins">Max Check-ins (-1 for unlimited)</Label>
                    <Input
                      id="max-checkins"
                      type="number"
                      value={newPlan.maxCheckIns}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, maxCheckIns: parseInt(e.target.value) || 0 }))}
                      placeholder="1000"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="feature-input">Features</Label>
                  <div className="flex gap-2">
                    <Input
                      id="feature-input"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      placeholder="Enter a feature"
                      onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    />
                    <Button type="button" onClick={addFeature}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newPlan.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFeature(feature)}>
                        {feature} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePlan} disabled={createPlanMutation.isPending}>
                  {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
                </Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plans?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active subscription plans
              </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubscribers}</div>
              <p className="text-xs text-muted-foreground">
                Across all plans
              </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From active subscriptions
              </p>
            </CardContent>
        </Card>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>
              Manage your subscription plans, pricing, and features
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Limits</TableHead>
                  <TableHead>Subscribers</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans?.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {plan.features.length} features
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${plan.price}</div>
                      <div className="text-sm text-muted-foreground">
                        per {plan.billingPeriod}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Technicians: {plan.maxTechnicians === -1 ? 'Unlimited' : plan.maxTechnicians}</div>
                        <div>Check-ins: {plan.maxCheckIns === -1 ? 'Unlimited' : plan.maxCheckIns}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{plan.subscriberCount}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${plan.revenue.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {plan.isActive ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPlan(plan)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the "{plan.name}" plan? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePlan(plan.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Subscription Plan</DialogTitle>
              <DialogDescription>
                Update plan details, pricing, and features
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-plan-name">Plan Name</Label>
                <Input
                  id="edit-plan-name"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Enterprise"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-plan-price">Price ($)</Label>
                  <Input
                    id="edit-plan-price"
                    type="number"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="99.00"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-billing-period">Billing Period</Label>
                  <select
                    id="edit-billing-period"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={newPlan.billingPeriod}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, billingPeriod: e.target.value }))}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-max-technicians">Max Technicians</Label>
                  <Input
                    id="edit-max-technicians"
                    type="number"
                    value={newPlan.maxTechnicians}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, maxTechnicians: parseInt(e.target.value) || 0 }))}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-max-checkins">Max Check-ins</Label>
                  <Input
                    id="edit-max-checkins"
                    type="number"
                    value={newPlan.maxCheckIns}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, maxCheckIns: parseInt(e.target.value) || 0 }))}
                    placeholder="1000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-feature-input">Features</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-feature-input"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Enter a feature"
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  />
                  <Button type="button" onClick={addFeature}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newPlan.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFeature(feature)}>
                      {feature} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePlan} disabled={updatePlanMutation.isPending}>
                {updatePlanMutation.isPending ? 'Updating...' : 'Update Plan'}
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
            </div>
        </main>
      </div>
    </div>
  );
}