import { Landmark, X } from "lucide-react";
import { NavLink } from "react-router";
import { Logo } from "../../../components/Logo";
import { cn } from "../../../utils/cn";
import type { SidebarProps } from "../types/layout";
import { AccountCard } from "./AccountCard";

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <aside
      id="app-sidebar"
      aria-label="Menú lateral"
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-14 items-center justify-between gap-2 border-b border-border px-4">
        <Logo size="sm" withText />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="-mr-1 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <NavLink
          to="/accounts"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )
          }
        >
          <Landmark className="size-4" />
          Cuentas
        </NavLink>
      </nav>

      <div className="border-t border-border p-3">
        <AccountCard />
      </div>
    </aside>
  );
}
