import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PhotoUploadWizard from "@/components/technician/photo-upload-wizard";
import JobFormWizard from "@/components/technician/job-form-wizard";

export default function MobileTechApp() {
  // We'll get user info from the server
  const [userInfo, setUserInfo] = useState<any>(null);
  // Wizard state management
  const [wizardStage, setWizardStage] = useState<'none' | 'photos' | 'details'>('none');
  const [selectedPhotos, setSelectedPhotos] = useState<{
    before: File[];
    during: File[];
    after: File[];
  }>({
    before: [],
    during: [],
    after: []
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch job types for the visit form
  const { data: jobTypes = [], isLoading: isLoadingJobTypes } = useQuery({
    queryKey: ['/api/job-types'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/job-types');
        if (!res.ok) {
          // If API isn't implemented yet, return default job types
          return [
            "Plumbing Repair",
            "Water Heater Installation",
            "Drain Cleaning",
            "Sewer Line Repair",
            "AC Maintenance",
            "HVAC Repair",
            "Electrical Repair",
            "Remodeling",
            "Flooring Installation",
            "Roof Repair",
            "General Maintenance"
          ];
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching job types:", error);
        // Return default job types as fallback
        return [
          "Plumbing Repair",
          "Water Heater Installation",
          "Drain Cleaning",
          "Sewer Line Repair",
          "AC Maintenance",
          "HVAC Repair",
          "Electrical Repair",
          "Remodeling",
          "Flooring Installation",
          "Roof Repair",
          "General Maintenance"
        ];
      }
    }
  });

  // Fetch recent visits
  const { data: recentVisits = [], isLoading: isLoadingVisits } = useQuery({
    queryKey: ['/api/visits'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/visits');
      if (!res.ok) return [];
      return await res.json();
    }
  });

  // Handle photo wizard completion
  const handlePhotosSelected = (photos: {
    before: File[];
    during: File[];
    after: File[];
  }) => {
    setSelectedPhotos(photos);
    // Move to the job details form
    setWizardStage('details');
    console.log("Photos selected:", photos);
  };
  
  // Handle form completion
  const handleFormComplete = () => {
    // Reset the wizard state
    setWizardStage('none');
    setSelectedPhotos({
      before: [],
      during: [],
      after: []
    });
    
    // Show success message
    setSuccessMessage("Service visit successfully recorded!");
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* App Header */}
      <header className="bg-primary text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Rank It Pro</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm">Field Technician</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container p-4 mx-auto max-w-md">
        {isWizardOpen ? (
          <PhotoUploadWizard
            onPhotosSelected={handlePhotosSelected}
            onCancel={() => setIsWizardOpen(false)}
          />
        ) : (
          <>
            {/* Quick Actions */}
            <section className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  size="lg" 
                  className="h-16 font-semibold text-lg"
                  onClick={() => setIsWizardOpen(true)}
                >
                  <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                    <circle cx="12" cy="13" r="3"/>
                  </svg>
                  Log New Visit
                </Button>
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
              
              {isLoadingVisits ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : recentVisits.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <svg className="h-12 w-12 text-muted-foreground mb-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <p className="text-center text-muted-foreground mb-1">No recent service visits</p>
                    <p className="text-center text-sm text-muted-foreground">
                      Your recently logged visits will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {recentVisits.map((visit: any) => (
                    <Card key={visit.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base flex justify-between">
                          <span>{visit.jobType}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(visit.createdAt).toLocaleDateString()}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {visit.notes}
                        </p>
                        
                        {visit.location && (
                          <div className="flex items-center mt-2 text-xs text-muted-foreground">
                            <svg className="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {visit.location}
                          </div>
                        )}
                        
                        {/* Photo indicators */}
                        {(visit.beforePhotos?.length > 0 || visit.duringPhotos?.length > 0 || visit.afterPhotos?.length > 0) && (
                          <div className="flex gap-2 mt-2">
                            {visit.beforePhotos?.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <svg className="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                                  <circle cx="12" cy="13" r="3"/>
                                </svg>
                                Before
                              </span>
                            )}
                            {visit.duringPhotos?.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <svg className="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                                  <circle cx="12" cy="13" r="3"/>
                                </svg>
                                During
                              </span>
                            )}
                            {visit.afterPhotos?.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg className="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                                  <circle cx="12" cy="13" r="3"/>
                                </svg>
                                After
                              </span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-around items-center">
        <button className="flex flex-col items-center text-primary">
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span className="text-xs mt-1">Home</span>
        </button>
        
        <button className="flex flex-col items-center text-gray-500" onClick={() => setIsWizardOpen(true)}>
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
          <span className="text-xs mt-1">New Visit</span>
        </button>
        
        <button className="flex flex-col items-center text-gray-500">
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/>
            <line x1="12" x2="12" y1="12" y2="12"/>
            <line x1="12" x2="12" y1="16" y2="16"/>
            <line x1="12" x2="12" y1="8" y2="8"/>
          </svg>
          <span className="text-xs mt-1">History</span>
        </button>
      </nav>
    </div>
  );
}