import { queryClient } from "./queryClient";

// Production-optimized logout for deployed environments
export function performImmediateLogout() {
  console.log("LOGOUT: Starting production logout sequence");
  
  // Step 1: Immediate React Query poisoning to force re-auth
  queryClient.setQueryData(["/api/auth/me"], { user: null, company: null });
  queryClient.clear();
  queryClient.removeQueries();
  
  // Step 2: Aggressive storage clearing
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
    console.log("Storage clear error:", e);
  }
  
  // Step 3: Nuclear cookie destruction for production domains
  const productionDomains = [
    '',
    window.location.hostname,
    '.' + window.location.hostname,
    '.onrender.com',
    '.replit.app',
    '.replit.dev'
  ];
  
  const allCookieNames = ['connect.sid', 'session', 'auth', 'token', 'rank-it-pro-session', 'JSESSIONID'];
  
  // Clear existing cookies
  document.cookie.split(";").forEach(cookie => {
    const name = cookie.split("=")[0].trim();
    if (name) {
      productionDomains.forEach(domain => {
        const cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${domain ? 'domain=' + domain + ';' : ''}`;
        document.cookie = cookieString;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api; ${domain ? 'domain=' + domain + ';' : ''}`;
      });
    }
  });
  
  // Force clear known session cookies
  allCookieNames.forEach(cookieName => {
    productionDomains.forEach(domain => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${domain ? 'domain=' + domain + ';' : ''}`;
    });
  });
  
  // Step 4: Cache API clearing
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  // Step 5: Service Worker clearing
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
  }
  
  // Step 6: Server logout with production headers
  const logoutPromise = fetch("/api/auth/logout?" + Date.now(), {
    method: "POST",
    credentials: "include",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "X-Requested-With": "XMLHttpRequest"
    }
  }).catch(() => console.log("Server logout call failed"));
  
  // Step 7: Force immediate navigation with no delay
  setTimeout(() => {
    // Force complete page replacement
    window.location.href = "/login?logout=" + Date.now();
  }, 100);
  
  // Step 8: Backup navigation for production environments
  setTimeout(() => {
    if (window.location.pathname.includes('dashboard')) {
      window.location.replace("/login?force=" + Date.now());
    }
  }, 500);
  
  // Step 9: Nuclear option - full page reload if still on dashboard
  setTimeout(() => {
    if (window.location.pathname.includes('dashboard')) {
      window.location.assign("/login");
    }
  }, 1000);
}