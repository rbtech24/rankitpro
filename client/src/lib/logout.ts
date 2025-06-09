import { queryClient } from "./queryClient";

// Simplified logout function to prevent navigation loops
export async function performImmediateLogout() {
  console.log("LOGOUT: Starting logout sequence");
  
  try {
    // Step 1: Clear React Query cache immediately
    queryClient.setQueryData(["/api/auth/me"], { user: null, company: null });
    queryClient.clear();
    
    // Step 2: Clear browser storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Step 3: Clear session cookies
    document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    
    // Step 4: Call server logout
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    }).catch(() => console.log("Server logout failed"));
    
    console.log("LOGOUT: Complete, redirecting to login");
    
    // Step 5: Single navigation to login
    window.location.href = "/login";
    
  } catch (error) {
    console.error("LOGOUT: Error during logout", error);
    // Fallback navigation
    window.location.href = "/login";
  }
}