import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "@/lib/auth";

interface QuickActionsProps {
  onOpenVisitModal: () => void;
  onOpenTechnicianModal?: () => void;
  onOpenBlogPostModal?: () => void;
  onOpenReviewRequestModal?: () => void;
}

export default function QuickActions({
  onOpenVisitModal,
  onOpenTechnicianModal,
  onOpenBlogPostModal,
  onOpenReviewRequestModal
}: QuickActionsProps) {
  const { toast } = useToast();
  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  const userRole = auth?.user?.role;
  const isSuperAdmin = userRole === "super_admin";
  const isCompanyAdmin = userRole === "company_admin";
  const isTechnician = userRole === "technician";
  
  const handleAction = (actionType: string) => {
    switch (actionType) {
      case "visit":
        onOpenVisitModal();
        break;
      case "technician":
        if (onOpenTechnicianModal) {
          onOpenTechnicianModal();
        } else {
          toast({
            title: "Coming Soon",
            description: "This feature is not yet implemented.",
            variant: "default",
          });
        }
        break;
      case "blog-post":
        if (onOpenBlogPostModal) {
          onOpenBlogPostModal();
        } else {
          toast({
            title: "Coming Soon",
            description: "This feature is not yet implemented.",
            variant: "default",
          });
        }
        break;
      case "review-request":
        if (onOpenReviewRequestModal) {
          onOpenReviewRequestModal();
        } else {
          toast({
            title: "Coming Soon",
            description: "This feature is not yet implemented.",
            variant: "default",
          });
        }
        break;
      default:
        toast({
          title: "Coming Soon",
          description: "This feature is not yet implemented.",
          variant: "default",
        });
    }
  };
  
  return (
    <Card className="bg-white shadow-card">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {/* All users can create a visit */}
          <Button 
            className="w-full flex items-center justify-center"
            onClick={() => handleAction("visit")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M5 12h14"/>
              <path d="M12 5v14"/>
            </svg>
            New Visit
          </Button>
          
          {/* Only company admins can add technicians */}
          {isCompanyAdmin && (
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => handleAction("technician")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
              </svg>
              Add Technician
            </Button>
          )}
          
          {/* Company admins and technicians can create blog posts */}
          {(isCompanyAdmin || isTechnician) && (
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => handleAction("blog-post")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" x2="8" y1="13" y2="13"/>
                <line x1="16" x2="8" y1="17" y2="17"/>
                <line x1="10" x2="8" y1="9" y2="9"/>
              </svg>
              Create Blog Post
            </Button>
          )}
          
          {/* Only company admins can send review requests */}
          {isCompanyAdmin && (
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => handleAction("review-request")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Send Review Request
            </Button>
          )}
          
          {/* Only company admins can manage testimonials */}
          {isCompanyAdmin && (
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => window.location.href = "/testimonials"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10,8 16,12 10,16 10,8"/>
              </svg>
              Manage Testimonials
            </Button>
          )}
          
          {/* Super admin specific actions */}
          {isSuperAdmin && (
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => window.location.href = "/companies-management"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
                <path d="M8 7V3m8 4V3"/>
              </svg>
              Manage Companies
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
