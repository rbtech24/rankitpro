import { useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Extend Navigator interface for PWA detection
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export default function LogoutHandler() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // First clear all client-side data immediately
        queryClient.clear();
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear any cached data in IndexedDB
        if ('indexedDB' in window) {
          try {
            const databases = await indexedDB.databases();
            await Promise.all(databases.map(db => {
              if (db.name && typeof db.name === 'string') {
                return new Promise((resolve) => {
                  const deleteReq = indexedDB.deleteDatabase(db.name as string);
                  deleteReq.onsuccess = () => resolve(true);
                  deleteReq.onerror = () => resolve(false);
                  deleteReq.onblocked = () => resolve(false);
                });
              }
              return Promise.resolve();
            }));
          } catch (idbError) {
            console.log("IndexedDB cleanup completed with warnings");
          }
        }
        
        // Try to call the logout API to destroy server session
        try {
          await apiRequest("POST", "/api/auth/logout");
          console.log("Server session destroyed successfully");
        } catch (apiError) {
          console.log("Server logout API call failed, proceeding with client cleanup");
        }
        
        // Clear all possible cookie configurations
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name) {
            // Clear cookie for all possible paths and domains
            const clearOptions = [
              `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`,
              `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`,
              `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure`,
              `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=none`
            ];
            clearOptions.forEach(option => {
              document.cookie = option;
            });
          }
        });
        
        // Show success message
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
        
        // Force a complete page reload to ensure clean state
        setTimeout(() => {
          if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
            // PWA mode - use replace to prevent back navigation
            window.location.replace("/");
          } else {
            // Regular browser - force reload
            window.location.href = "/";
          }
        }, 500);
        
      } catch (error) {
        console.error("Critical logout error:", error);
        
        // Emergency fallback - force complete cleanup and redirect
        try {
          queryClient.clear();
          localStorage.clear();
          sessionStorage.clear();
          
          // Emergency cookie clear
          document.cookie.split(";").forEach(cookie => {
            const name = cookie.split("=")[0].trim();
            if (name) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            }
          });
        } catch (cleanupError) {
          console.error("Emergency cleanup failed:", cleanupError);
        }
        
        toast({
          title: "Logged Out",
          description: "You have been logged out.",
        });
        
        // Force navigation regardless of errors
        setTimeout(() => {
          window.location.replace("/");
        }, 100);
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