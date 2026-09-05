import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse font-display text-2xl tracking-widest font-light">
          RENT<span className="text-primary">ROBE</span>
          <span className="block text-xs tracking-[0.3em] text-muted-foreground mt-1 font-body">ADMIN</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="font-display text-3xl font-light">Access Denied</h1>
        <p className="text-muted-foreground font-body font-light text-sm">You do not have admin privileges.</p>
        <a href="/" className="text-primary text-sm font-body underline">Return to home</a>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
