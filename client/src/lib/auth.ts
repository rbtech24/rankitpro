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
    console.log("LOGIN: Starting login request for", credentials.email);
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    const user = await response.json();
    
    console.log("LOGIN: Server response received", user);
    
    // Immediately update the query cache with the user data
    const authData = { user, company: null };
    queryClient.setQueryData(["/api/auth/me"], authData);
    
    // Also invalidate to trigger a fresh fetch
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    
    return authData;
  } catch (error) {
    console.error("LOGIN: Error during login process", error);
    throw error;
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
    console.log("AUTH: Fetching current user");
    const response = await apiRequest("GET", "/api/auth/me");
    const data = await response.json();
    console.log("AUTH: Current user data received", data);
    return data;
  } catch (error) {
    console.log("AUTH: Error fetching current user", error);
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
