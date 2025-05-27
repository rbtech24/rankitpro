import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CheckinCard from "@/components/checkin/checkin-card";
import CheckinModal from "@/components/modals/checkin-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Technician {
  id: number;
  name: string;
  email: string;
  specialty?: string;
}

interface CheckIn {
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

export default function CheckIns() {
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: checkIns = [], isLoading, refetch } = useQuery<CheckIn[]>({
    queryKey: ["/api/check-ins"],
  });

  const filteredCheckIns = checkIns.filter(checkIn => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      checkIn.jobType.toLowerCase().includes(query) ||
      checkIn.technician.name.toLowerCase().includes(query) ||
      (checkIn.notes && checkIn.notes.toLowerCase().includes(query)) ||
      (checkIn.location && checkIn.location.toLowerCase().includes(query))
    );
  });
  
  const handleCreatePost = async (checkInId: number) => {
    try {
      // Generate blog post content
      const contentRes = await apiRequest("POST", "/api/generate-content", {
        checkInId,
        contentType: "blog"
      });
      const contentData = await contentRes.json();
      
      // Create blog post with generated content
      await apiRequest("POST", "/api/blog-posts", {
        title: contentData.title,
        content: contentData.content,
        checkInId
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

  const handleRequestReview = (checkInId: number, technicianId: number) => {
    toast({
      title: "Review Request",
      description: "The review request modal would open here.",
      variant: "default",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Check-ins</h1>
            <p className="text-sm text-gray-500">View and manage all check-ins from your technicians.</p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              className="w-full sm:w-64"
              placeholder="Search check-ins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={() => setCheckInModalOpen(true)}>
              New Check-in
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="px-6 py-5 border-b border-gray-200">
            <CardTitle className="text-lg font-medium text-gray-900">All Check-ins</CardTitle>
          </CardHeader>
          
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-gray-500">Loading check-ins...</p>
              </div>
            ) : filteredCheckIns.length > 0 ? (
              filteredCheckIns.map((checkIn) => (
                <CheckinCard
                  key={checkIn.id}
                  checkIn={checkIn}
                  onCreatePost={() => handleCreatePost(checkIn.id)}
                  onRequestReview={() => {
                    handleRequestReview(checkIn.id, checkIn.technician.id);
                  }}
                />
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">
                  {searchQuery 
                    ? "No check-ins found matching your search." 
                    : "No check-ins found. Create your first check-in to get started."}
                </p>
                <Button className="mt-4" onClick={() => setCheckInModalOpen(true)}>
                  Create Check-in
                </Button>
              </div>
            )}
          </div>
        </Card>
      
        <CheckinModal 
          isOpen={checkInModalOpen} 
          onClose={() => setCheckInModalOpen(false)} 
        />
      </div>
    </DashboardLayout>
  );
}