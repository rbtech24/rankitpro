import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar-clean";
import TopNav from "@/components/layout/top-nav";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const { data: checkIns, isLoading } = useQuery<CheckIn[]>({
    queryKey: ["/api/check-ins"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/check-ins");
      return res.json();
    }
  });
  
  const filteredCheckIns = checkIns?.filter(checkIn => {
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar className={`fixed inset-0 z-40 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:relative`} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                <div className="p-6 space-y-6">
                  {[...Array(3)].map((_, i) => (
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
              ) : filteredCheckIns && filteredCheckIns.length > 0 ? (
                filteredCheckIns.map((checkIn) => (
                  <CheckinCard
                    key={checkIn.id}
                    checkIn={checkIn}
                    onCreatePost={() => handleCreatePost(checkIn.id)}
                    onRequestReview={() => handleRequestReview(checkIn.id, checkIn.technician.id)}
                    onEdit={() => {
                      toast({
                        title: "Edit Check-in",
                        description: "Edit functionality coming soon.",
                        variant: "default",
                      });
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
        </main>
      </div>
      
      <CheckinModal 
        isOpen={checkInModalOpen} 
        onClose={() => setCheckInModalOpen(false)} 
      />
    </div>
  );
}
