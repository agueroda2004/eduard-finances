import { Plus } from "lucide-react";
import { useNavigate } from "react-router";

export function QuickAddButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      aria-label="Nueva transacción"
      onClick={() => navigate("/transactions?new=1")}
      className="fixed bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Plus className="size-6" />
    </button>
  );
}
