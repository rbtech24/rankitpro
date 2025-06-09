// Simple, reliable logout function that works in all environments
export function performImmediateLogout() {
  // Clear all storage immediately
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.log("Storage clear failed:", e);
  }

  // Clear all cookies aggressively
  const cookies = document.cookie.split(";");
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

  // Make server logout request (fire and forget)
  fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    }
  }).catch(() => {
    // Ignore server errors - client cleanup is sufficient
  });

  // Immediate navigation
  window.location.replace("/login");
}