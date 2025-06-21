import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white overflow-hidden shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-100 rounded-md p-3 h-12 w-12"></div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-12"></div>
                </div>
              </div>
            </CardContent>
            <div className="bg-gray-50 px-5 py-2">
              <div className="text-sm flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Total Check-ins Card */}
      <Card className="bg-white overflow-hidden shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-50 rounded-md p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                <path d="M9 11l3 3l8-8"/>
                <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Check-ins</dt>
                <dd>
                  <div className="text-lg font-semibold text-gray-900">{stats?.totalCheckins || 0}</div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <div className="bg-gray-50 px-5 py-2">
          <div className="text-sm flex justify-between">
            <span 
              className="font-medium text-primary-600 hover:text-primary-500 cursor-pointer"
              onClick={() => setLocation('/check-ins')}
            >
              View all
            </span>
            {stats?.trends?.checkinsChange !== undefined && (
              <span className={`${stats.trends.checkinsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.trends.checkinsChange >= 0 ? '↑' : '↓'} {Math.abs(stats.trends.checkinsChange)}%
              </span>
            )}
          </div>
        </div>
      </Card>
      
      {/* Active Technicians Card */}
      <Card className="bg-white overflow-hidden shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Technicians</dt>
                <dd>
                  <div className="text-lg font-semibold text-gray-900">{stats?.activeTechs || 0}</div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <div className="bg-gray-50 px-5 py-2">
          <div className="text-sm flex justify-between">
            <span 
              className="font-medium text-primary-600 hover:text-primary-500 cursor-pointer"
              onClick={() => setLocation('/technicians')}
            >
              Manage
            </span>
            {stats?.activeTechs ? (
              <span className="text-gray-600">{stats.activeTechs > 1 ? `${stats.activeTechs} techs` : '1 tech'}</span>
            ) : (
              <span className="text-gray-500">No techs</span>
            )}
          </div>
        </div>
      </Card>
      
      {/* Blog Posts Card */}
      <Card className="bg-white overflow-hidden shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-50 rounded-md p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" x2="8" y1="13" y2="13"/>
                <line x1="16" x2="8" y1="17" y2="17"/>
                <line x1="10" x2="8" y1="9" y2="9"/>
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Blog Posts</dt>
                <dd>
                  <div className="text-lg font-semibold text-gray-900">{stats?.blogPosts || 0}</div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <div className="bg-gray-50 px-5 py-2">
          <div className="text-sm flex justify-between">
            <span 
              className="font-medium text-primary-600 hover:text-primary-500 cursor-pointer"
              onClick={() => setLocation('/blog-posts')}
            >
              View all
            </span>
            {stats?.trends?.blogPostsChange !== undefined && (
              <span className={`${stats.trends.blogPostsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.trends.blogPostsChange >= 0 ? '↑' : '↓'} {Math.abs(stats.trends.blogPostsChange)}%
              </span>
            )}
          </div>
        </div>
      </Card>
      
      {/* Review Requests Card */}
      <Card className="bg-white overflow-hidden shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-50 rounded-md p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Review Requests</dt>
                <dd>
                  <div className="text-lg font-semibold text-gray-900">{stats?.reviewRequests || 0}</div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <div className="bg-gray-50 px-5 py-2">
          <div className="text-sm flex justify-between">
            <span 
              className="font-medium text-primary-600 hover:text-primary-500 cursor-pointer"
              onClick={() => setLocation('/review-request')}
            >
              Send new
            </span>
            {stats?.trends?.reviewRequestsChange !== undefined && (
              <span className={`${stats.trends.reviewRequestsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.trends.reviewRequestsChange >= 0 ? '↑' : '↓'} {Math.abs(stats.trends.reviewRequestsChange)}%
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
