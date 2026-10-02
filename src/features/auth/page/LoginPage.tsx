import { Navigate } from "react-router";
import { Logo } from "../../../components/Logo";
import { ThemeToggle } from "../../theme";
import { LoginForm } from "../components/LoginForm";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-surface px-6 text-foreground">
      <ThemeToggle className="absolute right-[calc(1rem+env(safe-area-inset-right))] top-[calc(1rem+env(safe-area-inset-top))]" />
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo size="md" />
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
