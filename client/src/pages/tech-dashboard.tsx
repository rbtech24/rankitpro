import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Star, 
  Smartphone, 
  Menu, 
  X, 
  Plus,
  CheckCircle,
  Camera,
  MapPin
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function TechDashboardPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const { auth } = useAuth();

  // Mock data for development
  const visits: any[] = [];

  const menuItems = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Overview of your work'
    },
    {
      id: 'visits',
      icon: ClipboardList,
      label: 'My Visits',
      description: 'Track your service visits'
    },
    {
      id: 'reviews',
      icon: Star,
      label: 'My Reviews',
      description: 'Customer feedback'
    },
    {
      id: 'mobile',
      icon: Smartphone,
      label: 'Mobile App',
      description: 'Access on the go'
    }
  ];

  const isActive = (section: string) => activeSection === section;

  // Content Components
  const DashboardContent = () => (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Field Technician Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {auth?.user?.username}! Log your service visits and track your work.
          </p>
        </div>
        <div className="mb-8">
          <Button 
            onClick={() => setShowVisitModal(true)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transition-colors flex items-center justify-center text-lg"
          >
            <Plus className="mr-3 h-6 w-6" />
            Log New Visit
          </Button>
        </div>
        {/* Dashboard stats and content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Visits</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const TechVisitsContent = () => (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Visits</h1>
          <p className="mt-2 text-gray-600">Track and manage your service visits</p>
        </div>
        <div className="mb-6">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Log New Visit
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No visits logged yet</h3>
            <p className="text-gray-600">Start logging your service visits to track your work.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const TechReviewsContent = () => (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="mt-2 text-gray-600">Customer feedback and ratings for your work</p>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Complete visits to start receiving customer reviews.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const MobileAppContent = () => (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mobile App</h1>
          <p className="mt-2 text-gray-600">Access your dashboard on the go</p>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Mobile App Coming Soon</h3>
            <p className="text-gray-600">Use your browser for now to access all features.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Function to render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'visits':
        return <TechVisitsContent />;
      case 'reviews':
        return <TechReviewsContent />;
      case 'mobile':
        return <MobileAppContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto shadow-sm">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <h1 className="text-xl font-bold text-gray-900">Technician Portal</h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.id)
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${isActive(item.id) ? 'text-blue-500' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">Technician Portal</h1>
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4 mb-8">
                <h1 className="text-xl font-bold text-gray-900">Technician Portal</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.id)
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${isActive(item.id) ? 'text-blue-500' : 'text-gray-400'}`} />
                      <div className="text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
        
      {/* Main Dashboard Content */}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Visit Modal */}
      {showVisitModal && (
        <MobileVisitModal 
          open={showVisitModal} 
          onClose={() => setShowVisitModal(false)} 
        />
      )}
    </div>
  );
}

// Modal component for logging visits
interface MobileVisitModalProps {
  open: boolean;
  onClose: () => void;
}

function MobileVisitModal({ open, onClose }: MobileVisitModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Log New Visit</h3>
        <p className="text-gray-600 mb-4">Visit logging feature coming soon!</p>
        <button 
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}