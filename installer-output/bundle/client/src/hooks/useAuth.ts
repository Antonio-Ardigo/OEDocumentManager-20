import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    // Don't throw errors to prevent app crashes
    throwOnError: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error
  };
}
