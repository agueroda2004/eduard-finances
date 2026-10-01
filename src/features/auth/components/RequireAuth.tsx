import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function RequireAuth() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
