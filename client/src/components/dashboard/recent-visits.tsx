import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../../components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { Button } from "../../components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "../../hooks/use-toast";
import VisitCard from "../../components/visit/visit-card";
import { AuthState, getCurrentUser } from "../../lib/auth";
import ReviewRequestModal from "../../components/modals/review-request-modal";
import { Edit, Trash2, Eye } from "lucide-react";

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
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState<{ name?: string; email?: string; visitId: number } | null>(null);
  const [showAllVisits, setShowAllVisits] = useState(false);
  
  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  const userRole = auth?.user?.role;
  const isSuperAdmin = userRole === "super_admin";
  const isCompanyAdmin = userRole === "company_admin";
  const isTechnician = userRole === "technician";
  
  // Show more visits when expanded
  const visitLimit = showAllVisits ? 50 : 5;
  
  // For technicians, we might want to show only their own visits
  const endpoint = isTechnician 
    ? `/api/visits?limit=${visitLimit}&technicianId=${auth?.user?.id}`
    : `/api/visits?limit=${visitLimit}`;
  
  const { data: visits, isLoading } = useQuery<Visit[]>({
    queryKey: ["/api/visits", { limit: visitLimit, technicianId: isTechnician ? auth?.user?.id : undefined }],
    queryFn: async () => {
      const res = await apiRequest("GET", endpoint);
      return res.json();
    }
  });

  const deleteVisitMutation = useMutation({
    mutationFn: async (visitId: number) => {
      const res = await apiRequest("DELETE", `/api/visits/${visitId}`);
      if (res.status === 204 || res.ok) {
        return { success: true };
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Visit deleted successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/visits"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete visit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteVisit = (visitId: number) => {
    if (confirm("Are you sure you want to delete this visit? This action cannot be undone.")) {
      deleteVisitMutation.mutate(visitId);
    }
  };

  const handleEditVisit = (visitId: number) => {
    // Navigate to edit visit page or open edit modal
    window.location.href = `/visit/${visitId}/edit`;
  };
  
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
      
      <div className={`${showAllVisits ? 'max-h-96 overflow-y-auto' : ''} divide-y divide-gray-200`}>
        {isLoading ? (
          <div className="p-6 space-y-6">
            {[...Array(showAllVisits ? 5 : 2)].map((_, i) => (
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
              </div>
            ))}
          </div>
        ) : visits && visits.length > 0 ? (
          visits.map((visit, index) => (
            <div key={visit.id} className={`relative group p-4 hover:bg-gray-50 ${index < (showAllVisits ? visits.length : Math.min(5, visits.length)) ? 'block' : 'hidden'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium mr-3">
                      {visit.technician?.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{visit.jobType}</h4>
                      <p className="text-sm text-gray-500">
                        {visit.technician?.name || 'Technician'} • {formatDistanceToNow(new Date(visit.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  {visit.notes && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {visit.notes}
                    </p>
                  )}
                  
                  {visit.location && (
                    <p className="text-xs text-gray-500 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {visit.location}
                    </p>
                  )}
                  
                  {visit.photos && visit.photos.length > 0 && (
                    <div className="flex mt-2 space-x-2">
                      {visit.photos.slice(0, 3).map((photo, idx) => (
                        <div key={idx} className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </div>
                      ))}
                      {visit.photos.length > 3 && (
                        <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                          +{visit.photos.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Action buttons - show on hover or for touch devices */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditVisit(visit.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  
                  {(isCompanyAdmin || isSuperAdmin) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteVisit(visit.id)}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      disabled={deleteVisitMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                  
                  {isCompanyAdmin && (visit.technician?.id || visit.technicianId) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestReview(visit.id, visit.technician?.id || visit.technicianId!)}
                      className="h-8 px-2 text-xs"
                    >
                      Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
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
        
        {visits && visits.length > 5 && !showAllVisits && (
          <div className="p-4 border-t bg-gray-50">
            <Button
              variant="ghost"
              onClick={() => setShowAllVisits(true)}
              className="w-full text-sm text-gray-600 hover:text-gray-900"
            >
              Show {visits.length - 5} more visits
            </Button>
          </div>
        )}
        
        {showAllVisits && (
          <div className="p-4 border-t bg-gray-50">
            <Button
              variant="ghost"
              onClick={() => setShowAllVisits(false)}
              className="w-full text-sm text-gray-600 hover:text-gray-900"
            >
              Show less
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
