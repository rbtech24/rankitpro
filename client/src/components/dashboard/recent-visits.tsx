import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import VisitCard from "@/components/visit/visit-card";
import { AuthState, getCurrentUser } from "@/lib/auth";
import ReviewRequestModal from "@/components/modals/review-request-modal";

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
  technician: Technician | null;
  technicianId?: number;
  createdAt: string;
  latitude?: number;
  longitude?: number;
}

export default function RecentVisits() {
  const { toast } = useToast();
  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  const userRole = auth?.user?.role;
  const isSuperAdmin = userRole === "super_admin";
  const isCompanyAdmin = userRole === "company_admin";
  const isTechnician = userRole === "technician";
  
  // For technicians, we might want to show only their own visits
  const endpoint = isTechnician 
    ? "/api/visits?limit=5&technicianId=" + auth?.user?.id
    : "/api/visits?limit=5";
  
  const { data: visits, isLoading } = useQuery<Visit[]>({
    queryKey: ["/api/visits", { limit: 5, technicianId: isTechnician ? auth?.user?.id : undefined }],
    queryFn: async () => {
      const res = await apiRequest("GET", endpoint);
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
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<{ visitId: number; technicianId: number } | null>(null);

  const handleRequestReview = (visitId: number, technicianId: number) => {
    setSelectedVisit({ visitId, technicianId });
    setReviewModalOpen(true);
  };
  
  return (
    <Card className="bg-white shadow-card col-span-4">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">
            {isTechnician ? "My Recent Visits" : "Recent Visits"}
          </CardTitle>
          <Button 
            variant="link" 
            size="sm" 
            className="text-primary-600"
            onClick={() => window.location.href = "/visits"}
          >
            View all
          </Button>
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
              onCreatePost={!isSuperAdmin ? () => handleCreatePost(visit.id) : undefined}
              onRequestReview={isCompanyAdmin && (visit.technician?.id || visit.technicianId) ? () => handleRequestReview(visit.id, visit.technician?.id || visit.technicianId!) : undefined}
            />
          ))
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">
              {isTechnician 
                ? "You haven't logged any visits yet. Create your first visit to get started." 
                : "No visits found. Create your first visit to get started."}
            </p>
            <Button 
              className="mt-4"
              onClick={() => window.location.href = "/visits?action=new"}
            >
              Create Visit
            </Button>
          </div>
        )}
      </div>

      <ReviewRequestModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedVisit(null);
        }}
        visitId={selectedVisit?.visitId}
        technicianId={selectedVisit?.technicianId}
      />
    </Card>
  );
}
