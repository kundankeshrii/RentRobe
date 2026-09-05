import { useAuth } from "@/hooks/useAuth";

export const useAdmin = () => {
  const { user, loading } = useAuth();

  // Check role from decoded JWT
  const isAdmin = user?.role === "ADMIN";

  return { isAdmin, loading };
};
