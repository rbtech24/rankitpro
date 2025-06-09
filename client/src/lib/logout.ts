// Bulletproof logout for all environments including Replit preview
export function performImmediateLogout() {
  console.log("Starting bulletproof logout...");
  
  // Clear all client data
  try {
    localStorage.clear();
    sessionStorage.clear();
    
    document.cookie.split(";").forEach(cookie => {
      const name = cookie.split("=")[0].trim();
      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    console.log("Client data cleared");
  } catch (e) {
    console.log("Cleanup error:", e);
  }

  // Server logout
  fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include"
  }).catch(() => {});

  // Force reload entire page to reset all state
  console.log("Forcing page reload...");
  window.location.reload(true);
}