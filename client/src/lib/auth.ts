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

// Simple logout function - clears cache and redirects
export function logout(): void {
  console.log('LOGOUT: Clearing cache and redirecting');
  
  // Clear all data immediately
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear React Query cache completely
  queryClient.clear();
  queryClient.invalidateQueries();
  queryClient.removeQueries();
  
  // Make API call and redirect
  fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    .finally(() => {
      // Force a complete page reload to reset everything
      window.location.reload();
    });
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
