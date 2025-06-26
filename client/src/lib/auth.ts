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
    console.log("Attempting login for:", credentials.email);
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    const user = await response.json();
    console.log("Login response received:", user);
    
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
    // Always validate with server first to ensure session is valid
    console.log('getCurrentUser - validating with server');
    const response = await apiRequest("GET", "/api/auth/me");
    const data = await response.json();
    console.log('getCurrentUser - server validation successful:', data);
    
    // Store the validated response in localStorage
    if (data.user) {
      localStorage.setItem('authUser', JSON.stringify(data.user));
      localStorage.setItem('authCompany', JSON.stringify(data.company));
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      // Clear localStorage if no user returned
      localStorage.removeItem('authUser');
      localStorage.removeItem('authCompany');
      localStorage.removeItem('isAuthenticated');
    }
    
    return data;
  } catch (error) {
    console.log('getCurrentUser - authentication failed:', error);
    
    // Clear stale auth data on any authentication failure
    queryClient.setQueryData(["/api/auth/me"], { user: null, company: null });
    localStorage.removeItem('authUser');
    localStorage.removeItem('authCompany');
    localStorage.removeItem('isAuthenticated');
    
    // Return empty auth state instead of throwing
    return { user: null, company: null };
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
