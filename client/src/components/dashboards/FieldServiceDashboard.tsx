import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Camera, 
  Clock, 
  CheckCircle, 
  Users, 
  TrendingUp,
  Plus,
  Calendar,
  Navigation,
  Phone
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface FieldServiceDashboardProps {
  company: {
    id: number;
    name: string;
    businessType: string;
  };
  user: {
    id: number;
    username: string;
    role: string;
  };
}

export function FieldServiceDashboard({ company, user }: FieldServiceDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checkins' | 'technicians' | 'locations'>('overview');

  // Fetch dashboard data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/field-service', company.id],
    enabled: !!company.id
  });

  const { data: recentCheckins } = useQuery({
    queryKey: ['/api/check-ins', company.id, { limit: 5 }],
    enabled: !!company.id
  });

  const { data: technicians } = useQuery({
    queryKey: ['/api/technicians', company.id],
    enabled: !!company.id
  });

  const { data: locations } = useQuery({
    queryKey: ['/api/locations', company.id],
    enabled: !!company.id
  });

  const quickActions = [
    { 
      icon: <Plus className="w-4 h-4" />, 
      label: 'New Check-in', 
      action: () => window.location.href = '/mobile/checkin',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      icon: <Users className="w-4 h-4" />, 
      label: 'Manage Technicians', 
      action: () => setActiveTab('technicians'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      icon: <MapPin className="w-4 h-4" />, 
      label: 'Locations', 
      action: () => setActiveTab('locations'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    { 
      icon: <Calendar className="w-4 h-4" />, 
      label: 'Schedule', 
      action: () => {},
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const overviewCards = [
    {
      title: 'Today\'s Check-ins',
      value: stats?.todayCheckins || 0,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      description: 'Jobs completed today',
      trend: '+12% from yesterday'
    },
    {
      title: 'Active Technicians',
      value: stats?.activeTechnicians || 0,
      icon: <Users className="w-5 h-5 text-blue-500" />,
      description: 'Technicians in the field',
      trend: '3 on duty now'
    },
    {
      title: 'Total Locations',
      value: stats?.totalLocations || 0,
      icon: <MapPin className="w-5 h-5 text-purple-500" />,
      description: 'Service locations',
      trend: '+2 this month'
    },
    {
      title: 'Avg Response Time',
      value: stats?.avgResponseTime || '24min',
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      description: 'Customer response time',
      trend: '-5min improvement'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
          <p className="text-gray-600">Field Service Management Dashboard</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Field Service Edition
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, idx) => (
          <Button
            key={idx}
            onClick={action.action}
            className={`${action.color} text-white h-auto py-3 px-4 flex flex-col items-center gap-2`}
          >
            {action.icon}
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'checkins', label: 'Recent Check-ins' },
          { id: 'technicians', label: 'Technicians' },
          { id: 'locations', label: 'Locations' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewCards.map((card, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  {card.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-gray-600">{card.description}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">{card.trend}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Check-ins
              </CardTitle>
              <CardDescription>Latest job completions from your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCheckins?.slice(0, 5).map((checkin: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{checkin.customerName}</p>
                        <p className="text-xs text-gray-600">{checkin.jobType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{checkin.location}</p>
                      <p className="text-xs font-medium">{new Date(checkin.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No check-ins yet</p>
                    <Button className="mt-2" onClick={() => window.location.href = '/mobile/checkin'}>
                      Create First Check-in
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'technicians' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Field Technicians
            </CardTitle>
            <CardDescription>Manage your service team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {technicians?.map((tech: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{tech.name}</p>
                      <p className="text-sm text-gray-600">{tech.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{tech.checkinsCount || 0} jobs</Badge>
                    <Button size="sm" variant="outline">
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <p className="text-gray-500">No technicians added yet</p>
                  <Button className="mt-2" onClick={() => window.location.href = '/admin/technicians'}>
                    Add Technician
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'locations' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Service Locations
            </CardTitle>
            <CardDescription>Manage your service areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {locations?.map((location: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{location.name}</p>
                      <p className="text-sm text-gray-600">{location.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={location.isActive ? "default" : "secondary"}>
                      {location.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Navigation className="w-3 h-3 mr-1" />
                      Navigate
                    </Button>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <p className="text-gray-500">No locations added yet</p>
                  <Button className="mt-2" onClick={() => window.location.href = '/admin/locations'}>
                    Add Location
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}