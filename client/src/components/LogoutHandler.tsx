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
        // Call the logout API
        await apiRequest("POST", "/api/auth/logout");
        
        // Clear React Query cache completely
        queryClient.clear();
        
        // Clear any local storage
        localStorage.removeItem("auth");
        sessionStorage.clear();
        
        // Show success message
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
        
        // Force a full page reload to clear all state
        window.location.href = "/";
      } catch (error) {
        console.error("Logout error:", error);
        
        // Even if logout API fails, still clear cache and redirect
        queryClient.clear();
        localStorage.removeItem("auth");
        sessionStorage.clear();
        
        toast({
          title: "Logged Out",
          description: "You have been logged out.",
        });
        
        // Force a full page reload
        window.location.href = "/";
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