import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ReviewRequest {
  id: number;
  customerName: string;
  email?: string;
  phone?: string;
  method: "email" | "sms";
  sentAt: string;
  technicianId: number;
  technician?: {
    name: string;
  };
}

export default function Reviews() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const { data: reviewRequests, isLoading } = useQuery<ReviewRequest[]>({
    queryKey: ["/api/review-requests"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/review-requests");
      return res.json();
    }
  });
  
  const filteredReviewRequests = reviewRequests?.filter(request => {
    const query = searchQuery.toLowerCase();
    return (
      request.customerName.toLowerCase().includes(query) ||
      (request.email && request.email.toLowerCase().includes(query)) ||
      (request.phone && request.phone.toLowerCase().includes(query))
    );
  });
  
  const handleNewReviewRequest = () => {
    toast({
      title: "New Review Request",
      description: "This functionality is coming soon.",
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
              <h1 className="text-2xl font-bold text-gray-900">Review Requests</h1>
              <p className="text-sm text-gray-500">Manage review requests sent to your customers.</p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                className="w-full sm:w-64"
                placeholder="Search review requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={handleNewReviewRequest}>
                New Request
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <CardTitle className="text-lg font-medium text-gray-900">All Review Requests</CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Sent Date</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i} className="animate-pulse">
                          <TableCell>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="h-8 bg-gray-200 rounded w-20 ml-auto"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredReviewRequests && filteredReviewRequests.length > 0 ? (
                      filteredReviewRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.customerName}</TableCell>
                          <TableCell>
                            {request.email || request.phone || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={request.method === "email" ? "default" : "secondary"}>
                              {request.method === "email" ? "Email" : "SMS"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(request.sentAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {request.technician?.name || `Tech ID: ${request.technicianId}`}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              Resend
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          <p className="text-gray-500">
                            {searchQuery 
                              ? "No review requests found matching your search." 
                              : "No review requests found. Create your first review request to get started."}
                          </p>
                          <Button className="mt-2" onClick={handleNewReviewRequest}>
                            Create Review Request
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
