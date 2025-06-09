import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/auth";

export default function LogoutHandler() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear all storage first to prevent conflicts
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        });

        // Attempt server logout with timeout
        const logoutPromise = logout();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Logout timeout")), 5000)
        );
        
        await Promise.race([logoutPromise, timeoutPromise]);
        
      } catch (error) {
        console.log("Server logout error (proceeding anyway):", error);
      } finally {
        // Force complete page reload to clear all state
        setTimeout(() => {
          window.location.replace("/login");
        }, 100);
      }
    };

    performLogout();
  }, [setLocation, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Signing out...</p>
      </div>
    </div>
  );
}