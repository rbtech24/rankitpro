import { useEffect } from "react";

export default function LogoutHandler() {
  useEffect(() => {
    const performCompleteLogout = async () => {
      // Step 1: Clear all client-side storage immediately
      try {
        if (typeof Storage !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
        }
      } catch (e) {
        console.log("Storage clear failed:", e);
      }

      // Step 2: Clear all cookies aggressively
      try {
        // Get all cookies
        const cookies = document.cookie.split(";");
        
        // Clear each cookie with multiple variations
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          
          if (name) {
            // Clear for current domain and path
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            
            // Clear for parent domain if applicable
            const hostname = window.location.hostname;
            if (hostname.includes('.')) {
              const parentDomain = '.' + hostname.split('.').slice(-2).join('.');
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${parentDomain};`;
            }
          }
        });

        // Force clear known session cookie names
        const sessionCookies = ['connect.sid', 'session', 'JSESSIONID', 'PHPSESSID', 'auth'];
        sessionCookies.forEach(cookieName => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          
          const hostname = window.location.hostname;
          if (hostname.includes('.')) {
            const parentDomain = '.' + hostname.split('.').slice(-2).join('.');
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${parentDomain};`;
          }
        });
      } catch (e) {
        console.log("Cookie clear failed:", e);
      }

      // Step 3: Make server logout request (optional, non-blocking)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
      } catch (error) {
        // Server logout failed, but we continue anyway
        console.log("Server logout failed, proceeding with client-side logout");
      }

      // Step 4: Force complete navigation reset
      setTimeout(() => {
        // Use location.replace to avoid back button issues
        window.location.replace("/login?logged_out=1");
      }, 500);
    };

    performCompleteLogout();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Signing out...</p>
        <p className="text-xs text-gray-400 mt-2">Clearing session data...</p>
      </div>
    </div>
  );
}