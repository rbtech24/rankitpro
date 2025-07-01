import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { useLocation } from "wouter";
import { CheckCircle, Users, FileText, Star, ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface CompanyStats {
  totalCheckins: number;
  activeTechs: number;
  blogPosts: number;
  reviewRequests: number;
  trends: {
    checkinsChange: number;
    techsChange: number;
    blogPostsChange: number;
    reviewRequestsChange: number;
  };
}

export default function StatsOverview() {
  const [, setLocation] = useLocation();
  
  const { data: stats, isLoading } = useQuery<CompanyStats>({
    queryKey: ["/api/company-stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/company-stats");
      return res.json();
    }
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-12 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
                </div>
              </div>
            </CardContent>
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Total Check-ins Card */}
      <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats?.totalCheckins || 0}</div>
            </div>
          </div>
        </CardContent>
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <div className="flex justify-between items-center text-sm">
            <span 
              className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
              onClick={() => setLocation('/check-ins')}
            >
              View all
            </span>
            <div className="flex items-center text-gray-500">
              <ArrowUpIcon className="w-3 h-3 mr-1 text-green-500" />
              <span>0%</span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Active Technicians Card */}
      <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats?.activeTechs || 0}</div>
            </div>
          </div>
        </CardContent>
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <div className="flex justify-between items-center text-sm">
            <span 
              className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
              onClick={() => setLocation('/technicians')}
            >
              Manage
            </span>
            <span className="text-gray-500">{stats?.activeTechs || 0} tech{(stats?.activeTechs || 0) !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </Card>
      
      {/* Blog Posts Card */}
      <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats?.blogPosts || 0}</div>
            </div>
          </div>
        </CardContent>
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <div className="flex justify-between items-center text-sm">
            <span 
              className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
              onClick={() => setLocation('/blog-posts')}
            >
              View all
            </span>
            <div className="flex items-center text-gray-500">
              <ArrowUpIcon className="w-3 h-3 mr-1 text-green-500" />
              <span>0%</span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Review Requests Card */}
      <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats?.reviewRequests || 0}</div>
            </div>
          </div>
        </CardContent>
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <div className="flex justify-between items-center text-sm">
            <span 
              className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
              onClick={() => setLocation('/review-request')}
            >
              Send new
            </span>
            <span className="text-gray-500">0%</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
