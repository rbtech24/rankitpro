import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, AuthState } from "../lib/auth";

export function useAuth() {
  const { data: auth, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  // Handle null return from getCurrentUser gracefully
  const authState: AuthState = auth || { user: null, company: null };

  return {
    user: authState.user,
    company: authState.company,
    isAuthenticated: !!authState.user,
    isLoading,
    error
  };
}