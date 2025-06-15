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
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    const user = await response.json();
    
    let company: Company | null = null;
    
    // Get company data if user has companyId
    if (user?.companyId) {
      try {
        const companyResponse = await apiRequest("GET", `/api/companies/${user.companyId}`);
        company = await companyResponse.json();
      } catch (error) {
        console.warn("Failed to fetch company data:", error);
      }
    }
    
    // Store auth data in localStorage for session persistence
    localStorage.setItem('authUser', JSON.stringify(user));
    localStorage.setItem('authCompany', JSON.stringify(company));
    localStorage.setItem('isAuthenticated', 'true');
    
    // Update query cache with auth data
    const authState = { user, company };
    queryClient.setQueryData(["/api/auth/me"], authState);
    
    return authState;
  } catch (error: any) {
    console.error("Login error:", error);
    // Clear any stale auth data on login failure
    localStorage.removeItem('authUser');
    localStorage.removeItem('authCompany');
    localStorage.removeItem('isAuthenticated');
    throw new Error(error.message || "Login failed");
  }
}

export async function register(credentials: RegisterCredentials): Promise<AuthState> {
  try {
    const response = await apiRequest("POST", "/api/auth/register", credentials);
    const user = await response.json();
    
    let company: Company | null = null;
    
    // Get company data if user has companyId
    if (user?.companyId) {
      try {
        const companyResponse = await apiRequest("GET", `/api/companies/${user.companyId}`);
        company = await companyResponse.json();
      } catch (error) {
        console.warn("Failed to fetch company data:", error);
      }
    }
    
    // Store auth data in localStorage for session persistence
    localStorage.setItem('authUser', JSON.stringify(user));
    localStorage.setItem('authCompany', JSON.stringify(company));
    localStorage.setItem('isAuthenticated', 'true');
    
    // Update query cache with auth data
    const authState = { user, company };
    queryClient.setQueryData(["/api/auth/me"], authState);
    
    return authState;
  } catch (error: any) {
    console.error("Registration error:", error);
    // Clear any stale auth data on registration failure
    localStorage.removeItem('authUser');
    localStorage.removeItem('authCompany');
    localStorage.removeItem('isAuthenticated');
    throw new Error(error.message || "Registration failed");
  }
}

export async function logout(): Promise<void> {
  try {
    // Call the server logout endpoint
    await apiRequest("POST", "/api/auth/logout");
  } catch (error) {
    console.warn("Server logout failed:", error);
  } finally {
    // Always clear local authentication data
    localStorage.removeItem('authUser');
    localStorage.removeItem('authCompany');
    localStorage.removeItem('isAuthenticated');
    
    // Clear query cache
    queryClient.setQueryData(["/api/auth/me"], { user: null, company: null });
    queryClient.clear();
    
    // Redirect to login page
    window.location.href = '/login';
  }
}

export async function getCurrentUser(): Promise<AuthState> {
  try {
    // Check localStorage first for client-side auth
    const storedUser = localStorage.getItem('authUser');
    const storedCompany = localStorage.getItem('authCompany');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    console.log('getCurrentUser - localStorage check:', { isAuthenticated, hasStoredUser: !!storedUser });
    
    if (isAuthenticated === 'true' && storedUser) {
      const user = JSON.parse(storedUser);
      const company = storedCompany ? JSON.parse(storedCompany) : null;
      console.log('getCurrentUser - using localStorage data:', { user, company });
      return { user, company };
    }
    
    // Fallback to API request
    console.log('getCurrentUser - making API request to /api/auth/me');
    const response = await apiRequest("GET", "/api/auth/me");
    const data = await response.json();
    console.log('getCurrentUser - API response:', data);
    
    // Store the response in localStorage for future use
    if (data.user) {
      localStorage.setItem('authUser', JSON.stringify(data.user));
      localStorage.setItem('authCompany', JSON.stringify(data.company));
      localStorage.setItem('isAuthenticated', 'true');
    }
    
    return data;
  } catch (error) {
    console.log('getCurrentUser - error:', error);
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
