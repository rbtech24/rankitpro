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
  try {
    const user = await apiRequest("POST", "/api/auth/login", credentials);
    
    let company: Company | null = null;
    
    // Get company data if user has companyId
    if (user?.companyId) {
      try {
        company = await apiRequest("GET", `/api/companies/${user.companyId}`);
      } catch (error) {
        console.warn("Failed to fetch company data:", error);
      }
    }
    
    // Invalidate auth query to refresh user state
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    return { user, company };
  } catch (error: any) {
    console.error("Login error:", error);
    throw new Error(error.message || "Login failed");
  }
}

export async function register(credentials: RegisterCredentials): Promise<AuthState> {
  const response = await apiRequest("POST", "/api/auth/register", credentials);
  const user = await response.json();
  
  // Invalidate any auth-related queries
  queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  
  return { user, company: null };
}

export async function logout(): Promise<void> {
  // Use the optimized logout function
  const { performImmediateLogout } = await import('./logout');
  performImmediateLogout();
}

export async function getCurrentUser(): Promise<AuthState> {
  try {
    // Check localStorage first for client-side auth
    const storedUser = localStorage.getItem('authUser');
    const storedCompany = localStorage.getItem('authCompany');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (isAuthenticated === 'true' && storedUser) {
      const user = JSON.parse(storedUser);
      const company = storedCompany ? JSON.parse(storedCompany) : null;
      return { user, company };
    }
    
    // Fallback to API request
    await new Promise(resolve => setTimeout(resolve, 100));
    const response = await apiRequest("GET", "/api/auth/me");
    const data = await response.json();
    return data;
  } catch (error) {
    // Clear any stale auth data on 401 errors
    if ((error as Error).message.includes("401")) {
      queryClient.setQueryData(["/api/auth/me"], { user: null, company: null });
      localStorage.removeItem('authUser');
      localStorage.removeItem('authCompany');
      localStorage.removeItem('isAuthenticated');
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
