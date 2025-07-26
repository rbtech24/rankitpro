import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, AuthState } from "../lib/auth";

export function useAuth() {
  const { data: auth, isLoading, error } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  return {
    user: auth?.user || null,
    company: auth?.company || null,
    isAuthenticated: !!auth?.user,
    isLoading,
    error
  };
}