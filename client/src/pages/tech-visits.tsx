import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Camera, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TechVisits() {
  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['/api/visits'],
    queryFn: async () => {
      const res = await fetch('/api/visits', { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Visits</h1>
          <p className="mt-2 text-gray-600">
            Track and manage your service visits
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Log New Visit
        </Button>
      </div>

      {visits.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No visits logged yet</h3>
            <p className="text-gray-600 mb-4">
              Start logging your service visits to track your work and generate content.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Log Your First Visit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Visits</p>
                    <p className="text-2xl font-bold text-gray-900">{visits.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {visits.filter((visit: any) => {
                        const visitDate = new Date(visit.createdAt);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return visitDate >= weekAgo;
                      }).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Camera className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">With Photos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {visits.filter((visit: any) => visit.photos && visit.photos.length > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visits List */}
          <div className="space-y-4">
            {visits.map((visit: any) => (
              <Card key={visit.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{visit.jobType}</CardTitle>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{visit.location || visit.address || 'Location not specified'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        {formatDate(visit.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {visit.notes && (
                    <p className="text-gray-700 mb-3">
                      {visit.notes}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {visit.customerName && (
                        <span>Customer: {visit.customerName}</span>
                      )}
                      {visit.photos && visit.photos.length > 0 && (
                        <span className="flex items-center">
                          <Camera className="h-4 w-4 mr-1" />
                          {visit.photos.length} photo{visit.photos.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}