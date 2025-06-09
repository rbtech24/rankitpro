// Simple direct logout for preview environments
export function performImmediateLogout() {
  console.log("LOGOUT: Direct logout and redirect");
  
  // Clear all storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear all cookies
  document.cookie.split(";").forEach(cookie => {
    const name = cookie.split("=")[0].trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
  
  // Server logout
  fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include"
  }).catch(() => {});
  
  // Direct navigation to login
  window.location.href = "/login";
}