import { useEffect } from "react";
import { queryClient } from "../lib/queryClient";

export default function ForceLogout() {
  useEffect(() => {
    const forceCompleteLogout = async () => {
      // Clear React Query cache
      queryClient.clear();
      queryClient.removeQueries();
      queryClient.setQueryData(["/api/auth/me"], { user: null, company: null });
      
      // Clear all storage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}
      
      // Clear all cookies
      document.cookie.split(";").forEach(cookie => {
        const name = cookie.split("=")[0].trim();
        if (name) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
        }
      });
      
      // Server logout
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include"
        });
      } catch (e) {}
      
      // Force redirect
      window.location.href = "/login?cleared=" + Date.now();
    };
    
    forceCompleteLogout();
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Clearing all sessions...</p>
      </div>
    </div>
  );
}