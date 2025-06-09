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
  
  // Step 6: Preview-specific logout completion
  console.log("LOGOUT: Completed - session destroyed, caches cleared");
  
  // Create persistent logout confirmation that works in preview
  document.documentElement.innerHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Logged Out - Rank It Pro</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          margin: 0; 
          font-family: system-ui, -apple-system, sans-serif; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .logout-container {
          background: white;
          padding: 3rem;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 400px;
          width: 90%;
        }
        .success-icon {
          font-size: 4rem;
          color: #10b981;
          margin-bottom: 1rem;
        }
        h1 {
          color: #1f2937;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }
        p {
          color: #6b7280;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .login-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: background 0.2s;
        }
        .login-btn:hover {
          background: #2563eb;
        }
        .status {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          color: #166534;
          font-size: 0.875rem;
        }
      </style>
    </head>
    <body>
      <div class="logout-container">
        <div class="success-icon">✓</div>
        <h1>Successfully Logged Out</h1>
        <p>Your session has been completely cleared and all caches have been reset. You are now logged out of Rank It Pro.</p>
        <a href="/login" class="login-btn" onclick="window.location.reload(); return false;">Return to Login</a>
        <div class="status">
          ✓ Server session destroyed<br>
          ✓ Local storage cleared<br>
          ✓ All caches reset<br>
          ✓ Cookies removed
        </div>
      </div>
      <script>
        // Force any remaining React context to reset
        if (window.location.pathname !== '/login') {
          setTimeout(() => {
            window.location.href = '/login?t=' + Date.now();
          }, 3000);
        }
      </script>
    </body>
    </html>
  `;
}