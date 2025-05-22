import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Star } from "lucide-react";

const PerformanceWidget = () => {
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
              <p className="text-2xl font-bold">94%</p>
            </div>
            <div className="text-green-500 font-medium bg-green-50 px-2 py-1 rounded text-sm flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +3.2%
            </div>
          </div>
          <Progress value={94} className="h-2 w-full bg-gray-100" />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">Average Review Score</p>
              <p className="text-2xl font-bold">4.8</p>
            </div>
            <div className="text-green-500 font-medium bg-green-50 px-2 py-1 rounded text-sm flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +0.2
            </div>
          </div>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`h-5 w-5 ${star <= 4 ? 'text-amber-400' : 'text-amber-200'}`} 
                fill={star <= 4 ? "#f59e0b" : "#fde68a"} 
              />
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">Website Traffic from Visits</p>
              <p className="text-2xl font-bold">328</p>
            </div>
            <div className="text-green-500 font-medium bg-green-50 px-2 py-1 rounded text-sm flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12.5%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceWidget;