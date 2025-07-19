import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import CheckinCard from "../components/checkin/checkin-card";
import CheckinModal from "../components/modals/checkin-modal";
import EditCheckinModal from "../components/modals/edit-checkin-modal";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: checkIns = [], isLoading, refetch } = useQuery<CheckIn[]>({
    queryKey: ["/api/check-ins"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (checkInId: number) => {
      const res = await apiRequest("DELETE", `/api/check-ins/${checkInId}`);
      if (res.status === 204 || res.ok) {
        return { success: true };
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Check-in deleted successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/check-ins"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete check-in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredCheckIns = checkIns.filter(checkIn => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      checkIn.jobType?.toLowerCase().includes(query) ||
      checkIn.technician?.name?.toLowerCase().includes(query) ||
      (checkIn.notes && checkIn.notes.toLowerCase().includes(query)) ||
      (checkIn.location && checkIn.location.toLowerCase().includes(query))
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCheckIns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCheckIns = filteredCheckIns.slice(startIndex, endIndex);

  const handleDeleteCheckIn = (checkInId: number) => {
    if (confirm("Are you sure you want to delete this check-in? This action cannot be undone.")) {
      deleteMutation.mutate(checkInId);
    }
  };
  
  const handleCreatePost = async (checkInId: number) => {
    try {
      // Get the visit data first
      const visit = checkIns.find(c => c.id === checkInId);
      if (!visit) {
        throw new Error("Visit not found");
      }

      // Generate blog post content using the visit data
      const contentRes = await apiRequest("POST", "/api/generate-content", {
        jobType: visit.jobType,
        notes: visit.notes || "",
        location: visit.location || "",
        technicianName: visit.technician.name,
        contentType: "blog_post"
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
        description: "The blog post was created successfully and is ready for publishing.",
        variant: "default",
      });
      
      // Refresh the data
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create blog post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestReview = async (checkInId: number, technicianId: number) => {
    try {
      await apiRequest("POST", "/api/review-requests", {
        checkInId,
        technicianId,
        method: "email",
        customerEmail: "customer@example.com", // In real app, this would come from the visit data
        customerName: "Customer",
        message: "We'd love to hear about your experience with our service!"
      });
      
      toast({
        title: "Review Request Sent",
        description: "Customer review request has been sent successfully.",
        variant: "default",
      });
      
      // Refresh the data
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send review request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visits</h1>
            <p className="text-sm text-gray-500">View and manage all visits from your technicians.</p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              className="w-full sm:w-64"
              placeholder="Search check-ins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={() => setCheckInModalOpen(true)}>
              Add New Visit
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="px-6 py-5 border-b border-gray-200">
            <CardTitle className="text-lg font-medium text-gray-900">All Check-ins</CardTitle>
          </CardHeader>
          
          <div className="max-h-[600px] overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-gray-500">Loading check-ins...</p>
                </div>
              ) : paginatedCheckIns.length > 0 ? (
                paginatedCheckIns.map((checkIn) => (
                  <div key={checkIn.id} className="relative group">
                    <CheckinCard
                      checkIn={checkIn}
                      onCreatePost={() => handleCreatePost(checkIn.id)}
                      onRequestReview={() => {
                        handleRequestReview(checkIn.id, checkIn.technician?.id || 0);
                      }}
                      onEdit={() => {
                        setSelectedCheckIn(checkIn);
                        setEditModalOpen(true);
                      }}
                      onViewDetails={() => {
                        setSelectedCheckIn(checkIn);
                        setDetailsModalOpen(true);
                        setEditModalOpen(false); // Close edit modal if open
                      }}
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCheckIn(checkIn.id)}
                        disabled={deleteMutation.isPending}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">
                    {searchQuery 
                      ? "No check-ins found matching your search." 
                      : "No check-ins found. Create your first check-in to get started."}
                  </p>
                  <Button className="mt-4" onClick={() => setCheckInModalOpen(true)}>
                    Create Visit
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Pagination */}
          {filteredCheckIns.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCheckIns.length)} of {filteredCheckIns.length} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      
        <CheckinModal 
          isOpen={checkInModalOpen} 
          onClose={() => setCheckInModalOpen(false)} 
        />

        <EditCheckinModal
          checkIn={selectedCheckIn}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedCheckIn(null);
          }}
        />
        
        {/* Visit Details Modal */}
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Visit Details</DialogTitle>
            </DialogHeader>
            {selectedCheckIn && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                    {selectedCheckIn.technician?.name ? selectedCheckIn.technician.name.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedCheckIn.technician?.name || 'Unknown Technician'}</h3>
                    <p className="text-sm text-gray-500">{selectedCheckIn.technician?.email}</p>
                    <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(selectedCheckIn.createdAt), { addSuffix: true })}</p>
                  </div>
                </div>
                
                {/* Job Information */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Job Type</h4>
                    <p className="text-gray-600">{selectedCheckIn.jobType}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Job Description</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedCheckIn.notes && selectedCheckIn.notes.trim() 
                          ? selectedCheckIn.notes 
                          : "No job description provided."
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                    <p className="text-gray-600">
                      {selectedCheckIn.location || 
                       (selectedCheckIn.latitude && selectedCheckIn.longitude ? 
                         `${parseFloat(selectedCheckIn.latitude).toFixed(4)}, ${parseFloat(selectedCheckIn.longitude).toFixed(4)}` : 
                         'Location not available')}
                    </p>
                  </div>
                </div>
                
                {/* Photos */}
                {selectedCheckIn.photos && selectedCheckIn.photos.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Photos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(() => {
                        let photoUrls = [];
                        if (typeof selectedCheckIn.photos === 'string') {
                          try {
                            const parsed = JSON.parse(selectedCheckIn.photos);
                            if (Array.isArray(parsed)) {
                              photoUrls = parsed;
                            } else {
                              photoUrls = [parsed];
                            }
                          } catch {
                            if (selectedCheckIn.photos.includes(',')) {
                              photoUrls = selectedCheckIn.photos.split(',').map(url => url.trim());
                            } else {
                              photoUrls = [selectedCheckIn.photos];
                            }
                          }
                        } else if (Array.isArray(selectedCheckIn.photos)) {
                          photoUrls = selectedCheckIn.photos.map(p => typeof p === 'string' ? p : p.url);
                        }
                        
                        return photoUrls.map((photoUrl: string, index: number) => (
                          <div key={index} className="aspect-square rounded-lg border overflow-hidden bg-gray-100">
                            <img 
                              src={photoUrl} 
                              alt={`Visit photo ${index + 1}`} 
                              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(photoUrl, '_blank')}
                              onError={(e) => {
                                console.error('Photo failed to load:', photoUrl);
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5VjEzTTEyIDE3SDE2VjEzSDhWMTdIMTJaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                              }}
                            />
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}