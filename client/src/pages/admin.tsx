import React from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { 
  Users, 
  Building2, 
  Shield, 
  Server, 
  BarChart3, 
  Settings, 
  CreditCard, 
  Activity, 
  CheckCircle2, 
  Clock,
  Database,
  Globe,
  User,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Bell,
  Menu,
  X
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import AdminLayout from "../components/layout/AdminLayout";

export default function AdminPage() {
  const [, setLocation] = useLocation();

  // Fetch system stats
  const { data: systemStats } = useQuery({
    queryKey: ['/api/admin/system-stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/system-stats');
      return response.json();
    },
  });

  // Fetch companies
  const { data: companies = [] } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/companies');
      return response.json();
    },
  });

  // Fetch system health
  const { data: systemHealth = [] } = useQuery({
    queryKey: ['/api/admin/system-health'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/system-health');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent activity
  const { data: recentActivity = [] } = useQuery({
    queryKey: ['/api/admin/recent-activity'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/recent-activity');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const adminMenuItems = [
    {
      section: "Dashboard",
      items: [
        { name: "System Overview", path: "/system-overview", icon: BarChart3, description: "Platform metrics and analytics" },
        { name: "Admin Dashboard", path: "/admin", icon: Server, description: "Main admin interface", active: true },
      ]
    },
    {
      section: "Management",
      items: [
        { name: "Companies", path: "/companies-management", icon: Building2, description: "Manage client companies" },
        { name: "Technicians", path: "/technicians-management", icon: Users, description: "Field staff management" },
        { name: "Admin Users", path: "/admin-user-management", icon: Shield, description: "System administrators" },
        { name: "Billing & Plans", path: "/subscription-management", icon: CreditCard, description: "Subscription management" },
      ]
    },
    {
      section: "System",
      items: [
        { name: "System Health", path: "/admin-system", icon: Activity, description: "Performance monitoring" },
        { name: "Security Center", path: "/security-dashboard", icon: Shield, description: "Security monitoring" },
        { name: "Rate Limiting", path: "/rate-limiting-dashboard", icon: Server, description: "API rate controls" },
        { name: "Settings", path: "/system-settings", icon: Settings, description: "System configuration" },
      ]
    }
  ];

  const quickStats = [
    { 
      title: "Total Companies", 
      value: companies.length || 0, 
      icon: Building2, 
      color: "bg-blue-500",
      change: "+12%"
    },
    { 
      title: "Active Users", 
      value: systemStats?.totalUsers || 0, 
      icon: Users, 
      color: "bg-green-500",
      change: "+8%"
    },
    { 
      title: "Monthly Revenue", 
      value: `$${systemStats?.monthlyRevenue || 0}`, 
      icon: DollarSign, 
      color: "bg-purple-500",
      change: "+15%"
    },
    { 
      title: "System Health", 
      value: "Operational", 
      icon: CheckCircle2, 
      color: "bg-emerald-500",
      change: "99.9%"
    }
  ];

  return (
    <AdminLayout currentPath="/admin">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-green-600">
                        <TrendingUp className="inline h-3 w-3 mr-1" />
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`${stat.color} rounded-full p-3`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Status
                </CardTitle>
                <CardDescription>Real-time system health monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemHealth.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.name}</span>
                      <Badge className={item.color}>{item.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest system events and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => {
                    const IconComponent = activity.icon === 'User' ? User : 
                                       activity.icon === 'Building2' ? Building2 :
                                       activity.icon === 'Server' ? Server : Activity;
                    
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`rounded-full p-1 ${activity.iconColor}`}>
                          <IconComponent className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                  {recentActivity.length === 0 && (
                    <div className="flex items-center justify-center py-4">
                      <p className="text-sm text-gray-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setLocation('/admin-user-management')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Create Admin User
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setLocation('/companies-management')}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Manage Companies
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setLocation('/system-settings')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setLocation('/security-dashboard')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Security Center
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
    </AdminLayout>
  );
}