import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, Users, TrendingUp, Clock, ExternalLink, User, Building2, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';

interface SalesDashboardData {
  salesPerson: any;
  stats: {
    totalCustomers: number;
    monthlyEarnings: number;
    pendingPayouts: number;
    conversionRate: number;
    lastSale: string | null;
  };
  customers: any[];
  commissions: any[];
  pendingCommissions: any[];
}

export default function SalesDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bankingDetails: {
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      bankName: ''
    }
  });
  const [companyData, setCompanyData] = useState({
    name: '',
    contactEmail: '',
    phone: '',
    address: '',
    plan: '',
    billingPeriod: 'yearly'
  });

  const { data: subscriptionPlans = [] } = useQuery<any[]>({
    queryKey: ['/api/sales/subscription-plans'],
    enabled: user?.role === 'sales_staff'
  });

  const { data: dashboardData, isLoading, refetch } = useQuery<SalesDashboardData>({
    queryKey: ['/api/sales/dashboard'],
    enabled: user?.role === 'sales_staff'
  });

  const { data: payouts } = useQuery({
    queryKey: ['/api/sales/payouts'],
    enabled: user?.role === 'sales_staff'
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', '/api/sales/profile', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved."
      });
      setIsProfileDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/sales/dashboard'] });
    },
    onError: () => {
      toast({
        title: "Error updating profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/sales/companies', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Company created successfully",
        description: "The new company has been added to your assignments."
      });
      setIsCompanyDialogOpen(false);
      setCompanyData({
        name: '',
        contactEmail: '',
        phone: '',
        address: '',
        plan: 'starter',
        billingPeriod: 'monthly'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/dashboard'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating company",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const handleConnectStripe = async () => {
    try {
      const response = await apiRequest('POST', '/api/sales/connect-stripe');
      const data = await response.json();
      
      if (data.accountLink) {
        window.open(data.accountLink, '_blank');
        toast({
          title: "Redirecting to Stripe",
          description: "Complete your bank account setup in the new window."
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to Stripe. Please contact support.",
        variant: "destructive"
      });
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompanyMutation.mutate(companyData);
  };

  if (user?.role !== 'sales_staff') {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need sales staff permissions to access this dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
            <CardDescription>
              Unable to load your sales dashboard. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { salesPerson, stats, customers, commissions, pendingCommissions } = dashboardData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {salesPerson.name}
          </p>
        </div>
        
        {!salesPerson.stripeAccountId && (
          <Button onClick={handleConnectStripe} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Connect Bank Account
          </Button>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="companies">Sign Up Companies</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  Companies you've signed up
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.monthlyEarnings)}</div>
                <p className="text-xs text-muted-foreground">
                  Paid commissions this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.pendingPayouts)}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval & payment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(parseFloat(salesPerson.commissionRate) * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Your commission percentage
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest commissions and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Recent activity will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your profile information and banking details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name || salesPerson.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email || salesPerson.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone || salesPerson.phone || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Bank Account Status</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {salesPerson.stripeAccountId ? (
                      <Badge variant="default">Connected</Badge>
                    ) : (
                      <Badge variant="secondary">Not Connected</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleProfileSubmit}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
                {!salesPerson.stripeAccountId && (
                  <Button onClick={handleConnectStripe} variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Connect Bank Account
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Sign Up Companies
              </CardTitle>
              <CardDescription>
                Add new companies to earn commission on their subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Company
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Sign Up New Company</DialogTitle>
                    <DialogDescription>
                      Fill out the company details to create their account and earn commission
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCompanySubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={companyData.name}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={companyData.contactEmail}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, contactEmail: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyPhone">Phone</Label>
                        <Input
                          id="companyPhone"
                          value={companyData.phone}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="plan">Subscription Plan</Label>
                        <Select value={companyData.plan} onValueChange={(value) => setCompanyData(prev => ({ ...prev, plan: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {subscriptionPlans.map((plan: any) => {
                              const monthlyPrice = parseFloat(plan.price) || 0;
                              const yearlyPrice = parseFloat(plan.yearlyPrice) || (monthlyPrice * 10);
                              const annualSavings = (monthlyPrice * 12) - yearlyPrice;
                              const discountPercent = monthlyPrice > 0 ? 
                                Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100) : 0;
                              
                              const displayPrice = companyData.billingPeriod === 'yearly'
                                ? `$${yearlyPrice}/year • Save $${annualSavings.toFixed(0)} (${discountPercent}% off)`
                                : `$${monthlyPrice}/month`;
                              
                              return (
                                <SelectItem key={plan.id} value={plan.id.toString()}>
                                  {plan.name} • {displayPrice}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="billingPeriod">Billing Period</Label>
                        <Select value={companyData.billingPeriod} onValueChange={(value) => setCompanyData(prev => ({ ...prev, billingPeriod: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly billing</SelectItem>
                            <SelectItem value="yearly">Annual billing (best value)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Company Address</Label>
                      <Input
                        id="address"
                        value={companyData.address}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Main St, City, State, ZIP"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCompanyDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createCompanyMutation.isPending}>
                        {createCompanyMutation.isPending ? 'Creating...' : 'Create Company'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Recent Company Signups */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Company Signups</CardTitle>
              <CardDescription>Companies you've successfully signed up</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                Company signup history will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}