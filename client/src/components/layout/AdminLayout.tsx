import React from "react";
import { Button } from "../ui/button";
import { useLocation } from "wouter";
import { apiRequest } from "../../lib/queryClient";
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
  Menu,
  X,
  LogOut,
  User,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Code,
  Zap,
  FileText,
  Download,
  Code2,
  HelpCircle
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export default function AdminLayout({ children, currentPath }: AdminLayoutProps) {
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      setLocation('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      setLocation('/login');
    }
  };

  const adminMenuItems = [
    {
      section: "Dashboard",
      items: [
        { name: "System Overview", path: "/system-overview", icon: BarChart3, description: "Platform metrics and analytics" },
        { name: "Admin Dashboard", path: "/admin", icon: Server, description: "Main admin interface" },
        { name: "Financial Dashboard", path: "/financial-dashboard", icon: DollarSign, description: "Revenue and financial metrics" },
      ]
    },
    {
      section: "Management",
      items: [
        { name: "Companies", path: "/companies-management", icon: Building2, description: "Manage client companies" },
        { name: "Technicians", path: "/technicians-management", icon: Users, description: "Field staff management" },
        { name: "Admin Users", path: "/admin-user-management", icon: Shield, description: "System administrators" },
        { name: "Subscription Plans", path: "/subscription-management", icon: CreditCard, description: "Subscription management" },
        { name: "Sales Management", path: "/sales-management", icon: TrendingUp, description: "Sales team and performance" },
        { name: "Support Management", path: "/support-management", icon: MessageCircle, description: "Customer support system" },
      ]
    },
    {
      section: "System",
      items: [
        { name: "System Health", path: "/admin-system", icon: Activity, description: "Performance monitoring" },
        { name: "Security Center", path: "/security-dashboard", icon: Shield, description: "Security monitoring" },
        { name: "Rate Limiting", path: "/rate-limiting-dashboard", icon: Server, description: "API rate controls" },
        { name: "System Settings", path: "/system-settings", icon: Settings, description: "System configuration" },
        { name: "Account Settings", path: "/settings", icon: User, description: "Admin account settings" },
      ]
    },
    {
      section: "Tools & Testing",
      items: [
        { name: "Shortcode Testing", path: "/shortcode-demo", icon: Code, description: "Test embed codes" },
        { name: "API Testing", path: "/api-testing", icon: Zap, description: "API endpoint testing" },
      ]
    },
    {
      section: "Documentation",
      items: [
        { name: "Documentation", path: "/documentation", icon: FileText, description: "Platform documentation" },
        { name: "Installation Guide", path: "/installation-guide", icon: Download, description: "Setup and installation" },
        { name: "API Documentation", path: "/api-documentation", icon: Code2, description: "API reference guide" },
        { name: "Troubleshooting", path: "/troubleshooting", icon: HelpCircle, description: "Problem resolution guide" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:bg-white/10 md:hidden"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 rounded-lg p-2">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">System Administrator</h1>
                  <p className="text-purple-100 text-sm">Platform Management Console</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-300" />
                  <span className="text-sm">System: Operational</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-300" />
                  <span className="text-sm">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 transition-transform duration-300 ease-in-out
          fixed md:sticky top-[72px] left-0 z-40
          w-80 h-[calc(100vh-72px)] bg-white border-r border-gray-200
          overflow-y-auto
        `}>
          <div className="p-6">
            <div className="space-y-8">
              {adminMenuItems.map((section) => (
                <div key={section.section} className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    {section.section}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          setLocation(item.path);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                          currentPath === item.path
                            ? "bg-purple-50 text-purple-700 border-l-4 border-purple-600"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <item.icon className={`h-5 w-5 ${currentPath === item.path ? 'text-purple-600' : 'text-gray-400'}`} />
                        <div className="flex-1 text-left">
                          <div>{item.name}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Logout Button */}
              <div className="pt-6 mt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Account
                </h3>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-5 w-5" />
                  <div className="flex-1 text-left">
                    <div>Logout</div>
                    <div className="text-xs text-red-400">Sign out of admin panel</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 pb-16">
          {children}
        </main>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-gray-900 text-white z-30">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => setLocation('/companies-management')}
                  className="hover:text-purple-300 transition-colors"
                >
                  Companies
                </button>
                <button 
                  onClick={() => setLocation('/technicians-management')}
                  className="hover:text-purple-300 transition-colors"
                >
                  Technicians
                </button>
                <button 
                  onClick={() => setLocation('/security-dashboard')}
                  className="hover:text-purple-300 transition-colors"
                >
                  Security
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">Rank It Pro Admin Console v2.1</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400">All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}