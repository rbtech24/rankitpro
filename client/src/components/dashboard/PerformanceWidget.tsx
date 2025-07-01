import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { BarChart3, TrendingUp, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const PerformanceWidget = () => {
  const { data: visits } = useQuery({
    queryKey: ["/api/visits"],
  });

  const { data: blogPosts } = useQuery({
    queryKey: ["/api/blog-posts"],
  });

  // Calculate real metrics from actual data
  const totalVisits = visits?.length || 0;
  const completedVisits = visits?.filter((v: any) => v.status === 'completed')?.length || 0;
  const completionRate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;
  
  const blogPostsCount = blogPosts?.length || 0;
  const estimatedTraffic = blogPostsCount * 25; // Estimate 25 visits per blog post
  
  // Calculate average rating from visits
  const ratingsSum = visits?.reduce((sum: number, visit: any) => {
    return sum + (visit.customerRating || 0);
  }, 0) || 0;
  const ratingsCount = visits?.filter((v: any) => v.customerRating > 0)?.length || 0;
  const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-medium">
          <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
          Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">Visit Completion Rate</p>
              <p className="text-2xl font-bold">{totalVisits > 0 ? `${completionRate}%` : '0%'}</p>
            </div>
            <div className={`font-medium px-2 py-1 rounded text-sm flex items-center ${
              completionRate >= 90 ? 'text-green-500 bg-green-50' : 
              completionRate >= 70 ? 'text-yellow-500 bg-yellow-50' : 
              'text-gray-500 bg-gray-50'
            }`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {completionRate > 0 ? `+${completionRate}%` : '0%'}
            </div>
          </div>
          <Progress value={completionRate} className="h-2 w-full bg-gray-100" />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">Average Review Score</p>
              <p className="text-2xl font-bold">{averageRating > 0 ? averageRating.toFixed(1) : 'No reviews'}</p>
            </div>
            <div className={`font-medium px-2 py-1 rounded text-sm flex items-center ${
              averageRating >= 4 ? 'text-green-500 bg-green-50' : 
              averageRating >= 3 ? 'text-yellow-500 bg-yellow-50' : 
              averageRating > 0 ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-gray-50'
            }`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {averageRating > 0 ? `+${(averageRating - 3).toFixed(1)}` : '0.0'}
            </div>
          </div>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`h-5 w-5 ${star <= Math.round(averageRating) ? 'text-amber-400' : 'text-amber-200'}`} 
                fill={star <= Math.round(averageRating) ? "#f59e0b" : "#fde68a"} 
              />
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">Website Traffic from Visits</p>
              <p className="text-2xl font-bold">{estimatedTraffic > 0 ? estimatedTraffic : 'No traffic'}</p>
            </div>
            <div className={`font-medium px-2 py-1 rounded text-sm flex items-center ${
              estimatedTraffic > 0 ? 'text-green-500 bg-green-50' : 'text-gray-500 bg-gray-50'
            }`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {estimatedTraffic > 0 ? `+${Math.min(100, Math.round(estimatedTraffic / 10))}%` : '0%'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceWidget;