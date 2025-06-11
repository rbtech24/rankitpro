import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

export default function LogoutHandler() {
  useEffect(() => {
    const performCompleteLogout = async () => {
      // Step 1: Immediately poison React Query cache
      queryClient.setQueryData(["/api/auth/me"], { user: null, company: null });
      queryClient.clear();
      queryClient.removeQueries();
      
      // Step 2: Clear all client storage
      try {
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear IndexedDB
        if ('indexedDB' in window) {
          indexedDB.databases().then(databases => {
            databases.forEach(db => {
              if (db.name) indexedDB.deleteDatabase(db.name);
            });
          });
        }
      } catch (e) {
        // Storage clear failed, continue anyway
      }

      // Step 3: Nuclear cookie clearing
      const domains = [
        '',
        window.location.hostname,
        '.' + window.location.hostname,
        '.onrender.com',
        '.replit.app',
        '.replit.dev'
      ];
      
      document.cookie.split(";").forEach(cookie => {
        const name = cookie.split("=")[0].trim();
        if (name) {
          domains.forEach(domain => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${domain ? 'domain=' + domain + ';' : ''}`;
          });
        }
      });

      // Step 4: Clear caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }

      // Step 5: Server logout
      try {
        await fetch("/api/auth/logout?" + Date.now(), {
          method: "POST",
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache"
          }
        });
      } catch (error) {
        // Server logout failed, continue with client cleanup
      }

      // Step 6: Force navigation immediately
      window.location.href = "/login?logout=" + Date.now();
    };

    performCompleteLogout();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Logging Out</h2>
        <p className="text-gray-600 mb-1">Clearing session data...</p>
        <p className="text-gray-600 mb-1">Destroying authentication...</p>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}