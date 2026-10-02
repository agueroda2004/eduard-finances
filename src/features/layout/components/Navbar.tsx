import { Menu } from "lucide-react";
import { Button } from "../../../components/Button";
import { ThemeToggle } from "../../theme";
import type { NavbarProps } from "../types/layout";

export function Navbar({ onMenuClick, menuOpen }: NavbarProps) {
  return (
    <header className="z-30 flex h-14 items-center gap-2 border-b border-border bg-surface px-4 lg:sticky lg:top-0">
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menú"
        aria-controls="app-sidebar"
        aria-expanded={menuOpen}
      >
        <Menu className="size-5" />
      </Button>

      <ThemeToggle className="ml-auto" />
    </header>
  );
}
