import React from "react";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  CreditCard, 
  Box, 
  Settings, 
  Activity,
  Lock,
  BarChart3,
  Globe,
  FileText,
  Mail
} from "lucide-react";

const AdminBusinessManagement = () => {
  const [, setLocation] = useLocation();

  const managementSections = [
    {
      title: "Account Management",
      description: "Manage companies, users and roles",
      icon: <Users className="h-8 w-8 text-blue-500" />,
      action: () => setLocation("/users"),
      actionText: "Manage Users"
    },
    {
      title: "Billing & Subscriptions",
      description: "Manage billing, invoices and subscription plans",
      icon: <CreditCard className="h-8 w-8 text-green-500" />,
      action: () => setLocation("/billing"),
      actionText: "Manage Billing"
    },
    {
      title: "Integrations",
      description: "Manage CRM, website and other integrations",
      icon: <Box className="h-8 w-8 text-purple-500" />,
      action: () => setLocation("/crm-integrations"),
      actionText: "Manage Integrations"
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings and defaults",
      icon: <Settings className="h-8 w-8 text-gray-500" />,
      action: () => setLocation("/settings"),
      actionText: "System Settings"
    },
    {
      title: "Usage Analytics",
      description: "View system usage, API calls and performance",
      icon: <Activity className="h-8 w-8 text-red-500" />,
      action: () => setLocation("/analytics"),
      actionText: "View Analytics"
    },
    {
      title: "Security & Permissions",
      description: "Configure security settings and permissions",
      icon: <Lock className="h-8 w-8 text-amber-500" />,
      action: () => setLocation("/security"),
      actionText: "Security Settings"
    }
  ];
  
  const quickInsights = [
    {
      label: "Active Companies",
      value: "24",
      change: "+3",
      icon: <Globe className="h-4 w-4 text-blue-500" />
    },
    {
      label: "Revenue MTD",
      value: "$8,240",
      change: "+12%",
      icon: <BarChart3 className="h-4 w-4 text-green-500" />
    },
    {
      label: "Pending Invoices",
      value: "7",
      change: "-2",
      icon: <FileText className="h-4 w-4 text-amber-500" />
    },
    {
      label: "Support Tickets",
      value: "3",
      change: "0",
      icon: <Mail className="h-4 w-4 text-purple-500" />
    }
  ];

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Business Management</CardTitle>
          <CardDescription>
            Manage all aspects of your Rank It Pro business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managementSections.map((section, index) => (
              <Card key={index} className="border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    {section.icon}
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    onClick={section.action}
                    className="w-full mt-2"
                  >
                    {section.actionText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Business Insights</CardTitle>
          <CardDescription>
            Quick overview of your business metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickInsights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{insight.label}</span>
                  {insight.icon}
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold mr-2">{insight.value}</span>
                  <span className={`text-xs ${insight.change.startsWith('+') ? 'text-green-500' : insight.change.startsWith('-') ? 'text-red-500' : 'text-gray-500'}`}>
                    {insight.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AdminBusinessManagement;