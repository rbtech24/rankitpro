import { useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LogoutHandler() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Call the logout API
        await apiRequest("POST", "/api/auth/logout");
        
        // Clear any local storage
        localStorage.removeItem("auth");
        
        // Show success message
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
        
        // Redirect to home page
        setLocation("/");
      } catch (error) {
        console.error("Logout error:", error);
        
        // Even if logout API fails, still redirect to clear the session
        toast({
          title: "Logged Out",
          description: "You have been logged out.",
        });
        
        setLocation("/");
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