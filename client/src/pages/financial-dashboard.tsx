import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/layout/sidebar-clean';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
  totalPayments: number;
  failedPayments: number;
  refunds: number;
  netRevenue: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  subscriptions: number;
  newSignups: number;
  churn: number;
}

interface PaymentData {
  id: string;
  companyName: string;
  amount: number;
  status: 'success' | 'failed' | 'pending' | 'refunded';
  paymentMethod: string;
  date: string;
  subscriptionPlan: string;
  stripePaymentId?: string;
}

interface SubscriptionData {
  planName: string;
  subscribers: number;
  revenue: number;
  percentage: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function FinancialDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  
  // Fetch financial metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/admin/financial/metrics', selectedPeriod],
    queryFn: () => fetch(`/api/admin/financial/metrics?period=${selectedPeriod}`)
      .then(res => res.json())
  });

  // Fetch revenue trends
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['/api/admin/financial/revenue-trends', selectedPeriod],
    queryFn: () => fetch(`/api/admin/financial/revenue-trends?period=${selectedPeriod}`)
      .then(res => res.json())
  });

  // Fetch recent payments
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/admin/financial/payments'],
    queryFn: () => fetch('/api/admin/financial/payments?limit=50')
      .then(res => res.json())
  });

  // Fetch subscription breakdown
  const { data: subscriptionBreakdown, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/admin/financial/subscription-breakdown'],
    queryFn: () => fetch('/api/admin/financial/subscription-breakdown')
      .then(res => res.json())
  });

  const handleExportData = () => {
    window.open(`/api/admin/financial/export?period=${selectedPeriod}`, '_blank');
  };

  if (metricsLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </main>
      </div>
    );
  }

  const financialMetrics: FinancialMetrics = metrics || {
    totalRevenue: 0,
    monthlyRecurringRevenue: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    churnRate: 0,
    averageRevenuePerUser: 0,
    lifetimeValue: 0,
    totalPayments: 0,
    failedPayments: 0,
    refunds: 0,
    netRevenue: 0
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Financial Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor revenue, subscriptions, and payment analytics</p>
            </div>
            <div className="flex space-x-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="12months">Last 12 Months</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportData} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(financialMetrics.totalRevenue || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Net: ${(financialMetrics.netRevenue || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(financialMetrics.monthlyRecurringRevenue || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  ARPU: ${(financialMetrics.averageRevenuePerUser || 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{financialMetrics.activeSubscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Churn: {((financialMetrics.churnRate || 0) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment Success Rate</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(financialMetrics.totalPayments || 0) > 0 
                    ? ((1 - (financialMetrics.failedPayments || 0) / (financialMetrics.totalPayments || 1)) * 100).toFixed(1)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {financialMetrics.failedPayments || 0} failed of {financialMetrics.totalPayments || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="revenue" className="space-y-4">
            <TabsList>
              <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscription Breakdown</TabsTrigger>
              <TabsTrigger value="payments">Payment History</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trends</CardTitle>
                    <CardDescription>Monthly revenue and growth patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {revenueLoading ? (
                      <div className="flex justify-center p-8">
                        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueData || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#8884d8" 
                            fill="#8884d8" 
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Growth</CardTitle>
                    <CardDescription>New signups vs churn over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {revenueLoading ? (
                      <div className="flex justify-center p-8">
                        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="newSignups" fill="#00C49F" name="New Signups" />
                          <Bar dataKey="churn" fill="#FF8042" name="Churned" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Distribution</CardTitle>
                    <CardDescription>Revenue share by subscription plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {subscriptionLoading ? (
                      <div className="flex justify-center p-8">
                        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={subscriptionBreakdown || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name} ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="revenue"
                          >
                            {(subscriptionBreakdown || []).map((entry: SubscriptionData, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Plan Performance</CardTitle>
                    <CardDescription>Detailed breakdown by subscription plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {subscriptionLoading ? (
                      <div className="flex justify-center p-8">
                        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Plan</TableHead>
                            <TableHead>Subscribers</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Share</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(subscriptionBreakdown || []).map((plan: SubscriptionData, index: number) => (
                            <TableRow key={`${plan.planName}-${index}`}>
                              <TableCell className="font-medium">{plan.planName}</TableCell>
                              <TableCell>{plan.subscribers}</TableCell>
                              <TableCell>${plan.revenue.toLocaleString()}</TableCell>
                              <TableCell>{plan.percentage}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Latest payment transactions and status</CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentsLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(payments || []).map((payment: PaymentData) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.companyName}</TableCell>
                            <TableCell>${payment.amount.toFixed(2)}</TableCell>
                            <TableCell>{payment.subscriptionPlan}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  payment.status === 'success' ? 'default' :
                                  payment.status === 'failed' ? 'destructive' :
                                  payment.status === 'refunded' ? 'secondary' : 'outline'
                                }
                              >
                                {payment.status === 'success' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {payment.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                                {payment.status === 'pending' && <AlertCircle className="w-3 h-3 mr-1" />}
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{payment.paymentMethod}</TableCell>
                            <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}