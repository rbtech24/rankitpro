import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, AuthState } from "@/lib/auth";

export function useAuth() {
  const { data: auth, isLoading, error } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  return {
    user: auth?.user || null,
    company: auth?.company || null,
    isAuthenticated: !!auth?.user,
    isLoading,
    error
  };
}