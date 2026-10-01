import { UserButton } from "@clerk/react";
import { Wallet } from "lucide-react";

export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-foreground">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Wallet className="size-5" />
        </span>
        <h1 className="text-lg font-semibold">Bienvenido a eduard</h1>
      </div>
      <UserButton />
    </main>
  );
}
