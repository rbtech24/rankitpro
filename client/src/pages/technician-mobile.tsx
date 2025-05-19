import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, ArrowLeft, CheckCircle, Clock, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { CheckInForm } from "@/components/check-ins/CheckInForm";
import { useToast } from "@/hooks/use-toast";

const TechnicianMobileView = () => {
  const [activeTab, setActiveTab] = useState("check-in");
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch current user data to get technician and company info
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  // Fetch recent check-ins
  const { data: recentCheckIns, isLoading: isCheckInsLoading } = useQuery({
    queryKey: ["/api/check-ins", { limit: 5 }],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/check-ins?limit=5");
      if (!res.ok) throw new Error("Failed to fetch recent check-ins");
      return res.json();
    },
    enabled: !!userData
  });
  
  // Handle successful check-in submission
  const handleCheckInSuccess = () => {
    toast({
      title: "Check-in Successful",
      description: "Your check-in has been recorded successfully",
    });
    
    // Invalidate check-ins query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['/api/check-ins'] });
    
    // Switch to history tab to show the new check-in
    setActiveTab("history");
  };
  
  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!userData || !userData.user) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col p-4">
        <h1 className="text-2xl font-bold mb-4">Not Authorized</h1>
        <p className="text-muted-foreground mb-6">Please login to access the technician portal.</p>
        <Button onClick={() => navigate("/login")}>
          Go to Login
        </Button>
      </div>
    );
  }
  
  const userCompanyId = userData.user.companyId;
  const userTechnicianId = userData.user.id;
  
  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-6' : 'py-6'}`}>
      <div className="container px-4 mx-auto max-w-4xl">
        {!isMobile && (
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        )}
        
        <Card className="shadow-md">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="text-2xl font-semibold">
              Technician Mobile Portal
            </CardTitle>
            <CardDescription className="text-white/80">
              Record check-ins, view history, and manage your work
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full rounded-none">
                <TabsTrigger value="check-in" className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  New Check-In
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  <History className="h-4 w-4 mr-2" />
                  Recent History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="check-in" className="p-4 focus:outline-none">
                {userCompanyId && userTechnicianId && (
                  <CheckInForm 
                    companyId={userCompanyId}
                    technicianId={userTechnicianId}
                    onSuccess={handleCheckInSuccess}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="history" className="p-6 focus:outline-none">
                <h3 className="text-lg font-semibold mb-4">Recent Check-Ins</h3>
                
                {isCheckInsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : recentCheckIns && recentCheckIns.length > 0 ? (
                  <div className="space-y-4">
                    {recentCheckIns.map((checkIn: any) => (
                      <Card key={checkIn.id} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{checkIn.jobType}</CardTitle>
                              <CardDescription className="text-xs">
                                {new Date(checkIn.createdAt).toLocaleString()}
                              </CardDescription>
                            </div>
                            {checkIn.isBlog && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Blog Post
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {checkIn.workPerformed || checkIn.notes || 'No notes provided'}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{new Date(checkIn.createdAt).toLocaleTimeString()}</span>
                            {checkIn.location && (
                              <>
                                <Separator orientation="vertical" className="mx-2 h-3" />
                                <span className="line-clamp-1">{checkIn.location}</span>
                              </>
                            )}
                          </div>
                          
                          {checkIn.followUpRequired && (
                            <div className="mt-2">
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                Follow-up Required
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No recent check-ins found.</p>
                    <p className="text-sm mt-2">
                      Create your first check-in using the form in the "New Check-In" tab.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TechnicianMobileView;