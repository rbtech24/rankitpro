import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  PieChart, 
  ArrowUpRight, 
  FileText,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const BillingManagement = () => {
  // Sample data - in a real implementation, this would come from the API
  const revenueData = {
    monthlyRecurring: 8240,
    yearlyRecurring: 98880,
    totalCompanies: 24,
    avgRevenuePerCompany: 343,
    pendingInvoices: 7,
    pendingAmount: 1645,
  };

  const recentTransactions = [
    { 
      id: 1, 
      company: "Acme Services", 
      amount: 249, 
      date: "2025-05-18", 
      status: "successful", 
      type: "subscription",
      plan: "agency" 
    },
    { 
      id: 2, 
      company: "Best Plumbing", 
      amount: 99, 
      date: "2025-05-17", 
      status: "successful", 
      type: "subscription",
      plan: "pro" 
    },
    { 
      id: 3, 
      company: "Clear Electric", 
      amount: 99, 
      date: "2025-05-15", 
      status: "successful", 
      type: "subscription",
      plan: "pro" 
    },
    { 
      id: 4, 
      company: "Deluxe Home Services", 
      amount: 49, 
      date: "2025-05-12", 
      status: "failed", 
      type: "subscription",
      plan: "starter" 
    },
    { 
      id: 5, 
      company: "Expert HVAC", 
      amount: 99, 
      date: "2025-05-10", 
      status: "successful", 
      type: "subscription",
      plan: "pro" 
    },
  ];

  const pendingInvoices = [
    { 
      id: 101, 
      company: "Good Plumbers", 
      amount: 249, 
      dueDate: "2025-05-25", 
      daysPastDue: 0,
      plan: "agency" 
    },
    { 
      id: 102, 
      company: "Home Fix Pro", 
      amount: 99, 
      dueDate: "2025-05-20", 
      daysPastDue: 0,
      plan: "pro" 
    },
    { 
      id: 103, 
      company: "Innovative Electrical", 
      amount: 99, 
      dueDate: "2025-05-12", 
      daysPastDue: 8,
      plan: "pro" 
    },
    { 
      id: 104, 
      company: "Johnson Services", 
      amount: 249, 
      dueDate: "2025-05-05", 
      daysPastDue: 15,
      plan: "agency" 
    },
    { 
      id: 105, 
      company: "Knight Plumbing", 
      amount: 99, 
      dueDate: "2025-05-03", 
      daysPastDue: 17,
      plan: "pro" 
    },
  ];

  const subscriptionByPlan = [
    { plan: "agency", count: 6, revenue: 1494 },
    { plan: "pro", count: 14, revenue: 1386 },
    { plan: "starter", count: 4, revenue: 196 },
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
              Billing & Revenue Management
            </CardTitle>
            <CardDescription>
              Manage all financial aspects of your Rank It Pro platform
            </CardDescription>
          </div>
          <Button>Export Financial Report</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Revenue Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="flex-1">Recent Transactions</TabsTrigger>
            <TabsTrigger value="invoices" className="flex-1">Pending Invoices</TabsTrigger>
            <TabsTrigger value="plans" className="flex-1">Subscription Plans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Monthly Recurring Revenue</span>
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">${revenueData.monthlyRecurring.toLocaleString()}</div>
              </div>
              
              <div className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Annual Recurring Revenue</span>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold">${revenueData.yearlyRecurring.toLocaleString()}</div>
              </div>
              
              <div className="p-4 border rounded-lg bg-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Average Revenue Per Company</span>
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold">${revenueData.avgRevenuePerCompany}</div>
              </div>
              
              <div className="p-4 border rounded-lg bg-amber-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Pending Invoices</span>
                  <FileText className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-2xl font-bold">{revenueData.pendingInvoices}</div>
              </div>
              
              <div className="p-4 border rounded-lg bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Pending Amount</span>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-2xl font-bold">${revenueData.pendingAmount}</div>
              </div>
              
              <div className="p-4 border rounded-lg bg-indigo-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Paying Companies</span>
                  <PieChart className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="text-2xl font-bold">{revenueData.totalCompanies}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Subscription by Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan</TableHead>
                        <TableHead>Companies</TableHead>
                        <TableHead>Monthly Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptionByPlan.map((item) => (
                        <TableRow key={item.plan}>
                          <TableCell className="font-medium capitalize">{item.plan}</TableCell>
                          <TableCell>{item.count}</TableCell>
                          <TableCell>${item.revenue}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50">
                        <TableCell className="font-medium">Total</TableCell>
                        <TableCell>{subscriptionByPlan.reduce((acc, curr) => acc + curr.count, 0)}</TableCell>
                        <TableCell>${subscriptionByPlan.reduce((acc, curr) => acc + curr.revenue, 0)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between border-b pb-3">
                        <div>
                          <div className="font-medium">{transaction.company}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()} • ${transaction.amount}
                          </div>
                        </div>
                        <Badge 
                          className={
                            transaction.status === "successful" 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : "bg-red-100 text-red-800 border-red-200"
                          }
                        >
                          {transaction.status === "successful" ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Paid</>
                          ) : (
                            <><AlertCircle className="h-3 w-3 mr-1" /> Failed</>
                          )}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full flex items-center justify-center">
                      View All Transactions <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions" className="pt-6">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.company}</TableCell>
                        <TableCell>${transaction.amount}</TableCell>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell className="capitalize">{transaction.plan}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              transaction.status === "successful" 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {transaction.status === "successful" ? (
                              <><CheckCircle2 className="h-3 w-3 mr-1" /> Paid</>
                            ) : (
                              <><AlertCircle className="h-3 w-3 mr-1" /> Failed</>
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="invoices" className="pt-6">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Days Past Due</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.company}</TableCell>
                        <TableCell>${invoice.amount}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {invoice.daysPastDue > 0 ? (
                            <span className="text-red-600">{invoice.daysPastDue} days</span>
                          ) : (
                            "Not due yet"
                          )}
                        </TableCell>
                        <TableCell className="capitalize">{invoice.plan}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">Send Reminder</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="plans" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <CardTitle>Starter Plan</CardTitle>
                  <CardDescription>
                    <div className="text-2xl font-bold">$49<span className="text-sm font-normal">/mo</span></div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Basic check-in features</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Up to 3 technicians</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Limited WordPress integration</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Basic analytics</span>
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t text-gray-500 text-sm">
                    Active companies: {subscriptionByPlan.find(p => p.plan === "starter")?.count || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-indigo-200">
                <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                  <CardTitle>Pro Plan</CardTitle>
                  <CardDescription>
                    <div className="text-2xl font-bold">$99<span className="text-sm font-normal">/mo</span></div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>All starter features</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Up to 10 technicians</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Full WordPress & JS integration</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Customer review management</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Basic CRM integrations</span>
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t text-gray-500 text-sm">
                    Active companies: {subscriptionByPlan.find(p => p.plan === "pro")?.count || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50 border-b border-purple-100">
                  <CardTitle>Agency Plan</CardTitle>
                  <CardDescription>
                    <div className="text-2xl font-bold">$249<span className="text-sm font-normal">/mo</span></div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>All pro features</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Unlimited technicians</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Priority customer support</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Advanced analytics and reporting</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Full CRM integration</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>White-label capabilities</span>
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t text-gray-500 text-sm">
                    Active companies: {subscriptionByPlan.find(p => p.plan === "agency")?.count || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button>Manage Subscription Plans</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BillingManagement;