import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import VisitCard from "@/components/visit/visit-card";

interface Technician {
  id: number;
  name: string;
  email: string;
  specialty?: string;
}

interface Visit {
  id: number;
  jobType: string;
  notes?: string;
  location?: string;
  photos: { url: string; filename: string }[];
  technician: Technician;
  createdAt: string;
  latitude?: number;
  longitude?: number;
}

export default function RecentVisits() {
  const { toast } = useToast();
  
  const { data: visits, isLoading } = useQuery<Visit[]>({
    queryKey: ["/api/visits", { limit: 5 }],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/visits?limit=5");
      return res.json();
    }
  });
  
  const handleCreatePost = async (visitId: number) => {
    try {
      // Generate blog post content
      const contentRes = await apiRequest("POST", "/api/generate-content", {
        visitId,
        contentType: "blog"
      });
      const contentData = await contentRes.json();
      
      // Create blog post with generated content
      await apiRequest("POST", "/api/blog-posts", {
        title: contentData.title,
        content: contentData.content,
        visitId
      });
      
      toast({
        title: "Blog Post Created",
        description: "The blog post was created successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create blog post. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleRequestReview = async (visitId: number, technicianId: number) => {
    try {
      // This would open a modal to collect customer information
      // For now, we'll just show a success toast
      toast({
        title: "Review Request",
        description: "The review request modal would open here.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open review request form.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="bg-white shadow-card col-span-4">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">Recent Visits</CardTitle>
          <Button variant="link" size="sm" className="text-primary-600">View all</Button>
        </div>
      </CardHeader>
      
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="p-6 space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="ml-4">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                <div className="flex flex-wrap mb-4">
                  <div className="mr-2 mb-2 w-24 h-24 rounded-md bg-gray-200"></div>
                  <div className="mr-2 mb-2 w-24 h-24 rounded-md bg-gray-200"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-8 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
            ))}
          </div>
        ) : visits && visits.length > 0 ? (
          visits.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              onCreatePost={() => handleCreatePost(visit.id)}
              onRequestReview={() => handleRequestReview(visit.id, visit.technician.id)}
            />
          ))
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No visits found. Create your first visit to get started.</p>
            <Button className="mt-4">Create Visit</Button>
          </div>
        )}
      </div>
    </Card>
  );
}
