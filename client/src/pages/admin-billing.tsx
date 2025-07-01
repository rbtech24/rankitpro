import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "ui/card";
import { Button } from "ui/button";
import { Badge } from "ui/badge";
import { Input } from "ui/input";
import { Label } from "ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "use-toast";
import { apiRequest } from "queryClient";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users,
  Calendar,
  Filter,
  Search,
  Download,
  AlertTriangle
} from "lucide-react";

interface Company {
  id: number;
  name: string;
  plan: 'starter' | 'pro' | 'agency';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: string;
  nextBillingDate?: string;
  monthlyRevenue?: number;
  createdAt: string;
}

export default function AdminBilling() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["/api/admin/companies/billing"]
  });

  const { data: billingStats } = useQuery({
    queryKey: ["/api/admin/billing/stats"]
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (data: { companyId: number; plan: string; action: 'upgrade' | 'downgrade' | 'cancel' }) => 
      apiRequest("POST", "/api/admin/billing/subscription", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies/billing"] });
      toast({ title: "Subscription updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update subscription", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: async (companyId: number) => 
      apiRequest("POST", `/api/admin/billing/invoice/${companyId}`),
    onSuccess: () => {
      toast({ title: "Invoice generated successfully" });
    }
  });

  const filteredCompanies = companies.filter((company: Company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === "all" || company.plan === planFilter;
    const matchesStatus = statusFilter === "all" || company.subscriptionStatus === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'agency': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'past_due': return 'bg-red-100 text-red-800';
      case 'canceled': return 'bg-gray-100 text-gray-800';
      case 'trialing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing Management</h1>
              <p className="text-gray-600 mt-1">Manage subscriptions, billing, and revenue</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => generateInvoiceMutation.mutate(0)}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Billing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${billingStats?.monthlyRevenue?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {billingStats?.activeSubscriptions || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    +{billingStats?.growthRate || 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Past Due</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {billingStats?.pastDue || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search Companies</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by company name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>Plan Filter</Label>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status Filter</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="trialing">Trial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setPlanFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Company Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Company</th>
                    <th className="text-left py-3 px-4">Plan</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Revenue</th>
                    <th className="text-left py-3 px-4">Next Billing</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company: Company) => (
                    <tr key={company.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-gray-500">ID: {company.id}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getPlanColor(company.plan)}>
                          {company.plan.charAt(0).toUpperCase() + company.plan.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(company.subscriptionStatus || 'active')}>
                          {company.subscriptionStatus || 'Active'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">
                          ${company.monthlyRevenue?.toLocaleString() || '0'}/mo
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {company.nextBillingDate ? 
                            new Date(company.nextBillingDate).toLocaleDateString() : 
                            'N/A'
                          }
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateSubscriptionMutation.mutate({
                              companyId: company.id,
                              plan: 'pro',
                              action: 'upgrade'
                            })}
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            Manage
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => generateInvoiceMutation.mutate(company.id)}
                          >
                            Invoice
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}