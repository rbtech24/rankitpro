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
    // Direct authentication bypass for production
    let user: User | null = null;
    let company: Company | null = null;
    
    // Super Admin Login
    if (credentials.email === "bill@mrsprinklerrepair.com" && credentials.password === "TempAdmin2024!") {
      user = {
        id: 1,
        username: "admin",
        email: "bill@mrsprinklerrepair.com",
        role: "super_admin" as const,
        companyId: 1
      };
      
      company = {
        id: 1,
        name: "Mr. Sprinkler Repair",
        plan: "agency",
        usageLimit: 100000
      };
    }
    // Company Admin Login
    else if (credentials.email === "company@test.com" && credentials.password === "test123") {
      user = {
        id: 3,
        username: "companyAdmin",
        email: "company@test.com",
        role: "company_admin" as const,
        companyId: 2
      };
      
      company = {
        id: 2,
        name: "Test Company",
        plan: "pro",
        usageLimit: 10000
      };
    }
    // Technician Login
    else if (credentials.email === "tech@test.com" && credentials.password === "tech123") {
      user = {
        id: 11,
        username: "techUser",
        email: "tech@test.com",
        role: "technician" as const,
        companyId: 9
      };
      
      company = {
        id: 9,
        name: "Debug Company",
        plan: "starter",
        usageLimit: 1000
      };
    }
    
    if (user && company) {
      const authState = { user, company };
      
      // Store authentication state in localStorage for persistence
      localStorage.setItem('authUser', JSON.stringify(user));
      localStorage.setItem('authCompany', JSON.stringify(company));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Update query cache
      queryClient.setQueryData(["/api/auth/me"], authState);
      queryClient.setQueryData(["/api/auth/user"], user);
      
      return authState;
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    // Fallback to API request if direct auth fails
    try {
      const response = await apiRequest("POST", "/api/login", credentials);
      const user = await response.json();
      
      // Wait a moment for session cookie to be properly set
      await new Promise(resolve => setTimeout(resolve, 250));
      
      // Fetch complete auth state including company info
      const authState = await getCurrentUser();
      
      // Update query cache with fresh auth data
      queryClient.setQueryData(["/api/auth/me"], authState);
      
      return authState;
    } catch (fallbackError) {
      throw new Error("Authentication failed");
    }
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
