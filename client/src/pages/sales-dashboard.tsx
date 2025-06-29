import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, Users, TrendingUp, Clock, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiRequest } from '@/lib/queryClient';

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

  const { data: dashboardData, isLoading, refetch } = useQuery<SalesDashboardData>({
    queryKey: ['/api/sales/dashboard'],
    enabled: user?.role === 'sales_staff'
  });

  const { data: payouts } = useQuery({
    queryKey: ['/api/sales/payouts'],
    enabled: user?.role === 'sales_staff'
  });

  const handleConnectStripe = async () => {
    try {
      const response = await apiRequest('POST', '/api/sales/connect-stripe');
      const data = await response.json();
      
      if (data.accountLink) {
        window.open(data.accountLink, '_blank');
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error);
    }
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="customers">My Customers</TabsTrigger>
          <TabsTrigger value="commissions">Commission History</TabsTrigger>
          <TabsTrigger value="pending">Pending Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
        </TabsList>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Customers</CardTitle>
              <CardDescription>
                Companies you've signed up and are managing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Subscription Plan</TableHead>
                    <TableHead>Monthly Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Signup Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No customers assigned yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer: any) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.companyName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {customer.subscriptionPlan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(parseFloat(customer.currentPlanPrice))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {customer.signupDate && formatDate(customer.signupDate)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission History Tab */}
        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission History</CardTitle>
              <CardDescription>
                All your commission earnings and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No commissions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    commissions.map((commission: any) => (
                      <TableRow key={commission.id}>
                        <TableCell className="font-medium">
                          {commission.companyName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {commission.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(parseFloat(commission.amount))}
                        </TableCell>
                        <TableCell>
                          {(parseFloat(commission.commissionRate) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            commission.status === 'paid' ? 'default' :
                            commission.status === 'approved' ? 'secondary' :
                            commission.status === 'pending' ? 'outline' : 'destructive'
                          }>
                            {commission.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(commission.paymentDate)}
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
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Commissions</CardTitle>
              <CardDescription>
                Commissions awaiting approval and payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date Earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingCommissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No pending commissions
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingCommissions.map((commission: any) => (
                      <TableRow key={commission.id}>
                        <TableCell className="font-medium">
                          {commission.companyName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {commission.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(parseFloat(commission.amount))}
                        </TableCell>
                        <TableCell>
                          {formatDate(commission.paymentDate)}
                        </TableCell>
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
                History of commission payments to your bank account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payout Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Commissions Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stripe ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!payouts || payouts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No payouts yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    payouts.map((payout: any) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          {formatDate(payout.payoutDate)}
                        </TableCell>
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
      </Tabs>

      {/* Stripe Account Status */}
      {!salesPerson.stripeAccountId && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Connect Your Bank Account</CardTitle>
            <CardDescription className="text-orange-700">
              Connect your bank account to receive commission payments directly via Stripe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConnectStripe} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Connect Bank Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}