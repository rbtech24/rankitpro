import { useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LogoutHandler() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Call the logout API to destroy server session
        await apiRequest("POST", "/api/auth/logout");
        
        // Clear React Query cache completely
        queryClient.clear();
        
        // Clear all storage completely for mobile PWA compatibility
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear any cached data in IndexedDB if present
        if ('indexedDB' in window) {
          try {
            const databases = await indexedDB.databases();
            databases.forEach(db => {
              if (db.name) {
                indexedDB.deleteDatabase(db.name);
              }
            });
          } catch (idbError) {
            console.log("IndexedDB cleanup skipped:", idbError);
          }
        }
        
        // Show success message
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
        
        // For mobile PWA, use replace to ensure clean navigation
        if ((window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches) {
          window.location.replace("/");
        } else {
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Logout error:", error);
        
        // Even if logout API fails, still clear cache and redirect
        queryClient.clear();
        localStorage.clear();
        sessionStorage.clear();
        
        toast({
          title: "Logged Out",
          description: "You have been logged out.",
        });
        
        // Force navigation for mobile compatibility
        if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
          window.location.replace("/");
        } else {
          window.location.href = "/";
        }
      }
    };

    handleLogout();
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-xl font-medium text-gray-900">
            Logging you out...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we securely log you out.
          </p>
        </div>
      </div>
    </div>
  );
}