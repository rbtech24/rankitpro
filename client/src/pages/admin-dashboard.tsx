import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import CompaniesManagement from "@/components/dashboard/companies-management";
import AdminBusinessManagement from "@/components/dashboard/admin-business-management";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Users,
  Building2,
  CheckCircle2,
  Star,
} from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  
  // Super admin queries for platform-wide data
  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"]
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/admin/users"]
  });

  const { data: visits = [] } = useQuery({
    queryKey: ["/api/visits"]
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/review-responses"]
  });

  const totalVisits = Array.isArray(visits) ? visits.length : 0;
  const totalReviews = Array.isArray(reviews) ? reviews.length : 0;

  return (
    <DashboardLayout>
      {/* Super Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 -mt-6 -mx-6 px-6 py-8 mb-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                System Administrator Dashboard
              </h1>
              <p className="text-purple-100 mt-1">
                Platform-wide management and oversight
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => setLocation('/companies-management')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Manage Companies
              </Button>
              <Button 
                className="bg-white text-purple-700 hover:bg-purple-50"
                onClick={() => setLocation('/admin-user-management')}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold">{Array.isArray(companies) ? companies.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{Array.isArray(allUsers) ? allUsers.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Platform Visits</p>
                <p className="text-2xl font-bold">{totalVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Platform Reviews</p>
                <p className="text-2xl font-bold">{totalReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CompaniesManagement />
        <AdminBusinessManagement />
      </div>
    </DashboardLayout>
  );
}