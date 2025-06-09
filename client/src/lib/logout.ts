import { queryClient } from "./queryClient";

// Replit preview-compatible logout with state management
export function performImmediateLogout() {
  console.log("LOGOUT: Starting preview-compatible logout");
  
  // Step 1: Clear server session
  fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include"
  }).then(() => {
    console.log("LOGOUT: Server session cleared");
  }).catch(() => {
    console.log("LOGOUT: Server logout failed, proceeding with client cleanup");
  });
  
  // Step 2: Clear all client storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Step 3: Clear cookies
  document.cookie.split(";").forEach(cookie => {
    const name = cookie.split("=")[0].trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
  
  // Step 4: Force React Query to clear auth state
  queryClient.setQueryData(["/api/auth/me"], null);
  queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  
  // Step 5: Create visual feedback and force page reload
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; background: #f8fafc;">
      <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #059669; margin-bottom: 1rem;">Successfully Logged Out</h2>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">You have been logged out successfully.</p>
        <p style="color: #9ca3af; font-size: 0.875rem;">Redirecting to login page...</p>
      </div>
    </div>
  `;
  
  // Force reload after showing confirmation
  setTimeout(() => {
    window.location.reload();
  }, 1500);
}