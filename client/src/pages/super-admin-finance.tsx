import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  RefreshCw,
  Calendar,
  Building2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  totalCompanies: number;
  activeSubscriptions: number;
  monthlySignups: number;
  churnRate: number;
  averageRevenuePerUser: number;
}

interface Transaction {
  id: string;
  companyName: string;
  plan: string;
  amount: number;
  status: string;
  type: string;
  date: string;
  stripeTransactionId: string;
}

interface SignupMetric {
  month: string;
  signups: number;
  revenue: number;
}

interface RevenueBreakdown {
  plan: string;
  count: number;
  revenue: number;
  percentage: number;
}

const PLAN_COLORS = {
  starter: '#10B981',
  pro: '#3B82F6', 
  agency: '#8B5CF6'
};

export default function SuperAdminFinance() {
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  const [transactionFilter, setTransactionFilter] = useState('all');

  // Financial metrics query
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery<FinancialMetrics>({
    queryKey: ['/api/admin/financial/metrics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/financial/metrics');
      return response.json();
    }
  });

  // Revenue trends query
  const { data: revenueTrends = [], isLoading: trendsLoading } = useQuery<SignupMetric[]>({
    queryKey: ['/api/admin/financial/revenue-trends', selectedPeriod],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/financial/revenue-trends?period=${selectedPeriod}`);
      return response.json();
    }
  });

  // Recent transactions query
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/financial/payments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/financial/payments?limit=100');
      return response.json();
    }
  });

  // Subscription breakdown query
  const { data: subscriptionBreakdown = [], isLoading: breakdownLoading } = useQuery<RevenueBreakdown[]>({
    queryKey: ['/api/admin/financial/subscription-breakdown'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/financial/subscription-breakdown');
      const data: RevenueBreakdown[] = await response.json();
      
      // Calculate percentages
      const total = data.reduce((sum: number, item: RevenueBreakdown) => sum + item.revenue, 0);
      return data.map((item: RevenueBreakdown) => ({
        ...item,
        percentage: total > 0 ? (item.revenue / total) * 100 : 0
      }));
    }
  });

  // Signup metrics query  
  const { data: signupMetrics = [], isLoading: signupsLoading } = useQuery<SignupMetric[]>({
    queryKey: ['/api/admin/signup-metrics', selectedPeriod],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/signup-metrics?period=${selectedPeriod}`);
      return response.json();
    }
  });

  const handleExportData = () => {
    const csvData = transactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Company: t.companyName,
      Plan: t.plan,
      Amount: t.amount,
      Status: t.status,
      Type: t.type,
      'Stripe ID': t.stripeTransactionId
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const filteredTransactions = transactions.filter(t => 
    transactionFilter === 'all' || t.type === transactionFilter
  );

  if (metricsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
            <p className="text-gray-600">Monitor revenue, subscriptions, and transaction data</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => refetchMetrics()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics?.monthlyRecurringRevenue || 0)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +{metrics?.monthlySignups || 0} this month
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Annual Recurring Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics?.annualRecurringRevenue || 0)}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Growing steadily
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{metrics?.activeSubscriptions || 0}</p>
                  <p className="text-xs text-purple-600">
                    {formatCurrency(metrics?.averageRevenuePerUser || 0)} ARPU
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Companies</p>
                  <p className="text-2xl font-bold">{metrics?.totalCompanies || 0}</p>
                  <p className="text-xs text-orange-600">
                    {((metrics?.churnRate || 0) * 100).toFixed(1)}% churn rate
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
              <TabsTrigger value="signups">Signups</TabsTrigger>
              <TabsTrigger value="breakdown">Plan Breakdown</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="12months">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signups">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Signups</CardTitle>
                <CardDescription>New company registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={signupMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="signups" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breakdown">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Plan</CardTitle>
                  <CardDescription>Distribution of revenue across subscription plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subscriptionBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ plan, percentage }) => `${plan} (${percentage.toFixed(1)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {subscriptionBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PLAN_COLORS[entry.plan as keyof typeof PLAN_COLORS] || '#8884d8'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plan Statistics</CardTitle>
                  <CardDescription>Detailed breakdown by subscription plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subscriptionBreakdown.map((plan) => (
                      <div key={plan.plan} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: PLAN_COLORS[plan.plan as keyof typeof PLAN_COLORS] }}
                          />
                          <div>
                            <p className="font-medium capitalize">{plan.plan} Plan</p>
                            <p className="text-sm text-gray-600">{plan.count} subscribers</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(plan.revenue)}</p>
                          <p className="text-sm text-gray-600">{plan.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>All subscription payments and transactions</CardDescription>
                  </div>
                  <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transactions</SelectItem>
                      <SelectItem value="subscription">Subscriptions</SelectItem>
                      <SelectItem value="payment">Payments</SelectItem>
                      <SelectItem value="refund">Refunds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stripe ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell className="font-medium">{transaction.companyName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {transaction.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell className="capitalize">{transaction.type}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                            className={transaction.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{transaction.stripeTransactionId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}