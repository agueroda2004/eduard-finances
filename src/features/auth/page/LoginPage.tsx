import { Navigate } from "react-router";
import { Wallet } from "lucide-react";
import { LoginForm } from "../components/LoginForm";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 text-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Wallet className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">Bienvenido</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Inicia sesión para continuar.
            </p>
          </div>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
