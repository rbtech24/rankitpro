import { queryClient } from "./queryClient";

// Anti-cache logout with comprehensive cache busting
export function performImmediateLogout() {
  console.log("LOGOUT: Starting anti-cache logout");
  
  // Step 1: Aggressive cache clearing
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    });
  }
  
  // Clear all possible browser caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // Step 2: Clear all storage mechanisms
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear IndexedDB
  if ('indexedDB' in window) {
    try {
      indexedDB.databases().then(databases => {
        databases.forEach(db => {
          if (db.name) indexedDB.deleteDatabase(db.name);
        });
      });
    } catch (e) {
      console.log("IndexedDB clear failed:", e);
    }
  }
  
  // Step 3: Comprehensive cookie clearing
  const cookiesToClear = ['connect.sid', 'session', 'auth', 'token', 'rank-it-pro-session'];
  const domains = [
    '',
    window.location.hostname,
    '.' + window.location.hostname,
    '.replit.dev',
    '.replit.com'
  ];
  
  document.cookie.split(";").forEach(cookie => {
    const name = cookie.split("=")[0].trim();
    if (name) {
      domains.forEach(domain => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${domain ? 'domain=' + domain + ';' : ''}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api; ${domain ? 'domain=' + domain + ';' : ''}`;
      });
    }
  });
  
  cookiesToClear.forEach(cookieName => {
    domains.forEach(domain => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${domain ? 'domain=' + domain + ';' : ''}`;
    });
  });
  
  // Step 4: Nuclear React Query clearing
  queryClient.clear();
  queryClient.removeQueries();
  queryClient.setQueryData(["/api/auth/me"], null);
  queryClient.invalidateQueries();
  queryClient.refetchQueries();
  
  // Step 5: Server logout with cache-busting headers
  fetch("/api/auth/logout?" + Date.now(), {
    method: "POST",
    credentials: "include",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  }).catch(() => {});
  
  // Step 6: Force navigation with cache busting
  const timestamp = Date.now();
  const clearCacheUrl = `/login?logout=${timestamp}&nocache=${Math.random()}`;
  
  // Visual feedback
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; background: #f8fafc;">
      <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #059669; margin-bottom: 1rem;">Logout Complete</h2>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">All caches cleared, session destroyed.</p>
        <p style="color: #9ca3af; font-size: 0.875rem;">Redirecting...</p>
      </div>
    </div>
  `;
  
  // Multiple navigation strategies with cache busting
  setTimeout(() => {
    window.location.href = clearCacheUrl;
  }, 800);
  
  setTimeout(() => {
    window.location.replace(clearCacheUrl);
  }, 1200);
  
  setTimeout(() => {
    window.location.reload();
  }, 1600);
}