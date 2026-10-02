import { cn } from "../../../utils/cn";
import { formatCurrency } from "../../../utils/currency";

interface PeriodSummaryProps {
  income: number;
  expense: number;
  net: number;
}

interface SummaryCardProps {
  label: string;
  value: number;
  className?: string;
}

function SummaryCard({ label, value, className }: SummaryCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-lg font-semibold", className)}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

export function PeriodSummary({ income, expense, net }: PeriodSummaryProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SummaryCard label="Ingresos" value={income} className="text-success" />
      <SummaryCard label="Gastos" value={expense} className="text-danger" />
      <SummaryCard
        label="Balance del período"
        value={net}
        className={net >= 0 ? "text-success" : "text-danger"}
      />
    </div>
  );
}
