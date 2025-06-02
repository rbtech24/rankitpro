import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

export default function LogoutHandler() {
  useEffect(() => {
    console.log('LogoutHandler: Starting logout process');
    
    // Clear all application state immediately
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('LogoutHandler: Cleared all client state');
    
    // Call logout API and redirect regardless of success/failure
    fetch("/api/auth/logout", { 
      method: "POST", 
      credentials: "include" 
    })
    .then(() => {
      console.log('LogoutHandler: Logout API successful');
    })
    .catch(error => {
      console.log('LogoutHandler: Logout API failed, but continuing:', error);
    })
    .finally(() => {
      console.log('LogoutHandler: Redirecting to home page');
      // Force redirect to home page with cache busting
      window.location.replace("/?logout=" + Date.now());
    });
  }, []);

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