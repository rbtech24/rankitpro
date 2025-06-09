import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "super_admin" | "company_admin" | "technician";
  companyName?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: "super_admin" | "company_admin" | "technician";
  companyId?: number;
}

export interface Company {
  id: number;
  name: string;
  plan: string;
  usageLimit: number;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
}

export async function login(credentials: LoginCredentials): Promise<AuthState> {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  const user = await response.json();
  
  // Invalidate any auth-related queries
  queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  
  return { user, company: null };
}

export async function register(credentials: RegisterCredentials): Promise<AuthState> {
  const response = await apiRequest("POST", "/api/auth/register", credentials);
  const user = await response.json();
  
  // Invalidate any auth-related queries
  queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  
  return { user, company: null };
}

export async function logout(): Promise<void> {
  // Clear client-side data immediately
  if (typeof window !== 'undefined') {
    // Clear all storage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.log("Storage clear failed:", e);
    }
    
    // Clear all cookies with multiple domain variations
    const hostname = window.location.hostname;
    const cookiesToClear = ['connect.sid', 'session', 'auth', 'token'];
    
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name) {
        // Clear for current path and domain
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${hostname}`;
        // Clear for parent domain
        if (hostname.includes('.')) {
          const parentDomain = hostname.substring(hostname.indexOf('.'));
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${parentDomain}`;
        }
      }
    });
    
    // Force clear known session cookies
    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${hostname}`;
      if (hostname.includes('.')) {
        const parentDomain = hostname.substring(hostname.indexOf('.'));
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${parentDomain}`;
      }
    });
  }
  
  // Clear React Query cache
  queryClient.clear();
  
  try {
    // Attempt server logout with aggressive timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
  } catch (error) {
    // Server logout failed, but client is already cleaned up
    console.log("Server logout request failed, but client cleanup completed");
  }
}

export async function getCurrentUser(): Promise<AuthState> {
  try {
    const response = await apiRequest("GET", "/api/auth/me");
    return await response.json();
  } catch (error) {
    if ((error as Error).message.includes("401")) {
      return { user: null, company: null };
    }
    throw error;
  }
}

export function useIsAuth(role?: "super_admin" | "company_admin" | "technician") {
  const authState = queryClient.getQueryData<AuthState>(["/api/auth/me"]);
  
  if (!authState || !authState.user) {
    return false;
  }
  
  if (!role) {
    return true;
  }
  
  if (role === "super_admin") {
    return authState.user.role === "super_admin";
  }
  
  if (role === "company_admin") {
    return authState.user.role === "super_admin" || authState.user.role === "company_admin";
  }
  
  return true;
}
