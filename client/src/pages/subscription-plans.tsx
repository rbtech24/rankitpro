import React, { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { useToast } from "../hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { 
  Package, 
  DollarSign, 
  Users, 
  Settings,
  Save,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  userLimit: number;
  aiGenerationLimit: number;
  features: string[];
  active: boolean;
}

export default function SubscriptionPlans() {
  const { toast } = useToast();
  
  // Fetch subscription plans from database
  const { data: plans = [], refetch } = useQuery({
    queryKey: ["/api/billing/plans"],
    queryFn: () => apiRequest("/api/billing/plans")
  });

  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Create new subscription plan
  const createPlan = useMutation({
    mutationFn: (newPlan: any) => apiRequest("POST", "/api/billing/plans", newPlan),
    onSuccess: () => {
      refetch();
      toast({
        title: "Plan Created",
        description: "Subscription plan has been created successfully."
      });
    }
  });

  // Update subscription plan
  const updatePlan = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) => 
      apiRequest("PUT", `/api/billing/plans/${id}`, updates),
    onSuccess: () => {
      refetch();
      setEditingPlan(null);
      toast({
        title: "Plan Updated",
        description: "Subscription plan has been updated successfully."
      });
    }
  });

  // Delete subscription plan
  const deletePlan = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/billing/plans/${id}`),
    onSuccess: () => {
      refetch();
      toast({
        title: "Plan Deleted",
        description: "Subscription plan has been deleted successfully."
      });
    }
  });

  const PlanCard = ({ plan }: { plan: SubscriptionPlan }) => (
    <Card className="relative">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {plan.name}
              {!plan.active && <Badge variant="secondary">Inactive</Badge>}
            </CardTitle>
            <CardDescription className="mt-2">
              {plan.description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingPlan(plan)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">${plan.price}</span>
            <span className="text-gray-500">/{plan.interval}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Users:</span>
              <span className="ml-2 font-medium">
                {plan.userLimit === -1 ? 'Unlimited' : plan.userLimit}
              </span>
            </div>
            <div>
              <span className="text-gray-500">AI Generations:</span>
              <span className="ml-2 font-medium">{plan.aiGenerationLimit}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Features</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EditPlanModal = ({ plan, onSave, onCancel }: {
    plan: SubscriptionPlan;
    onSave: (plan: SubscriptionPlan) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(plan);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle>Edit {plan.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userLimit">User Limit</Label>
                <Input
                  id="userLimit"
                  type="number"
                  value={formData.userLimit === -1 ? '' : formData.userLimit}
                  placeholder="Leave empty for unlimited"
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    userLimit: e.target.value === '' ? -1 : Number(e.target.value) 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="aiLimit">AI Generation Limit</Label>
                <Input
                  id="aiLimit"
                  type="number"
                  value={formData.aiGenerationLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, aiGenerationLimit: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                rows={6}
                value={formData.features.join('\n')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  features: e.target.value.split('\n').filter(f => f.trim()) 
                }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              />
              <Label htmlFor="active">Plan is active</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={() => onSave(formData)}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
            <p className="text-gray-600">Manage subscription plans and pricing</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Plan Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Payment Processing</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Configure Stripe integration for subscription billing
                  </p>
                  <Button variant="outline" size="sm">
                    Configure Stripe
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Trial Periods</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Set default trial periods for new subscriptions
                  </p>
                  <Button variant="outline" size="sm">
                    Manage Trials
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Usage Limits</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Configure enforcement of plan limits and overages
                  </p>
                  <Button variant="outline" size="sm">
                    Configure Limits
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Plan Migration</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Handle upgrades, downgrades, and cancellations
                  </p>
                  <Button variant="outline" size="sm">
                    Migration Rules
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {editingPlan && (
          <EditPlanModal
            plan={editingPlan}
            onSave={handleSavePlan}
            onCancel={() => setEditingPlan(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}