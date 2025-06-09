// Simple, reliable logout function that works in all environments
export function performImmediateLogout() {
  console.log("Starting logout process...");
  
  // Step 1: Clear all browser storage immediately
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log("Storage cleared");
  } catch (e) {
    console.log("Storage clear failed:", e);
  }

  // Step 2: Clear all cookies aggressively
  try {
    const cookies = document.cookie.split(";");
    console.log("Found cookies:", cookies.length);
    
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      if (name) {
        // Multiple clearing strategies
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        
        // Clear for parent domain
        const hostname = window.location.hostname;
        if (hostname.includes('.')) {
          const parts = hostname.split('.');
          if (parts.length > 1) {
            const parentDomain = '.' + parts.slice(-2).join('.');
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${parentDomain};`;
          }
        }
      }
    });

    // Force clear session cookies by name
    const sessionCookies = ['connect.sid', 'session', 'JSESSIONID', 'PHPSESSID', 'auth', 'token'];
    sessionCookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      
      const hostname = window.location.hostname;
      if (hostname.includes('.')) {
        const parts = hostname.split('.');
        if (parts.length > 1) {
          const parentDomain = '.' + parts.slice(-2).join('.');
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${parentDomain};`;
        }
      }
    });
    console.log("Cookies cleared");
  } catch (e) {
    console.log("Cookie clear failed:", e);
  }

  // Step 3: Make server logout request (async, non-blocking)
  fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    }
  }).then(() => {
    console.log("Server logout successful");
  }).catch(() => {
    console.log("Server logout failed, but proceeding with client logout");
  });

  // Step 4: Force immediate navigation with multiple fallbacks
  console.log("Redirecting to login...");
  
  // Try multiple navigation methods
  try {
    window.location.href = "/login";
  } catch (e) {
    try {
      window.location.replace("/login");
    } catch (e2) {
      // Last resort - reload the page to clear state
      window.location.reload();
    }
  }
}