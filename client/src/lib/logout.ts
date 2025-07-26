import { queryClient } from "./queryClient";

// Enhanced logout function with aggressive session clearing
export async function performImmediateLogout() {
  try {
    // Step 1: Clear React Query cache immediately
    queryClient.setQueryData(["/api/auth/me"], { user: null, company: null });
    queryClient.clear();
    
    // Step 2: Clear ALL browser storage aggressively
    localStorage.clear();
    sessionStorage.clear();
    
    // Step 3: Clear ALL possible session cookies with multiple variations
    const cookieNames = ['connect.sid', 'session', 'sess', 'sessionId', 'auth', 'token'];
    const paths = ['/', '/api', '/auth'];
    const domains = [window.location.hostname, `.${window.location.hostname}`, 'localhost', '.localhost'];
    
    cookieNames.forEach(name => {
      paths.forEach(path => {
        domains.forEach(domain => {
          // Clear with domain
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}`;
          // Clear without domain  
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
        });
      });
      // Also clear basic version
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    });
    
    // Step 4: Call multiple logout endpoints aggressively
    try {
      // First try immediate logout
      const immediateLogout = await fetch("/api/auth/immediate-logout", {
        method: "POST",
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      // Then try regular logout
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }).catch(() => {});
      
      // Finally try force logout
      await fetch("/api/force-logout", {
        method: "POST",
        credentials: "include"
      }).catch(() => {});
      
    } catch (error) {
      // Continue with client cleanup regardless of server response
    }
    
    // Step 5: Additional cleanup - clear any cached authentication headers
    delete (window as any).authToken;
    delete (window as any).userSession;
    
    // Step 6: Force complete page reload to clear any lingering state
    window.location.href = "/";
    
  } catch (error) {
    // Extreme fallback - force reload
    window.location.href = "/";
  }
}