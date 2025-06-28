import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Plus,
  Camera,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  User,
  Phone,
  Mail,
  MessageSquare,
  HeadphonesIcon,
  Smartphone,
  X,
  MapPin,
  Star,
  Home,
  Bell,
  Settings,
  LogOut
} from "lucide-react";
import { getCurrentUser, AuthState } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function TechnicianDashboardFinal() {
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    priority: 'medium',
    category: 'technical',
    description: '',
    location: ''
  });

  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      .then(() => window.location.href = "/login");
  };

  const handleViewChange = (view: string) => {
    console.log('Switching view to:', view);
    setActiveView(view);
    setSidebarOpen(false); // Close mobile sidebar
  };

  const handleSupportSubmit = async () => {
    try {
      const ticketData = {
        ...supportForm,
        technicianId: auth?.user?.id,
        technicianName: auth?.user?.username,
        companyId: auth?.company?.id,
        status: 'open',
        createdAt: new Date().toISOString()
      };

      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(ticketData)
      });

      if (res.ok) {
        setSupportModalOpen(false);
        setSupportForm({
          subject: '',
          priority: 'medium',
          category: 'technical',
          description: '',
          location: ''
        });
        alert('Support ticket created successfully! Our team will contact you soon.');
      } else {
        alert('Failed to create support ticket. Please try again.');
      }
    } catch (error) {
      alert('Error creating support ticket. Please check your connection.');
    }
  };

  const handleQuickSupport = (type: string) => {
    const quickTickets = {
      'equipment': {
        subject: 'Equipment Issue',
        category: 'technical',
        priority: 'high',
        description: 'I need assistance with equipment malfunction or technical issues.'
      },
      'app': {
        subject: 'App Issue',
        category: 'technical',
        priority: 'medium',
        description: 'I am experiencing problems with the mobile app or dashboard.'
      },
      'customer': {
        subject: 'Customer Issue',
        category: 'customer_service',
        priority: 'medium',
        description: 'I need help with a customer-related situation or complaint.'
      }
    };

    const template = quickTickets[type as keyof typeof quickTickets];
    if (template) {
      setSupportForm({ ...supportForm, ...template });
      setSupportModalOpen(true);
    }
  };

  // Navigation items for the sidebar
  const navigationItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: Home,
      description: 'Main overview'
    },
    {
      id: 'visits',
      label: 'My Visits',
      icon: MapPin,
      description: 'Visit history & logs'
    },
    {
      id: 'reviews',
      label: 'My Reviews',
      icon: Star,
      description: 'Customer feedback'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      description: 'Today\'s appointments'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: 3,
      description: 'Updates & alerts'
    }
  ];

  const renderSidebar = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              {auth?.user?.username || 'Technician'}
            </h2>
            <p className="text-xs text-gray-500">Field Technician</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <div
              key={item.id}
              onClick={() => handleViewChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive ? "text-blue-600" : "text-gray-400"
              )} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <div
            onClick={() => handleViewChange('settings')}
            className="w-full flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </div>
          <div
            onClick={handleLogout}
            className="w-full flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Online</span>
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (activeView) {
      case 'visits':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">My Visits</h1>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Log New Visit
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Visits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-gray-500">All time</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-green-600">+12% from last week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-gray-500">2 completed, 1 in progress</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((visit) => (
                    <div key={visit} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Service Call #{visit}</p>
                          <p className="text-sm text-gray-500">123 Main St, City</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Today</p>
                        <Badge variant="secondary" className="text-xs">HVAC</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold mr-2">4.8</div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-xs text-gray-500">All time</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-green-600">+20% from last month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="ml-2 text-sm font-medium">5.0</span>
                        </div>
                        <span className="text-sm text-gray-500">2 days ago</span>
                      </div>
                      <p className="text-gray-700">Excellent service! Very professional and fixed our heating system quickly.</p>
                      <p className="text-sm text-gray-500 mt-1">- Customer #{review}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Today's Schedule</h1>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Clock className="w-5 h-5 text-blue-600 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium">9:00 AM - HVAC Maintenance</p>
                      <p className="text-sm text-gray-600">123 Main St, Downtown</p>
                    </div>
                    <Badge className="bg-blue-600">In Progress</Badge>
                  </div>
                  
                  <div className="flex items-center p-4 border rounded-lg">
                    <Clock className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium">11:30 AM - System Installation</p>
                      <p className="text-sm text-gray-600">456 Oak Ave, Midtown</p>
                    </div>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                  
                  <div className="flex items-center p-4 border rounded-lg">
                    <Clock className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium">2:00 PM - Repair Service</p>
                      <p className="text-sm text-gray-600">789 Pine St, Uptown</p>
                    </div>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <div className="flex-1">
                      <p className="font-medium">New appointment scheduled</p>
                      <p className="text-sm text-gray-600">Tomorrow at 10:00 AM - System maintenance</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></div>
                    <div className="flex-1">
                      <p className="font-medium">Review received</p>
                      <p className="text-sm text-gray-600">5-star review from Sarah Johnson</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3"></div>
                    <div className="flex-1">
                      <p className="font-medium">Equipment update available</p>
                      <p className="text-sm text-gray-600">New firmware version ready for download</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <div className="text-sm text-gray-500">
                Welcome back, {auth?.user?.username || 'Technician'}!
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button size="lg" className="h-16 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-6 h-6 mr-3" />
                    Log New Visit
                  </Button>
                  <Button size="lg" variant="outline" className="h-16">
                    <Camera className="w-6 h-6 mr-3" />
                    Quick Photo
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-16 border-orange-200 hover:bg-orange-50"
                    onClick={() => setSupportModalOpen(true)}
                  >
                    <HeadphonesIcon className="w-6 h-6 mr-3 text-orange-600" />
                    Get Support
                  </Button>
                </div>
                
                {/* Quick Support Buttons */}
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Quick Support:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => handleQuickSupport('equipment')}
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Equipment Issue
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => handleQuickSupport('app')}
                    >
                      <Smartphone className="w-3 h-3 mr-1" />
                      App Problem
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => handleQuickSupport('customer')}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Customer Help
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Visits</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">2 completed, 1 pending</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+20% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8</div>
                  <p className="text-xs text-muted-foreground">Based on 47 reviews</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">11:30</div>
                  <p className="text-xs text-muted-foreground">System installation</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  if (!auth?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-6" />
          <div className="w-6" />
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {renderSidebar()}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        {renderSidebar()}
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-6">
          {renderMainContent()}
        </main>
      </div>

      {/* Support Ticket Modal */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSupportModalOpen(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create Support Ticket</h3>
                <button onClick={() => setSupportModalOpen(false)}>
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                    placeholder="Brief description of the issue"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={supportForm.priority}
                      onChange={(e) => setSupportForm({...supportForm, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={supportForm.category}
                      onChange={(e) => setSupportForm({...supportForm, category: e.target.value})}
                    >
                      <option value="technical">Technical</option>
                      <option value="equipment">Equipment</option>
                      <option value="app">App Issue</option>
                      <option value="customer_service">Customer Service</option>
                      <option value="billing">Billing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Location (Optional)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={supportForm.location}
                    onChange={(e) => setSupportForm({...supportForm, location: e.target.value})}
                    placeholder="Where are you experiencing this issue?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-24 resize-none"
                    value={supportForm.description}
                    onChange={(e) => setSupportForm({...supportForm, description: e.target.value})}
                    placeholder="Please describe the issue in detail..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setSupportModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSupportSubmit}
                  disabled={!supportForm.subject || !supportForm.description}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <HeadphonesIcon className="w-4 h-4 mr-2" />
                  Create Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}