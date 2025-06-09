import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, DollarSign, Users, TrendingUp, CheckCircle, Clock, Calculator } from "lucide-react";

const createSalesPersonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  commissionRate: z.number().min(0).max(100)
});

const assignCompanySchema = z.object({
  salesPersonId: z.number(),
  companyId: z.number()
});

type CreateSalesPersonData = z.infer<typeof createSalesPersonSchema>;
type AssignCompanyData = z.infer<typeof assignCompanySchema>;

export default function SalesDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });

  // Get dashboard data
  const { data: dashboardData } = useQuery({
    queryKey: ["/api/sales/dashboard"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/sales/dashboard');
      return response.json();
    },
    enabled: auth?.user?.role === 'super_admin'
  });

  // Get sales people
  const { data: salesPeople } = useQuery({
    queryKey: ["/api/sales/people"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/sales/people');
      return response.json();
    },
    enabled: auth?.user?.role === 'super_admin'
  });

  // Get all companies for assignment
  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/companies');
      return response.json();
    },
    enabled: auth?.user?.role === 'super_admin'
  });

  // Create sales person form
  const createForm = useForm<CreateSalesPersonData>({
    resolver: zodResolver(createSalesPersonSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      commissionRate: 10
    }
  });

  // Assign company form
  const assignForm = useForm<AssignCompanyData>({
    resolver: zodResolver(assignCompanySchema),
    defaultValues: {
      salesPersonId: 0,
      companyId: 0
    }
  });

  // Create sales person mutation
  const createSalesPerson = useMutation({
    mutationFn: async (data: CreateSalesPersonData) => {
      const response = await apiRequest('POST', '/api/sales/people', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sales person created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/people'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/dashboard'] });
      setCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create sales person",
        variant: "destructive"
      });
    }
  });

  // Assign company mutation
  const assignCompany = useMutation({
    mutationFn: async (data: AssignCompanyData) => {
      const response = await apiRequest('POST', '/api/sales/assignments', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company assigned successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/people'] });
      setAssignDialogOpen(false);
      assignForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign company",
        variant: "destructive"
      });
    }
  });

  // Calculate commissions mutation
  const calculateCommissions = useMutation({
    mutationFn: async (month: string) => {
      const response = await apiRequest('POST', '/api/sales/commissions/calculate', { month });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Calculated ${data.length} new commissions`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/dashboard'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate commissions",
        variant: "destructive"
      });
    }
  });

  const handleCreateSubmit = (data: CreateSalesPersonData) => {
    createSalesPerson.mutate(data);
  };

  const handleAssignSubmit = (data: AssignCompanyData) => {
    assignCompany.mutate(data);
  };

  const handleCalculateCommissions = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    calculateCommissions.mutate(currentMonth);
  };

  if (auth?.user?.role !== 'super_admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">You need super admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Sales Commission Dashboard</h1>
              <div className="flex gap-2">
                <Button
                  onClick={handleCalculateCommissions}
                  disabled={calculateCommissions.isPending}
                  variant="outline"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Monthly Commissions
                </Button>
                <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Assign Company
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Company to Sales Person</DialogTitle>
                      <DialogDescription>
                        Link a company to a sales representative for commission tracking.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...assignForm}>
                      <form onSubmit={assignForm.handleSubmit(handleAssignSubmit)} className="space-y-4">
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
                                  {salesPeople?.map((person: any) => (
                                    <SelectItem key={person.id} value={person.id.toString()}>
                                      {person.name} ({person.email})
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
                                      {company.name} ({company.plan})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAssignDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={assignCompany.isPending}>
                            Assign Company
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sales Person
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Sales Person</DialogTitle>
                      <DialogDescription>
                        Add a new sales representative to track commissions.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...createForm}>
                      <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                        <FormField
                          control={createForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
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
                              <FormLabel>Commission Rate (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  placeholder="10"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCreateDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createSalesPerson.isPending}>
                            Create Sales Person
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Dashboard Stats */}
            {dashboardData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.totalCommissions}</div>
                    <p className="text-xs text-muted-foreground">
                      ${dashboardData.totalAmount.toFixed(2)} total value
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Paid Commissions</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.paidCommissions}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData.totalCommissions > 0 
                        ? Math.round((dashboardData.paidCommissions / dashboardData.totalCommissions) * 100)
                        : 0
                      }% completion rate
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unpaid Commissions</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.unpaidCommissions}</div>
                    <p className="text-xs text-muted-foreground">
                      Pending payment
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sales People</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.salesPeople.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Active representatives
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Sales People Table */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Representatives</CardTitle>
                <CardDescription>
                  Manage sales team and commission tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Commission Rate</TableHead>
                      <TableHead>Total Commissions</TableHead>
                      <TableHead>Unpaid Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesPeople?.map((person: any) => {
                      const personStats = dashboardData?.salesPeople.find((sp: any) => sp.id === person.id);
                      return (
                        <TableRow key={person.id}>
                          <TableCell className="font-medium">{person.name}</TableCell>
                          <TableCell>{person.email}</TableCell>
                          <TableCell>{person.commissionRate}%</TableCell>
                          <TableCell>{personStats?.totalCommissions || 0}</TableCell>
                          <TableCell>${(personStats?.unpaidAmount || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={person.isActive ? "default" : "secondary"}>
                              {person.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}