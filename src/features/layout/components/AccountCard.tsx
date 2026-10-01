import { SignOutButton } from "@clerk/react";
import { LogOut } from "lucide-react";
import { Button } from "../../../components/Button";
import { useAuth } from "../../auth";

export function AccountCard() {
  const { user } = useAuth();

  const name = user?.fullName ?? user?.username ?? "Usuario";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt=""
            className="size-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          {email ? (
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          ) : null}
        </div>
      </div>

      <SignOutButton redirectUrl="/login">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <LogOut className="size-4" />
          Cerrar sesión
        </Button>
      </SignOutButton>
    </div>
  );
}
