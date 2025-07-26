import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { DollarSign, Users, TrendingUp, Clock, Plus, CheckCircle, UserPlus, Edit, UserX, UserCheck, DollarSign as DollarSignIcon, MoreHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import AdminLayout from '../components/layout/AdminLayout';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

interface CreateSalesPersonForm {
  name: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
  commissionRate: number;
}

interface EditSalesPersonForm {
  name: string;
  email: string;
  phone?: string;
  commissionRate: number;
}

interface AssignCustomerForm {
  salesPersonId: number;
  companyId: number;
  subscriptionPlan: string;
  initialPlanPrice: number;
  currentPlanPrice: number;
  billingPeriod: 'monthly' | 'yearly';
}

export default function SalesManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSalesPerson, setEditingSalesPerson] = useState<any>(null);
  const [financialDialogOpen, setFinancialDialogOpen] = useState(false);
  const [selectedSalesPersonForFinancials, setSelectedSalesPersonForFinancials] = useState<any>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCommissions, setSelectedCommissions] = useState<number[]>([]);

  const createForm = useForm<CreateSalesPersonForm>({
    defaultValues: {
      commissionRate: 0.10 // 10% default
    }
  });

  const editForm = useForm<EditSalesPersonForm>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      commissionRate: 0.10
    }
  });

  const assignForm = useForm<AssignCustomerForm>();

  // Queries with proper default values
  const { data: salesPeople = [], isLoading: loadingSalesPeople } = useQuery({
    queryKey: ['/api/sales/people'],
    enabled: user?.role === 'super_admin'
  });

  const { data: analytics = {} } = useQuery({
    queryKey: ['/api/sales/analytics'],
    enabled: user?.role === 'super_admin'
  });

  const { data: pendingCommissions = [] } = useQuery({
    queryKey: ['/api/sales/commissions/pending'],
    enabled: user?.role === 'super_admin'
  });

  const { data: allPayouts = [] } = useQuery({
    queryKey: ['/api/sales/payouts'],
    enabled: user?.role === 'super_admin'
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['/api/companies'],
    enabled: user?.role === 'super_admin'
  });

  // Financial details query for selected sales person
  const { data: financialDetails, refetch: refetchFinancialDetails } = useQuery({
    queryKey: ['/api/sales/people', selectedSalesPersonForFinancials?.id, 'financials'],
    queryFn: async () => {
      if (!selectedSalesPersonForFinancials?.id) return null;
      const response = await apiRequest('GET', `/api/sales/people/${selectedSalesPersonForFinancials.id}/financials`);
      return response.json();
    },
    enabled: !!selectedSalesPersonForFinancials?.id
  });

  // Mutations
  const createSalesPersonMutation = useMutation({
    mutationFn: async (data: CreateSalesPersonForm) => {
      const response = await apiRequest('POST', '/api/sales/people', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/people'] });
      setCreateDialogOpen(false);
      createForm.reset();
      toast({ title: 'Sales person created successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error creating sales person', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const editSalesPersonMutation = useMutation({
    mutationFn: async (data: EditSalesPersonForm & { id: number }) => {
      const response = await apiRequest('PUT', `/api/sales/people/${data.id}`, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        commissionRate: data.commissionRate
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/people'] });
      setEditDialogOpen(false);
      setEditingSalesPerson(null);
      editForm.reset();
      toast({ title: 'Sales person updated successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error updating sales person', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const toggleSalesPersonStatus = useMutation({
    mutationFn: async (data: { id: number; isActive: boolean }) => {
      const response = await apiRequest('PUT', `/api/sales/people/${data.id}`, {
        isActive: data.isActive
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/people'] });
      toast({ 
        title: `Sales person ${variables.isActive ? 'activated' : 'deactivated'} successfully` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error updating sales person status', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const assignCustomerMutation = useMutation({
    mutationFn: async (data: AssignCustomerForm) => {
      const response = await apiRequest('POST', '/api/sales/customers/assign', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/customers'] });
      setAssignDialogOpen(false);
      assignForm.reset();
      toast({ title: 'Customer assigned successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error assigning customer', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const approveCommissionsMutation = useMutation({
    mutationFn: async (commissionIds: number[]) => {
      const response = await apiRequest('POST', '/api/sales/commissions/approve', { commissionIds });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/commissions/pending'] });
      setSelectedCommissions([]);
      toast({ title: 'Commissions approved successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error approving commissions', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const createPayoutMutation = useMutation({
    mutationFn: async ({ salesPersonId, commissionIds, totalAmount }: { 
      salesPersonId: number; 
      commissionIds: number[]; 
      totalAmount: number; 
    }) => {
      const response = await apiRequest('POST', '/api/sales/payouts', {
        salesPersonId,
        commissionIds,
        totalAmount
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/payouts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/commissions'] });
      toast({ title: 'Payout created successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error creating payout', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const deleteSalesPersonMutation = useMutation({
    mutationFn: async (salesPersonId: number) => {
      const response = await apiRequest('DELETE', `/api/sales/people/${salesPersonId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/people'] });
      toast({ title: 'Sales person deleted successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting sales person', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need super admin permissions to access sales management.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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

  const handleCommissionSelection = (commissionId: number, checked: boolean) => {
    if (checked) {
      setSelectedCommissions([...selectedCommissions, commissionId]);
    } else {
      setSelectedCommissions(selectedCommissions.filter(id => id !== commissionId));
    }
  };

  const handleApproveSelected = () => {
    if (selectedCommissions.length > 0) {
      approveCommissionsMutation.mutate(selectedCommissions);
    }
  };

  const totalSelectedAmount = pendingCommissions?.reduce((total: number, commission: any) => {
    if (selectedCommissions.includes(commission.id)) {
      return total + parseFloat(commission.amount);
    }
    return total;
  }, 0) || 0;

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Management</h1>
          <p className="text-muted-foreground">
            Manage sales staff, commissions, and payouts
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Assign Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Customer to Sales Person</DialogTitle>
                <DialogDescription>
                  Assign a company to a sales person for commission tracking.
                </DialogDescription>
              </DialogHeader>
              <Form {...assignForm}>
                <form onSubmit={assignForm.handleSubmit((data) => assignCustomerMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={assignForm.control}
                    name="salesPersonId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sales Person</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sales person" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {salesPeople?.map((sp: any) => (
                              <SelectItem key={sp.id} value={sp.id.toString()}>
                                {sp.name} ({sp.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={assignForm.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companies?.map((company: any) => (
                              <SelectItem key={company.id} value={company.id.toString()}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={assignForm.control}
                    name="subscriptionPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription Plan</FormLabel>
                        <Select onValueChange={field.onChange}>
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={assignForm.control}
                      name="initialPlanPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={assignForm.control}
                      name="currentPlanPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={assignForm.control}
                    name="billingPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Period</FormLabel>
                        <Select onValueChange={field.onChange}>
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

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setAssignDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={assignCustomerMutation.isPending}>
                      {assignCustomerMutation.isPending ? 'Assigning...' : 'Assign Customer'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Sales Person
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Sales Person</DialogTitle>
                <DialogDescription>
                  Add a new sales person with a full user account.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit((data) => createSalesPersonMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johnsmith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="commissionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commission Rate</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            placeholder="0.10"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createSalesPersonMutation.isPending}>
                      {createSalesPersonMutation.isPending ? 'Creating...' : 'Create Sales Person'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSalesStaff}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.activeSalesStaff} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                From sales commissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCommissions?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Commissions awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+15.3%</div>
              <p className="text-xs text-muted-foreground">
                Commission growth this month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="staff" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="staff">Sales Staff</TabsTrigger>
          <TabsTrigger value="commissions">
            Pending Approvals
            {pendingCommissions && pendingCommissions.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {pendingCommissions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Sales Staff Tab */}
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Staff Members</CardTitle>
              <CardDescription>
                Manage sales staff accounts and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead>Total Customers</TableHead>
                    <TableHead>Monthly Earnings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bank Connected</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingSalesPeople ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : !salesPeople || salesPeople.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No sales staff members yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    salesPeople.map((person: any) => (
                      <TableRow key={person.id}>
                        <TableCell className="font-medium">{person.name}</TableCell>
                        <TableCell>{person.email}</TableCell>
                        <TableCell>{(parseFloat(person.commissionRate) * 100).toFixed(1)}%</TableCell>
                        <TableCell>{person.totalCustomers || 0}</TableCell>
                        <TableCell>{formatCurrency(person.monthlyEarnings || 0)}</TableCell>
                        <TableCell>
                          <Badge variant={person.isActive ? 'default' : 'secondary'}>
                            {person.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={person.stripeAccountId ? 'default' : 'outline'}>
                            {person.stripeAccountId ? 'Connected' : 'Not Connected'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingSalesPerson(person);
                                  editForm.reset({
                                    name: person.name,
                                    email: person.email,
                                    phone: person.phone || '',
                                    commissionRate: parseFloat(person.commissionRate)
                                  });
                                  setEditDialogOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  // Toggle active status
                                  toggleSalesPersonStatus.mutate({
                                    id: person.id,
                                    isActive: !person.isActive
                                  });
                                }}
                              >
                                {person.isActive ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSalesPersonForFinancials(person);
                                  setFinancialDialogOpen(true);
                                }}
                              >
                                <DollarSignIcon className="mr-2 h-4 w-4" />
                                View Financials
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${person.name}? This action cannot be undone.`)) {
                                    deleteSalesPersonMutation.mutate(person.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Commissions Tab */}
        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Commission Approvals</span>
                {selectedCommissions.length > 0 && (
                  <Button 
                    onClick={handleApproveSelected}
                    className="gap-2"
                    disabled={approveCommissionsMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Selected ({formatCurrency(totalSelectedAmount)})
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                Review and approve commission payments for sales staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Sales Person</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!pendingCommissions || pendingCommissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No pending commissions
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingCommissions.map((commission: any) => (
                      <TableRow key={commission.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCommissions.includes(commission.id)}
                            onCheckedChange={(checked) => 
                              handleCommissionSelection(commission.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {commission.salesPersonName}
                        </TableCell>
                        <TableCell>{commission.companyName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{commission.type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(parseFloat(commission.amount))}
                        </TableCell>
                        <TableCell>
                          {(parseFloat(commission.commissionRate) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell>{formatDate(commission.paymentDate)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout History Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                History of commission payments to sales staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sales Person</TableHead>
                    <TableHead>Payout Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Commissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stripe ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!allPayouts || allPayouts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No payouts yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    allPayouts.map((payout: any) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium">
                          {payout.salesPersonName}
                        </TableCell>
                        <TableCell>{formatDate(payout.payoutDate)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(parseFloat(payout.totalAmount))}
                        </TableCell>
                        <TableCell>
                          {payout.commissionIds.length} commissions
                        </TableCell>
                        <TableCell>
                          <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                            {payout.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {payout.stripePayoutId}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission Summary</CardTitle>
                <CardDescription>
                  Monthly commission trends and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Analytics charts coming soon...
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Sales staff with highest earnings this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesPeople?.slice(0, 5).map((person: any, index: number) => (
                    <div key={person.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{person.name}</p>
                          <p className="text-sm text-muted-foreground">{person.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(person.monthlyEarnings || 0)}</p>
                        <p className="text-sm text-muted-foreground">
                          {person.totalCustomers || 0} customers
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>

      {/* Edit Sales Person Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sales Person</DialogTitle>
            <DialogDescription>
              Update sales person details and commission rate
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => 
              editSalesPersonMutation.mutate({ ...data, id: editingSalesPerson?.id })
            )} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="commissionRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Rate</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="1"
                        placeholder="0.10 (10%)" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editSalesPersonMutation.isPending}>
                  {editSalesPersonMutation.isPending ? 'Updating...' : 'Update Sales Person'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Financial Management Dialog */}
      <Dialog open={financialDialogOpen} onOpenChange={setFinancialDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSignIcon className="h-5 w-5" />
              Financial Details: {selectedSalesPersonForFinancials?.name}
            </DialogTitle>
            <DialogDescription>
              Complete financial overview including commission history, earnings breakdown, and payout status
            </DialogDescription>
          </DialogHeader>

          {financialDetails ? (
            <div className="space-y-6">
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSignIcon className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Earnings</p>
                        <p className="text-lg font-semibold">{formatCurrency(parseFloat(financialDetails.totalEarnings || '0'))}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Commissions</p>
                        <p className="text-lg font-semibold">{formatCurrency(parseFloat(financialDetails.pendingCommissions || '0'))}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="text-lg font-semibold">{formatCurrency(parseFloat(financialDetails.monthlyEarnings || '0'))}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Active Customers</p>
                        <p className="text-lg font-semibold">{financialDetails.totalCustomers || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Commission History */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Commission History</h3>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Base Amount</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Commission</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {financialDetails.commissions && financialDetails.commissions.length > 0 ? (
                          financialDetails.commissions.map((commission: any) => (
                            <TableRow key={commission.id}>
                              <TableCell>
                                {new Date(commission.paymentDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="font-medium">
                                {commission.companyName}
                              </TableCell>
                              <TableCell>
                                <Badge variant={commission.type === 'signup' ? 'default' : 'secondary'}>
                                  {commission.type}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatCurrency(parseFloat(commission.baseAmount))}</TableCell>
                              <TableCell>{(parseFloat(commission.commissionRate) * 100).toFixed(1)}%</TableCell>
                              <TableCell className="font-semibold">
                                {formatCurrency(parseFloat(commission.amount))}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    commission.status === 'paid' ? 'default' : 
                                    commission.status === 'approved' ? 'secondary' : 
                                    'outline'
                                  }
                                >
                                  {commission.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              No commission history available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Assignments */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Assignments</h3>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Monthly Value</TableHead>
                          <TableHead>Commission Rate</TableHead>
                          <TableHead>Monthly Commission</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {financialDetails.customers && financialDetails.customers.length > 0 ? (
                          financialDetails.customers.map((customer: any) => (
                            <TableRow key={customer.id}>
                              <TableCell className="font-medium">
                                {customer.companyName}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{customer.subscriptionPlan}</Badge>
                              </TableCell>
                              <TableCell>{formatCurrency(parseFloat(customer.currentPlanPrice))}</TableCell>
                              <TableCell>{(parseFloat(customer.commissionRate || selectedSalesPersonForFinancials.commissionRate) * 100).toFixed(1)}%</TableCell>
                              <TableCell className="font-semibold text-green-600">
                                {formatCurrency(parseFloat(customer.currentPlanPrice) * parseFloat(customer.commissionRate || selectedSalesPersonForFinancials.commissionRate))}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={customer.status === 'active' ? 'default' : 'secondary'}
                                >
                                  {customer.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              No customer assignments available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Payout History */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payout History</h3>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {financialDetails.payouts && financialDetails.payouts.length > 0 ? (
                          financialDetails.payouts.map((payout: any) => (
                            <TableRow key={payout.id}>
                              <TableCell>
                                {new Date(payout.payoutDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="font-semibold">
                                {formatCurrency(parseFloat(payout.amount))}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{payout.paymentMethod}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {payout.stripeTransferId || 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    payout.status === 'completed' ? 'default' : 
                                    payout.status === 'processing' ? 'secondary' : 
                                    'destructive'
                                  }
                                >
                                  {payout.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                              No payout history available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Loading financial details...</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setFinancialDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}