import { queryClient } from "./queryClient";

// Replit preview-optimized logout
export function performImmediateLogout() {
  console.log("LOGOUT: Starting Replit-optimized logout");
  
  // Clear all client data
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear cookies
  document.cookie.split(";").forEach(cookie => {
    const name = cookie.split("=")[0].trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
  
  // Clear React Query state
  queryClient.clear();
  queryClient.setQueryData(["/api/auth/me"], { user: null, company: null });
  
  // Server logout
  fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include"
  }).catch(() => {});
  
  console.log("LOGOUT: All data cleared, forcing reload");
  
  // Force immediate page reload - this bypasses all routing restrictions
  window.location.reload();
}